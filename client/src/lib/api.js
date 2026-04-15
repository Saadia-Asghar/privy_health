/**
 * API base for split deployments (optional). Default: same-origin `/api` (Vite proxy or Vercel).
 * Set `VITE_API_BASE=https://your-project.vercel.app` only if the SPA is hosted elsewhere.
 */
export function api(path) {
  const base = (import.meta.env.VITE_API_BASE || '').replace(/\/$/, '')
  const p = path.startsWith('/') ? path : `/${path}`
  return `${base}${p}`
}
