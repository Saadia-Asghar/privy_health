const express = require('express')
const { login, registerUser, verifyToken } = require('../../lib/authService.cjs')
const { authLimiter } = require('./middleware.cjs')

const router = express.Router()

async function ensureSql() {
  if (process.env.FORCE_MEMORY_STORE === '1') return
  try {
    await require('../../lib/sqljsDataStore.cjs').initSqlJsDb()
    global.__PH_USE_SQLJS = true
  } catch (e) {
    console.warn('[auth] sql init', e.message)
  }
}

router.post('/login', authLimiter, async (req, res) => {
  await ensureSql()
  const { email, password } = req.body || {}
  if (!password) return res.status(400).json({ error: 'password required' })
  const out = login(email || 'admin@local.demo', password)
  if (out.error) return res.status(401).json({ error: out.error })
  res.json(out)
})

router.post('/register', authLimiter, async (req, res) => {
  await ensureSql()
  const { email, password, role } = req.body || {}
  if (!email || !password || !role) return res.status(400).json({ error: 'email, password, role required' })
  const out = registerUser({ email, password, role }, req)
  if (out.error) return res.status(400).json({ error: out.error })
  res.json(out)
})

router.get('/me', (req, res) => {
  const p = verifyToken(req.headers.authorization)
  if (!p) return res.status(401).json({ error: 'Unauthorized' })
  res.json({ user: { sub: p.sub, role: p.role, email: p.email } })
})

module.exports = router
