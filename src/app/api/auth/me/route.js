/**
 * GET /api/auth/me
 * Verifies Bearer token and returns user profile (role, fullName, etc.)
 */
import { getAuth, getFirestore } from '@/lib/firebase-admin'
import { COLLECTIONS } from '@/lib/firestore-collections'
import { json, unauthorized, serverError } from '@/app/api/lib/responses'

const normalizeRole = role => {
  const value = String(role || '').trim().toLowerCase()
  if (!value) return null
  if (value === 'federation_admin' || value === 'federation-admin' || value === 'federation admin') return 'federation_admin'
  if (value === 'club_admin' || value === 'club-admin' || value === 'club admin' || value === 'clubadmin') return 'club_admin'
  if (value === 'coach') return 'coach'
  if (value === 'player') return 'player'
  if (value === 'referee') return 'referee'
  return value
}

export async function GET (request) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
    if (!token) return unauthorized('Missing token')

    const auth = getAuth()
    const decoded = await auth.verifyIdToken(token).catch(() => null)
    if (!decoded?.uid) return unauthorized('Invalid token')

    const decodedRole = normalizeRole(decoded.role || decoded.accountRole)
    const db = getFirestore()
    const userDoc = await db.collection(COLLECTIONS.users).doc(decoded.uid).get()
    const profile = userDoc.exists ? userDoc.data() : {}
    const profileRole = normalizeRole(profile.role || profile.accountRole)

    let clubId = decoded.clubId || profile.clubId || null

    let effectiveRole = decodedRole || profileRole || 'player'
    // Always try resolving club by uid/email when clubId is missing.
    // This supports legacy club-admin accounts where role claims/profile are incomplete.
    if (!clubId) {
      let clubDoc = null
      const byUid = await db.collection(COLLECTIONS.clubs).where('adminUserId', '==', decoded.uid).limit(1).get()
      if (!byUid.empty) {
        clubDoc = byUid.docs[0]
      } else if (decoded.email || profile.email) {
        const email = (decoded.email || profile.email || '').trim().toLowerCase()
        if (email) {
          const byEmail = await db.collection(COLLECTIONS.clubs).where('adminEmail', '==', decoded.email || profile.email).limit(1).get()
          if (!byEmail.empty) {
            clubDoc = byEmail.docs[0]
          } else {
            const allClubs = await db.collection(COLLECTIONS.clubs).get()
            clubDoc = allClubs.docs.find(doc => {
              const data = doc.data() || {}
              const adminEmail = String(data.adminEmail || data.email || data.clubAdminEmail || '').trim().toLowerCase()
              const adminUid = String(data.adminUserId || data.userId || data.adminUid || '').trim()
              return adminEmail === email || adminUid === decoded.uid
            }) || null
          }
        }
      }
      if (clubDoc) {
        clubId = clubDoc.id
        effectiveRole = 'club_admin'
      }
    }

    if (clubId && userDoc.exists && !profile.clubId) {
      await db.collection(COLLECTIONS.users).doc(decoded.uid).set(
        { clubId, updatedAt: new Date().toISOString() },
        { merge: true }
      )
    }

    return json({
      uid: decoded.uid,
      email: decoded.email || profile.email,
      fullName: profile.fullName || decoded.name || decoded.email?.split('@')[0] || '',
      role: effectiveRole,
      accountRole: effectiveRole,
      clubId
    })
  } catch (e) {
    console.error(e)
    return serverError(e.message)
  }
}
