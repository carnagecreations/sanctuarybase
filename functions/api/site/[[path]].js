// Proxies admin requests to the sfr-rescue website's Worker API.
//
// Auth: the caller's Firebase login is verified server-side (see
// _shared/verifyRole.js) against their real Firestore role. Only requests
// whose resulting role is 'admin' get forwarded (staff may also read/reply
// to contact messages). The site's real admin token (SITE_ADMIN_TOKEN)
// lives only in this function's environment and is never sent to the browser.
import { verifyCallerRole, jsonResponse } from '../../_shared/verifyRole.js'

const SITE_API_BASE = 'https://sfr-rescue.pages.dev/api'

export async function onRequest(context) {
  const { request, env, params } = context

  const role = await verifyCallerRole(request)
  if (!role) return jsonResponse({ error: 'Sign in required' }, 401)

  const pathParts = Array.isArray(params.path) ? params.path : [params.path].filter(Boolean)

  // Reading/replying to contact messages is routine staff work. Writing
  // to the site's live public listings (animals, auction items, uploads)
  // is admin-only — it directly changes what donors and adopters see.
  const isContactsPath = pathParts[0] === 'contacts'
  const allowed = role === 'admin' || (isContactsPath && role === 'staff')
  if (!allowed) return jsonResponse({ error: 'Admin access required' }, 403)

  const url = new URL(request.url)
  const target = `${SITE_API_BASE}/${pathParts.join('/')}${url.search}`

  const init = { method: request.method, headers: { Authorization: `Bearer ${env.SITE_ADMIN_TOKEN}` } }
  if (!['GET', 'HEAD'].includes(request.method)) {
    // Forward the body untouched, byte-for-byte, with its original
    // Content-Type (boundary and all). Re-parsing multipart uploads into a
    // FormData and re-serializing them loses File identity along the way —
    // the site ends up seeing zero files. Raw passthrough avoids that.
    init.body = await request.arrayBuffer()
    const contentType = request.headers.get('Content-Type')
    if (contentType) {
      init.headers['Content-Type'] = contentType
    } else if (request.method !== 'DELETE') {
      init.headers['Content-Type'] = 'application/json'
    }
  }

  const res = await fetch(target, init)
  const text = await res.text()
  return new Response(text, {
    status: res.status,
    headers: { 'Content-Type': res.headers.get('Content-Type') || 'application/json' },
  })
}
