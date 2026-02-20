/**
 * GET /api/player-requests – list (optional ?status=pending|approved|rejected)
 * POST /api/player-requests – create request (club submits)
 */
import { getFirestore } from '@/lib/firebase-admin'
import { COLLECTIONS } from '@/lib/firestore-collections'
import { created, badRequest, serverError } from '@/app/api/lib/responses'

export async function GET (request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const db = getFirestore()
    let q = db.collection(COLLECTIONS.playerRequests).orderBy('createdAt', 'desc')
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
    const { clubId, playerId, fullName, position, nicOrPassport, dateOfBirth, jerseyNo, commentaryName, residentStatus, visaNo } = body
    if (!clubId || !playerId?.trim() || !fullName?.trim()) {
      return badRequest('clubId, playerId and fullName are required')
    }
    const db = getFirestore()
    const ref = db.collection(COLLECTIONS.playerRequests).doc()
    await ref.set({
      clubId,
      playerId: playerId.trim(),
      fullName: fullName.trim(),
      position: position ?? '',
      nicOrPassport: nicOrPassport ?? '',
      dateOfBirth: dateOfBirth ?? '',
      jerseyNo: jerseyNo ?? '',
      commentaryName: commentaryName ?? '',
      residentStatus: residentStatus ?? 'local',
      visaNo: visaNo ?? '',
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
