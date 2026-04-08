/**
 * POST /api/iot/ingest/stop – After substitution: stop live stream, release device link, reset RTDB device readings.
 * Body: { matchId, playerId, deviceId? }
 * - Firestore live_metrics doc → stopped
 * - player_device_links for this match + player → status released
 * - RTDB live_metrics path updated
 * - RTDB devices/{deviceId}/sensor set to zeros (and control command → reset)
 */
import { getFirestore, getDatabase } from '@/lib/firebase-admin'
import { COLLECTIONS } from '@/lib/firestore-collections'
import { json, badRequest, serverError } from '@/app/api/lib/responses'

const safeRtdbKey = (s) => String(s ?? '').replace(/[.#$\[\]/]/g, '_')

const ZERO_SENSOR = {
  heartRate: {
    bpm: 0,
    bpm_instant: 0,
    finger: false,
    ir: 0,
    status: 'idle',
    timestamp: 0
  },
  motion: {
    accel: 0,
    distance_m: 0,
    gyro: 0,
    speed_kmh: 0,
    steps: 0,
    stride_m: 0,
    timestamp_ms: 0
  }
}

async function releaseDeviceLinks ({ db, matchId, playerId, deviceIdOpt }) {
  const col = db.collection(COLLECTIONS.playerDeviceLinks)
  const pid = String(playerId).trim()
  const mid = String(matchId).trim()

  const activeSnap = await col.where('playerId', '==', pid).where('status', '==', 'active').get()
  const docs = activeSnap.docs.filter(d => {
    const m = d.data()?.matchId
    return !m || String(m) === mid
  })

  const now = new Date().toISOString()
  const deviceIds = new Set()
  for (const doc of docs) {
    const data = doc.data() || {}
    const dev = String(data.deviceId || '').trim()
    if (deviceIdOpt && dev && dev !== String(deviceIdOpt).trim()) continue
    if (dev) deviceIds.add(dev)
    await doc.ref.update({
      status: 'released',
      releasedAt: now,
      releaseReason: 'substitution'
    }).catch(err => console.error('release link failed:', err?.message))
  }

  return [...deviceIds]
}

export async function POST (request) {
  try {
    const body = await request.json()
    const { matchId, playerId, deviceId } = body
    if (!matchId || !playerId) return badRequest('matchId and playerId are required')

    const db = getFirestore()
    const docId = `${matchId}_${playerId}`
    const ref = db.collection(COLLECTIONS.liveMetrics).doc(docId)
    const update = { status: 'stopped', updatedAt: new Date().toISOString() }
    await ref.set(update, { merge: true })

    const resolvedDevices = await releaseDeviceLinks({
      db,
      matchId,
      playerId,
      deviceIdOpt: deviceId ? String(deviceId).trim() : null
    })
    const devicesToReset = [...new Set([
      ...resolvedDevices,
      ...(deviceId ? [String(deviceId).trim()] : [])
    ])].filter(Boolean)

    const rtdb = getDatabase()
    if (rtdb) {
      const rtdbPath = `live_metrics/${safeRtdbKey(matchId)}/${safeRtdbKey(playerId)}`
      await rtdb.ref(rtdbPath).update(update).catch(err => console.error('RTDB stop update failed:', err?.message))

      for (const devId of devicesToReset) {
        const safeDev = String(devId).replace(/[.#$\[\]/]/g, '_')
        await rtdb.ref(`devices/${safeDev}/sensor`).set(ZERO_SENSOR).catch(err => console.error('RTDB sensor reset failed:', devId, err?.message))
        await rtdb.ref(`devices/${safeDev}/control/command`).set('reset').catch(() => {})
      }
    }

    return json({
      docId,
      status: 'stopped',
      devicesReset: devicesToReset,
      linksReleased: devicesToReset.length > 0 || resolvedDevices.length > 0
    })
  } catch (e) {
    console.error(e)
    return serverError(e.message)
  }
}
