/**
 * GET /api/coach-requests – list (optional ?status=)
 * POST /api/coach-requests – create request (club submits)
 */
import { getAuth, getFirestore } from '@/lib/firebase-admin'
import { COLLECTIONS } from '@/lib/firestore-collections'
import { created, badRequest, serverError } from '@/app/api/lib/responses'

const nextCoachIdFrom = (items = []) => {
  let max = 0
  for (const item of items) {
    const value = String(item?.coachId || '').trim()
    const match = value.match(/(\d+)$/)
    if (!match) continue
    const n = Number(match[1])
    if (Number.isFinite(n) && n > max) max = n
  }
  return `CH-${String(max + 1).padStart(4, '0')}`
}

export async function GET (request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const clubId = searchParams.get('clubId')
    const db = getFirestore()

    let list
    if (clubId) {
      const snap = await db.collection(COLLECTIONS.coachRequests).where('clubId', '==', clubId).get()
      list = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      list.sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')))
    } else {
      const snap = await db.collection(COLLECTIONS.coachRequests).orderBy('createdAt', 'desc').get()
      list = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    }
    if (status) list = list.filter(item => (item.status || '') === status)
    return Response.json(list)
  } catch (e) {
    console.error(e)
    return serverError(e.message)
  }
}

export async function POST (request) {
  try {
    const body = await request.json()
    const { clubId, coachId, fullName, email, password, role, license, nicOrPassport, dateOfBirth } = body
    if (!clubId || !fullName?.trim()) {
      return badRequest('clubId and fullName are required')
    }
    if (!email?.trim()) {
      return badRequest('email is required')
    }
    if (!password || typeof password !== 'string') {
      return badRequest('password is required for coach login')
    }
    if (password.length < 6) {
      return badRequest('password must be at least 6 characters')
    }

    const auth = getAuth()
    const db = getFirestore()

    const clubSnap = await db.collection(COLLECTIONS.clubs).doc(clubId).get()
    if (!clubSnap.exists) {
      return badRequest('Invalid club')
    }

    const submittedCoachId = String(coachId || '').trim()

    let resolvedCoachId = submittedCoachId
    if (!resolvedCoachId) {
      const [reqSnap, coachesSnap] = await Promise.all([
        db.collection(COLLECTIONS.coachRequests).where('clubId', '==', clubId).get(),
        db.collection(COLLECTIONS.clubCoaches).where('clubId', '==', clubId).get()
      ])
      const all = [
        ...reqSnap.docs.map(d => d.data()),
        ...coachesSnap.docs.map(d => d.data())
      ]
      resolvedCoachId = nextCoachIdFrom(all)
    }

    const existingPending = await db
      .collection(COLLECTIONS.coachRequests)
      .where('clubId', '==', clubId)
      .where('coachId', '==', resolvedCoachId)
      .where('status', '==', 'pending')
      .get()

    if (!existingPending.empty) {
      return badRequest('A pending request already exists for this coach ID')
    }

    const existingCoaches = await db
      .collection(COLLECTIONS.clubCoaches)
      .where('clubId', '==', clubId)
      .where('coachId', '==', resolvedCoachId)
      .get()

    if (!existingCoaches.empty) {
      return badRequest('Coach ID already exists in this club')
    }

    let uid
    try {
      const userRecord = await auth.createUser({
        email: email.trim(),
        password,
        displayName: fullName?.trim() || email.split('@')[0]
      })
      uid = userRecord.uid
      await auth.setCustomUserClaims(uid, { role: 'coach' })
      await db.collection(COLLECTIONS.users).doc(uid).set({
        email: email.trim(),
        fullName: fullName?.trim() || userRecord.displayName || '',
        role: 'coach',
        accountRole: 'coach',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
    } catch (e) {
      if (e.code === 'auth/email-already-exists') {
        return badRequest('An account with this email already exists')
      }
      throw e
    }

    const ref = db.collection(COLLECTIONS.coachRequests).doc()
    try {
      await ref.set({
        clubId,
        coachId: resolvedCoachId,
        fullName: fullName.trim(),
        email: email?.trim() || '',
        uid,
        role: role ?? 'assistant_coach',
        license: role === 'analyst' ? '' : (license ?? ''),
        nicOrPassport: nicOrPassport ?? '',
        dateOfBirth: dateOfBirth ?? '',
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
    } catch (writeErr) {
      try {
        await auth.deleteUser(uid)
      } catch (_) { /* ignore rollback failure */ }
      throw writeErr
    }
    return created({ id: ref.id, status: 'pending', coachId: resolvedCoachId })
  } catch (e) {
    console.error(e)
    return serverError(e.message)
  }
}
