import { ensurePrescriptionDb, verifyByCode } from "../../lib/store.mjs";

function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
}

export default async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  await ensurePrescriptionDb();
  const code = req.query?.code;
  if (!code || typeof code !== "string") {
    return res.status(400).json({ error: "Missing code" });
  }

  const out = await verifyByCode(code);
  if (out.error) return res.status(200).json({ valid: false, error: out.error });
  return res.status(200).json(out);
}
