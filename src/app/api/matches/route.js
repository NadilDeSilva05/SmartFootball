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
    const refereeId = searchParams.get('refereeId')
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
    if (refereeId) {
      list = list.filter(m => {
        const refs = m.referees
        if (Array.isArray(refs)) return refs.includes(refereeId)
        if (refs && typeof refs === 'object') return Object.values(refs).includes(refereeId)
        return m.refereeId === refereeId
      })
    }
    // Sort in memory: matchDate desc, then matchTime asc (avoids composite index)
    list.sort((a, b) => {
      const da = (a.matchDate || '').toString()
      const dbVal = (b.matchDate || '').toString()
      if (da !== dbVal) return dbVal.localeCompare(da) // desc
      return ((a.matchTime || '').toString()).localeCompare((b.matchTime || '').toString())
    })
    // Resolve club names for display (homeClubName, awayClubName)
    const clubIds = [...new Set(list.flatMap(m => [m.homeClubId, m.awayClubId]).filter(Boolean))]
    const clubNames = {}
    if (clubIds.length > 0) {
      await Promise.all(clubIds.map(async (cid) => {
        const doc = await db.collection(COLLECTIONS.clubs).doc(cid).get()
        if (doc.exists) clubNames[cid] = doc.data()?.clubName || doc.data()?.name || cid
        else clubNames[cid] = cid
      }))
    }
    list = list.map(m => ({
      ...m,
      homeClubName: clubNames[m.homeClubId] ?? m.homeClubId ?? '',
      awayClubName: clubNames[m.awayClubId] ?? m.awayClubId ?? ''
    }))
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
