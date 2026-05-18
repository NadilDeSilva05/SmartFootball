'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useSelector } from 'react-redux'
import { ref, onValue, off } from 'firebase/database'
import { getRealtimeDbClient } from '@/lib/firebase-client'
import {
  registrationMatchesCoachClub,
  sensorToLiveMetrics,
  firestoreLiveDocToPlayer,
  readStoredCoachMatchId,
  writeStoredCoachMatchId
} from '@/views/coach/coachLiveShared'

/**
 * Club-scoped matches, device links, and live player metrics (RTDB devices/.../sensor)
 * with Firestore /api/iot/live fallback when RTDB URL is not configured.
 */
export function useCoachLivePlayers () {
  const user = useSelector(state => state?.authenticationReducer?.loginData?.user)
  const coachClubId = user?.clubId ? String(user.clubId) : ''
  const isCoachRole =
    user?.role === 'coach' ||
    user?.accountRole === 'coach'

  const [matches, setMatches] = useState([])
  const [selectedMatchId, setSelectedMatchIdState] = useState('')
  const [registered, setRegistered] = useState([])
  const [activeLinks, setActiveLinks] = useState([])
  const [players, setPlayers] = useState([])
  const [loadingMatches, setLoadingMatches] = useState(true)
  const lastMotionByPlayerRef = useRef({})

  const setSelectedMatchId = useCallback((id) => {
    setSelectedMatchIdState(id || '')
    if (id) writeStoredCoachMatchId(id)
  }, [])

  const clubMatches = useMemo(() => {
    if (!coachClubId || !isCoachRole) return matches
    return matches.filter(
      m => m.homeClubId === coachClubId || m.awayClubId === coachClubId
    )
  }, [matches, coachClubId, isCoachRole])

  const selectedMatch =
    clubMatches.find(m => m.id === selectedMatchId) || matches.find(m => m.id === selectedMatchId)

  const registeredForCoach = useMemo(() => {
    if (!selectedMatchId || !selectedMatch) return []
    const filtered = registered.filter(r =>
      registrationMatchesCoachClub(r, coachClubId || '', selectedMatch)
    )
    // Legacy data can contain duplicate registrations for the same player in a match.
    // Keep a single row per player so downstream lists/cards have stable unique keys.
    const uniq = new Map()
    filtered.forEach(r => {
      const pid = String(r?.playerId || '').trim()
      if (!pid) return
      if (!uniq.has(pid)) uniq.set(pid, r)
    })
    return [...uniq.values()]
  }, [registered, selectedMatch, selectedMatchId, coachClubId])

  const coachClubPlayerIds = useMemo(
    () => new Set(registeredForCoach.map(r => r.playerId)),
    [registeredForCoach]
  )

  const livePlayers = players.filter(p => p.status === 'live')
  const isLive = livePlayers.length > 0

  useEffect(() => {
    let cancelled = false
    fetch('/api/matches?status=scheduled')
      .then(r => r.json())
      .then(list => {
        if (!cancelled) setMatches(Array.isArray(list) ? list : [])
      })
      .catch(() => { if (!cancelled) setMatches([]) })
      .finally(() => { if (!cancelled) setLoadingMatches(false) })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (loadingMatches) return
    if (!clubMatches.length) {
      setSelectedMatchIdState('')
      return
    }
    if (clubMatches.some(m => m.id === selectedMatchId)) return
    const stored = readStoredCoachMatchId()
    const next =
      stored && clubMatches.some(m => m.id === stored)
        ? stored
        : clubMatches[0].id
    setSelectedMatchIdState(next)
    writeStoredCoachMatchId(next)
  }, [loadingMatches, clubMatches, selectedMatchId])

  useEffect(() => {
    if (!selectedMatchId) {
      setRegistered([])
      return
    }
    let cancelled = false
    fetch(`/api/referee/registered?matchId=${encodeURIComponent(selectedMatchId)}`)
      .then(r => r.json())
      .then(list => { if (!cancelled) setRegistered(Array.isArray(list) ? list : []) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [selectedMatchId])

  useEffect(() => {
    if (!selectedMatchId) {
      setActiveLinks([])
      return
    }
    let cancelled = false
    const poll = () => {
      fetch(`/api/iot/player-device-link?matchId=${encodeURIComponent(selectedMatchId)}`)
        .then(r => r.json())
        .then(list => { if (!cancelled && Array.isArray(list)) setActiveLinks(list) })
        .catch(() => {})
    }
    poll()
    const t = setInterval(poll, 10000)
    return () => { cancelled = true; clearInterval(t) }
  }, [selectedMatchId])

  useEffect(() => {
    if (!selectedMatchId || activeLinks.length === 0) {
      lastMotionByPlayerRef.current = {}
      setPlayers([])
      return
    }

    const filterByClub = !!(coachClubId && isCoachRole)
    const rtdb = getRealtimeDbClient()

    if (!rtdb) {
      let cancelled = false
      const poll = () => {
        fetch(`/api/iot/live?matchId=${encodeURIComponent(selectedMatchId)}`)
          .then(r => r.json())
          .then(arr => {
            if (cancelled) return
            let list = (Array.isArray(arr) ? arr : []).map(d =>
              firestoreLiveDocToPlayer(d, selectedMatchId)
            )
            if (filterByClub) list = list.filter(p => coachClubPlayerIds.has(p.playerId))
            setPlayers(list)
          })
          .catch(() => { if (!cancelled) setPlayers([]) })
      }
      poll()
      const interval = setInterval(poll, 4000)
      return () => { cancelled = true; clearInterval(interval) }
    }

    const playersMap = {}
    const unsubscribes = []
    const updatePlayers = () => {
      setPlayers(Object.values(playersMap))
    }

    activeLinks.forEach(link => {
      if (link.status !== 'active') return
      const playerId = link.playerId
      if (filterByClub && !coachClubPlayerIds.has(playerId)) return

      const deviceId = link.deviceId
      const registeredPlayer = registered.find(r => r.playerId === playerId)
      const name = registeredPlayer ? registeredPlayer.playerName : playerId

      const deviceRef = ref(rtdb, `devices/${deviceId}/sensor`)
      const handler = snapshot => {
        const sensor = snapshot.val() || {}
        const prevMotion = lastMotionByPlayerRef.current[playerId]
        const m = sensorToLiveMetrics(sensor, prevMotion)
        lastMotionByPlayerRef.current[playerId] = {
          distanceM: m.distanceM,
          speedKmh: m.speedKmh,
          steps: m.steps,
          strideM: m.strideM
        }
        const nowIso = new Date().toISOString()
        playersMap[playerId] = {
          id: `${selectedMatchId}_${playerId}`,
          playerId,
          deviceId,
          name,
          ...m,
          status: 'live',
          updatedAt: nowIso
        }
        updatePlayers()
      }
      onValue(deviceRef, handler)
      unsubscribes.push(() => off(deviceRef))
    })

    return () => {
      unsubscribes.forEach(fn => fn())
    }
  }, [selectedMatchId, activeLinks, registered, coachClubId, isCoachRole, coachClubPlayerIds])

  return {
    user,
    coachClubId,
    isCoachRole,
    matches,
    clubMatches,
    loadingMatches,
    selectedMatchId,
    setSelectedMatchId,
    selectedMatch,
    registered,
    registeredForCoach,
    activeLinks,
    players,
    coachClubPlayerIds,
    livePlayers,
    isLive
  }
}

