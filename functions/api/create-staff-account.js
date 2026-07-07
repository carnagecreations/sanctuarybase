import { verifyCallerRole, jsonResponse } from '../_shared/verifyRole.js'

const FIREBASE_PROJECT_ID = 'sanctuarybasev2'
const FIREBASE_API_KEY = 'AIzaSyDxOOKDrFfCGBRENNSsFTmau0v7U144vrw'

export async function onRequest(context) {
  const { request } = context

  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405)
  }

  const role = await verifyCallerRole(request)
  if (role !== 'admin' && role !== 'staff') {
    return jsonResponse({ error: 'Admin or staff access required' }, 403)
  }

  try {
    const body = await request.json()
    const { firstName, lastName, email, password, role: newRole } = body

    if (!firstName || !lastName || !email || !password) {
      return jsonResponse({ error: 'Missing required fields' }, 400)
    }

    if (password.length < 8) {
      return jsonResponse({ error: 'Password must be at least 8 characters' }, 400)
    }

    const validRoles = ['volunteer', 'staff', 'admin']
    if (!validRoles.includes(newRole)) {
      return jsonResponse({ error: 'Invalid role' }, 400)
    }

    if (role === 'staff' && newRole === 'admin') {
      return jsonResponse({ error: 'Only admins can create admin accounts' }, 403)
    }

    const idToken = request.headers.get('Authorization')?.slice(7)
    if (!idToken) {
      return jsonResponse({ error: 'Authorization failed' }, 401)
    }

    const emailLower = email.toLowerCase().trim()
    const fullName = `${firstName} ${lastName}`.trim()

    try {
      // Create Firebase Auth user
      await createFirebaseAuthUser(email, password)

      // Create role invite for the new user's email
      await createRoleInvite(emailLower, newRole, idToken)

      // Create people record
      await createPeopleRecord(fullName, email, emailLower, idToken)

      return jsonResponse({
        success: true,
        message: 'Staff account created successfully'
      }, 201)
    } catch (err) {
      console.error('Account creation failed:', err)
      return jsonResponse({ error: err.message || 'Failed to create account' }, 500)
    }
  } catch (err) {
    console.error('Request processing error:', err)
    return jsonResponse({ error: 'Invalid request' }, 400)
  }
}

async function createFirebaseAuthUser(email, password) {
  // Use Firebase Auth REST API to create a user without signing them in
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`

  const payload = {
    email: email.trim(),
    password: password.trim(),
    returnSecureToken: false, // Don't return auth tokens
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const error = await res.json()
    const errorMsg = error.error?.message || 'Failed to create auth user'
    // Handle common Firebase errors
    if (errorMsg.includes('EMAIL_EXISTS')) {
      throw new Error('Email address is already in use')
    }
    throw new Error(errorMsg)
  }

  return res.json()
}

async function createRoleInvite(email, role, idToken) {
  const documentId = email.toLowerCase()
  const timestamp = new Date().toISOString()

  const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/roleInvites/${documentId}`

  const payload = {
    fields: {
      role: { stringValue: role },
      invitedAt: { timestampValue: timestamp },
      invitedBy: { stringValue: 'admin-panel' },
    }
  }

  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${idToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const error = await res.text()
    throw new Error(`Failed to create role invite: ${error}`)
  }

  return res.json()
}

async function createPeopleRecord(name, email, emailLower, idToken) {
  const documentId = emailLower.replace(/[^a-z0-9]/g, '_')
  const timestamp = new Date().toISOString()

  const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/people/${documentId}`

  const payload = {
    fields: {
      name: { stringValue: name },
      email: { stringValue: email },
      emailLower: { stringValue: emailLower },
      types: { arrayValue: { values: [{ stringValue: 'volunteer' }] } },
      status: { stringValue: 'active' },
      createdAt: { timestampValue: timestamp },
      updatedAt: { timestampValue: timestamp },
    }
  }

  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${idToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const error = await res.text()
    throw new Error(`Failed to create people record: ${error}`)
  }

  return res.json()
}
