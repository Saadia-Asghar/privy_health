/** Public marketing / app origin for links (never hardcode a domain you do not own). */
function publicSiteUrl() {
  const u = (process.env.PUBLIC_SITE_URL || '').trim().replace(/\/$/, '')
  return u || 'https://example.invalid'
}

module.exports = { publicSiteUrl }
