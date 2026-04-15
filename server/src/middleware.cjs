const rateLimit = require('express-rate-limit')
const { verifyToken } = require('../../lib/authService.cjs')

const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: Number(process.env.RATE_LIMIT_GLOBAL_MAX || 200),
  standardHeaders: true,
  legacyHeaders: false,
})

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_AUTH_MAX || 30),
  standardHeaders: true,
  legacyHeaders: false,
})

const writeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: Number(process.env.RATE_LIMIT_WRITE_MAX || 60),
  standardHeaders: true,
  legacyHeaders: false,
})

function optionalAuth(req, res, next) {
  const p = verifyToken(req.headers.authorization)
  req.user = p || null
  next()
}

function requireAdminJwt(req, res, next) {
  if (process.env.REQUIRE_ADMIN_JWT !== '1') return next()
  const p = verifyToken(req.headers.authorization)
  if (!p || p.role !== 'admin') return res.status(401).json({ error: 'Admin JWT required (set REQUIRE_ADMIN_JWT=0 to disable).' })
  req.user = p
  next()
}

function requireDoctorJwt(req, res, next) {
  if (process.env.AUTH_STRICT !== '1') return next()
  const p = verifyToken(req.headers.authorization)
  if (!p || (p.role !== 'doctor' && p.role !== 'admin')) {
    return res.status(403).json({ error: 'Doctor or admin JWT required (AUTH_STRICT=1).' })
  }
  req.user = p
  next()
}

function requirePharmacyJwt(req, res, next) {
  if (process.env.AUTH_STRICT !== '1') return next()
  const p = verifyToken(req.headers.authorization)
  if (!p || (p.role !== 'pharmacy' && p.role !== 'admin')) {
    return res.status(403).json({ error: 'Pharmacy or admin JWT required (AUTH_STRICT=1).' })
  }
  req.user = p
  next()
}

module.exports = {
  globalLimiter,
  authLimiter,
  writeLimiter,
  optionalAuth,
  requireAdminJwt,
  requireDoctorJwt,
  requirePharmacyJwt,
}
