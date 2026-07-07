/**
 * Cloudflare Pages Function: Upload grant document to R2
 * Admin only — grant documents may contain financial and legal material.
 */
import { verifyCallerRole, jsonResponse } from '../_shared/verifyRole.js'

export async function onRequest(context) {
  if (context.request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  const role = await verifyCallerRole(context.request)
  if (role !== 'admin') {
    return jsonResponse({ error: 'Sign in as admin required' }, 403)
  }

  try {
    const formData = await context.request.formData()
    const file = formData.get('file')
    const grantId = formData.get('grantId')

    if (!file || !grantId) {
      return new Response(
        JSON.stringify({ error: 'Missing file or grantId' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Generate unique filename
    const timestamp = Date.now()
    const filename = `${grantId}/${timestamp}-${file.name}`

    // Upload to R2
    const buffer = await file.arrayBuffer()
    await context.env.GRANTS_BUCKET.put(filename, buffer, {
      httpMetadata: {
        contentType: file.type,
      },
    })

    return new Response(
      JSON.stringify({
        success: true,
        filename: filename,
        size: file.size,
        type: file.type,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error uploading document:', error)
    return new Response(
      JSON.stringify({ error: 'Upload failed', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
