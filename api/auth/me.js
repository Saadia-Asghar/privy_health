import { createRequire } from "module";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
}

export default async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const { verifyToken } = require(join(__dirname, "../../lib/authService.cjs"));
  const p = verifyToken(req.headers.authorization);
  if (!p) return res.status(401).json({ error: "Unauthorized" });
  return res.status(200).json({ user: { sub: p.sub, role: p.role, email: p.email } });
}
