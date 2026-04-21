/**
 * GET /api/player/matches?playerId= – matches a player is registered for, enriched with match details.
 */
import { getFirestore } from '@/lib/firebase-admin'
import { COLLECTIONS } from '@/lib/firestore-collections'
import { badRequest, serverError } from '@/app/api/lib/responses'

export async function GET (request) {
  try {
    const { searchParams } = new URL(request.url)
    const playerId = searchParams.get('playerId')
    if (!playerId) return badRequest('playerId query required')

    const db = getFirestore()
    const regSnap = await db.collection(COLLECTIONS.matchRegistrations).where('playerId', '==', playerId).get()
    const registrations = (regSnap.docs || []).map(d => ({ id: d.id, ...d.data() }))

    if (registrations.length === 0) return Response.json([])

    const matchIds = [...new Set(registrations.map(r => r.matchId).filter(Boolean))]
    const matches = []
    await Promise.all(matchIds.map(async (mid) => {
      const mdoc = await db.collection(COLLECTIONS.matches).doc(mid).get()
      if (mdoc.exists) {
        const data = mdoc.data()
        matches.push({ id: mdoc.id, ...data })
      }
    }))

    const clubIds = [...new Set(matches.flatMap(m => [m.homeClubId, m.awayClubId]).filter(Boolean))]
    const clubMap = {}
    await Promise.all(clubIds.map(async (cid) => {
      const cdoc = await db.collection(COLLECTIONS.clubs).doc(cid).get()
      clubMap[cid] = cdoc.exists ? (cdoc.data()?.clubName || cdoc.data()?.name || cid) : cid
    }))

    const enriched = registrations.map(r => {
      const match = matches.find(m => m.id === r.matchId) || {}
      const isHome = match.homeClubId === r.clubId || match.homeClubName === r.club
      const opponent = isHome ? clubMap[match.awayClubId] || match.awayClubId : clubMap[match.homeClubId] || match.homeClubId
      return {
        ...r,
        matchDate: match.matchDate || '',
        matchTime: match.matchTime || '',
        venue: match.venue || '',
        status: match.status || 'scheduled',
        homeClubName: clubMap[match.homeClubId] || match.homeClubId || '',
        awayClubName: clubMap[match.awayClubId] || match.awayClubId || '',
        opponent,
        isHome
      }
    })

    enriched.sort((a, b) => {
      const da = (a.matchDate || '').toString()
      const dbVal = (b.matchDate || '').toString()
      if (da !== dbVal) return dbVal.localeCompare(da)
      return ((a.matchTime || '').toString()).localeCompare((b.matchTime || '').toString())
    })

    return Response.json(enriched)
  } catch (e) {
    console.error(e)
    return serverError(e.message)
  }
}
