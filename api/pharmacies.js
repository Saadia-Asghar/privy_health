import { ensurePrescriptionDb, listActivePharmacies, registerPharmacy } from "./lib/store.mjs";

function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
}

export default async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  await ensurePrescriptionDb();

  if (req.method === "GET") {
    return res.status(200).json(await listActivePharmacies());
  }

  if (req.method === "POST") {
    try {
      const ph = await registerPharmacy(req.body || {}, req);
      return res.status(200).json(ph);
    } catch (e) {
      return res.status(400).json({ error: e?.message || "Bad request" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
