/**
 * POST /api/iot/ingest – ESP32 (or device) sends live metrics.
 * Body: { matchId, playerId, playerName? } OR { deviceId } – when deviceId is sent, playerId/matchId are resolved from player_device_links.
 * Plus: heartRate, fatigueLevel, playerLoad, sprintCount, highIntensityDist, workRate, injuryRisk?
 * Writes to Firestore (live_metrics) and Firebase Realtime Database (live_metrics/{matchId}/{playerId}) when FIREBASE_DATABASE_URL is set.
 */
import { getFirestore, getDatabase } from '@/lib/firebase-admin'
import { COLLECTIONS } from '@/lib/firestore-collections'
import { created, badRequest, serverError } from '@/app/api/lib/responses'

export async function POST (request) {
  try {
    const body = await request.json()
    let {
      matchId,
      playerId,
      playerName,
      deviceId,
      heartRate,
      fatigueLevel,
      playerLoad,
      sprintCount,
      highIntensityDist,
      workRate,
      injuryRisk
    } = body

    const db = getFirestore()

    if (deviceId) {
      const linkSnap = await db.collection(COLLECTIONS.playerDeviceLinks).where('deviceId', '==', String(deviceId).trim()).where('status', '==', 'active').get()
      const linkDoc = linkSnap.docs[0]
      if (!linkDoc) return badRequest('No active link for this device. Referee must link device to a player first.')
      const link = linkDoc.data()
      playerId = link.playerId
      matchId = matchId || link.matchId
      if (!matchId) return badRequest('matchId required when link has no matchId; include matchId in request body.')
      await db.collection(COLLECTIONS.iotDevices).doc(String(deviceId).trim()).set({ lastSeen: new Date().toISOString(), status: 'online', updatedAt: new Date().toISOString() }, { merge: true })
    }

    if (!matchId || !playerId) {
      return badRequest('matchId and playerId are required (or deviceId with an active player link)')
    }

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

    const rtdb = getDatabase()
    if (rtdb) {
      const safe = (s) => String(s ?? '').replace(/[.#$\[\]/]/g, '_')
      const rtdbPath = `live_metrics/${safe(matchId)}/${safe(playerId)}`
      await rtdb.ref(rtdbPath).set(payload).catch(err => console.error('RTDB write failed:', err?.message))
    }

    return created({ docId, updatedAt: payload.updatedAt })
  } catch (e) {
    console.error(e)
    return serverError(e.message)
  }
}
