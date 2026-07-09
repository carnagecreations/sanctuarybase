// Shared config for talking to the sfr-rescue website's data (animals,
// auction items, contact messages). Requests go through this app's own
// /api/site/* proxy function, which verifies the caller's Firebase login
// and admin role server-side before forwarding to the site's Worker API —
// the site's real admin token never reaches the browser.
import { auth } from './firebase'

export const SITE_API_BASE = '/api/site'
export const SITE_ORIGIN = 'https://sfr-rescue.pages.dev'

// Media URLs stored on the site are site-relative ("/media/animals/…").
// Serve as-is since they're relative paths on the current domain.
export function siteMediaUrl(u) {
  if (!u) return ''
  // Absolute URL - use as-is
  if (/^https?:\/\//i.test(u)) return u
  // Relative URL - serve from current domain
  return u
}

export async function authHeaders() {
  const user = auth.currentUser
  if (!user) throw new Error('You must be signed in to do that')
  const idToken = await user.getIdToken()
  return {
    'Authorization': `Bearer ${idToken}`,
    'Content-Type': 'application/json'
  }
}

export async function authOnlyHeaders() {
  const user = auth.currentUser
  if (!user) throw new Error('You must be signed in to do that')
  const idToken = await user.getIdToken()
  return { 'Authorization': `Bearer ${idToken}` }
}
