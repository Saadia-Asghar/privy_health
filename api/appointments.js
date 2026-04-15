import { ensurePrescriptionDb, listAppointments, createAppointment } from "./lib/store.mjs";

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
    try {
      const q = req.query || {};
      return res.status(200).json(await listAppointments(q));
    } catch (e) {
      return res.status(500).json({ error: String(e?.message || e) });
    }
  }

  if (req.method === "POST") {
    try {
      const appt = await createAppointment(req.body || {}, req);
      return res.status(200).json(appt);
    } catch (e) {
      return res.status(400).json({ error: e?.message || "Bad request" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
