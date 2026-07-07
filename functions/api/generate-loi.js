/**
 * Cloudflare Pages Function: Generate Letter of Intent using Cloudflare Workers AI
 *
 * This endpoint receives grant information and generates a professional
 * Letter of Intent draft using Cloudflare's built-in AI models.
 * Signed-in staff/admin only — burns AI-inference budget.
 */
import { verifyCallerRole, jsonResponse } from '../_shared/verifyRole.js'

export async function onRequest(context) {
  // Only allow POST requests
  if (context.request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  const role = await verifyCallerRole(context.request)
  if (role !== 'staff' && role !== 'admin') {
    return jsonResponse({ error: 'Sign in as staff or admin required' }, 403)
  }

  try {
    const { grantName, organization, amount, context: grantContext } = await context.request.json()

    if (!grantName || !organization || !grantContext) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Prepare the prompt for the AI model
    const prompt = `You are an expert grant writer. Generate a professional Letter of Intent (LOI) for a grant application.

Grant Details:
- Organization: ${organization}
- Grant Name: ${grantName}
- Funding Amount: $${Number(amount).toLocaleString()}

Organization Context:
${grantContext}

Please write a compelling, professional Letter of Intent that:
1. Clearly states the purpose and goals
2. Explains why this organization is a good fit for the grant
3. Demonstrates understanding of the grant requirements
4. Highlights relevant achievements and impact
5. Shows a clear plan for using the funds effectively

Keep it concise but comprehensive (300-500 words). Format it as a formal business letter.`

    // Check if AI is available in env
    if (!context.env.AI) {
      console.error('AI binding not available in context.env')
      return new Response(
        JSON.stringify({ error: 'AI service unavailable - ensure AI binding is configured' }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Use Cloudflare Workers AI
    const response = await context.env.AI.run(
      '@cf/meta/llama-3.1-70b-instruct',
      {
        prompt: prompt,
      }
    )

    const loi = response.response || response.result?.response

    return new Response(
      JSON.stringify({ loi }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error generating LOI:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
