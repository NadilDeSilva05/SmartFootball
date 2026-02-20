// Live match analytics – fatigue levels and work rate options (aligned with ESP32/IoT metrics)

export const FATIGUE_LEVELS = ['Low', 'Medium', 'High']
export const WORK_RATE_OPTIONS = ['Low', 'Medium', 'High', 'Very High']

export const MATCH_DURATION_MINUTES = 90
// Demo: 1 match minute = 2 real seconds (set to 60000 for real 90 min)
export const TICK_MS = 2000

// In-memory store for completed session results (device stopped after substitute or 90 min)
// In production this would be API + DB; coach and player Performance History read from here
let completedSessions = []

export function getCompletedSessions () {
  return [...completedSessions]
}

export function addCompletedSession (payload) {
  completedSessions.push({
    id: `session-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    ...payload,
    endedAt: new Date().toISOString()
  })
}

export function getSessionsByPlayerId (playerId) {
  return completedSessions.filter(s => s.playerId === playerId)
}

export function getSessionsByMatchId (matchId) {
  return completedSessions.filter(s => s.matchId === matchId)
}
