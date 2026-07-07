/**
 * Cloudflare Pages Function: Send email reminders
 * POST /api/send-reminder
 * Body: { to, subject, body, type }
 * Uses Cloudflare Email Workers binding (configure in dashboard)
 * Signed-in staff/admin only — otherwise this is an open relay that can
 * send arbitrary email under the org's name.
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
    const { to, subject, body, type } = await context.request.json()

    if (!to || !subject || !body) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: to, subject, body' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Build email using Cloudflare Email Workers (MailChannels)
    const emailData = {
      personalizations: [{ to: [{ email: to }] }],
      from: { email: 'noreply@sanctuarybase.com', name: 'SanctuaryBase' },
      subject: subject,
      content: [
        {
          type: 'text/html',
          value: buildEmailHTML(subject, body, type),
        },
      ],
    }

    const resp = await fetch('https://api.mailchannels.net/tx/v1/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emailData),
    })

    if (!resp.ok && resp.status !== 202) {
      const errText = await resp.text()
      throw new Error(`MailChannels error: ${resp.status} ${errText}`)
    }

    return new Response(
      JSON.stringify({ success: true, to, subject }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error sending reminder:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to send email', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

const buildEmailHTML = (subject, body, type) => {
  const typeColors = {
    vaccine: '#F97316',
    foster: '#A78BFA',
    volunteer: '#4EFFC5',
    donor: '#60A5FA',
    general: '#4EFFC5',
  }
  const color = typeColors[type] || typeColors.general

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#1A1033;font-family:'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px;">
    <div style="background:#241B4A;border-radius:12px;overflow:hidden;border:1px solid #2D2456;">
      <div style="background:${color};padding:4px 0;"></div>
      <div style="padding:24px 28px;">
        <div style="font-size:22px;font-weight:800;color:#fff;margin-bottom:16px;">SanctuaryBase</div>
        <div style="font-size:18px;font-weight:700;color:#fff;margin-bottom:12px;">${subject}</div>
        <div style="font-size:14px;color:#9B8FCC;line-height:1.6;white-space:pre-wrap;">${body}</div>
        <div style="margin-top:24px;padding-top:16px;border-top:1px solid #2D2456;font-size:11px;color:#5A4E8A;">
          Sent by SanctuaryBase · Do not reply to this email
        </div>
      </div>
    </div>
  </div>
</body>
</html>`
}
