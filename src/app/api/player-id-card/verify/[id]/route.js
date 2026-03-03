/**
 * GET /api/player-id-card/verify/[id] – public: returns player + club details for QR verification page
 */
import { getFirestore } from '@/lib/firebase-admin'
import { COLLECTIONS } from '@/lib/firestore-collections'
import { badRequest, notFound, serverError } from '@/app/api/lib/responses'

export async function GET (request, { params }) {
  try {
    const id = await Promise.resolve(params?.id)
    if (!id) return badRequest('Player id required')
    const db = getFirestore()
    const playerSnap = await db.collection(COLLECTIONS.clubPlayers).doc(id).get()
    if (!playerSnap.exists) return notFound('Player not found')
    const player = { id: playerSnap.id, ...playerSnap.data() }
    let club = null
    if (player.clubId) {
      const clubSnap = await db.collection(COLLECTIONS.clubs).doc(player.clubId).get()
      if (clubSnap.exists) club = { id: clubSnap.id, ...clubSnap.data() }
    }
    return Response.json({ player, club })
  } catch (e) {
    console.error(e)
    return serverError(e?.message || 'Failed to load player')
  }
}
