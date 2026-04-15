import { buildReply } from "./logic.js";

function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
}

export default async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  const provider = (process.env.WHATSAPP_PROVIDER || "mock").toLowerCase();

  // Meta webhook verification handshake
  if (provider === "meta" && req.method === "GET") {
    const mode = req.query?.["hub.mode"];
    const token = req.query?.["hub.verify_token"];
    const challenge = req.query?.["hub.challenge"];
    if (mode === "subscribe" && token === process.env.META_WHATSAPP_VERIFY_TOKEN) {
      return res.status(200).send(challenge || "ok");
    }
    return res.status(403).send("Verification failed");
  }

  if (req.method !== "POST") return res.status(405).send("Method not allowed");

  // Twilio-compatible payload path
  if (provider === "twilio") {
    const from = req.body?.From || req.body?.from || "unknown";
    const body = req.body?.Body || req.body?.message || "";
    const reply = await buildReply(body);
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>Hi ${from},\n${reply}</Message>
</Response>`;
    res.setHeader("Content-Type", "text/xml");
    return res.status(200).send(twiml);
  }

  // Meta Cloud API webhook path
  if (provider === "meta") {
    const change = req.body?.entry?.[0]?.changes?.[0]?.value;
    const msg = change?.messages?.[0];
    const from = msg?.from;
    const text = msg?.text?.body || "";
    if (!from || !text) return res.status(200).json({ ok: true, ignored: true });

    const reply = await buildReply(text);
    const phoneId = process.env.META_WHATSAPP_PHONE_NUMBER_ID;
    const token = process.env.META_WHATSAPP_TOKEN;
    if (!phoneId || !token) return res.status(500).json({ error: "META_WHATSAPP_PHONE_NUMBER_ID and META_WHATSAPP_TOKEN required" });

    const sendRes = await fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: from,
        type: "text",
        text: { body: reply },
      }),
    });
    if (!sendRes.ok) {
      const errorBody = await sendRes.text();
      return res.status(500).json({ error: "meta_send_failed", detail: errorBody });
    }
    return res.status(200).json({ ok: true });
  }

  // Default MVP mode: accepts local JSON test payload and returns plain text JSON
  const from = req.body?.From || req.body?.from || "unknown";
  const body = req.body?.Body || req.body?.message || "";
  const reply = await buildReply(body);
  return res.status(200).json({ ok: true, from, reply });
}
