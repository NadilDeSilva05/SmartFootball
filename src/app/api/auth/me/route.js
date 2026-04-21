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
        const raw = String(decoded.email || profile.email || '').trim()
        const lower = raw.toLowerCase()
        const emailVariants = [...new Set([raw, lower].filter(Boolean))]
        for (const em of emailVariants) {
          const byEmail = await db.collection(COLLECTIONS.clubs).where('adminEmail', '==', em).limit(1).get()
          if (!byEmail.empty) {
            clubDoc = byEmail.docs[0]
            break
          }
        }
      }
      if (clubDoc) {
        clubId = clubDoc.id
        effectiveRole = 'club_admin'
      }
    }

    const isCoach = effectiveRole === 'coach' || profileRole === 'coach' || decodedRole === 'coach'
    if (!clubId && isCoach) {
      const rawEmail = String(decoded.email || profile.email || '').trim()
      if (rawEmail) {
        const tryEmail = async (em) => {
          const snap = await db.collection(COLLECTIONS.clubCoaches).where('email', '==', em).limit(1).get()
          return snap.empty ? null : (snap.docs[0].data()?.clubId || null)
        }
        clubId = (await tryEmail(rawEmail)) || (await tryEmail(rawEmail.toLowerCase())) || null
      }
    }

    let clubPlayerDocId = profile.clubPlayerDocId || null
    const isPlayer = effectiveRole === 'player' || profileRole === 'player' || decodedRole === 'player'
    if (!clubPlayerDocId && isPlayer) {
      const emails = [...new Set(
        [decoded.email, profile.email]
          .filter(Boolean)
          .map(e => String(e).trim())
          .flatMap(e => [e, e.toLowerCase()])
      )]
      for (const em of emails) {
        if (!em) continue
        const pSnap = await db.collection(COLLECTIONS.clubPlayers).where('email', '==', em).limit(5).get()
        if (!pSnap.empty) {
          const sorted = pSnap.docs.sort((a, b) =>
            String(b.data()?.updatedAt || '').localeCompare(String(a.data()?.updatedAt || ''))
          )
          clubPlayerDocId = sorted[0].id
          break
        }
      }
    }

    const userPatch = { updatedAt: new Date().toISOString() }
    if (clubId && !profile.clubId) userPatch.clubId = clubId
    if (clubPlayerDocId && !profile.clubPlayerDocId) userPatch.clubPlayerDocId = clubPlayerDocId
    if (userDoc.exists && Object.keys(userPatch).length > 1) {
      await db.collection(COLLECTIONS.users).doc(decoded.uid).set(userPatch, { merge: true })
    }

    return json({
      uid: decoded.uid,
      email: decoded.email || profile.email,
      fullName: profile.fullName || decoded.name || decoded.email?.split('@')[0] || '',
      role: effectiveRole,
      accountRole: effectiveRole,
      clubId,
      clubPlayerDocId: clubPlayerDocId || undefined,
      refereeId: profile.refereeId || decoded.refereeId || undefined
    })
  } catch (e) {
    console.error(e)
    return serverError(e.message)
  }
}
