/**
 * GET /api/coach-requests – list (optional ?status=)
 * POST /api/coach-requests – create request (club submits)
 */
import { getFirestore } from '@/lib/firebase-admin'
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
    const snap = await db.collection(COLLECTIONS.coachRequests).orderBy('createdAt', 'desc').get()
    let list = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    if (status) list = list.filter(item => (item.status || '') === status)
    if (clubId) list = list.filter(item => (item.clubId || null) === clubId)
    return Response.json(list)
  } catch (e) {
    console.error(e)
    return serverError(e.message)
  }
}

export async function POST (request) {
  try {
    const body = await request.json()
    const { clubId, coachId, fullName, email, role, license, nicOrPassport, dateOfBirth } = body
    if (!clubId || !fullName?.trim()) {
      return badRequest('clubId and fullName are required')
    }
    const db = getFirestore()
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

    const ref = db.collection(COLLECTIONS.coachRequests).doc()
    await ref.set({
      clubId,
      coachId: resolvedCoachId,
      fullName: fullName.trim(),
      email: email?.trim() || '',
      role: role ?? 'assistant_coach',
      license: role === 'analyst' ? '' : (license ?? ''),
      nicOrPassport: nicOrPassport ?? '',
      dateOfBirth: dateOfBirth ?? '',
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
    return created({ id: ref.id, status: 'pending', coachId: resolvedCoachId })
  } catch (e) {
    console.error(e)
    return serverError(e.message)
  }
}
