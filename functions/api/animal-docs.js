/**
 * Cloudflare Pages Function: List documents for an animal from R2.
 * Staff/admin only.
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
    const animalId = new URL(context.request.url).searchParams.get('animalId')
    if (!animalId) {
      return jsonResponse({ error: 'Missing animalId' }, 400)
    }

    const safeAnimalId = animalId.replace(/[^a-zA-Z0-9_-]/g, '')
    const objects = await context.env.GRANTS_BUCKET.list({
      prefix: `animal-docs/${safeAnimalId}/`,
      include: ['customMetadata'],
    })

    const documents = objects.objects.map(obj => ({
      key: obj.key,
      // Strip the "timestamp-" prefix added at upload time
      filename: (obj.key.split('/').pop() || '').replace(/^\d+-/, ''),
      uploaded: obj.uploaded,
      size: obj.size,
      tags: obj.customMetadata?.tags || '',
    }))

    return jsonResponse({ documents })
  } catch (error) {
    console.error('Error listing animal documents:', error)
    return jsonResponse({ error: 'Failed to list documents', details: error.message }, 500)
  }
}
