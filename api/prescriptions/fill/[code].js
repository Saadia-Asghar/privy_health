import { ensurePrescriptionDb, fillPrescription } from "../../lib/store.mjs";

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
  const code = req.query?.code;
  if (!code || typeof code !== "string") {
    return res.status(400).json({ error: "Missing code" });
  }

  const result = await fillPrescription(code, req.body || {}, req);
  if (result.error === "not_found") return res.status(404).json({ error: "Not found" });
  if (result.error === "already_filled") return res.status(400).json({ error: "Already filled" });
  if (result.error === "expired") return res.status(400).json({ error: "Expired" });
  return res.status(200).json({ success: true });
}
