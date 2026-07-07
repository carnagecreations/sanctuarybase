// Contact submissions API service
// Fetches from the sfr-rescue website via this app's /api/site proxy

import { SITE_API_BASE, authHeaders } from './siteApi'

const CONTACTS_API = `${SITE_API_BASE}/contacts`

export async function fetchContacts() {
  const response = await fetch(CONTACTS_API, { headers: await authHeaders() })

  if (!response.ok) {
    throw new Error(`Failed to fetch contacts: ${response.statusText}`)
  }

  return response.json()
}

export async function replyToContact(contactId, replyText) {
  const response = await fetch(`${CONTACTS_API}/${contactId}`, {
    method: 'PATCH',
    headers: await authHeaders(),
    body: JSON.stringify({ reply: replyText })
  })

  if (!response.ok) {
    throw new Error(`Failed to send reply: ${response.statusText}`)
  }

  return response.json()
}

export async function updateContactStatus(contactId, status, declineReason) {
  const response = await fetch(`${CONTACTS_API}/${contactId}`, {
    method: 'PATCH',
    headers: await authHeaders(),
    body: JSON.stringify(status === 'declined' ? { status, declineReason } : { status })
  })

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new Error(data.error || `Failed to update status: ${response.statusText}`)
  }

  return response.json()
}

export async function archiveContact(contactId, archived) {
  const response = await fetch(`${CONTACTS_API}/${contactId}`, {
    method: 'PATCH',
    headers: await authHeaders(),
    body: JSON.stringify({ archived })
  })

  if (!response.ok) {
    throw new Error(`Failed to update contact: ${response.statusText}`)
  }

  return response.json()
}

export async function deleteContact(contactId) {
  const response = await fetch(`${CONTACTS_API}/${contactId}`, {
    method: 'DELETE',
    headers: await authHeaders()
  })

  if (!response.ok) {
    throw new Error(`Failed to delete contact: ${response.statusText}`)
  }

  return response.json()
}
