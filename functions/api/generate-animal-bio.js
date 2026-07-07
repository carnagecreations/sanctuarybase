// Cloudflare Pages Function: draft a public adoption/sanctuary bio for an
// animal using Cloudflare Workers AI, for the "Write with AI" button on the
// Website tab (WebsiteListingTab.vue). Staff/admin only — this doesn't touch
// the site's data, just burns AI-inference budget, so it's still gated.
import { verifyCallerRole, jsonResponse } from '../_shared/verifyRole.js'

export async function onRequest(context) {
  if (context.request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  const role = await verifyCallerRole(context.request)
  if (role !== 'staff' && role !== 'admin') {
    return jsonResponse({ error: 'Sign in as staff or admin required' }, 403)
  }

  if (!context.env.AI) {
    return jsonResponse({ error: 'AI service unavailable - ensure AI binding is configured' }, 503)
  }

  try {
    const { name, species, breed, age, sex, status, notes } = await context.request.json()
    if (!name || !species) {
      return jsonResponse({ error: 'Animal name and species are required' }, 400)
    }

    const statusContext = {
      available: 'They are ready for adoption.',
      fostered: 'They are currently in foster care and could use a foster or forever home.',
      adopted: 'They have already found their forever home.',
      resident: 'They are a permanent sanctuary resident, not up for adoption — this bio should invite people to sponsor or visit them rather than adopt them.',
    }[status] || ''

    const details = [
      species && `Species: ${species}`,
      breed && `Breed: ${breed}`,
      age && `Age: ${age}`,
      sex && `Sex: ${sex}`,
    ].filter(Boolean).join('\n')

    const prompt = `You are writing a warm, honest adoption/sanctuary bio for an animal rescue website. Write about ${name}.

${details}
${statusContext}

${notes ? `Staff notes about ${name}:\n${notes}\n` : ''}
Write 2-4 short paragraphs in a warm, genuine, slightly informal tone (not corporate or cheesy). Be honest about any needs or quirks mentioned in the notes rather than glossing over them — the right adopter/sponsor wants the real picture. Do not invent specific facts (medical history, past incidents, exact numbers) that weren't given to you; keep it general where details are missing. Do not include a title, greeting, or sign-off — just the bio text itself.`

    // Workers AI defaults to 256 output tokens, which truncated bios
    // mid-sentence — 1024 comfortably fits the 2-4 paragraphs we ask for.
    const response = await context.env.AI.run('@cf/meta/llama-3.1-70b-instruct', { prompt, max_tokens: 1024 })
    const bio = (response.response || response.result?.response || '').trim()

    if (!bio) return jsonResponse({ error: 'AI did not return a bio — try again' }, 502)
    return jsonResponse({ bio })
  } catch (error) {
    return jsonResponse({ error: 'Failed to generate bio', details: error.message }, 500)
  }
}
