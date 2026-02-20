/**
 * GET /api/coach-requests – list (optional ?status=)
 * POST /api/coach-requests – create request (club submits)
 */
import { getFirestore } from '@/lib/firebase-admin'
import { COLLECTIONS } from '@/lib/firestore-collections'
import { created, badRequest, serverError } from '@/app/api/lib/responses'

export async function GET (request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const db = getFirestore()
    let q = db.collection(COLLECTIONS.coachRequests).orderBy('createdAt', 'desc')
    if (status) q = q.where('status', '==', status)
    const snap = await q.get()
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
    const { clubId, coachId, fullName, role, license, nicOrPassport, dateOfBirth } = body
    if (!clubId || !coachId?.trim() || !fullName?.trim()) {
      return badRequest('clubId, coachId and fullName are required')
    }
    const db = getFirestore()
    const ref = db.collection(COLLECTIONS.coachRequests).doc()
    await ref.set({
      clubId,
      coachId: coachId.trim(),
      fullName: fullName.trim(),
      role: role ?? 'assistant_coach',
      license: license ?? '',
      nicOrPassport: nicOrPassport ?? '',
      dateOfBirth: dateOfBirth ?? '',
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
    return created({ id: ref.id, status: 'pending' })
  } catch (e) {
    console.error(e)
    return serverError(e.message)
  }
}
