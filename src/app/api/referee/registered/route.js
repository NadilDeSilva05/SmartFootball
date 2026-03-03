/**
 * GET /api/referee/registered?matchId= – list players registered for a match (after scan)
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
    const snap = await db.collection(COLLECTIONS.matchRegistrations).where('matchId', '==', matchId).get()
    const list = (snap.docs || [])
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (b.scannedAt || '').localeCompare(a.scannedAt || ''))
    return Response.json(list)
  } catch (e) {
    console.error('Registered error:', e?.message ?? e)
    return serverError(e?.message ?? 'Internal server error')
  }
}
