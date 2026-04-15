const memory = require('./memoryPrescriptionStore.cjs')

function sqljs() {
  return require('./sqljsDataStore.cjs')
}
function postgres() {
  return require('./postgresDataStore.cjs')
}

function backend() {
  if (process.env.FORCE_MEMORY_STORE === '1') return memory
  if (global.__PH_BACKEND === 'postgres') return postgres()
  if (global.__PH_BACKEND === 'sqljs') return sqljs()
  return sqljs()
}

module.exports = {
  get driver() {
    if (process.env.FORCE_MEMORY_STORE === '1') return 'memory'
    return global.__PH_BACKEND || 'memory'
  },
  get store() {
    return backend().store ?? memory.store
  },
  listPrescriptions: (q) => backend().listPrescriptions(q),
  createPrescription: (body, req) => backend().createPrescription(body, req),
  verifyByCode: (code) => backend().verifyByCode(code),
  fillPrescription: (code, body, req) => backend().fillPrescription(code, body, req),
  listActivePharmacies: () => backend().listActivePharmacies(),
  registerPharmacy: (body, req) => backend().registerPharmacy(body, req),
  pharmacyStats: (id) => backend().pharmacyStats(id),
  adminOverview: () => backend().adminOverview(),
  listAppointments: (q) => backend().listAppointments(q),
  createAppointment: (body, req) => backend().createAppointment(body, req),
  whatsappReply: (msg) => backend().whatsappReply(msg),
}
