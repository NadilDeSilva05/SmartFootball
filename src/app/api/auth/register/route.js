/**
 * POST /api/auth/register
 * Registers club_admin, coach, player, or referee. No security code required.
 */
import { getAuth, getFirestore } from '@/lib/firebase-admin'
import { COLLECTIONS } from '@/lib/firestore-collections'
import { created, badRequest, serverError } from '@/app/api/lib/responses'

const ALLOWED_ROLES = ['club_admin', 'coach', 'player', 'referee']

export async function POST (request) {
  try {
    const body = await request.json()
    const { email, password, fullName, role } = body

    if (!email?.trim() || !password) {
      return badRequest('Email and password are required')
    }
    if (password.length < 6) {
      return badRequest('Password must be at least 6 characters')
    }
    if (!ALLOWED_ROLES.includes(role)) {
      return badRequest(`role must be one of: ${ALLOWED_ROLES.join(', ')}`)
    }

    const auth = getAuth()
    const db = getFirestore()

    const userRecord = await auth.createUser({
      email: email.trim(),
      password,
      displayName: fullName?.trim() || email.split('@')[0]
    })

    await auth.setCustomUserClaims(userRecord.uid, { role })

    await db.collection(COLLECTIONS.users).doc(userRecord.uid).set({
      email: email.trim(),
      fullName: fullName?.trim() || userRecord.displayName || '',
      role,
      accountRole: role,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })

    return created({
      uid: userRecord.uid,
      email: userRecord.email,
      role
    })
  } catch (e) {
    if (e.code === 'auth/email-already-exists') {
      return badRequest('An account with this email already exists')
    }
    console.error(e)
    return serverError(e.message)
  }
}
