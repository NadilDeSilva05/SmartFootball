/**
 * GET /api/matches – list matches (optional query: ?leagueId= & status=)
 * POST /api/matches – create match
 */
import { getFirestore } from '@/lib/firebase-admin'
import { COLLECTIONS } from '@/lib/firestore-collections'
import { created, badRequest, serverError } from '@/app/api/lib/responses'

export async function GET (request) {
  try {
    const { searchParams } = new URL(request.url)
    const leagueId = searchParams.get('leagueId')
    const status = searchParams.get('status')
    const db = getFirestore()
    let q = db.collection(COLLECTIONS.matches).orderBy('matchDate', 'desc').orderBy('matchTime', 'asc')
    if (leagueId) q = q.where('leagueId', '==', leagueId)
    if (status) q = q.where('status', '==', status)
    const snap = await q.get()
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    return Response.json(list)
  } catch (e) {
    console.error(e)
    return serverError(e.message)
  }
}

export async function POST (request) {
  try {
    const body = await request.json()
    const { leagueId, homeClubId, awayClubId, matchDate, matchTime, venue, referees = [], status = 'scheduled' } = body
    if (!matchDate || !homeClubId || !awayClubId) {
      return badRequest('matchDate, homeClubId and awayClubId are required')
    }
    const db = getFirestore()
    const ref = db.collection(COLLECTIONS.matches).doc()
    await ref.set({
      leagueId: leagueId ?? null,
      homeClubId,
      awayClubId,
      matchDate,
      matchTime: matchTime ?? '',
      venue: venue ?? '',
      referees: Array.isArray(referees) ? referees : [],
      status: status === 'played' || status === 'cancelled' ? status : 'scheduled',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
    return created({ id: ref.id })
  } catch (e) {
    console.error(e)
    return serverError(e.message)
  }
}
