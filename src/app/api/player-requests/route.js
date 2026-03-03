/**
 * GET /api/player-requests � list (optional ?status=pending|approved|rejected&clubId=)
 * POST /api/player-requests � create request (club submits)
 */
import { getFirestore } from '@/lib/firebase-admin'
import { COLLECTIONS } from '@/lib/firestore-collections'
import { created, badRequest, serverError } from '@/app/api/lib/responses'

const nextPlayerIdFrom = (items = []) => {
  let max = 0
  for (const item of items) {
    const value = String(item?.playerId || '').trim()
    const match = value.match(/(\d+)$/)
    if (!match) continue
    const n = Number(match[1])
    if (Number.isFinite(n) && n > max) max = n
  }
  return `PLY-${String(max + 1).padStart(4, '0')}`
}

export async function GET (request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const clubId = searchParams.get('clubId')
    const db = getFirestore()

    const snap = await db.collection(COLLECTIONS.playerRequests).orderBy('createdAt', 'desc').get()
    let list = snap.docs.map(d => ({ id: d.id, ...d.data() }))

    if (status) list = list.filter(item => (item.status || '') === status)
    if (clubId) list = list.filter(item => (item.clubId || null) === clubId)

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
      clubId,
      playerId,
      fullName,
      email,
      commentaryName,
      jerseyNo,
      nicOrPassport,
      dateOfBirth,
      residentStatus,
      visaNo,
      position,
      photo
    } = body

    if (!clubId || !fullName?.trim()) {
      return badRequest('clubId and fullName are required')
    }
    if (!email?.trim()) {
      return badRequest('email is required')
    }

    const db = getFirestore()
    const submittedPlayerId = String(playerId || '').trim()

    let resolvedPlayerId = submittedPlayerId
    if (!resolvedPlayerId) {
      const [reqSnap, playersSnap] = await Promise.all([
        db.collection(COLLECTIONS.playerRequests).where('clubId', '==', clubId).get(),
        db.collection(COLLECTIONS.clubPlayers).where('clubId', '==', clubId).get()
      ])
      const all = [
        ...reqSnap.docs.map(d => d.data()),
        ...playersSnap.docs.map(d => d.data())
      ]
      resolvedPlayerId = nextPlayerIdFrom(all)
    }

    const existingPending = await db
      .collection(COLLECTIONS.playerRequests)
      .where('clubId', '==', clubId)
      .where('playerId', '==', resolvedPlayerId)
      .where('status', '==', 'pending')
      .get()

    if (!existingPending.empty) {
      return badRequest('A pending request already exists for this player ID')
    }

    const existingPlayers = await db
      .collection(COLLECTIONS.clubPlayers)
      .where('clubId', '==', clubId)
      .where('playerId', '==', resolvedPlayerId)
      .get()

    if (!existingPlayers.empty) {
      return badRequest('Player ID already exists in this club')
    }

    const ref = db.collection(COLLECTIONS.playerRequests).doc()
    await ref.set({
      clubId,
      playerId: resolvedPlayerId,
      fullName: fullName.trim(),
      email: email.trim(),
      position: position ?? '',
      nicOrPassport: nicOrPassport ?? '',
      dateOfBirth: dateOfBirth ?? '',
      jerseyNo: jerseyNo ?? '',
      commentaryName: commentaryName ?? '',
      residentStatus: residentStatus ?? 'local',
      visaNo: visaNo ?? '',
      photo: photo ?? null,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })

    return created({ id: ref.id, status: 'pending', playerId: resolvedPlayerId })
  } catch (e) {
    console.error(e)
    return serverError(e.message)
  }
}
