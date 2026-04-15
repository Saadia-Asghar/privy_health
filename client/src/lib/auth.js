import { api } from './api.js'

const AUTH_KEY = 'privyhealth_auth'

export function getAuthSession() {
  if (typeof sessionStorage === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(AUTH_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed?.token || !parsed?.user?.role) return null
    return parsed
  } catch {
    return null
  }
}

export function setAuthSession(session) {
  if (typeof sessionStorage === 'undefined') return
  sessionStorage.setItem(AUTH_KEY, JSON.stringify(session))
}

export function clearAuthSession() {
  if (typeof sessionStorage === 'undefined') return
  sessionStorage.removeItem(AUTH_KEY)
}

export function authHeader() {
  const s = getAuthSession()
  return s?.token ? { Authorization: `Bearer ${s.token}` } : {}
}

export function hasRole(roles = []) {
  const s = getAuthSession()
  return !!s?.user?.role && roles.includes(s.user.role)
}

export async function login(email, password) {
  const res = await fetch(api('/api/auth/login'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Login failed')
  setAuthSession(data)
  return data
}

export async function fetchWithAuth(path, options = {}) {
  const merged = {
    ...options,
    headers: { ...(options.headers || {}), ...authHeader() },
  }
  const res = await fetch(api(path), merged)
  if (res.status === 401) {
    clearAuthSession()
    const err = new Error('Session expired. Please sign in again.')
    err.code = 'AUTH_EXPIRED'
    throw err
  }
  return res
}

