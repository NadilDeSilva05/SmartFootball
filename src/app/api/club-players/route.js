/**
 * GET /api/club-players?clubId= – list players for a club
 * POST /api/club-players – add player (club)
 */
import { getFirestore } from '@/lib/firebase-admin'
import { COLLECTIONS } from '@/lib/firestore-collections'
import { created, badRequest, serverError } from '@/app/api/lib/responses'

export async function GET (request) {
  try {
    const { searchParams } = new URL(request.url)
    const clubId = searchParams.get('clubId')
    if (!clubId) return badRequest('clubId query required')
    const db = getFirestore()
    const snap = await db.collection(COLLECTIONS.clubPlayers).where('clubId', '==', clubId).orderBy('fullName').get()
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
    const { clubId, playerId, fullName, commentaryName, jerseyNo, nicOrPassport, dateOfBirth, residentStatus, visaNo, position, photo, status = 'approved' } = body
    if (!clubId || !playerId?.trim() || !fullName?.trim()) {
      return badRequest('clubId, playerId and fullName are required')
    }
    const db = getFirestore()
    const ref = db.collection(COLLECTIONS.clubPlayers).doc()
    await ref.set({
      clubId,
      playerId: playerId.trim(),
      fullName: fullName.trim(),
      commentaryName: commentaryName ?? '',
      jerseyNo: jerseyNo ?? '',
      nicOrPassport: nicOrPassport ?? '',
      dateOfBirth: dateOfBirth ?? '',
      residentStatus: residentStatus ?? 'local',
      visaNo: visaNo ?? '',
      position: position ?? 'Forward',
      photo: photo ?? null,
      status: status === 'pending' ? 'pending' : 'approved',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
    return created({ id: ref.id })
  } catch (e) {
    console.error(e)
    return serverError(e.message)
  }
}
