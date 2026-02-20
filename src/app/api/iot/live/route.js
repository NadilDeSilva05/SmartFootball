/**
 * GET /api/iot/live?matchId= – get current live metrics for a match (optional; dashboard can use Firestore onSnapshot instead)
 */
import { getFirestore } from '@/lib/firebase-admin'
import { COLLECTIONS } from '@/lib/firestore-collections'
import { badRequest, serverError } from '@/app/api/lib/responses'

export async function GET (request) {
  try {
    const { searchParams } = new URL(request.url)
    const matchId = searchParams.get('matchId')
    if (!matchId) return badRequest('matchId query required')
    const db = getFirestore()
    const snap = await db.collection(COLLECTIONS.liveMetrics).where('matchId', '==', matchId).where('status', '==', 'live').get()
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    return Response.json(list)
  } catch (e) {
    console.error(e)
    return serverError(e.message)
  }
}
