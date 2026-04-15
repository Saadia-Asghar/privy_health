const path = require('path')
const fs = require('fs')
const { v4: uuidv4 } = require('uuid')
const { publicSiteUrl } = require('./publicSite.cjs')

let db
let initialized = false

function persist() {
  if (!db) return
  try {
    const file = process.env.SQLJS_PATH || path.join(__dirname, '../data/privyhealth.db')
    fs.mkdirSync(path.dirname(file), { recursive: true })
    fs.writeFileSync(file, Buffer.from(db.export()))
  } catch (e) {
    console.warn('[sqljs] persist failed', e.message)
  }
}

function all(sql, params = []) {
  const stmt = db.prepare(sql)
  if (params && params.length) stmt.bind(params)
  const rows = []
  while (stmt.step()) rows.push(stmt.getAsObject())
  stmt.free()
  return rows
}

function get(sql, params = []) {
  const r = all(sql, params)
  return r[0] || null
}

function run(sql, params = []) {
  db.run(sql, params)
  persist()
}

async function initSqlJsDb() {
  if (initialized) return
  const initSqlJs = require('sql.js')
  const wasmPath = require.resolve('sql.js/dist/sql-wasm.wasm')
  const SQL = await initSqlJs({ locateFile: () => wasmPath })
  const file = process.env.SQLJS_PATH || path.join(__dirname, '../data/privyhealth.db')
  if (fs.existsSync(file)) {
    const buf = fs.readFileSync(file)
    db = new SQL.Database(buf)
  } else {
    db = new SQL.Database()
  }
  initSchema()
  bootstrapUsers()
  seedDemoData()
  initialized = true
}

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL,
      wallet_address TEXT,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS pharmacies (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      city TEXT NOT NULL,
      drap_license TEXT,
      whatsapp_number TEXT,
      tier TEXT NOT NULL,
      verifications INTEGER NOT NULL DEFAULT 0,
      can_fill_controlled INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL,
      registered_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS prescriptions (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      patient_id TEXT,
      patient_name TEXT,
      patient_allergies TEXT,
      doctor_id TEXT,
      doctor_name TEXT,
      medication TEXT,
      dosage TEXT,
      frequency TEXT,
      duration TEXT,
      category TEXT,
      refills_allowed INTEGER NOT NULL DEFAULT 0,
      refills_used INTEGER NOT NULL DEFAULT 0,
      notes TEXT,
      filled INTEGER NOT NULL DEFAULT 0,
      filled_by TEXT,
      filled_by_name TEXT,
      filled_at TEXT,
      cancelled INTEGER NOT NULL DEFAULT 0,
      issued_at TEXT NOT NULL,
      valid_until TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      actor_id TEXT,
      action TEXT NOT NULL,
      resource_type TEXT,
      resource_id TEXT,
      ip TEXT,
      user_agent TEXT,
      payload TEXT,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS appointments (
      id TEXT PRIMARY KEY,
      doctor_id TEXT,
      doctor_name TEXT NOT NULL,
      specialty TEXT,
      city TEXT,
      slot TEXT NOT NULL,
      patient_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      note TEXT,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `)
  persist()
}

function bootstrapUsers() {
  const bcrypt = require('bcryptjs')
  const n = get('SELECT COUNT(*) as c FROM users')?.c ?? 0
  if (n > 0) return
  const pass = process.env.ADMIN_BOOTSTRAP_PASSWORD || 'ChangeMe!Admin2026'
  const hash = bcrypt.hashSync(pass, 10)
  run('INSERT INTO users (id, email, password_hash, role, wallet_address, created_at) VALUES (?,?,?,?,?,?)', [
    uuidv4(),
    'admin@local.demo',
    hash,
    'admin',
    null,
    new Date().toISOString(),
  ])
  run('INSERT INTO users (id, email, password_hash, role, wallet_address, created_at) VALUES (?,?,?,?,?,?)', [
    uuidv4(),
    'doctor@local.demo',
    bcrypt.hashSync(process.env.DOCTOR_BOOTSTRAP_PASSWORD || 'ChangeMe!Doctor2026', 10),
    'doctor',
    null,
    new Date().toISOString(),
  ])
  run('INSERT INTO users (id, email, password_hash, role, wallet_address, created_at) VALUES (?,?,?,?,?,?)', [
    uuidv4(),
    'pharmacy@local.demo',
    bcrypt.hashSync(process.env.PHARMACY_BOOTSTRAP_PASSWORD || 'ChangeMe!Pharmacy2026', 10),
    'pharmacy',
    null,
    new Date().toISOString(),
  ])
}

function seedDemoData() {
  const pc = get('SELECT COUNT(*) as c FROM prescriptions')
  if (pc && pc.c > 0) return
  const now = Date.now()
  const phRows = [
    ['demo-pharmacy', 'Medico Pharmacy', 'Karachi', 'DRAP-KHI-2341', '+923001234567', 'Verified', 147, 0, 'Active', new Date(now - 86400000 * 90).toISOString()],
    ['p2', 'Al-Shifa Chemists', 'Karachi', 'DRAP-KHI-0821', '+923012345678', 'Premium', 523, 1, 'Active', new Date(now - 86400000 * 180).toISOString()],
    ['p3', 'City Pharmacy', 'Lahore', 'DRAP-LHR-1122', '+923021234567', 'Basic', 34, 0, 'Active', new Date(now - 86400000 * 30).toISOString()],
    ['p4', 'Islamabad Meds', 'Islamabad', 'DRAP-ISB-0442', '+923031234567', 'Verified', 201, 0, 'Active', new Date(now - 86400000 * 60).toISOString()],
    ['p5', 'Punjab Pharmacy', 'Lahore', 'DRAP-LHR-3341', '+923041234567', 'Basic', 67, 0, 'Active', new Date(now - 86400000 * 45).toISOString()],
  ]
  for (const r of phRows) {
    run(
      'INSERT INTO pharmacies (id,name,city,drap_license,whatsapp_number,tier,verifications,can_fill_controlled,status,registered_at) VALUES (?,?,?,?,?,?,?,?,?,?)',
      r
    )
  }
  const rows = [
    [
      uuidv4(),
      'PK-7X4M2K',
      'demo-patient',
      'Ayesha Malik',
      JSON.stringify(['Penicillin']),
      'demo-doctor',
      'Dr. Ahmed Khan',
      'Augmentin 625mg',
      '2 tablets',
      'twice daily',
      '5 days',
      'ScheduleG',
      0,
      0,
      'Take with food',
      0,
      null,
      null,
      null,
      0,
      new Date(now - 86400000).toISOString(),
      new Date(now + 86400000 * 7).toISOString(),
    ],
    [
      uuidv4(),
      'PK-9KRM4X',
      'demo-patient',
      'Ayesha Malik',
      JSON.stringify(['Penicillin']),
      'demo-doctor',
      'Dr. Ahmed Khan',
      'Metformin 500mg',
      '1 tablet',
      'once daily',
      '30 days',
      'ScheduleH',
      3,
      1,
      '',
      1,
      'demo-pharmacy',
      null,
      new Date(now - 86400000 * 3).toISOString(),
      0,
      new Date(now - 86400000 * 35).toISOString(),
      new Date(now + 86400000 * 25).toISOString(),
    ],
    [
      uuidv4(),
      'PK-2BX8NQ',
      'demo-patient',
      'Ayesha Malik',
      JSON.stringify(['Penicillin']),
      'demo-doctor',
      'Dr. Ahmed Khan',
      'Ciprofloxacin 500mg',
      '1 tablet',
      'twice daily',
      '7 days',
      'ScheduleG',
      0,
      0,
      '',
      0,
      null,
      null,
      null,
      0,
      new Date(now - 86400000 * 2).toISOString(),
      new Date(now + 86400000 * 5).toISOString(),
    ],
  ]
  const ins = `INSERT INTO prescriptions (
    id,code,patient_id,patient_name,patient_allergies,doctor_id,doctor_name,medication,dosage,frequency,duration,category,refills_allowed,refills_used,notes,filled,filled_by,filled_by_name,filled_at,cancelled,issued_at,valid_until
  ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
  for (const r of rows) run(ins, r)
}

function rowToRx(r) {
  if (!r) return null
  return {
    id: r.id,
    code: r.code,
    patientId: r.patient_id,
    patientName: r.patient_name,
    patientAllergies: r.patient_allergies ? JSON.parse(r.patient_allergies) : [],
    doctorId: r.doctor_id,
    doctorName: r.doctor_name,
    medication: r.medication,
    dosage: r.dosage,
    frequency: r.frequency,
    duration: r.duration,
    category: r.category,
    refillsAllowed: r.refills_allowed,
    refillsUsed: r.refills_used,
    notes: r.notes || '',
    filled: !!r.filled,
    filledBy: r.filled_by,
    filledByName: r.filled_by_name,
    filledAt: r.filled_at,
    cancelled: !!r.cancelled,
    issuedAt: r.issued_at,
    validUntil: r.valid_until,
  }
}

function rowToPh(r) {
  return {
    id: r.id,
    name: r.name,
    city: r.city,
    drapLicense: r.drap_license,
    whatsappNumber: r.whatsapp_number,
    tier: r.tier,
    verifications: r.verifications,
    canFillControlled: !!r.can_fill_controlled,
    status: r.status,
    registeredAt: r.registered_at,
  }
}

function auditLog(actorId, action, resourceType, resourceId, req, payload) {
  const ip = req?.ip || req?.headers?.['x-forwarded-for'] || ''
  const ua = req?.headers?.['user-agent'] || ''
  run(
    'INSERT INTO audit_logs (id, actor_id, action, resource_type, resource_id, ip, user_agent, payload, created_at) VALUES (?,?,?,?,?,?,?,?,?)',
    [
      uuidv4(),
      actorId || null,
      action,
      resourceType || null,
      resourceId || null,
      String(ip).slice(0, 128),
      String(ua).slice(0, 256),
      payload ? JSON.stringify(payload) : null,
      new Date().toISOString(),
    ]
  )
}

function getDb() {
  return db
}

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = 'PK-'
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return code
}

function listPrescriptions(query = {}) {
  const { patientId, doctorId } = query
  let sql = 'SELECT * FROM prescriptions WHERE 1=1'
  const params = []
  if (patientId) {
    sql += ' AND patient_id = ?'
    params.push(patientId)
  }
  if (doctorId) {
    sql += ' AND doctor_id = ?'
    params.push(doctorId)
  }
  const now = Date.now()
  return all(sql, params).map((r) => {
    const p = rowToRx(r)
    return { ...p, expired: !p.filled && new Date(p.validUntil) < now }
  })
}

function createPrescription(body, req = null) {
  const { patientId, patientName, doctorId, doctorName, medication, dosage, frequency, duration, category, refillsAllowed, notes } = body
  if (!medication || !doctorId) throw new Error('Missing required fields')
  let code = generateCode()
  while (get('SELECT 1 as x FROM prescriptions WHERE code = ?', [code])) code = generateCode()
  const now = new Date()
  const id = uuidv4()
  const rx = {
    id,
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
    filledAt: null,
    cancelled: false,
    issuedAt: now.toISOString(),
    validUntil: new Date(now.getTime() + 86400000 * 14).toISOString(),
  }
  run(
    `INSERT INTO prescriptions (id,code,patient_id,patient_name,patient_allergies,doctor_id,doctor_name,medication,dosage,frequency,duration,category,refills_allowed,refills_used,notes,filled,filled_by,filled_by_name,filled_at,cancelled,issued_at,valid_until)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      rx.id,
      rx.code,
      rx.patientId,
      rx.patientName,
      JSON.stringify(rx.patientAllergies),
      rx.doctorId,
      rx.doctorName,
      rx.medication,
      rx.dosage,
      rx.frequency,
      rx.duration,
      rx.category,
      rx.refillsAllowed,
      rx.refillsUsed,
      rx.notes,
      0,
      null,
      null,
      null,
      0,
      rx.issuedAt,
      rx.validUntil,
    ]
  )
  auditLog(body._actorId || null, 'prescription.create', 'prescription', rx.code, req, { code: rx.code })
  return rx
}

function verifyByCode(rawCode) {
  const code = String(rawCode).toUpperCase()
  const r = get('SELECT * FROM prescriptions WHERE code = ?', [code])
  const p = rowToRx(r)
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
  const code = String(rawCode).toUpperCase()
  const { pharmacyId, pharmacyName } = body
  const r = get('SELECT * FROM prescriptions WHERE code = ?', [code])
  const p = rowToRx(r)
  if (!p) return { error: 'not_found', status: 404 }
  if (p.filled) return { error: 'already_filled', status: 400 }
  if (new Date(p.validUntil) < Date.now()) return { error: 'expired', status: 400 }
  const filledAt = new Date().toISOString()
  run('UPDATE prescriptions SET filled = 1, filled_by = ?, filled_by_name = ?, filled_at = ? WHERE code = ?', [
    pharmacyId,
    pharmacyName || null,
    filledAt,
    code,
  ])
  const ph = get('SELECT * FROM pharmacies WHERE id = ?', [pharmacyId])
  if (ph) {
    let v = ph.verifications + 1
    let tier = ph.tier
    let cfc = ph.can_fill_controlled
    if (v >= 500 && tier !== 'Premium') {
      tier = 'Premium'
      cfc = 1
    } else if (v >= 100 && tier === 'Basic') tier = 'Verified'
    run('UPDATE pharmacies SET verifications = ?, tier = ?, can_fill_controlled = ? WHERE id = ?', [v, tier, cfc, pharmacyId])
  }
  auditLog(body._actorId || pharmacyId, 'prescription.fill', 'prescription', code, req, { pharmacyId })
  return { success: true }
}

function listActivePharmacies() {
  return all("SELECT * FROM pharmacies WHERE status = 'Active'").map(rowToPh)
}

function registerPharmacy(body, req = null) {
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
  run(
    'INSERT INTO pharmacies (id,name,city,drap_license,whatsapp_number,tier,verifications,can_fill_controlled,status,registered_at) VALUES (?,?,?,?,?,?,?,?,?,?)',
    [ph.id, ph.name, ph.city, ph.drapLicense, ph.whatsappNumber, ph.tier, 0, 0, ph.status, ph.registeredAt]
  )
  auditLog(null, 'pharmacy.register', 'pharmacy', ph.id, req, { name })
  return ph
}

function pharmacyStats(id) {
  const r = get('SELECT * FROM pharmacies WHERE id = ?', [id])
  if (!r) return null
  const ph = rowToPh(r)
  const row = get(
    `SELECT COUNT(*) as c FROM prescriptions WHERE filled_by = ? AND filled_at IS NOT NULL AND date(filled_at) = date('now')`,
    [id]
  )
  const today = row ? row.c : 0
  return { ...ph, todayVerifications: today }
}

function adminOverview() {
  const total = get('SELECT COUNT(*) as c FROM prescriptions')?.c ?? 0
  const filled = get('SELECT COUNT(*) as c FROM prescriptions WHERE filled = 1')?.c ?? 0
  const cats = all('SELECT category, COUNT(*) as n FROM prescriptions GROUP BY category')
  const byCategory = {}
  cats.forEach((x) => {
    byCategory[x.category] = x.n
  })
  const pharmacies = all('SELECT * FROM pharmacies').map(rowToPh)
  return {
    totalPrescriptions: total,
    filledPrescriptions: filled,
    fillRate: total > 0 ? Math.round((filled / total) * 100) : 0,
    totalPharmacies: get('SELECT COUNT(*) as c FROM pharmacies')?.c ?? 0,
    totalAppointments: get('SELECT COUNT(*) as c FROM appointments')?.c ?? 0,
    byCategory,
    pharmacies,
    appointments: all('SELECT * FROM appointments ORDER BY created_at DESC LIMIT 10').map((r) => ({
      id: r.id,
      doctorId: r.doctor_id,
      doctorName: r.doctor_name,
      specialty: r.specialty,
      city: r.city,
      slot: r.slot,
      patientName: r.patient_name,
      phone: r.phone,
      note: r.note || '',
      status: r.status,
      createdAt: r.created_at,
    })),
  }
}

function listAppointments(query = {}) {
  const { doctorId, city, status } = query
  let sql = 'SELECT * FROM appointments WHERE 1=1'
  const params = []
  if (doctorId) {
    sql += ' AND doctor_id = ?'
    params.push(doctorId)
  }
  if (city) {
    sql += ' AND city = ?'
    params.push(city)
  }
  if (status) {
    sql += ' AND status = ?'
    params.push(status)
  }
  sql += ' ORDER BY created_at DESC'
  return all(sql, params).map((r) => ({
    id: r.id,
    doctorId: r.doctor_id,
    doctorName: r.doctor_name,
    specialty: r.specialty,
    city: r.city,
    slot: r.slot,
    patientName: r.patient_name,
    phone: r.phone,
    note: r.note || '',
    status: r.status,
    createdAt: r.created_at,
  }))
}

function createAppointment(body, req = null) {
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
  run(
    `INSERT INTO appointments (id,doctor_id,doctor_name,specialty,city,slot,patient_name,phone,note,status,created_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    [appt.id, appt.doctorId, appt.doctorName, appt.specialty, appt.city, appt.slot, appt.patientName, appt.phone, appt.note, appt.status, appt.createdAt]
  )
  auditLog(body._actorId || null, 'appointment.create', 'appointment', appt.id, req, { doctorId: appt.doctorId })
  return appt
}

function whatsappReply(rawMessage = '') {
  const base = publicSiteUrl()
  const msg = (rawMessage || '').trim().toLowerCase()
  const now = Date.now()
  const findP = (code) => rowToRx(get('SELECT * FROM prescriptions WHERE code = ?', [code]))

  if (msg === 'help') {
    return `PrivyHealth Pakistan WhatsApp Bot\n\nCommands:\n  verify PK-XXXXXX\n  fill PK-XXXXXX\n  refill PK-XXXXXX\n  my record\n  emergency\n\nPowered by WireFluid Network`
  }
  if (msg === 'my record' || msg === 'my records') {
    return `Your PrivyHealth dashboard:\n${base}/patient\n\nYou have active prescriptions on file.`
  }
  if (msg === 'emergency') {
    return `EMERGENCY ACCESS\n\n${base}/qr-scanner`
  }

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
    const p = findP(code)
    if (!p) return `❌ Code ${code} not found.`
    if (p.filled) return `⚠️ ${code} already dispensed.`
    fillPrescription(code, { pharmacyId: 'whatsapp-demo', pharmacyName: 'WhatsApp Demo' })
    return `✅ DISPENSED\n\nCode: ${code}\n${p.medication}`
  }

  const refillMatch = msg.match(/^refill\s+(pk-[a-z0-9]+)$/i)
  if (refillMatch) {
    const code = refillMatch[1].toUpperCase()
    const p = findP(code)
    if (!p) return `❌ Code ${code} not found.`
    if (p.refillsUsed >= p.refillsAllowed) return `❌ NO REFILLS for ${code}`
    run('UPDATE prescriptions SET refills_used = refills_used + 1 WHERE code = ?', [code])
    const p2 = findP(code)
    return `✅ REFILL OK\n${code} · remaining ${p2.refillsAllowed - p2.refillsUsed}`
  }

  return `Try: verify PK-7X4M2K or visit ${base}`
}

module.exports = {
  initSqlJsDb,
  getDb,
  auditLog,
  run,
  get,
  all,
  generateCode,
  seed: () => {},
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
  store: null,
}
