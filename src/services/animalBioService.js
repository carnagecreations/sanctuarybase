// Calls this app's own Pages Function (Cloudflare Workers AI) to draft a
// public bio for an animal — used by the "Write with AI" button on the
// Website tab. Not part of the site proxy: this never touches sfr-rescue.
import { authHeaders } from './siteApi'

export async function generateAnimalBio(animal) {
  const response = await fetch('/api/generate-animal-bio', {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify(animal),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error || 'Failed to generate bio')
  return data.bio
}
