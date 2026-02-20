/**
 * POST /api/iot/ingest – ESP32 (or device) sends live metrics.
 * Writes to Firestore so the Live Match Dashboard can listen in real time.
 * Body: { matchId, playerId, playerName?, heartRate, fatigueLevel, playerLoad, sprintCount, highIntensityDist, workRate, injuryRisk? }
 */
import { getFirestore } from '@/lib/firebase-admin'
import { COLLECTIONS } from '@/lib/firestore-collections'
import { created, badRequest, serverError } from '@/app/api/lib/responses'

export async function POST (request) {
  try {
    const body = await request.json()
    const {
      matchId,
      playerId,
      playerName,
      heartRate,
      fatigueLevel,
      playerLoad,
      sprintCount,
      highIntensityDist,
      workRate,
      injuryRisk
    } = body

    if (!matchId || !playerId) {
      return badRequest('matchId and playerId are required')
    }

    const db = getFirestore()
    // One doc per player per match for real-time listener: live_metrics/{matchId}_{playerId}
    const docId = `${matchId}_${playerId}`
    const ref = db.collection(COLLECTIONS.liveMetrics).doc(docId)
    const payload = {
      matchId,
      playerId,
      playerName: playerName ?? '',
      heartRate: Number(heartRate) || 0,
      fatigueLevel: fatigueLevel ?? 'Low',
      playerLoad: Number(playerLoad) || 0,
      sprintCount: Number(sprintCount) || 0,
      highIntensityDist: Number(highIntensityDist) || 0,
      workRate: workRate ?? 'Medium',
      injuryRisk: Boolean(injuryRisk),
      status: 'live',
      updatedAt: new Date().toISOString()
    }
    await ref.set(payload, { merge: true })
    return created({ docId, updatedAt: payload.updatedAt })
  } catch (e) {
    console.error(e)
    return serverError(e.message)
  }
}
