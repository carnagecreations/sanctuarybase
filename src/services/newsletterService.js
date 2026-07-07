// Newsletter subscriber list — fetches from the sfr-rescue website via this
// app's /api/site proxy. Read-only: subscribers sign up on the public site;
// this is just visibility into who's on the list.
import { SITE_API_BASE, authHeaders } from './siteApi'

const NEWSLETTER_API = `${SITE_API_BASE}/newsletter`

export async function fetchSubscribers() {
  const response = await fetch(NEWSLETTER_API, { headers: await authHeaders() })

  if (!response.ok) {
    throw new Error(`Failed to fetch subscribers: ${response.statusText}`)
  }

  return response.json()
}
