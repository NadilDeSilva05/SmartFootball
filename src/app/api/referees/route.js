/**
 * GET /api/referees – list all referees
 * POST /api/referees – create referee (creates Firebase Auth user for referee login)
 */
import { getAuth, getFirestore } from '@/lib/firebase-admin'
import { COLLECTIONS } from '@/lib/firestore-collections'
import { created, badRequest, serverError } from '@/app/api/lib/responses'

export async function GET () {
  try {
    const db = getFirestore()
    const snap = await db.collection(COLLECTIONS.referees).orderBy('fullName').get()
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    return Response.json(list)
  } catch (e) {
    console.error(e)
    return serverError(e.message)
  }
}

export async function POST (request) {
  try {
    const body = await request.json()
    const { fullName, licenseLevel, nicOrPassport, email, password, age, homeTown, status = 'active' } = body
    if (!fullName?.trim()) return badRequest('fullName is required')
    if (!email?.trim()) return badRequest('Email is required for referee login')
    if (!/\S+@\S+\.\S+/.test(email.trim())) return badRequest('Enter a valid email')
    if (!password || password.length < 6) return badRequest('Password is required (min 6 characters) for referee login')

    const db = getFirestore()
    const auth = getAuth()
    const snap = await db.collection(COLLECTIONS.referees).get()
    const refereeId = `REF-${String(snap.size + 1).padStart(4, '0')}`
    const ref = db.collection(COLLECTIONS.referees).doc()

    const userRecord = await auth.createUser({
      email: email.trim(),
      password,
      displayName: fullName.trim() || email.split('@')[0]
    })

    await auth.setCustomUserClaims(userRecord.uid, { role: 'referee', refereeId: ref.id })

    await db.collection(COLLECTIONS.users).doc(userRecord.uid).set({
      email: email.trim(),
      fullName: fullName.trim() || userRecord.displayName || '',
      role: 'referee',
      accountRole: 'referee',
      refereeId: ref.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })

    await ref.set({
      refereeId,
      fullName: fullName.trim(),
      licenseLevel: licenseLevel ?? '',
      nicOrPassport: nicOrPassport ?? '',
      email: email.trim(),
      age: age ?? '',
      homeTown: homeTown ?? '',
      status: status === 'inactive' ? 'inactive' : status === 'pending' ? 'pending' : 'active',
      authUserId: userRecord.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
    return created({ id: ref.id, refereeId, fullName: body.fullName })
  } catch (e) {
    if (e.code === 'auth/email-already-exists') {
      return badRequest('An account with this email already exists. Use a different email.')
    }
    console.error(e)
    return serverError(e.message)
  }
}
