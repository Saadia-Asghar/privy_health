const { v4: uuidv4 } = require('uuid')
const { publicSiteUrl } = require('./publicSite.cjs')

const store = { prescriptions: [], pharmacies: [], appointments: [] }

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = 'PK-'
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return code
}

function seed() {
  const now = Date.now()
  store.pharmacies = [
    { id: 'demo-pharmacy', name: 'Medico Pharmacy', city: 'Karachi', drapLicense: 'DRAP-KHI-2341', whatsappNumber: '+923001234567', tier: 'Verified', verifications: 147, canFillControlled: false, status: 'Active', registeredAt: new Date(now - 86400000 * 90).toISOString() },
    { id: 'p2', name: 'Al-Shifa Chemists', city: 'Karachi', drapLicense: 'DRAP-KHI-0821', whatsappNumber: '+923012345678', tier: 'Premium', verifications: 523, canFillControlled: true, status: 'Active', registeredAt: new Date(now - 86400000 * 180).toISOString() },
    { id: 'p3', name: 'City Pharmacy', city: 'Lahore', drapLicense: 'DRAP-LHR-1122', whatsappNumber: '+923021234567', tier: 'Basic', verifications: 34, canFillControlled: false, status: 'Active', registeredAt: new Date(now - 86400000 * 30).toISOString() },
    { id: 'p4', name: 'Islamabad Meds', city: 'Islamabad', drapLicense: 'DRAP-ISB-0442', whatsappNumber: '+923031234567', tier: 'Verified', verifications: 201, canFillControlled: false, status: 'Active', registeredAt: new Date(now - 86400000 * 60).toISOString() },
    { id: 'p5', name: 'Punjab Pharmacy', city: 'Lahore', drapLicense: 'DRAP-LHR-3341', whatsappNumber: '+923041234567', tier: 'Basic', verifications: 67, canFillControlled: false, status: 'Active', registeredAt: new Date(now - 86400000 * 45).toISOString() },
  ]
  store.prescriptions = [
    { id: uuidv4(), code: 'PK-7X4M2K', patientId: 'demo-patient', patientName: 'Ayesha Malik', patientAllergies: ['Penicillin'], doctorId: 'demo-doctor', doctorName: 'Dr. Ahmed Khan', medication: 'Augmentin 625mg', dosage: '2 tablets', frequency: 'twice daily', duration: '5 days', category: 'ScheduleG', refillsAllowed: 0, refillsUsed: 0, notes: 'Take with food', filled: false, filledBy: null, filledAt: null, cancelled: false, issuedAt: new Date(now - 86400000).toISOString(), validUntil: new Date(now + 86400000 * 7).toISOString() },
    { id: uuidv4(), code: 'PK-9KRM4X', patientId: 'demo-patient', patientName: 'Ayesha Malik', patientAllergies: ['Penicillin'], doctorId: 'demo-doctor', doctorName: 'Dr. Ahmed Khan', medication: 'Metformin 500mg', dosage: '1 tablet', frequency: 'once daily', duration: '30 days', category: 'ScheduleH', refillsAllowed: 3, refillsUsed: 1, notes: '', filled: true, filledBy: 'demo-pharmacy', filledAt: new Date(now - 86400000 * 3).toISOString(), cancelled: false, issuedAt: new Date(now - 86400000 * 35).toISOString(), validUntil: new Date(now + 86400000 * 25).toISOString() },
    { id: uuidv4(), code: 'PK-2BX8NQ', patientId: 'demo-patient', patientName: 'Ayesha Malik', patientAllergies: ['Penicillin'], doctorId: 'demo-doctor', doctorName: 'Dr. Ahmed Khan', medication: 'Ciprofloxacin 500mg', dosage: '1 tablet', frequency: 'twice daily', duration: '7 days', category: 'ScheduleG', refillsAllowed: 0, refillsUsed: 0, notes: '', filled: false, filledBy: null, filledAt: null, cancelled: false, issuedAt: new Date(now - 86400000 * 2).toISOString(), validUntil: new Date(now + 86400000 * 5).toISOString() },
  ]
  store.appointments = [
    {
      id: uuidv4(),
      doctorId: 'PMDC-12345',
      doctorName: 'Dr. Ahmed Khan',
      specialty: 'General Physician',
      city: 'Karachi',
      slot: 'morning',
      patientName: 'Ayesha Malik',
      phone: '+923001112223',
      note: 'Recurring cough',
      status: 'requested',
      createdAt: new Date(now - 3600000 * 2).toISOString(),
    },
  ]
}

seed()

function listPrescriptions(query = {}) {
  const { patientId, doctorId } = query
  const now = Date.now()
  let results = store.prescriptions
  if (patientId) results = results.filter((p) => p.patientId === patientId)
  if (doctorId) results = results.filter((p) => p.doctorId === doctorId)
  return results.map((p) => ({ ...p, expired: !p.filled && new Date(p.validUntil) < now }))
}

function createPrescription(body, _req = null) {
  const { patientId, patientName, doctorId, doctorName, medication, dosage, frequency, duration, category, refillsAllowed, notes } = body
  if (!medication || !doctorId) throw new Error('Missing required fields')
  const code = generateCode()
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
    filledAt: null,
    cancelled: false,
    issuedAt: now.toISOString(),
    validUntil: new Date(now.getTime() + 86400000 * 14).toISOString(),
  }
  store.prescriptions.push(rx)
  return rx
}

function verifyByCode(rawCode) {
  const code = String(rawCode).toUpperCase()
  const p = store.prescriptions.find((x) => x.code === code)
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

function fillPrescription(rawCode, body = {}, _req = null) {
  const code = String(rawCode).toUpperCase()
  const { pharmacyId, pharmacyName } = body
  const p = store.prescriptions.find((x) => x.code === code)
  if (!p) return { error: 'not_found', status: 404 }
  if (p.filled) return { error: 'already_filled', status: 400 }
  if (new Date(p.validUntil) < Date.now()) return { error: 'expired', status: 400 }
  p.filled = true
  p.filledBy = pharmacyId
  p.filledByName = pharmacyName
  p.filledAt = new Date().toISOString()
  const ph = store.pharmacies.find((x) => x.id === pharmacyId)
  if (ph) {
    ph.verifications++
    if (ph.verifications >= 500 && ph.tier !== 'Premium') {
      ph.tier = 'Premium'
      ph.canFillControlled = true
    } else if (ph.verifications >= 100 && ph.tier === 'Basic') ph.tier = 'Verified'
  }
  return { success: true }
}

function listActivePharmacies() {
  return store.pharmacies.filter((p) => p.status === 'Active')
}

function registerPharmacy(body, _req = null) {
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
  store.pharmacies.push(ph)
  return ph
}

function pharmacyStats(id) {
  const ph = store.pharmacies.find((p) => p.id === id)
  if (!ph) return null
  const today = store.prescriptions.filter(
    (p) => p.filledBy === id && p.filledAt && new Date(p.filledAt).toDateString() === new Date().toDateString()
  ).length
  return { ...ph, todayVerifications: today }
}

function adminOverview() {
  const total = store.prescriptions.length
  const filled = store.prescriptions.filter((p) => p.filled).length
  const byCategory = {}
  store.prescriptions.forEach((p) => {
    byCategory[p.category] = (byCategory[p.category] || 0) + 1
  })
  return {
    totalPrescriptions: total,
    filledPrescriptions: filled,
    fillRate: total > 0 ? Math.round((filled / total) * 100) : 0,
    totalPharmacies: store.pharmacies.length,
    totalAppointments: store.appointments.length,
    byCategory,
    pharmacies: store.pharmacies,
    appointments: store.appointments.slice(-10).reverse(),
  }
}

function listAppointments(query = {}) {
  const { doctorId, city, status } = query
  let rows = store.appointments
  if (doctorId) rows = rows.filter((a) => a.doctorId === doctorId)
  if (city) rows = rows.filter((a) => a.city === city)
  if (status) rows = rows.filter((a) => a.status === status)
  return [...rows].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

function createAppointment(body, _req = null) {
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
  store.appointments.push(appt)
  return appt
}

function whatsappReply(rawMessage = '') {
  const base = publicSiteUrl()
  const msg = (rawMessage || '').trim().toLowerCase()
  const now = Date.now()

  if (msg === 'help') {
    return `PrivyHealth Pakistan WhatsApp Bot\n\nCommands:\n  verify PK-XXXXXX  — Check if prescription is valid\n  fill PK-XXXXXX    — Mark as dispensed (pharmacy)\n  refill PK-XXXXXX  — Request a refill\n  my record         — Get your health record link\n  emergency         — Emergency access info\n\nPowered by WireFluid Network`
  }

  if (msg === 'my record' || msg === 'my records') {
    return `Your PrivyHealth dashboard:\n${base}/patient\n\nYou have 2 active prescriptions.\nLast accessed: just now`
  }

  if (msg === 'emergency') {
    return `EMERGENCY ACCESS\n\nShare this QR link with emergency doctors:\n${base}/qr-scanner\n\nThey can scan to access your blood type and allergies instantly — no login needed.`
  }

  const verifyMatch = msg.match(/^verify\s+(pk-[a-z0-9]+)$/i)
  if (verifyMatch) {
    const code = verifyMatch[1].toUpperCase()
    const p = store.prescriptions.find((x) => x.code === code)
    if (!p) return `❌ INVALID CODE\n\nNo prescription found for ${code}.\n\nCheck the code and try again, or ask your doctor to re-issue.`
    const expired = !p.filled && new Date(p.validUntil) < now
    if (p.filled)
      return `⚠️ ALREADY DISPENSED\n\nCode: ${code}\nMedicine: ${p.medication}\n\nThis prescription was already dispensed on ${new Date(p.filledAt).toLocaleDateString('en-PK')}.\n\nFor a refill, patient must see Dr. ${p.doctorName} again.`
    if (expired)
      return `❌ PRESCRIPTION EXPIRED\n\nCode: ${code}\nMedicine: ${p.medication}\nExpired: ${new Date(p.validUntil).toLocaleDateString('en-PK')}\n\nPatient needs a new prescription from their doctor.`
    return `✅ VALID PRESCRIPTION\n\nCode: ${code}\nMedicine: ${p.medication}\nDosage: ${p.dosage} · ${p.frequency}\nDoctor: ${p.doctorName} ✓\nPatient: ${p.patientName}\nValid until: ${new Date(p.validUntil).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' })}\nCategory: ${p.category}\n${p.patientAllergies?.length ? `\n⚠ ALLERGY ALERT: ${p.patientAllergies.join(', ')}` : ''}\nReply: fill ${code}  to mark as dispensed`
  }

  const fillMatch = msg.match(/^fill\s+(pk-[a-z0-9]+)$/i)
  if (fillMatch) {
    const code = fillMatch[1].toUpperCase()
    const p = store.prescriptions.find((x) => x.code === code)
    if (!p) return `❌ Code ${code} not found. Verify first with: verify ${code}`
    if (p.filled) return `⚠️ ${code} was already dispensed. Cannot fill twice.`
    p.filled = true
    p.filledBy = 'whatsapp-demo'
    p.filledByName = 'WhatsApp Demo'
    p.filledAt = new Date().toISOString()
    return `✅ DISPENSED — Recorded on WireFluid\n\nCode: ${code}\nMedicine: ${p.medication}\nPatient: ${p.patientName}\nTime: ${new Date().toLocaleTimeString('en-PK')}\n\nThis prescription cannot be filled again. Record saved permanently.`
  }

  const refillMatch = msg.match(/^refill\s+(pk-[a-z0-9]+)$/i)
  if (refillMatch) {
    const code = refillMatch[1].toUpperCase()
    const p = store.prescriptions.find((x) => x.code === code)
    if (!p) return `❌ Code ${code} not found.`
    if (p.refillsUsed >= p.refillsAllowed)
      return `❌ NO REFILLS REMAINING\n\nCode: ${code}\nRefills used: ${p.refillsUsed}/${p.refillsAllowed}\n\nPatient needs a new prescription from Dr. ${p.doctorName}.`
    p.refillsUsed++
    return `✅ REFILL APPROVED\n\nCode: ${code}\nMedicine: ${p.medication}\nRefills remaining: ${p.refillsAllowed - p.refillsUsed}\n\nDispense as per original prescription.`
  }

  return `I didn't understand that command.\n\nTry:\n  verify PK-7X4M2K\n  fill PK-7X4M2K\n  help\n\nOr visit ${base} for full access.`
}

module.exports = {
  store,
  generateCode,
  seed,
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
}
