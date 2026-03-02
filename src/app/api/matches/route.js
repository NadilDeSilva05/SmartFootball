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
    const col = db.collection(COLLECTIONS.matches)
    // Avoid Firestore composite index: fetch all when filtering, or use single orderBy when not
    const snap = (!leagueId && !status)
      ? await col.orderBy('matchDate', 'desc').get()
      : await col.get()
    let list = (snap?.docs ?? []).map(d => {
      const data = d.data()
      return { id: d.id, ...(data && typeof data === 'object' ? data : {}) }
    })
    if (leagueId) list = list.filter(m => (m.leagueId || null) === leagueId)
    if (status) list = list.filter(m => (m.status || 'scheduled') === status)
    // Sort in memory: matchDate desc, then matchTime asc (avoids composite index)
    list.sort((a, b) => {
      const da = (a.matchDate || '').toString()
      const dbVal = (b.matchDate || '').toString()
      if (da !== dbVal) return dbVal.localeCompare(da) // desc
      return ((a.matchTime || '').toString()).localeCompare((b.matchTime || '').toString())
    })
    return Response.json(Array.isArray(list) ? list : [])
  } catch (e) {
    const msg = e?.message ?? String(e)
    console.error('Matches GET error:', msg)
    return serverError(msg || 'Internal server error')
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
    const msg = e?.message ?? String(e)
    console.error('Matches POST error:', msg)
    return serverError(msg || 'Internal server error')
  }
}
