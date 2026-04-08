/**
 * GET /api/iot/player-device-link?matchId= – list links for a match (referee/coach)
 * GET /api/iot/player-device-link?deviceId= – get link for device
 * POST /api/iot/player-device-link – link device to player (referee). Body: { playerId, deviceId, matchId }
 */
import { getFirestore } from '@/lib/firebase-admin'
import { COLLECTIONS } from '@/lib/firestore-collections'
import { created, badRequest, serverError } from '@/app/api/lib/responses'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const matchId = searchParams.get('matchId')
    const deviceId = searchParams.get('deviceId')
    const playerId = searchParams.get('playerId')
    const db = getFirestore()
    const col = db.collection(COLLECTIONS.playerDeviceLinks)
    if (matchId) {
      const snap = await col.where('matchId', '==', matchId).get()
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      return Response.json(list)
    }
    if (deviceId) {
      const snap = await col.where('deviceId', '==', deviceId).get()
      const sorted = snap.docs.sort((a, b) => (b.data()?.linkedAt || '').localeCompare(a.data()?.linkedAt || ''))
      const doc = sorted[0]
      if (!doc) return Response.json(null)
      return Response.json({ id: doc.id, ...doc.data() })
    }
    if (playerId) {
      const snap = await col.where('playerId', '==', playerId).get()
      const sorted = snap.docs.sort((a, b) => (b.data()?.linkedAt || '').localeCompare(a.data()?.linkedAt || ''))
      const doc = sorted[0]
      if (!doc) return Response.json(null)
      return Response.json({ id: doc.id, ...doc.data() })
    }
    const snap = await col.where('status', '==', 'active').get()
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    return Response.json(list)
  } catch (e) {
    console.error(e)
    return serverError(e?.message || 'Failed to get links')
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { playerId, deviceId, matchId } = body
    if (!playerId || !deviceId) return badRequest('playerId and deviceId are required')
    const db = getFirestore()
    const now = new Date().toISOString()
    const ref = db.collection(COLLECTIONS.playerDeviceLinks).doc()
    await ref.set({
      playerId: playerId.toString().trim(),
      deviceId: deviceId.toString().trim(),
      matchId: matchId ? matchId.toString().trim() : null,
      linkedAt: now,
      status: 'active'
    })
    return created({ id: ref.id, playerId, deviceId, matchId: matchId || null })
  } catch (e) {
    console.error(e)
    return serverError(e?.message || 'Failed to link device')
  }
}
