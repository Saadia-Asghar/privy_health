const { Pool } = require('pg')
const { v4: uuidv4 } = require('uuid')
const memory = require('./memoryPrescriptionStore.cjs')
const { publicSiteUrl } = require('./publicSite.cjs')

let pool = null
let initialized = false
let state = null

function clone(v) {
  return JSON.parse(JSON.stringify(v))
}

function defaultState() {
  return {
    prescriptions: clone(memory.store.prescriptions),
    pharmacies: clone(memory.store.pharmacies),
    appointments: clone(memory.store.appointments || []),
    auditLogs: [],
    users: [],
  }
}

async function persist() {
  if (!pool || !state) return
  await pool.query(
    `INSERT INTO app_state (id, data, updated_at)
     VALUES (1, $1::jsonb, NOW())
     ON CONFLICT (id)
     DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()`,
    [JSON.stringify(state)]
  )
}

async function initPostgresDb() {
  if (initialized) return
  const conn = process.env.DATABASE_URL
  if (!conn) throw new Error('DATABASE_URL is required for postgres store')
  pool = new Pool({
    connectionString: conn,
    ssl: process.env.PGSSLMODE === 'disable' ? false : { rejectUnauthorized: false },
  })
  await pool.query(`
    CREATE TABLE IF NOT EXISTS app_state (
      id INTEGER PRIMARY KEY,
      data JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)
  const row = await pool.query('SELECT data FROM app_state WHERE id = 1')
  if (row.rows.length) {
    state = row.rows[0].data || defaultState()
  } else {
    state = defaultState()
    await persist()
  }
  initialized = true
}

function ensureReady() {
  if (!initialized || !state) throw new Error('postgres store not initialized')
}

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = 'PK-'
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return code
}

function auditLog(actorId, action, resourceType, resourceId, req, payload) {
  ensureReady()
  const ip = req?.ip || req?.headers?.['x-forwarded-for'] || ''
  const ua = req?.headers?.['user-agent'] || ''
  state.auditLogs.push({
    id: uuidv4(),
    actorId: actorId || null,
    action,
    resourceType: resourceType || null,
    resourceId: resourceId || null,
    ip: String(ip).slice(0, 128),
    userAgent: String(ua).slice(0, 256),
    payload: payload || null,
    createdAt: new Date().toISOString(),
  })
}

function listPrescriptions(query = {}) {
  ensureReady()
  const { patientId, doctorId } = query
  const now = Date.now()
  let results = state.prescriptions
  if (patientId) results = results.filter((p) => p.patientId === patientId)
  if (doctorId) results = results.filter((p) => p.doctorId === doctorId)
  return results.map((p) => ({ ...p, expired: !p.filled && new Date(p.validUntil) < now }))
}

function createPrescription(body, req = null) {
  ensureReady()
  const { patientId, patientName, doctorId, doctorName, medication, dosage, frequency, duration, category, refillsAllowed, notes } = body
  if (!medication || !doctorId) throw new Error('Missing required fields')
  let code = generateCode()
  while (state.prescriptions.some((x) => x.code === code)) code = generateCode()
  const now = new Date()
  const rx = {
    id: uuidv4(),
    code,
    patientId: patientId || 'unknown',
    patientName: patientName || 'Unknown',
    patientAllergies: [],
    doctorId,
    doctorName: doctorName || 'Unknown',
    medication,
    dosage,
    frequency,
    duration,
    category: category || 'ScheduleH',
    refillsAllowed: parseInt(refillsAllowed, 10) || 0,
    refillsUsed: 0,
    notes: notes || '',
    filled: false,
    filledBy: null,
    filledByName: null,
    filledAt: null,
    cancelled: false,
    issuedAt: now.toISOString(),
    validUntil: new Date(now.getTime() + 86400000 * 14).toISOString(),
  }
  state.prescriptions.push(rx)
  auditLog(body._actorId || null, 'prescription.create', 'prescription', rx.code, req, { code: rx.code })
  persist().catch(() => {})
  return rx
}

function verifyByCode(rawCode) {
  ensureReady()
  const code = String(rawCode).toUpperCase()
  const p = state.prescriptions.find((x) => x.code === code)
  if (!p) return { valid: false, error: 'No prescription found with this code.' }
  const expired = !p.filled && new Date(p.validUntil) < Date.now()
  return {
    valid: !p.filled && !p.cancelled && !expired,
    filled: p.filled,
    expired,
    cancelled: p.cancelled,
    code: p.code,
    medication: p.medication,
    dosage: p.dosage,
    frequency: p.frequency,
    duration: p.duration,
    doctorName: p.doctorName,
    patientName: p.patientName,
    patientAllergies: p.patientAllergies,
    category: p.category,
    refillsAllowed: p.refillsAllowed,
    refillsUsed: p.refillsUsed,
    validUntil: p.validUntil,
    issuedAt: p.issuedAt,
    filledAt: p.filledAt || null,
  }
}

function fillPrescription(rawCode, body = {}, req = null) {
  ensureReady()
  const code = String(rawCode).toUpperCase()
  const { pharmacyId, pharmacyName } = body
  const p = state.prescriptions.find((x) => x.code === code)
  if (!p) return { error: 'not_found', status: 404 }
  if (p.filled) return { error: 'already_filled', status: 400 }
  if (new Date(p.validUntil) < Date.now()) return { error: 'expired', status: 400 }
  p.filled = true
  p.filledBy = pharmacyId
  p.filledByName = pharmacyName || null
  p.filledAt = new Date().toISOString()
  const ph = state.pharmacies.find((x) => x.id === pharmacyId)
  if (ph) {
    ph.verifications++
    if (ph.verifications >= 500 && ph.tier !== 'Premium') {
      ph.tier = 'Premium'
      ph.canFillControlled = true
    } else if (ph.verifications >= 100 && ph.tier === 'Basic') {
      ph.tier = 'Verified'
    }
  }
  auditLog(body._actorId || pharmacyId, 'prescription.fill', 'prescription', code, req, { pharmacyId })
  persist().catch(() => {})
  return { success: true }
}

function listActivePharmacies() {
  ensureReady()
  return state.pharmacies.filter((p) => p.status === 'Active')
}

function registerPharmacy(body, req = null) {
  ensureReady()
  const { name, city, drapLicense, whatsappNumber } = body
  if (!name || !city) throw new Error('Missing fields')
  const ph = {
    id: uuidv4(),
    name,
    city,
    drapLicense,
    whatsappNumber: whatsappNumber || '',
    tier: 'Basic',
    verifications: 0,
    canFillControlled: false,
    status: 'Pending',
    registeredAt: new Date().toISOString(),
  }
  state.pharmacies.push(ph)
  auditLog(null, 'pharmacy.register', 'pharmacy', ph.id, req, { name })
  persist().catch(() => {})
  return ph
}

function pharmacyStats(id) {
  ensureReady()
  const ph = state.pharmacies.find((p) => p.id === id)
  if (!ph) return null
  const today = state.prescriptions.filter(
    (p) => p.filledBy === id && p.filledAt && new Date(p.filledAt).toDateString() === new Date().toDateString()
  ).length
  return { ...ph, todayVerifications: today }
}

function adminOverview() {
  ensureReady()
  const total = state.prescriptions.length
  const filled = state.prescriptions.filter((p) => p.filled).length
  const byCategory = {}
  state.prescriptions.forEach((p) => {
    byCategory[p.category] = (byCategory[p.category] || 0) + 1
  })
  return {
    totalPrescriptions: total,
    filledPrescriptions: filled,
    fillRate: total > 0 ? Math.round((filled / total) * 100) : 0,
    totalPharmacies: state.pharmacies.length,
    totalAppointments: state.appointments.length,
    byCategory,
    pharmacies: state.pharmacies,
    appointments: [...state.appointments]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10),
  }
}

function listAppointments(query = {}) {
  ensureReady()
  const { doctorId, city, status } = query
  let rows = state.appointments || []
  if (doctorId) rows = rows.filter((a) => a.doctorId === doctorId)
  if (city) rows = rows.filter((a) => a.city === city)
  if (status) rows = rows.filter((a) => a.status === status)
  return [...rows].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

function createAppointment(body, req = null) {
  ensureReady()
  const { doctorId, doctorName, specialty, city, slot, patientName, phone, note } = body
  if (!doctorName || !slot || !patientName || !phone) throw new Error('Missing appointment fields')
  const appt = {
    id: uuidv4(),
    doctorId: doctorId || 'unknown-doctor',
    doctorName,
    specialty: specialty || '',
    city: city || '',
    slot,
    patientName,
    phone,
    note: note || '',
    status: 'requested',
    createdAt: new Date().toISOString(),
  }
  state.appointments.push(appt)
  auditLog(body._actorId || null, 'appointment.create', 'appointment', appt.id, req, { doctorId: appt.doctorId })
  persist().catch(() => {})
  return appt
}

function whatsappReply(rawMessage = '') {
  ensureReady()
  const base = publicSiteUrl()
  const msg = (rawMessage || '').trim().toLowerCase()
  const findP = (code) => state.prescriptions.find((x) => x.code === code)
  const now = Date.now()

  if (msg === 'help') return `PrivyHealth Pakistan WhatsApp Bot\n\nCommands:\n  verify PK-XXXXXX\n  fill PK-XXXXXX\n  refill PK-XXXXXX\n  my record\n  emergency`
  if (msg === 'my record' || msg === 'my records') return `Your PrivyHealth dashboard:\n${base}/patient`
  if (msg === 'emergency') return `EMERGENCY ACCESS\n\n${base}/qr-scanner`

  const verifyMatch = msg.match(/^verify\s+(pk-[a-z0-9]+)$/i)
  if (verifyMatch) {
    const code = verifyMatch[1].toUpperCase()
    const p = findP(code)
    if (!p) return `❌ INVALID CODE\n\nNo prescription found for ${code}.`
    const expired = !p.filled && new Date(p.validUntil) < now
    if (p.filled) return `⚠️ ALREADY DISPENSED\n\nCode: ${code}\nMedicine: ${p.medication}`
    if (expired) return `❌ EXPIRED\n\nCode: ${code}`
    return `✅ VALID\n\nCode: ${code}\n${p.medication}\nDr: ${p.doctorName}\nReply: fill ${code}`
  }

  const fillMatch = msg.match(/^fill\s+(pk-[a-z0-9]+)$/i)
  if (fillMatch) {
    const code = fillMatch[1].toUpperCase()
    const out = fillPrescription(code, { pharmacyId: 'whatsapp-demo', pharmacyName: 'WhatsApp Demo' }, null)
    if (out.error) return `❌ Cannot fill ${code}: ${out.error}`
    const p = findP(code)
    return `✅ DISPENSED\n\nCode: ${code}\n${p?.medication || ''}`
  }

  const refillMatch = msg.match(/^refill\s+(pk-[a-z0-9]+)$/i)
  if (refillMatch) {
    const code = refillMatch[1].toUpperCase()
    const p = findP(code)
    if (!p) return `❌ Code ${code} not found.`
    if (p.refillsUsed >= p.refillsAllowed) return `❌ NO REFILLS for ${code}`
    p.refillsUsed++
    persist().catch(() => {})
    return `✅ REFILL OK\n${code} · remaining ${p.refillsAllowed - p.refillsUsed}`
  }

  return `Try: verify PK-7X4M2K or visit ${base}`
}

module.exports = {
  initPostgresDb,
  store: null,
  generateCode,
  listPrescriptions,
  createPrescription,
  verifyByCode,
  fillPrescription,
  listActivePharmacies,
  registerPharmacy,
  pharmacyStats,
  adminOverview,
  listAppointments,
  createAppointment,
  whatsappReply,
  auditLog,
}

