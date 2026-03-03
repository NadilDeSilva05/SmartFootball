/**
 * GET /api/iot/devices – list registered IoT devices (for referee UI)
 * POST /api/iot/devices – register device (ESP32 / energy management device)
 * Body POST: { deviceId, name, type? } – type e.g. "energy_management"
 */
import { getFirestore } from '@/lib/firebase-admin'
import { COLLECTIONS } from '@/lib/firestore-collections'
import { created, badRequest, serverError } from '@/app/api/lib/responses'

export async function GET () {
  try {
    const db = getFirestore()
    const snap = await db.collection(COLLECTIONS.iotDevices).get()
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (b.lastSeen || '').localeCompare(a.lastSeen || ''))
    return Response.json(list)
  } catch (e) {
    console.error(e)
    return serverError(e?.message || 'Failed to list devices')
  }
}

export async function POST (request) {
  try {
    const body = await request.json()
    const { deviceId, name, type = 'energy_management' } = body
    const id = (deviceId || name || '').toString().trim().replace(/\s+/g, '_')
    if (!id) return badRequest('deviceId or name is required')
    const db = getFirestore()
    const now = new Date().toISOString()
    const ref = db.collection(COLLECTIONS.iotDevices).doc(id)
    await ref.set({
      deviceId: id,
      name: (name || id).toString().trim(),
      type: (type || 'energy_management').toString(),
      status: 'online',
      lastSeen: now,
      createdAt: (await ref.get()).exists ? (await ref.get()).data()?.createdAt : now,
      updatedAt: now
    }, { merge: true })
    return created({ deviceId: id, status: 'registered' })
  } catch (e) {
    console.error(e)
    return serverError(e?.message || 'Failed to register device')
  }
}
