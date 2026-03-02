/**
 * GET /api/clubs – list all clubs
 * POST /api/clubs – create club
 * Admin email + password create a Firebase Auth account so the club admin can sign in.
 */
import { getAuth, getFirestore } from '@/lib/firebase-admin'
import { COLLECTIONS } from '@/lib/firestore-collections'
import { created, badRequest, serverError } from '@/app/api/lib/responses'

export async function GET () {
  try {
    const db = getFirestore()
    const snap = await db.collection(COLLECTIONS.clubs).orderBy('clubName').get()
    const clubs = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    return Response.json(clubs)
  } catch (e) {
    console.error(e)
    return serverError(e.message)
  }
}

export async function POST (request) {
  try {
    const body = await request.json()
    const { clubName, city, league, logo, adminFullName, adminEmail, adminPassword, status = 'active' } = body
    if (!clubName?.trim() || !adminEmail?.trim()) {
      return badRequest('clubName and adminEmail are required')
    }
    if (!adminPassword || adminPassword.length < 6) {
      return badRequest('Admin password is required (min 6 characters) for club admin sign-in')
    }

    const db = getFirestore()
    const auth = getAuth()
    const snap = await db.collection(COLLECTIONS.clubs).get()
    const clubId = `CLB-${String(snap.size + 1).padStart(4, '0')}`
    const ref = db.collection(COLLECTIONS.clubs).doc()

    const userRecord = await auth.createUser({
      email: adminEmail.trim(),
      password: adminPassword,
      displayName: adminFullName?.trim() || adminEmail.split('@')[0]
    })

    await auth.setCustomUserClaims(userRecord.uid, { role: 'club_admin', clubId: ref.id })

    await db.collection(COLLECTIONS.users).doc(userRecord.uid).set({
      email: adminEmail.trim(),
      fullName: adminFullName?.trim() || userRecord.displayName || '',
      role: 'club_admin',
      accountRole: 'club_admin',
      clubId: ref.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })

    await ref.set({
      clubId,
      clubName: clubName.trim(),
      city: city?.trim() ?? '',
      league: league ?? '',
      logo: logo ?? null,
      adminFullName: adminFullName?.trim() ?? '',
      adminEmail: adminEmail.trim(),
      adminUserId: userRecord.uid,
      status: status === 'pending' || status === 'inactive' ? status : 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })

    return created({ id: ref.id, clubId, clubName: body.clubName })
  } catch (e) {
    if (e.code === 'auth/email-already-exists') {
      return badRequest('An account with this email already exists. Use a different admin email.')
    }
    console.error(e)
    return serverError(e.message)
  }
}
