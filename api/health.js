function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
}

export default async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  return res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    services: {
      gemini: Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY),
      pinata: Boolean(process.env.VITE_PINATA_JWT),
      smtp: Boolean(process.env.SMTP_HOST),
      whatsappProvider: process.env.WHATSAPP_PROVIDER || "mock",
      twilio: Boolean(process.env.TWILIO_ACCOUNT_SID),
      metaWhatsApp: Boolean(process.env.META_WHATSAPP_TOKEN && process.env.META_WHATSAPP_PHONE_NUMBER_ID),
      durableDb: Boolean(process.env.USE_POSTGRES === "1" && process.env.DATABASE_URL)
    },
  });
}
