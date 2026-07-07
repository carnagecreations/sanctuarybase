/**
 * Cloudflare Pages Function: Download an animal document from R2.
 * Staff/admin only — this is the only way animal docs are served; there is
 * deliberately no public URL for them.
 */
import { verifyCallerRole, jsonResponse } from '../_shared/verifyRole.js'

export async function onRequest(context) {
  if (context.request.method !== 'GET') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  const role = await verifyCallerRole(context.request)
  if (role !== 'staff' && role !== 'admin') {
    return jsonResponse({ error: 'Sign in as staff or admin required' }, 403)
  }

  try {
    const key = new URL(context.request.url).searchParams.get('key')
    if (!key || !key.startsWith('animal-docs/') || key.includes('..')) {
      return jsonResponse({ error: 'Invalid key' }, 400)
    }

    const object = await context.env.GRANTS_BUCKET.get(key)
    if (!object) {
      return jsonResponse({ error: 'Document not found' }, 404)
    }

    const filename = (key.split('/').pop() || 'document').replace(/^\d+-/, '')
    return new Response(object.body, {
      headers: {
        'Content-Type': object.httpMetadata?.contentType || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${filename.replace(/"/g, '')}"`,
      },
    })
  } catch (error) {
    console.error('Error downloading animal document:', error)
    return jsonResponse({ error: 'Download failed', details: error.message }, 500)
  }
}
