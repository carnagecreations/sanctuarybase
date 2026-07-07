/**
 * Cloudflare Pages Function: Upload an animal document to R2.
 * Staff/admin only — vet records and behavior reports are sensitive, so
 * files live in the private bucket and are only served through the gated
 * animal-doc-download endpoint, never a public URL.
 */
import { verifyCallerRole, jsonResponse } from '../_shared/verifyRole.js'

const MAX_BYTES = 10 * 1024 * 1024
const ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg', 'image/png', 'image/webp', 'image/heic',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

export async function onRequest(context) {
  if (context.request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  const role = await verifyCallerRole(context.request)
  if (role !== 'staff' && role !== 'admin') {
    return jsonResponse({ error: 'Sign in as staff or admin required' }, 403)
  }

  try {
    const formData = await context.request.formData()
    const file = formData.get('file')
    const animalId = formData.get('animalId')
    const tags = (formData.get('tags') || '').toString().slice(0, 500)

    if (!file || !animalId) {
      return jsonResponse({ error: 'Missing file or animalId' }, 400)
    }
    if (file.size > MAX_BYTES) {
      return jsonResponse({ error: `"${file.name}" is larger than 10 MB` }, 400)
    }
    if (file.type && !ALLOWED_TYPES.includes(file.type)) {
      return jsonResponse({ error: `"${file.name}" isn't a supported type (PDF, image, or Word doc)` }, 400)
    }

    const safeAnimalId = animalId.toString().replace(/[^a-zA-Z0-9_-]/g, '')
    const key = `animal-docs/${safeAnimalId}/${Date.now()}-${file.name}`

    await context.env.GRANTS_BUCKET.put(key, await file.arrayBuffer(), {
      httpMetadata: { contentType: file.type || 'application/octet-stream' },
      customMetadata: { tags },
    })

    return jsonResponse({ success: true, key, filename: file.name, size: file.size, tags })
  } catch (error) {
    console.error('Error uploading animal document:', error)
    return jsonResponse({ error: 'Upload failed', details: error.message }, 500)
  }
}
