import { createRequire } from "module";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { ensurePrescriptionDb } from "../lib/store.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const storePath = join(__dirname, "../../lib/prescriptionStore.cjs");

/** @param {string} raw */
export async function buildReply(raw = "") {
  await ensurePrescriptionDb();
  const { whatsappReply } = require(storePath);
  return whatsappReply(raw);
}
