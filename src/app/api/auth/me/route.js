/**
 * GET /api/auth/me
 * Verifies Bearer token and returns user profile (role, fullName, etc.)
 */
import { getAuth, getFirestore } from '@/lib/firebase-admin'
import { COLLECTIONS } from '@/lib/firestore-collections'
import { json, unauthorized, serverError } from '@/app/api/lib/responses'

export async function GET (request) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
    if (!token) return unauthorized('Missing token')

    const auth = getAuth()
    const decoded = await auth.verifyIdToken(token).catch(() => null)
    if (!decoded?.uid) return unauthorized('Invalid token')

    const role = decoded.role || decoded.accountRole
    const db = getFirestore()
    const userDoc = await db.collection(COLLECTIONS.users).doc(decoded.uid).get()
    const profile = userDoc.exists ? userDoc.data() : {}

    return json({
      uid: decoded.uid,
      email: decoded.email || profile.email,
      fullName: profile.fullName || decoded.name || decoded.email?.split('@')[0] || '',
      role: role || profile.role || 'player',
      accountRole: profile.accountRole || role
    })
  } catch (e) {
    console.error(e)
    return serverError(e.message)
  }
}
