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

  const { medications = [] } = req.body || {};
  const key = geminiKey();
  if (!key) {
    return res.status(200).json({ interactions: [], safe: null, summary: "Check with pharmacist." });
  }

  const prompt = [
    `Analyze interactions for: ${medications.join(", ")}.`,
    'Return ONLY strict minified JSON.',
    'Schema: {"interactions":[{"pair":["A","B"],"severity":"low|moderate|high","note":"..."}],"safe":true|false,"summary":"...","disclaimer":"..."}',
    'Rules:',
    '- no markdown, no backticks, no extra keys',
    '- if uncertain, set safe to null and explain briefly in summary',
    '- include Pakistan-relevant generic/brand context when useful',
    '- disclaimer must remind to confirm with licensed doctor/pharmacist'
  ].join(" ");

  try {
    const body = JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: 400,
        responseMimeType: "application/json",
        temperature: 0.2
      }
    });
    let lastText = "";
    for (const url of geminiCandidateUrls(key)) {
      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body
      });
      const out = await resp.json().catch(() => ({}));
      const text = extractGeminiText(out);
      lastText = text || lastText;
      if (resp.ok && text) {
        const parsed = JSON.parse(text);
        return res.status(200).json(parsed);
      }
    }
    if (lastText) {
      const parsed = JSON.parse(lastText);
      return res.status(200).json(parsed);
    }
    return res.status(200).json({
      interactions: [],
      safe: null,
      summary: "Unable to confidently assess interaction. Please verify with a pharmacist.",
      disclaimer: "This is educational support, not medical advice."
    });
  } catch {
    return res.status(200).json({
      interactions: [],
      safe: null,
      summary: "Unable to confidently assess interaction. Please verify with a pharmacist.",
      disclaimer: "This is educational support, not medical advice."
    });
  }
}
