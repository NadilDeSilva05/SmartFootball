/**
 * POST /api/iot/ingest/stop – Mark a player's live stream as stopped (e.g. after substitution).
 * Body: { matchId, playerId }
 * Sets status to 'stopped' so dashboard can hide or show "Substituted".
 */
import { getFirestore } from '@/lib/firebase-admin'
import { COLLECTIONS } from '@/lib/firestore-collections'
import { json, badRequest, serverError } from '@/app/api/lib/responses'

export async function POST (request) {
  try {
    const body = await request.json()
    const { matchId, playerId } = body
    if (!matchId || !playerId) return badRequest('matchId and playerId are required')
    const db = getFirestore()
    const docId = `${matchId}_${playerId}`
    const ref = db.collection(COLLECTIONS.liveMetrics).doc(docId)
    await ref.set({ status: 'stopped', updatedAt: new Date().toISOString() }, { merge: true })
    return json({ docId, status: 'stopped' })
  } catch (e) {
    console.error(e)
    return serverError(e.message)
  }
}
