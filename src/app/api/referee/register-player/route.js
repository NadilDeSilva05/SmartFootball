/**
 * POST /api/referee/register-player – Register a player for a match (after QR scan).
 * Device will connect at match start time; list is used by referee UI and to know who is in the match.
 */
import { getFirestore } from '@/lib/firebase-admin'
import { COLLECTIONS } from '@/lib/firestore-collections'
import { created, badRequest, conflict, serverError } from '@/app/api/lib/responses'

export async function POST (request) {
  try {
    const body = await request.json()
    const { matchId, matchName, startTime, playerId, playerName, club, jerseyNumber } = body
    if (!matchId || !playerId) {
      return badRequest('matchId and playerId are required')
    }
    const db = getFirestore()
    const mid = String(matchId).trim()
    const pid = String(playerId).trim()

    const existingSnap = await db.collection(COLLECTIONS.matchRegistrations).where('matchId', '==', mid).get()
    const duplicate = (existingSnap.docs || []).some(d => String(d.data()?.playerId ?? '').trim() === pid)
    if (duplicate) {
      return conflict('This player is already registered for this match.')
    }

    const ref = db.collection(COLLECTIONS.matchRegistrations).doc()
    await ref.set({
      matchId: mid,
      matchName: matchName ?? '',
      startTime: startTime ?? '',
      playerId: pid,
      playerName: playerName ?? '',
      club: club ?? '',
      clubId: body.clubId ?? '',
      jerseyNumber: jerseyNumber ?? '',
      scannedAt: new Date().toISOString()
    })
    return created({ id: ref.id, matchId: mid, playerId: pid })
  } catch (e) {
    console.error(e)
    return serverError(e.message)
  }
}
