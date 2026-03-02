/**
 * GET /api/standings?leagueId= – standings (points table) computed from match results
 * Returns: { standings, topScorers }
 */
import { getFirestore } from '@/lib/firebase-admin'
import { COLLECTIONS } from '@/lib/firestore-collections'
import { serverError } from '@/app/api/lib/responses'

export async function GET (request) {
  try {
    const { searchParams } = new URL(request.url)
    const leagueId = searchParams.get('leagueId')
    const db = getFirestore()

    // Fetch played matches (filter in memory to avoid Firestore index)
    const matchesSnap = await db.collection(COLLECTIONS.matches).get()
    const matches = (matchesSnap?.docs ?? [])
      .map(d => {
        const data = d.data()
        return { id: d.id, ...(data && typeof data === 'object' ? data : {}) }
      })
      .filter(m => (m.status || '') === 'played')
    const leagueMatches = leagueId
      ? matches.filter(m => (m.leagueId || null) === leagueId)
      : matches

    // Fetch clubs for name lookup
    const clubsSnap = await db.collection(COLLECTIONS.clubs).get()
    const clubMap = {}
    ;(clubsSnap?.docs ?? []).forEach(d => {
      const data = d.data()
      const name = data?.clubName || data?.name || '-'
      clubMap[d.id] = name
    })

    // Compute standings
    const byClub = {}
    for (const m of leagueMatches) {
      const homeId = m.homeClubId
      const awayId = m.awayClubId
      const homeScore = Number(m.homeScore ?? 0)
      const awayScore = Number(m.awayScore ?? 0)
      if (!homeId || !awayId) continue
      if (!byClub[homeId]) byClub[homeId] = { clubId: homeId, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0 }
      if (!byClub[awayId]) byClub[awayId] = { clubId: awayId, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0 }
      byClub[homeId].played += 1
      byClub[awayId].played += 1
      byClub[homeId].goalsFor += homeScore
      byClub[homeId].goalsAgainst += awayScore
      byClub[awayId].goalsFor += awayScore
      byClub[awayId].goalsAgainst += homeScore
      if (homeScore > awayScore) {
        byClub[homeId].won += 1
        byClub[awayId].lost += 1
      } else if (homeScore < awayScore) {
        byClub[awayId].won += 1
        byClub[homeId].lost += 1
      } else {
        byClub[homeId].draw += 1
        byClub[awayId].draw += 1
      }
    }
    const standingsList = Object.values(byClub).map(r => ({
      ...r,
      points: r.won * 3 + r.draw,
      goalDiff: r.goalsFor - r.goalsAgainst
    }))
    standingsList.sort((a, b) => {
      if (a.points !== b.points) return b.points - a.points
      if (a.goalDiff !== b.goalDiff) return b.goalDiff - a.goalDiff
      return b.goalsFor - a.goalsFor
    })
    const standings = standingsList.map((r, i) => ({
      position: i + 1,
      clubId: r.clubId,
      team: clubMap[r.clubId] || '-',
      played: r.played,
      won: r.won,
      draw: r.draw,
      lost: r.lost,
      goalsFor: r.goalsFor,
      goalsAgainst: r.goalsAgainst,
      goalDiff: r.goalDiff,
      points: r.points
    }))

    // Top scorers from match goals
    const scorerCount = {}
    for (const m of leagueMatches) {
      const goals = Array.isArray(m.goals) ? m.goals : []
      const homeId = m.homeClubId
      const awayId = m.awayClubId
      for (const g of goals) {
        const scorer = (g.scorer || '').trim()
        if (!scorer) continue
        const teamId = (g.team === 'away') ? awayId : homeId
        const key = `${scorer}::${teamId}`
        scorerCount[key] = (scorerCount[key] || 0) + 1
      }
    }
    const topScorersList = Object.entries(scorerCount)
      .map(([key, goals]) => {
        const [player, clubId] = key.split('::')
        return { player, clubId, goals }
      })
      .sort((a, b) => b.goals - a.goals)
      .slice(0, 10)
    const topScorers = topScorersList.map((r, i) => ({
      position: i + 1,
      player: r.player,
      team: clubMap[r.clubId] || '-',
      goals: r.goals
    }))

    return Response.json({ standings, topScorers })
  } catch (e) {
    const msg = e?.message ?? String(e)
    console.error('Standings GET error:', msg)
    return serverError(msg || 'Internal server error')
  }
}
