const express = require('express')
const cors = require('cors')
const { v4: uuidv4 } = require('uuid')

const app = express()
app.use(cors())
app.use(express.json())

const store = { prescriptions: [], pharmacies: [] }

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
}
seed()

app.get('/api/prescriptions', (req, res) => {
  const { patientId, doctorId } = req.query
  const now = Date.now()
  let results = store.prescriptions
  if (patientId) results = results.filter(p => p.patientId === patientId)
  if (doctorId) results = results.filter(p => p.doctorId === doctorId)
  res.json(results.map(p => ({ ...p, expired: !p.filled && new Date(p.validUntil) < now })))
})

app.post('/api/prescriptions', (req, res) => {
  const { patientId, patientName, doctorId, doctorName, medication, dosage, frequency, duration, category, refillsAllowed, notes } = req.body
  if (!medication || !doctorId) return res.status(400).json({ error: 'Missing required fields' })
  const code = generateCode()
  const now = new Date()
  const rx = { id: uuidv4(), code, patientId: patientId || 'unknown', patientName: patientName || 'Unknown', patientAllergies: [], doctorId, doctorName: doctorName || 'Unknown', medication, dosage, frequency, duration, category: category || 'ScheduleH', refillsAllowed: parseInt(refillsAllowed) || 0, refillsUsed: 0, notes: notes || '', filled: false, filledBy: null, filledAt: null, cancelled: false, issuedAt: now.toISOString(), validUntil: new Date(now.getTime() + 86400000 * 14).toISOString() }
  store.prescriptions.push(rx)
  res.json(rx)
})

app.get('/api/prescriptions/verify/:code', (req, res) => {
  const code = req.params.code.toUpperCase()
  const p = store.prescriptions.find(x => x.code === code)
  if (!p) return res.json({ valid: false, error: 'No prescription found with this code.' })
  const expired = !p.filled && new Date(p.validUntil) < Date.now()
  res.json({ valid: !p.filled && !p.cancelled && !expired, filled: p.filled, expired, cancelled: p.cancelled, code: p.code, medication: p.medication, dosage: p.dosage, frequency: p.frequency, duration: p.duration, doctorName: p.doctorName, patientName: p.patientName, patientAllergies: p.patientAllergies, category: p.category, refillsAllowed: p.refillsAllowed, refillsUsed: p.refillsUsed, validUntil: p.validUntil, issuedAt: p.issuedAt, filledAt: p.filledAt || null })
})

app.post('/api/prescriptions/fill/:code', (req, res) => {
  const code = req.params.code.toUpperCase()
  const { pharmacyId, pharmacyName } = req.body
  const p = store.prescriptions.find(x => x.code === code)
  if (!p) return res.status(404).json({ error: 'Not found' })
  if (p.filled) return res.status(400).json({ error: 'Already filled' })
  if (new Date(p.validUntil) < Date.now()) return res.status(400).json({ error: 'Expired' })
  p.filled = true; p.filledBy = pharmacyId; p.filledByName = pharmacyName; p.filledAt = new Date().toISOString()
  const ph = store.pharmacies.find(x => x.id === pharmacyId)
  if (ph) { ph.verifications++; if (ph.verifications >= 500 && ph.tier !== 'Premium') { ph.tier = 'Premium'; ph.canFillControlled = true } else if (ph.verifications >= 100 && ph.tier === 'Basic') ph.tier = 'Verified' }
  res.json({ success: true })
})

app.get('/api/pharmacies', (req, res) => res.json(store.pharmacies.filter(p => p.status === 'Active')))

app.post('/api/pharmacies', (req, res) => {
  const { name, city, drapLicense, whatsappNumber } = req.body
  if (!name || !city) return res.status(400).json({ error: 'Missing fields' })
  const ph = { id: uuidv4(), name, city, drapLicense, whatsappNumber: whatsappNumber || '', tier: 'Basic', verifications: 0, canFillControlled: false, status: 'Pending', registeredAt: new Date().toISOString() }
  store.pharmacies.push(ph)
  res.json(ph)
})

app.get('/api/pharmacy/:id/stats', (req, res) => {
  const ph = store.pharmacies.find(p => p.id === req.params.id)
  if (!ph) return res.status(404).json({ error: 'Not found' })
  const today = store.prescriptions.filter(p => p.filledBy === req.params.id && p.filledAt && new Date(p.filledAt).toDateString() === new Date().toDateString()).length
  res.json({ ...ph, todayVerifications: today })
})

app.get('/api/admin/overview', (req, res) => {
  const total = store.prescriptions.length
  const filled = store.prescriptions.filter(p => p.filled).length
  const byCategory = {}
  store.prescriptions.forEach(p => { byCategory[p.category] = (byCategory[p.category] || 0) + 1 })
  res.json({ totalPrescriptions: total, filledPrescriptions: filled, fillRate: total > 0 ? Math.round(filled / total * 100) : 0, totalPharmacies: store.pharmacies.length, byCategory, pharmacies: store.pharmacies })
})

app.post('/api/whatsapp/test', (req, res) => {
  const { message } = req.body
  const msg = (message || '').trim().toLowerCase()
  const now = Date.now()

  if (msg === 'help') {
    return res.json({ reply: `PrivyHealth Pakistan WhatsApp Bot\n\nCommands:\n  verify PK-XXXXXX  — Check if prescription is valid\n  fill PK-XXXXXX    — Mark as dispensed (pharmacy)\n  refill PK-XXXXXX  — Request a refill\n  my record         — Get your health record link\n  emergency         — Emergency access info\n\nPowered by WireFluid Network` })
  }

  if (msg === 'my record' || msg === 'my records') {
    return res.json({ reply: `Your PrivyHealth dashboard:\nhttps://privyhealth.pk/patient\n\nYou have 2 active prescriptions.\nLast accessed: just now` })
  }

  if (msg === 'emergency') {
    return res.json({ reply: `EMERGENCY ACCESS\n\nShare this QR link with emergency doctors:\nhttps://privyhealth.pk/emergency/scan\n\nThey can scan to access your blood type and allergies instantly — no login needed.` })
  }

  const verifyMatch = msg.match(/^verify\s+(pk-[a-z0-9]+)$/i)
  if (verifyMatch) {
    const code = verifyMatch[1].toUpperCase()
    const p = store.prescriptions.find(x => x.code === code)
    if (!p) return res.json({ reply: `❌ INVALID CODE\n\nNo prescription found for ${code}.\n\nCheck the code and try again, or ask your doctor to re-issue.` })
    const expired = !p.filled && new Date(p.validUntil) < now
    if (p.filled) return res.json({ reply: `⚠️ ALREADY DISPENSED\n\nCode: ${code}\nMedicine: ${p.medication}\n\nThis prescription was already dispensed on ${new Date(p.filledAt).toLocaleDateString('en-PK')}.\n\nFor a refill, patient must see Dr. ${p.doctorName} again.` })
    if (expired) return res.json({ reply: `❌ PRESCRIPTION EXPIRED\n\nCode: ${code}\nMedicine: ${p.medication}\nExpired: ${new Date(p.validUntil).toLocaleDateString('en-PK')}\n\nPatient needs a new prescription from their doctor.` })
    return res.json({ reply: `✅ VALID PRESCRIPTION\n\nCode: ${code}\nMedicine: ${p.medication}\nDosage: ${p.dosage} · ${p.frequency}\nDoctor: ${p.doctorName} ✓\nPatient: ${p.patientName}\nValid until: ${new Date(p.validUntil).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' })}\nCategory: ${p.category}\n${p.patientAllergies?.length ? `\n⚠ ALLERGY ALERT: ${p.patientAllergies.join(', ')}` : ''}\nReply: fill ${code}  to mark as dispensed` })
  }

  const fillMatch = msg.match(/^fill\s+(pk-[a-z0-9]+)$/i)
  if (fillMatch) {
    const code = fillMatch[1].toUpperCase()
    const p = store.prescriptions.find(x => x.code === code)
    if (!p) return res.json({ reply: `❌ Code ${code} not found. Verify first with: verify ${code}` })
    if (p.filled) return res.json({ reply: `⚠️ ${code} was already dispensed. Cannot fill twice.` })
    p.filled = true; p.filledBy = 'whatsapp-demo'; p.filledByName = 'WhatsApp Demo'; p.filledAt = new Date().toISOString()
    return res.json({ reply: `✅ DISPENSED — Recorded on WireFluid\n\nCode: ${code}\nMedicine: ${p.medication}\nPatient: ${p.patientName}\nTime: ${new Date().toLocaleTimeString('en-PK')}\n\nThis prescription cannot be filled again. Record saved permanently.` })
  }

  const refillMatch = msg.match(/^refill\s+(pk-[a-z0-9]+)$/i)
  if (refillMatch) {
    const code = refillMatch[1].toUpperCase()
    const p = store.prescriptions.find(x => x.code === code)
    if (!p) return res.json({ reply: `❌ Code ${code} not found.` })
    if (p.refillsUsed >= p.refillsAllowed) return res.json({ reply: `❌ NO REFILLS REMAINING\n\nCode: ${code}\nRefills used: ${p.refillsUsed}/${p.refillsAllowed}\n\nPatient needs a new prescription from Dr. ${p.doctorName}.` })
    p.refillsUsed++
    return res.json({ reply: `✅ REFILL APPROVED\n\nCode: ${code}\nMedicine: ${p.medication}\nRefills remaining: ${p.refillsAllowed - p.refillsUsed}\n\nDispense as per original prescription.` })
  }

  return res.json({ reply: `I didn't understand that command.\n\nTry:\n  verify PK-7X4M2K\n  fill PK-7X4M2K\n  help\n\nOr visit privyhealth.pk for full access.` })
})

const PORT = process.env.API_PORT || 3001
app.listen(PORT, '127.0.0.1', () => console.log(`PrivyHealth API running on port ${PORT}`))
