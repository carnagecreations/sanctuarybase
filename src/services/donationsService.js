// Reads Zeffy donations captured by the website's webhook receiver
// (POST /api/webhooks/zeffy -> Neon `donations` table), via the same
// role-verified site proxy used for contacts and animal listings.
import { SITE_API_BASE, authOnlyHeaders } from './siteApi'

const DONATIONS_API = `${SITE_API_BASE}/donations`

export async function fetchZeffyDonations() {
  const response = await fetch(DONATIONS_API, { headers: await authOnlyHeaders() })
  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new Error(data.error || `Request failed (${response.status})`)
  }
  return response.json()
}
