// Animal document storage — calls this app's own Pages Functions, which
// keep files in a private R2 bucket and gate every operation behind
// staff/admin Firebase auth. Docs are never publicly reachable.
import { authOnlyHeaders } from './siteApi'

export async function listAnimalDocs(animalId) {
  const response = await fetch(`/api/animal-docs?animalId=${encodeURIComponent(animalId)}`, {
    headers: await authOnlyHeaders(),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error || 'Failed to load documents')
  return data.documents || []
}

export async function uploadAnimalDoc(animalId, file, tags = '') {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('animalId', animalId)
  fd.append('tags', tags)
  const response = await fetch('/api/animal-doc-upload', {
    method: 'POST',
    headers: await authOnlyHeaders(),
    body: fd,
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error || 'Upload failed')
  return data
}

export async function downloadAnimalDoc(key, filename) {
  const response = await fetch(`/api/animal-doc-download?key=${encodeURIComponent(key)}`, {
    headers: await authOnlyHeaders(),
  })
  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new Error(data.error || 'Download failed')
  }
  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename || 'document'
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export async function deleteAnimalDoc(key) {
  const response = await fetch(`/api/animal-doc-delete?key=${encodeURIComponent(key)}`, {
    method: 'DELETE',
    headers: await authOnlyHeaders(),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error || 'Delete failed')
  return data
}
