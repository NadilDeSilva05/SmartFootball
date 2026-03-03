/**
 * POST /api/iot/ingest/stop – Mark a player's live stream as stopped (e.g. after substitution).
 * Body: { matchId, playerId }
 * Sets status to 'stopped' in Firestore and Firebase Realtime Database.
 */
import { getFirestore, getDatabase } from '@/lib/firebase-admin'
import { COLLECTIONS } from '@/lib/firestore-collections'
import { json, badRequest, serverError } from '@/app/api/lib/responses'

const safeRtdbKey = (s) => String(s ?? '').replace(/[.#$\[\]/]/g, '_')

export async function POST (request) {
  try {
    const body = await request.json()
    const { matchId, playerId } = body
    if (!matchId || !playerId) return badRequest('matchId and playerId are required')
    const db = getFirestore()
    const docId = `${matchId}_${playerId}`
    const ref = db.collection(COLLECTIONS.liveMetrics).doc(docId)
    const update = { status: 'stopped', updatedAt: new Date().toISOString() }
    await ref.set(update, { merge: true })

    const rtdb = getDatabase()
    if (rtdb) {
      const rtdbPath = `live_metrics/${safeRtdbKey(matchId)}/${safeRtdbKey(playerId)}`
      await rtdb.ref(rtdbPath).update(update).catch(err => console.error('RTDB stop update failed:', err?.message))
    }
    return json({ docId, status: 'stopped' })
  } catch (e) {
    console.error(e)
    return serverError(e.message)
  }
}
