export function publicSiteUrl() {
  const env = (import.meta.env.VITE_PUBLIC_SITE_URL || '').trim()
  if (env) return env.replace(/\/$/, '')
  if (typeof window !== 'undefined' && window.location?.origin) return window.location.origin
  return 'https://example.invalid'
}

export function marketingUrl() {
  const env = (import.meta.env.VITE_MARKETING_URL || '').trim()
  if (env) return env.replace(/\/$/, '')
  return publicSiteUrl()
}

export function supportEmail() {
  const env = (import.meta.env.VITE_SUPPORT_EMAIL || '').trim()
  return env || 'support@example.invalid'
}

export function whatsappNumber() {
  const env = (import.meta.env.VITE_WHATSAPP_NUMBER || '').trim()
  return env || '+923001234567'
}

export function whatsappWaLink(prefill = '') {
  const digits = whatsappNumber().replace(/\D/g, '')
  const text = prefill ? `?text=${encodeURIComponent(prefill)}` : ''
  return `https://wa.me/${digits}${text}`
}

