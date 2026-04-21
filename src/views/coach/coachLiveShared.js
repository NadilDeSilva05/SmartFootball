/** Shared coach live-match helpers: club filtering, RTDB sensor mapping, selected-match sync */

export const COACH_SELECTED_MATCH_STORAGE_KEY = 'smartfootball_coach_selected_match_id'

export function readStoredCoachMatchId () {
  if (typeof window === 'undefined') return ''
  try {
    return sessionStorage.getItem(COACH_SELECTED_MATCH_STORAGE_KEY) || ''
  } catch {
    return ''
  }
}

export function writeStoredCoachMatchId (matchId) {
  if (typeof window === 'undefined' || !matchId) return
  try {
    sessionStorage.setItem(COACH_SELECTED_MATCH_STORAGE_KEY, matchId)
  } catch { /* ignore */ }
}

/** Registered row belongs to the coach's club for this match (clubId preferred, names as fallback). */
export function registrationMatchesCoachClub (reg, coachClubId, match) {
  if (!coachClubId) return true
  if (!match) return false
  if (reg.clubId) return reg.clubId === coachClubId
  const onHome =
    match.homeClubId === coachClubId &&
    (reg.club === match.homeClubName || reg.club === match.homeClubId)
  const onAway =
    match.awayClubId === coachClubId &&
    (reg.club === match.awayClubName || reg.club === match.awayClubId)
  return !!(onHome || onAway)
}

/** Metrics shown when a player has no active device stream (e.g. after substitution). */
export const IDLE_LIVE_METRICS = {
  heartRate: 0,
  heartRateInstant: 0,
  distanceM: 0,
  speedKmh: 0,
  steps: 0,
  strideM: 0,
  irSignal: null,
  hrStatus: null,
  estimatedMet: 0,
  estimatedKcalPerMin: 0,
  energyLoadIndex: 0,
  fatigueLevel: 'Low',
  workRate: 'Low',
  playerLoad: 0,
  sprintCount: 0,
  highIntensityDist: 0,
  injuryRisk: false
}

/**
 * Map RTDB sensor blob to live + energy-oriented metrics.
 * Aligns with LiveMatchDashboard and substitution / injury logic (fatigue, workRate, injuryRisk, etc.).
 */
export function sensorToLiveMetrics (sensor) {
  const hr = sensor.heartRate || {}
  const motion = sensor.motion || {}
  const bpm = Number(hr.bpm || 0)
  const bpmInstant = Number(hr.bpm_instant ?? hr.bpm ?? 0)
  const dist = Number(motion.distance_m || 0)
  const speed = Number(motion.speed_kmh || 0)
  const steps = Number(motion.steps || 0)
  const stride = Number(motion.stride_m || 0)
  const ir = hr.ir != null ? Number(hr.ir) : null
  const hrStatus = (hr.status && String(hr.status)) || null

  let fatigue = 'Low'
  if (bpm > 160) fatigue = 'High'
  else if (bpm > 130) fatigue = 'Medium'

  let work = 'Low'
  if (bpm > 150) work = 'High'
  else if (bpm > 100) work = 'Medium'

  const hrFrac = Math.min(1, bpm > 0 ? bpm / 185 : 0)
  const speedFrac = Math.min(1, speed / 15)
  const estimatedMet = 1 + hrFrac * 5.5 + speedFrac * 2.2
  const assumedKg = 70
  const estimatedKcalPerMin = (estimatedMet * 3.5 * assumedKg) / 200
  const energyLoadIndex = Math.min(100, Math.round(45 * hrFrac + 35 * speedFrac + 20 * Math.min(1, steps / 8000)))

  return {
    heartRate: bpm,
    heartRateInstant: bpmInstant,
    distanceM: dist,
    speedKmh: speed,
    steps,
    strideM: stride,
    irSignal: ir,
    hrStatus,
    estimatedMet,
    estimatedKcalPerMin,
    energyLoadIndex,
    fatigueLevel: fatigue,
    workRate: work,
    playerLoad: dist,
    sprintCount: steps,
    highIntensityDist: dist,
    injuryRisk: bpm > 180
  }
}

/** Normalize Firestore live_metrics doc to the same player shape used by recommendations / alerts. */
export function firestoreLiveDocToPlayer (doc, selectedMatchId) {
  const p = doc && typeof doc === 'object' ? doc : {}
  const playerId = String(p.playerId || '')
  return {
    id: p.id || `${selectedMatchId}_${playerId}`,
    playerId,
    deviceId: p.deviceId,
    name: p.playerName || playerId,
    heartRate: Number(p.heartRate) || 0,
    fatigueLevel: p.fatigueLevel || 'Low',
    playerLoad: Number(p.playerLoad) || 0,
    sprintCount: Number(p.sprintCount) || 0,
    highIntensityDist: Number(p.highIntensityDist) || 0,
    workRate: p.workRate || 'Low',
    injuryRisk: Boolean(p.injuryRisk),
    status: p.status || 'live',
    updatedAt: p.updatedAt || null
  }
}
