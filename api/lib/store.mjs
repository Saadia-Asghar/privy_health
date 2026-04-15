import { createRequire } from "module";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const root = join(__dirname, "../..");

let initPromise = null;

/** Initialize backend store once per serverless instance. */
export function ensurePrescriptionDb() {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    if (process.env.FORCE_MEMORY_STORE === "1") {
      global.__PH_BACKEND = "memory";
      return;
    }
    if (process.env.USE_POSTGRES === "1" && process.env.DATABASE_URL) {
      try {
        const { initPostgresDb } = require(join(root, "lib/postgresDataStore.cjs"));
        await initPostgresDb();
        global.__PH_BACKEND = "postgres";
        return;
      } catch (e) {
        console.warn("[ensurePrescriptionDb:postgres]", e?.message || e);
      }
    }
    try {
      const { initSqlJsDb } = require(join(root, "lib/sqljsDataStore.cjs"));
      await initSqlJsDb();
      global.__PH_BACKEND = "sqljs";
    } catch (e) {
      console.warn("[ensurePrescriptionDb]", e?.message || e);
      global.__PH_BACKEND = "memory";
    }
  })();
  return initPromise;
}

function mod() {
  return require(join(root, "lib/prescriptionStore.cjs"));
}

export async function listPrescriptions(q) {
  await ensurePrescriptionDb();
  return mod().listPrescriptions(q);
}

export async function createPrescription(body, req) {
  await ensurePrescriptionDb();
  return mod().createPrescription(body, req);
}

export async function verifyByCode(code) {
  await ensurePrescriptionDb();
  return mod().verifyByCode(code);
}

export async function fillPrescription(code, body, req) {
  await ensurePrescriptionDb();
  return mod().fillPrescription(code, body, req);
}

export async function listActivePharmacies() {
  await ensurePrescriptionDb();
  return mod().listActivePharmacies();
}

export async function registerPharmacy(body, req) {
  await ensurePrescriptionDb();
  return mod().registerPharmacy(body, req);
}

export async function pharmacyStats(id) {
  await ensurePrescriptionDb();
  return mod().pharmacyStats(id);
}

export async function adminOverview() {
  await ensurePrescriptionDb();
  return mod().adminOverview();
}

export async function listAppointments(q) {
  await ensurePrescriptionDb();
  return mod().listAppointments(q);
}

export async function createAppointment(body, req) {
  await ensurePrescriptionDb();
  return mod().createAppointment(body, req);
}

export async function whatsappReply(msg) {
  await ensurePrescriptionDb();
  return mod().whatsappReply(msg);
}
