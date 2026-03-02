/**
 * POST /api/auth/register-federation-admin
 * Creates federation admin account. Requires FEDERATION_ADMIN_SECRET_CODE from env.
 */
import { getAuth, getFirestore } from '@/lib/firebase-admin'
import { COLLECTIONS } from '@/lib/firestore-collections'
import { created, badRequest, serverError } from '@/app/api/lib/responses'

const FEDERATION_ROLE = 'federation_admin'

export async function POST (request) {
  try {
    const body = await request.json()
    const { email, password, fullName, securityCode } = body

    if (!email?.trim() || !password) {
      return badRequest('Email and password are required')
    }
    if (password.length < 6) {
      return badRequest('Password must be at least 6 characters')
    }

    const secretCode = process.env.FEDERATION_ADMIN_SECRET_CODE
    if (!secretCode || String(securityCode || '').trim() !== String(secretCode).trim()) {
      return badRequest('Invalid security code')
    }

    const auth = getAuth()
    const db = getFirestore()

    const userRecord = await auth.createUser({
      email: email.trim(),
      password,
      displayName: fullName?.trim() || email.split('@')[0]
    })

    await auth.setCustomUserClaims(userRecord.uid, { role: FEDERATION_ROLE })

    await db.collection(COLLECTIONS.users).doc(userRecord.uid).set({
      email: email.trim(),
      fullName: fullName?.trim() || userRecord.displayName || '',
      role: FEDERATION_ROLE,
      accountRole: FEDERATION_ROLE,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })

    return created({
      uid: userRecord.uid,
      email: userRecord.email,
      role: FEDERATION_ROLE
    })
  } catch (e) {
    if (e.code === 'auth/email-already-exists') {
      return badRequest('An account with this email already exists')
    }
    console.error(e)
    return serverError(e.message)
  }
}
