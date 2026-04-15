function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
}

function geminiKey() {
  return process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
}

function geminiModel() {
  return process.env.GEMINI_MODEL || "gemini-2.5-flash";
}

function wantsUrdu(message = "", context = {}) {
  const lang = String(context?.lang || "").toLowerCase();
  if (lang === "ur" || lang === "urdu") return true;
  return /urdu|اردو|roman urdu/i.test(String(message || ""));
}

function geminiCandidateUrls(key) {
  const model = geminiModel();
  const custom = process.env.GEMINI_API_URL || "";
  const urls = [];
  if (custom) urls.push(custom.replace("{API_KEY}", encodeURIComponent(key)).replace("{MODEL}", model));
  urls.push(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`);
  urls.push(`https://aiplatform.googleapis.com/v1/publishers/google/models/${model}:generateContent?key=${encodeURIComponent(key)}`);
  return urls;
}

function extractGeminiText(out) {
  const parts = out?.candidates?.[0]?.content?.parts || [];
  return parts
    .map((p) => (typeof p.text === "string" ? p.text : ""))
    .join("\n")
    .trim();
}

export default async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { message = "", context = {}, history = [] } = req.body || {};
  const key = geminiKey();
  if (!key) {
    return res.status(200).json({
      reply:
        "PrivyHealth assistant is in fallback mode. For urgent care, consult a licensed doctor or call local emergency services. I can still help with records, prescription verification flow, and Urdu/English guidance."
    });
  }

  const system = [
    "You are PrivyHealth AI assistant for Pakistan.",
    "Never provide diagnosis, prescriptions, or emergency treatment decisions.",
    "Always include a short safety disclaimer to consult a licensed doctor for personal medical advice.",
    "Keep culturally sensitive guidance (Ramadan, halal, local brand context).",
    "Maximum 120 words in response.",
    wantsUrdu(message, context)
      ? "Reply in Urdu first, then one short English line."
      : "Reply in English. If useful, add a short Urdu line at the end.",
    `Patient context: bloodType=${context.bloodType ?? "unknown"}, allergies=${(context.allergies || []).join(", ")}, medications=${(context.medications || []).join(", ")}`
  ].join(" ");

  try {
    const convo = [...history, { role: "user", content: message }]
      .map((m) => `${m.role === "assistant" ? "Assistant" : "User"}: ${m.content}`)
      .join("\n");
    const prompt = `${system}\n\nConversation:\n${convo}\n\nRespond as assistant.`;

    const body = JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: 400,
        temperature: 0.4
      }
    });

    let lastOut = {};
    for (const url of geminiCandidateUrls(key)) {
      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body
      });
      const out = await resp.json().catch(() => ({}));
      lastOut = out;
      const reply = extractGeminiText(out);
      if (resp.ok && reply) return res.status(200).json({ reply });
    }
    const reply = extractGeminiText(lastOut) || "Unable to generate response right now.";
    return res.status(200).json({ reply });
  } catch {
    return res.status(200).json({
      reply:
        "AI service is temporarily unavailable. Please try again in a moment, or consult a licensed doctor for urgent care."
    });
  }
}
