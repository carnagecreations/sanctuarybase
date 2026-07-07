/**
 * Cloudflare Pages Function: Delete an animal document from R2.
 * Staff/admin only. Key must stay inside the animal-docs/ prefix so this
 * can't be used to delete grant documents.
 */
import { verifyCallerRole, jsonResponse } from '../_shared/verifyRole.js'

export async function onRequest(context) {
  if (context.request.method !== 'DELETE') {
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

    await context.env.GRANTS_BUCKET.delete(key)
    return jsonResponse({ success: true })
  } catch (error) {
    console.error('Error deleting animal document:', error)
    return jsonResponse({ error: 'Delete failed', details: error.message }, 500)
  }
}
