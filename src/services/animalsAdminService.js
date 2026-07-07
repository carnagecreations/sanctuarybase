// Public adoptable/foster/sanctuary animal listings on the website.
// Distinct from stores/animals.js, which is this app's own internal
// medical/care tracking collection in Firestore.
import { SITE_API_BASE, authHeaders, authOnlyHeaders } from './siteApi'
import { auth } from './firebase'

const ANIMALS_API = `${SITE_API_BASE}/admin/animals`

export async function fetchAllAnimals() {
  const response = await fetch(ANIMALS_API, { headers: await authHeaders() })
  if (!response.ok) throw new Error(`Failed to fetch website animals: ${response.statusText}`)
  return response.json()
}

export async function createAnimal(animalData) {
  const response = await fetch(ANIMALS_API, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify(animalData)
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error || 'Failed to create animal')
  return data
}

export async function updateAnimal(id, animalData) {
  const response = await fetch(`${ANIMALS_API}/${id}`, {
    method: 'PATCH',
    headers: await authHeaders(),
    body: JSON.stringify(animalData)
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error || 'Failed to update animal')
  return data
}

export async function deleteAnimal(id) {
  const response = await fetch(`${ANIMALS_API}/${id}`, {
    method: 'DELETE',
    headers: await authHeaders()
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error || 'Failed to delete animal')
  return data
}

export async function uploadAnimalImages(files) {
  const user = auth.currentUser
  if (!user) throw new Error('You must be signed in to do that')
  const idToken = await user.getIdToken()

  const fd = new FormData()
  for (const f of files) {
    if (!f) throw new Error('Invalid file selected')
    fd.append('files', f)
  }

  const response = await fetch(`${SITE_API_BASE}/admin/uploads`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${idToken}` },
    body: fd
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error || 'Upload failed')
  return data.urls || []
}
