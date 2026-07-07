/**
 * Cloudflare Pages Function: Veterinary AI Chat
 * POST /api/vet-chat
 * Body: { animal, question, species }
 * Uses Cloudflare Workers AI (Llama 3.1 70B)
 * Signed-in staff/admin only — burns AI-inference budget.
 */
import { verifyCallerRole, jsonResponse } from '../_shared/verifyRole.js'

export async function onRequest(context) {
  if (context.request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  const role = await verifyCallerRole(context.request)
  if (role !== 'staff' && role !== 'admin') {
    return jsonResponse({ error: 'Sign in as staff or admin required' }, 403)
  }

  try {
    const { animal, question, species } = await context.request.json()

    if (!question || !species) {
      return new Response(
        JSON.stringify({ error: 'question and species are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const systemPrompt = `You are a veterinary knowledge assistant for animal sanctuary staff caring for rescued farm animals and pets.
You provide educational information about animal health and care. Always remind users to consult a licensed veterinarian for diagnosis and treatment.
The animal in question is a ${species}${animal?.name ? ` named ${animal.name}` : ''}.
Be concise (2-3 sentences), practical, and specific to the species.`

    const userPrompt = question

    const response = await context.env.AI.run('@cf/meta/llama-3.1-70b-instruct', {
      prompt: `${systemPrompt}\n\nAnimal caregiver: ${userPrompt}\n\nVeterinary Assistant:`,
      max_tokens: 300,
    })

    const aiText = response.response || ''

    return new Response(
      JSON.stringify({ response: aiText.trim() }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Vet chat error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to generate response' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
