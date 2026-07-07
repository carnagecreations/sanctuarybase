/**
 * Cloudflare Pages Function: Get documents for a grant from R2
 * Admin only — matches the Grants page, which is an admin surface.
 */
import { verifyCallerRole, jsonResponse } from '../_shared/verifyRole.js'

export async function onRequest(context) {
  if (context.request.method !== 'GET') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  const role = await verifyCallerRole(context.request)
  if (role !== 'admin') {
    return jsonResponse({ error: 'Sign in as admin required' }, 403)
  }

  try {
    const grantId = new URL(context.request.url).searchParams.get('grantId')

    if (!grantId) {
      return new Response(
        JSON.stringify({ error: 'Missing grantId' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // List objects in the grant's folder
    const objects = await context.env.GRANTS_BUCKET.list({
      prefix: `${grantId}/`,
    })

    const documents = objects.objects.map(obj => ({
      key: obj.key,
      filename: obj.key.split('/').pop(),
      uploaded: obj.uploaded,
      size: obj.size,
    }))

    return new Response(
      JSON.stringify({ documents }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error retrieving documents:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to retrieve documents', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
