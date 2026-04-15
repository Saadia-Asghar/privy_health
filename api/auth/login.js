import { createRequire } from "module";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { ensurePrescriptionDb } from "../lib/store.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
}

export default async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  await ensurePrescriptionDb();
  const { login } = require(join(__dirname, "../../lib/authService.cjs"));
  const { email, password } = req.body || {};
  if (!password) return res.status(400).json({ error: "password required" });
  const out = login(email || "admin@local.demo", password);
  if (out.error) return res.status(401).json({ error: out.error });
  return res.status(200).json(out);
}
