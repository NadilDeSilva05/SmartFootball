/**
 * GET /api/sessions – list completed match sessions
 *   Query: ?playerId= (for player view) | ?matchId= (for coach view) | none = all
 *   When ?playerId= is set, Authorization: Bearer <idToken> is required and must match the user’s linked clubPlayerDocId.
 * POST /api/sessions – save a completed session (after substitute or full-time)
 */
import { getAuth, getFirestore } from '@/lib/firebase-admin'
import { COLLECTIONS } from '@/lib/firestore-collections'
import { created, badRequest, serverError, unauthorized, forbidden } from '@/app/api/lib/responses'

export async function GET (request) {
  try {
    const { searchParams } = new URL(request.url)
    const playerId = searchParams.get('playerId')
    const matchId = searchParams.get('matchId')
    const clubId = searchParams.get('clubId')
    const db = getFirestore()

    if (playerId) {
      const authHeader = request.headers.get('authorization')
      const raw = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
      if (!raw) return unauthorized('Authorization required when filtering by playerId')
      const auth = getAuth()
      const decoded = await auth.verifyIdToken(raw).catch(() => null)
      if (!decoded?.uid) return unauthorized('Invalid token')
      const userDoc = await db.collection(COLLECTIONS.users).doc(decoded.uid).get()
      const prof = userDoc.exists ? userDoc.data() : {}
      const allowed = prof.clubPlayerDocId ? String(prof.clubPlayerDocId) : null
      if (!allowed || allowed !== String(playerId)) {
        return forbidden('You can only view sessions linked to your player profile')
      }
    }
    let q = db.collection(COLLECTIONS.matchSessions).orderBy('endedAt', 'desc')
    if (playerId) q = q.where('playerId', '==', playerId)
    if (matchId) q = q.where('matchId', '==', matchId)
    const snap = await q.limit(300).get()
    let list = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    if (clubId) {
      const mSnap = await db.collection(COLLECTIONS.matches).get()
      const allowed = new Set(
        mSnap.docs
          .filter(doc => {
            const m = doc.data() || {}
            return m.homeClubId === clubId || m.awayClubId === clubId
          })
          .map(doc => doc.id)
      )
      list = list.filter(s => s.matchId && allowed.has(s.matchId))
    }
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
      matchId,
      matchName,
      playerId,
      playerName,
      reason,
      heartRate,
      heartRateInstant,
      fatigueLevel,
      playerLoad,
      sprintCount,
      highIntensityDist,
      workRate,
      minutesPlayed,
      deviceId,
      distanceM,
      speedKmh,
      steps,
      strideM,
      estimatedMet,
      estimatedKcalPerMin,
      energyLoadIndex,
      hrStatus,
      injuryRisk
    } = body

    if (!matchId || !playerId || !reason) {
      return badRequest('matchId, playerId and reason are required')
    }
    if (reason !== 'substitution' && reason !== 'full_time') {
      return badRequest('reason must be substitution or full_time')
    }

    const db = getFirestore()
    const ref = db.collection(COLLECTIONS.matchSessions).doc()
    const payload = {
      matchId,
      matchName: matchName ?? '',
      playerId,
      playerName: playerName ?? '',
      reason,
      heartRate: Number(heartRate) || 0,
      heartRateInstant: heartRateInstant != null ? Number(heartRateInstant) : null,
      fatigueLevel: fatigueLevel ?? '',
      playerLoad: Number(playerLoad) || 0,
      sprintCount: Number(sprintCount) || 0,
      highIntensityDist: Number(highIntensityDist) || 0,
      workRate: workRate ?? '',
      minutesPlayed: Number(minutesPlayed) || 0,
      deviceId: deviceId ? String(deviceId).trim() : '',
      distanceM: distanceM != null ? Number(distanceM) : null,
      speedKmh: speedKmh != null ? Number(speedKmh) : null,
      steps: steps != null ? Number(steps) : null,
      strideM: strideM != null ? Number(strideM) : null,
      estimatedMet: estimatedMet != null ? Number(estimatedMet) : null,
      estimatedKcalPerMin: estimatedKcalPerMin != null ? Number(estimatedKcalPerMin) : null,
      energyLoadIndex: energyLoadIndex != null ? Number(energyLoadIndex) : null,
      hrStatus: hrStatus != null ? String(hrStatus) : '',
      injuryRisk: Boolean(injuryRisk),
      endedAt: new Date().toISOString()
    }
    await ref.set(payload)
    return created({ id: ref.id, ...payload })
  } catch (e) {
    console.error(e)
    return serverError(e.message)
  }
}
