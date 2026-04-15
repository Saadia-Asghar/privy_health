const path = require('path')
const { pathToFileURL } = require('url')
try {
  require('dotenv').config({ path: path.join(__dirname, '../../.env.local') })
  require('dotenv').config({ path: path.join(__dirname, '../../.env') })
} catch (_) {}

async function start() {
  global.__PH_BACKEND = 'memory'
  if (process.env.FORCE_MEMORY_STORE !== '1') {
    if (process.env.USE_POSTGRES === '1' && process.env.DATABASE_URL) {
      try {
        await require('../../lib/postgresDataStore.cjs').initPostgresDb()
        global.__PH_BACKEND = 'postgres'
        console.log('[db] postgres durable store ready')
      } catch (e) {
        console.warn('[db] postgres init failed, trying sql.js:', e.message)
      }
    }
    if (global.__PH_BACKEND === 'memory') {
      try {
        await require('../../lib/sqljsDataStore.cjs').initSqlJsDb()
        global.__PH_BACKEND = 'sqljs'
        console.log('[db] sql.js persistent store ready')
      } catch (e) {
        console.warn('[db] sql.js init failed, using memory:', e.message)
      }
    }
  }

  const express = require('express')
  const cors = require('cors')
  const authRoutes = require('./authRoutes.cjs')
  const {
    globalLimiter,
    optionalAuth,
    requireAdminJwt,
    requireDoctorJwt,
    requirePharmacyJwt,
    writeLimiter,
  } = require('./middleware.cjs')

  const store = require('../../lib/prescriptionStore.cjs')
  const {
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
  } = store

  const app = express()
  app.set('trust proxy', 1)
  app.use(cors())
  app.use(express.json())
  app.use(globalLimiter)
  app.use(optionalAuth)

  function mountEsm(relativeFromRepoRoot, mountPath) {
    const abs = path.join(__dirname, '../../', relativeFromRepoRoot)
    const moduleUrl = pathToFileURL(abs).href
    app.all(mountPath, async (req, res) => {
      try {
        const { default: handler } = await import(moduleUrl)
        return handler(req, res)
      } catch (e) {
        console.error(`[${mountPath}]`, e)
        res.status(500).json({ error: String(e.message) })
      }
    })
  }

  mountEsm('api/health.js', '/api/health')
  mountEsm('api/ai/chat.js', '/api/ai/chat')
  mountEsm('api/ai/drug-check.js', '/api/ai/drug-check')
  mountEsm('api/email/send.js', '/api/email/send')
  mountEsm('api/whatsapp/webhook.js', '/api/whatsapp/webhook')

  app.use('/api/auth', authRoutes)

  app.get('/api/prescriptions', (req, res) => {
    try {
      res.json(listPrescriptions(req.query))
    } catch (e) {
      res.status(500).json({ error: String(e.message) })
    }
  })

  app.post('/api/prescriptions', writeLimiter, requireDoctorJwt, (req, res) => {
    try {
      const body = { ...req.body, _actorId: req.user?.sub }
      res.json(createPrescription(body, req))
    } catch (e) {
      res.status(400).json({ error: e.message || 'Bad request' })
    }
  })

  app.get('/api/prescriptions/verify/:code', (req, res) => {
    const out = verifyByCode(req.params.code)
    if (out.error) return res.json({ valid: false, error: out.error })
    res.json(out)
  })

  app.post('/api/prescriptions/fill/:code', writeLimiter, requirePharmacyJwt, (req, res) => {
    const body = { ...req.body, _actorId: req.user?.sub }
    const result = fillPrescription(req.params.code, body, req)
    if (result.error === 'not_found') return res.status(404).json({ error: 'Not found' })
    if (result.error === 'already_filled') return res.status(400).json({ error: 'Already filled' })
    if (result.error === 'expired') return res.status(400).json({ error: 'Expired' })
    res.json({ success: true })
  })

  app.get('/api/pharmacies', (req, res) => res.json(listActivePharmacies()))

  app.post('/api/pharmacies', writeLimiter, (req, res) => {
    try {
      res.json(registerPharmacy(req.body, req))
    } catch (e) {
      res.status(400).json({ error: e.message || 'Bad request' })
    }
  })

  app.get('/api/pharmacy/:id/stats', (req, res) => {
    const stats = pharmacyStats(req.params.id)
    if (!stats) return res.status(404).json({ error: 'Not found' })
    res.json(stats)
  })

  app.get('/api/admin/overview', requireAdminJwt, (req, res) => {
    res.json(adminOverview())
  })

  app.get('/api/appointments', (req, res) => {
    try {
      res.json(listAppointments(req.query))
    } catch (e) {
      res.status(500).json({ error: String(e.message) })
    }
  })

  app.post('/api/appointments', writeLimiter, (req, res) => {
    try {
      res.json(createAppointment(req.body || {}, req))
    } catch (e) {
      res.status(400).json({ error: e.message || 'Bad request' })
    }
  })

  app.post('/api/whatsapp/test', (req, res) => {
    const { message } = req.body
    res.json({ reply: whatsappReply(message) })
  })

  const PORT = process.env.API_PORT || 3001
  const HOST = process.env.API_HOST || '127.0.0.1'
  app.listen(PORT, HOST, () => {
    console.log(`PrivyHealth API on http://${HOST}:${PORT} (store: ${store.driver})`)
  })
}

start().catch((e) => {
  console.error(e)
  process.exit(1)
})
