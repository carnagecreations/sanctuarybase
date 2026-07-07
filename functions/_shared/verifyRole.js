// Shared by all admin-facing Pages Functions. Verifies the caller's Firebase
// ID token by passing it straight through to Firestore's own REST API to
// fetch their users/{uid} doc — no service account needed (see
// functions/api/site/[[path]].js for the full rationale). Returns the
// caller's role ('volunteer' | 'staff' | 'admin') or null if unverifiable.
const FIREBASE_PROJECT_ID = 'sanctuarybasev2'

function decodeJwtPayload(token) {
  const payloadB64 = token.split('.')[1]
  const base64 = payloadB64.replace(/-/g, '+').replace(/_/g, '/')
  return JSON.parse(atob(base64))
}

export async function verifyCallerRole(request) {
  const authHeader = request.headers.get('Authorization') || ''
  const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (!idToken) return null

  let uid
  try {
    const payload = decodeJwtPayload(idToken)
    if (!payload.sub) throw new Error('missing sub')
    if (payload.aud !== FIREBASE_PROJECT_ID) throw new Error('bad audience')
    if (!payload.exp || payload.exp * 1000 < Date.now()) throw new Error('expired')
    uid = payload.sub
  } catch {
    return null
  }

  const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/users/${uid}`
  const res = await fetch(url, { headers: { Authorization: `Bearer ${idToken}` } })
  if (!res.ok) return null
  const doc = await res.json()
  return doc.fields?.role?.stringValue || null
}

export function jsonResponse(obj, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json' } })
}
