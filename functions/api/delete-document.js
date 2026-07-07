/**
 * Cloudflare Pages Function: Delete grant document from R2
 * Admin only — deletes objects from GRANTS_BUCKET by key.
 */
import { verifyCallerRole, jsonResponse } from '../_shared/verifyRole.js'

export async function onRequest(context) {
  if (context.request.method !== 'DELETE') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  const role = await verifyCallerRole(context.request)
  if (role !== 'admin') {
    return jsonResponse({ error: 'Sign in as admin required' }, 403)
  }

  try {
    const key = new URL(context.request.url).searchParams.get('key')

    if (!key) {
      return new Response(
        JSON.stringify({ error: 'Missing key parameter' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Delete from R2
    await context.env.GRANTS_BUCKET.delete(key)

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error deleting document:', error)
    return new Response(
      JSON.stringify({ error: 'Delete failed', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
