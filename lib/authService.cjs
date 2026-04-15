const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const { v4: uuidv4 } = require('uuid')

const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-change-in-production'
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || '8h'

function getDbOrNull() {
  if (process.env.FORCE_MEMORY_STORE === '1') return null
  try {
    const { getDb } = require('./sqljsDataStore.cjs')
    return getDb() || null
  } catch {
    return null
  }
}

function verifyToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null
  const token = authHeader.slice(7)
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch {
    return null
  }
}

function issueToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES })
}

function login(email, password) {
  const d = getDbOrNull()
  if (d) {
    const { get } = require('./sqljsDataStore.cjs')
    const em = String(email || 'admin@local.demo').toLowerCase()
    const row = get('SELECT * FROM users WHERE email = ?', [em])
    if (!row || !bcrypt.compareSync(password, row.password_hash)) return { error: 'Invalid credentials' }
    const token = issueToken({ sub: row.id, role: row.role, email: row.email })
    return { token, user: { id: row.id, email: row.email, role: row.role } }
  }
  const demo = process.env.ADMIN_BOOTSTRAP_PASSWORD || 'ChangeMe!Admin2026'
  if (String(email || '').toLowerCase() === 'admin@local.demo' && password === demo) {
    const token = issueToken({ sub: 'mem-admin', role: 'admin', email: 'admin@local.demo' })
    return { token, user: { id: 'mem-admin', email: 'admin@local.demo', role: 'admin' } }
  }
  const doctorPass = process.env.DOCTOR_BOOTSTRAP_PASSWORD || 'ChangeMe!Doctor2026'
  if (String(email || '').toLowerCase() === 'doctor@local.demo' && password === doctorPass) {
    const token = issueToken({ sub: 'mem-doctor', role: 'doctor', email: 'doctor@local.demo' })
    return { token, user: { id: 'mem-doctor', email: 'doctor@local.demo', role: 'doctor' } }
  }
  const pharmacyPass = process.env.PHARMACY_BOOTSTRAP_PASSWORD || 'ChangeMe!Pharmacy2026'
  if (String(email || '').toLowerCase() === 'pharmacy@local.demo' && password === pharmacyPass) {
    const token = issueToken({ sub: 'mem-pharmacy', role: 'pharmacy', email: 'pharmacy@local.demo' })
    return { token, user: { id: 'mem-pharmacy', email: 'pharmacy@local.demo', role: 'pharmacy' } }
  }
  const legacy = process.env.ADMIN_DEMO_PASSWORD || 'entangled2026'
  if (password === legacy) {
    const token = issueToken({ sub: 'legacy-admin', role: 'admin', email: 'admin@legacy.demo' })
    return { token, user: { id: 'legacy-admin', email: 'admin@legacy.demo', role: 'admin' } }
  }
  return { error: 'Invalid credentials' }
}

function registerUser({ email, password, role }, req) {
  const open = process.env.OPEN_REGISTRATION === '1'
  const allowPharmacy = process.env.ALLOW_PHARMACY_SELF_REG !== '0'
  if (!open && !(role === 'pharmacy' && allowPharmacy)) return { error: 'Registration closed' }
  if (!['patient', 'pharmacy', 'doctor'].includes(role)) return { error: 'Invalid role' }
  const d = getDbOrNull()
  if (!d) return { error: 'Database not available' }
  const { get, run, auditLog } = require('./sqljsDataStore.cjs')
  const em = String(email).toLowerCase()
  const exists = get('SELECT 1 as x FROM users WHERE email = ?', [em])
  if (exists) return { error: 'Email already registered' }
  const id = uuidv4()
  const hash = bcrypt.hashSync(password, 10)
  run('INSERT INTO users (id, email, password_hash, role, wallet_address, created_at) VALUES (?,?,?,?,?,?)', [
    id,
    em,
    hash,
    role,
    null,
    new Date().toISOString(),
  ])
  auditLog(id, 'user.register', 'user', id, req, { email: em, role })
  const token = issueToken({ sub: id, role, email: em })
  return { token, user: { id, email: em, role } }
}

module.exports = { verifyToken, issueToken, login, registerUser, JWT_SECRET }
