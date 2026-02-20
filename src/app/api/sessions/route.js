/**
 * GET /api/sessions – list completed match sessions
 *   Query: ?playerId= (for player view) | ?matchId= (for coach view) | none = all
 * POST /api/sessions – save a completed session (after substitute or full-time)
 */
import { getFirestore } from '@/lib/firebase-admin'
import { COLLECTIONS } from '@/lib/firestore-collections'
import { created, badRequest, serverError } from '@/app/api/lib/responses'

export async function GET (request) {
  try {
    const { searchParams } = new URL(request.url)
    const playerId = searchParams.get('playerId')
    const matchId = searchParams.get('matchId')
    const db = getFirestore()
    let q = db.collection(COLLECTIONS.matchSessions).orderBy('endedAt', 'desc')
    if (playerId) q = q.where('playerId', '==', playerId)
    if (matchId) q = q.where('matchId', '==', matchId)
    const snap = await q.limit(200).get()
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
    const {
      matchId,
      matchName,
      playerId,
      playerName,
      reason,
      heartRate,
      fatigueLevel,
      playerLoad,
      sprintCount,
      highIntensityDist,
      workRate,
      minutesPlayed
    } = body

    if (!matchId || !playerId || !reason) {
      return badRequest('matchId, playerId and reason are required')
    }
    if (reason !== 'substitution' && reason !== 'full_time') {
      return badRequest('reason must be substitution or full_time')
    }

    const db = getFirestore()
    const ref = db.collection(COLLECTIONS.matchSessions).doc()
    const payload = {
      matchId,
      matchName: matchName ?? '',
      playerId,
      playerName: playerName ?? '',
      reason,
      heartRate: Number(heartRate) ?? 0,
      fatigueLevel: fatigueLevel ?? '',
      playerLoad: Number(playerLoad) ?? 0,
      sprintCount: Number(sprintCount) ?? 0,
      highIntensityDist: Number(highIntensityDist) ?? 0,
      workRate: workRate ?? '',
      minutesPlayed: Number(minutesPlayed) ?? 0,
      endedAt: new Date().toISOString()
    }
    await ref.set(payload)
    return created({ id: ref.id, ...payload })
  } catch (e) {
    console.error(e)
    return serverError(e.message)
  }
}
