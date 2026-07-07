// Fundraiser auction items shown on the website's fundraiser page.
import { SITE_API_BASE, authHeaders, authOnlyHeaders } from './siteApi'

const AUCTION_API = `${SITE_API_BASE}/admin/auction-items`

export async function fetchAuctionItems() {
  const response = await fetch(AUCTION_API, { headers: await authHeaders() })
  if (!response.ok) throw new Error(`Failed to fetch auction items: ${response.statusText}`)
  return response.json()
}

export async function createAuctionItem(itemData) {
  const response = await fetch(AUCTION_API, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify(itemData)
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error || 'Failed to create auction item')
  return data
}

export async function updateAuctionItem(id, itemData) {
  const response = await fetch(`${AUCTION_API}/${id}`, {
    method: 'PATCH',
    headers: await authHeaders(),
    body: JSON.stringify(itemData)
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error || 'Failed to update auction item')
  return data
}

export async function deleteAuctionItem(id) {
  const response = await fetch(`${AUCTION_API}/${id}`, {
    method: 'DELETE',
    headers: await authHeaders()
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error || 'Failed to delete auction item')
  return data
}

export async function uploadAuctionImage(file) {
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
