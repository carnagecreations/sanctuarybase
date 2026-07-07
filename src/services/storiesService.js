// Stories/news published on the website's public "Stories" page.
import { SITE_API_BASE, authHeaders, authOnlyHeaders } from './siteApi'

const STORIES_API = `${SITE_API_BASE}/admin/stories`

export async function fetchStories() {
  const response = await fetch(STORIES_API, { headers: await authHeaders() })
  if (!response.ok) throw new Error(`Failed to fetch stories: ${response.statusText}`)
  return response.json()
}

export async function createStory(storyData) {
  const response = await fetch(STORIES_API, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify(storyData)
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error || 'Failed to create story')
  return data
}

export async function updateStory(id, storyData) {
  const response = await fetch(`${STORIES_API}/${id}`, {
    method: 'PATCH',
    headers: await authHeaders(),
    body: JSON.stringify(storyData)
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error || 'Failed to update story')
  return data
}

export async function deleteStory(id) {
  const response = await fetch(`${STORIES_API}/${id}`, {
    method: 'DELETE',
    headers: await authHeaders()
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error || 'Failed to delete story')
  return data
}

export async function uploadStoryImage(file) {
  const fd = new FormData()
  fd.append('files', file)
  const response = await fetch(`${SITE_API_BASE}/admin/uploads`, {
    method: 'POST',
    headers: await authOnlyHeaders(),
    body: fd
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error || 'Upload failed')
  return (data.urls || [])[0] || ''
}
