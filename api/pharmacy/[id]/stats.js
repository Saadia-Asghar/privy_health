import { ensurePrescriptionDb, pharmacyStats } from "../../lib/store.mjs";

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
  const id = req.query?.id;
  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Missing id" });
  }

  const stats = await pharmacyStats(id);
  if (!stats) return res.status(404).json({ error: "Not found" });
  return res.status(200).json(stats);
}
