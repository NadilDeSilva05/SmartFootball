'use client'

import { useState, useEffect, useCallback } from 'react'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import Collapse from '@mui/material/Collapse'
import Divider from '@mui/material/Divider'
import { ref, set } from 'firebase/database'
import ConfirmationDialog from '@components/dialogs/confirmation-dialog'
import { getRealtimeDbClient } from '@/lib/firebase-client'
import { addCompletedSession, MATCH_DURATION_MINUTES } from '@views/coach/liveMatchConstants'
import { useCoachLivePlayers } from '@/hooks/useCoachLivePlayers'
import CoachAnalyticsNav from '@views/coach/CoachAnalyticsNav'
import { SquadOverviewCharts, PlayerTrendChart } from '@views/coach/LiveDashboardCharts'

const getFatigueColor = level => {
  if (level === 'Low') return 'success'
  if (level === 'Medium') return 'warning'
  return 'error'
}

const getFatigueBgColor = level => {
  if (level === 'Low') return 'success.light'
  if (level === 'Medium') return 'warning.light'
  return 'error.light'
}

const LiveMatchDashboard = () => {
  const {
    coachClubId,
    isCoachRole,
    clubMatches,
    loadingMatches,
    selectedMatchId,
    setSelectedMatchId,
    selectedMatch,
    players,
    activeLinks,
    coachClubPlayerIds,
    isLive
  } = useCoachLivePlayers()

  const [substituteDialog, setSubstituteDialog] = useState({ open: false, player: null })
  const [elapsedMinutes, setElapsedMinutes] = useState(0)
  /** Per-player: show expanded real-time energy metrics */
  const [metricsVisible, setMetricsVisible] = useState({})
  /** Rolling samples per player for sparkline-style charts */
  const [historyByPlayer, setHistoryByPlayer] = useState({})

  const toggleMetrics = useCallback(playerId => {
    setMetricsVisible(prev => ({ ...prev, [playerId]: !prev[playerId] }))
  }, [])

  useEffect(() => {
    if (!selectedMatchId || players.length === 0) return
    const t = setInterval(() => {
      setElapsedMinutes(prev => Math.min(prev + 1, MATCH_DURATION_MINUTES))
    }, 60000)
    return () => clearInterval(t)
  }, [selectedMatchId, players.length])

  useEffect(() => {
    if (!players.length) {
      setHistoryByPlayer({})
      return
    }
    const now = Date.now()
    setHistoryByPlayer(prev => {
      const next = { ...prev }
      const activeIds = new Set(players.map(p => p.playerId))
      Object.keys(next).forEach(pid => {
        if (!activeIds.has(pid)) delete next[pid]
      })
      players.forEach(p => {
        const pid = p.playerId
        const row = {
          t: now,
          hr: Number(p.heartRate) || 0,
          speed: Number(p.speedKmh) || 0,
          load: Number(p.energyLoadIndex) || 0
        }
        const prevList = next[pid] || []
        next[pid] = [...prevList, row].slice(-56)
      })
      return next
    })
  }, [players])

  const handleSubstituteClick = player => setSubstituteDialog({ open: true, player })

  const handleSubstituteConfirm = useCallback(async () => {
    const p = substituteDialog.player
    if (!p || !selectedMatchId) return
    const sessionPayload = {
      matchId: selectedMatchId,
      matchName: selectedMatch?.matchDate && selectedMatch?.matchTime
        ? `${selectedMatch.matchDate} ${selectedMatch.matchTime} – ${selectedMatch.homeClubName || selectedMatch.homeClubId || ''} vs ${selectedMatch.awayClubName || selectedMatch.awayClubId || ''}`
        : selectedMatchId,
      playerId: p.playerId,
      playerName: p.name,
      reason: 'substitution',
      heartRate: p.heartRate,
      heartRateInstant: p.heartRateInstant,
      fatigueLevel: p.fatigueLevel,
      playerLoad: p.playerLoad,
      sprintCount: p.sprintCount,
      highIntensityDist: p.highIntensityDist,
      workRate: p.workRate,
      minutesPlayed: elapsedMinutes,
      deviceId: p.deviceId,
      distanceM: p.distanceM,
      speedKmh: p.speedKmh,
      steps: p.steps,
      strideM: p.strideM,
      estimatedMet: p.estimatedMet,
      estimatedKcalPerMin: p.estimatedKcalPerMin,
      energyLoadIndex: p.energyLoadIndex,
      hrStatus: p.hrStatus,
      injuryRisk: p.injuryRisk
    }
    try {
      await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionPayload)
      })
      addCompletedSession(sessionPayload)
      await fetch('/api/iot/ingest/stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId: selectedMatchId,
          playerId: p.playerId,
          deviceId: p.deviceId || undefined
        })
      })
    } catch (e) {
      console.error(e)
    }
    setSubstituteDialog({ open: false, player: null })
  }, [substituteDialog.player, selectedMatchId, selectedMatch, elapsedMinutes])

  const handleStartTracking = async () => {
    const rtdb = getRealtimeDbClient()
    if (!rtdb) return
    const restrict = !!(coachClubId && isCoachRole)
    activeLinks.forEach(link => {
      if (link.status !== 'active' || !link.deviceId) return
      if (restrict && !coachClubPlayerIds.has(link.playerId)) return
      const controlRef = ref(rtdb, `devices/${link.deviceId}/control/command`)
      set(controlRef, 'reset').catch(() => {})
    })
  }

  const matchLabel = selectedMatch
    ? `${selectedMatch.matchDate || ''} ${selectedMatch.matchTime || ''} – ${selectedMatch.homeClubName || selectedMatch.homeClubId || ''} vs ${selectedMatch.awayClubName || selectedMatch.awayClubId || ''}`
    : 'Select match'

  return (
    <div className='space-y-6'>
      <CoachAnalyticsNav matchLabel={matchLabel !== 'Select match' ? matchLabel : ''} />
      <div className='flex items-center justify-between flex-wrap gap-2'>
        <div>
          <Typography variant='h4' className='font-semibold mb-1'>
            Live Match Dashboard
          </Typography>
          <Typography variant='body1' color='text.secondary'>
            Matches and players are scoped to your club when you log in as coach. Turn on a player below to stream real-time energy and load metrics from their device.
          </Typography>
        </div>
        <Box className='flex items-center gap-2'>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: isLive ? 'error.main' : 'text.disabled' }} />
          <Typography variant='body2' color='text.secondary'>
            {isLive ? 'LIVE' : 'No active devices'}
          </Typography>
          <Chip size='small' label={isLive ? 'Live' : 'No data'} color={isLive ? 'error' : 'default'} variant='tonal' icon={<i className={isLive ? 'ri-record-circle-line' : 'ri-stop-circle-line'} style={{ fontSize: 16 }} />} />
        </Box>
      </div>

      {isCoachRole && !coachClubId && (
        <Alert severity='warning'>
          Your account has no club assigned. Ask a club admin to link your coach profile to a club, or you will see all matches and all linked players.
        </Alert>
      )}

      <Card>
        <CardHeader
          title='Select match'
          subheader={isCoachRole && coachClubId ? 'Only fixtures involving your club are listed.' : 'Pick a scheduled match for your team.'}
        />
        <CardContent>
          <FormControl fullWidth size='small' sx={{ maxWidth: 480 }}>
            <InputLabel id='match-select-label'>Match</InputLabel>
            <Select
              labelId='match-select-label'
              label='Match'
              value={selectedMatchId}
              onChange={e => setSelectedMatchId(e.target.value)}
              disabled={loadingMatches || clubMatches.length === 0}
            >
              {clubMatches.map(m => (
                <MenuItem key={m.id} value={m.id}>
                  {m.matchDate} {m.matchTime} – {m.homeClubName || m.homeClubId} vs {m.awayClubName || m.awayClubId}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {!loadingMatches && isCoachRole && coachClubId && clubMatches.length === 0 && (
            <Typography variant='body2' color='text.secondary' sx={{ mt: 2 }}>
              No scheduled matches found for your club.
            </Typography>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          title={selectedMatch ? matchLabel : 'Live metrics'}
          subheader={selectedMatchId ? `Elapsed: ${elapsedMinutes}' · Data updates in real time from IoT devices` : 'Select a match above'}
          action={selectedMatchId && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button variant="contained" color="error" size="small" onClick={handleStartTracking} startIcon={<i className='ri-play-circle-line' />}>
                Start Data Tracking
              </Button>
              <Typography variant='h6' fontWeight='bold' color='primary'>
                {elapsedMinutes}' / {MATCH_DURATION_MINUTES}'
              </Typography>
            </Box>
          )}
        />
        <CardContent>
          {!selectedMatchId ? (
            <Typography color='text.secondary'>Select a match to view live player metrics from connected devices.</Typography>
          ) : players.length === 0 ? (
            <Typography color='text.secondary'>
              {isCoachRole && coachClubId
                ? 'No players from your club have a device linked for this match yet. The referee must scan your squad and assign IoT devices.'
                : 'No players with connected devices for this match yet. The referee must scan player IDs and connect their IoT devices first.'}
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <SquadOverviewCharts players={players} />
              {players.map(p => (
                <Card
                  key={p.id}
                  variant='outlined'
                  sx={{
                    borderColor: 'divider',
                    ...(p.injuryRisk && p.status === 'live' ? { borderColor: 'error.main', bgcolor: 'error.light' } : {})
                  }}
                >
                  <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={!!metricsVisible[p.playerId]}
                              onChange={() => toggleMetrics(p.playerId)}
                              color='primary'
                            />
                          }
                          label={
                            <Box>
                              <Typography className='font-medium' component='span'>{p.name}</Typography>
                              <Typography variant='caption' color='text.secondary' component='span' sx={{ display: 'block' }}>
                                Device {p.deviceId}
                              </Typography>
                            </Box>
                          }
                        />
                        {p.injuryRisk && p.status === 'live' && (
                          <Chip size='small' label='Injury risk' color='error' variant='outlined' />
                        )}
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip size='small' label='Live' color='success' variant='tonal' icon={<i className='ri-record-circle-line' style={{ fontSize: 14 }} />} />
                        <Button size='small' variant='outlined' color='warning' onClick={() => handleSubstituteClick(p)}>
                          Substitute
                        </Button>
                      </Box>
                    </Box>
                    <Collapse in={!!metricsVisible[p.playerId]}>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant='subtitle2' color='text.secondary' gutterBottom>
                        Real-time energy and load (from wearable)
                      </Typography>
                      <Box
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                          gap: 1.5
                        }}
                      >
                        <Box sx={{ p: 1.5, borderRadius: 1, bgcolor: 'action.hover' }}>
                          <Typography variant='caption' color='text.secondary'>Heart rate</Typography>
                          <Typography variant='h6'>{p.heartRate ?? '–'} <Typography component='span' variant='caption'>bpm</Typography></Typography>
                        </Box>
                        <Box sx={{ p: 1.5, borderRadius: 1, bgcolor: 'action.hover' }}>
                          <Typography variant='caption' color='text.secondary'>Instant HR (sensor)</Typography>
                          <Typography variant='h6'>{p.heartRateInstant ?? '–'} <Typography component='span' variant='caption'>bpm</Typography></Typography>
                        </Box>
                        <Box sx={{ p: 1.5, borderRadius: 1, bgcolor: 'action.hover' }}>
                          <Typography variant='caption' color='text.secondary'>Distance</Typography>
                          <Typography variant='h6'>{Number(p.distanceM ?? 0).toFixed(2)} <Typography component='span' variant='caption'>m</Typography></Typography>
                        </Box>
                        <Box sx={{ p: 1.5, borderRadius: 1, bgcolor: 'action.hover' }}>
                          <Typography variant='caption' color='text.secondary'>Speed</Typography>
                          <Typography variant='h6'>{Number(p.speedKmh ?? 0).toFixed(2)} <Typography component='span' variant='caption'>km/h</Typography></Typography>
                        </Box>
                        <Box sx={{ p: 1.5, borderRadius: 1, bgcolor: 'action.hover' }}>
                          <Typography variant='caption' color='text.secondary'>Steps</Typography>
                          <Typography variant='h6'>{p.steps ?? '–'}</Typography>
                        </Box>
                        <Box sx={{ p: 1.5, borderRadius: 1, bgcolor: 'action.hover' }}>
                          <Typography variant='caption' color='text.secondary'>Stride length</Typography>
                          <Typography variant='h6'>{Number(p.strideM ?? 0).toFixed(3)} <Typography component='span' variant='caption'>m</Typography></Typography>
                        </Box>
                        <Box sx={{ p: 1.5, borderRadius: 1, bgcolor: 'action.hover' }}>
                          <Typography variant='caption' color='text.secondary'>Est. intensity (MET)</Typography>
                          <Typography variant='h6'>{Number(p.estimatedMet ?? 0).toFixed(2)}</Typography>
                        </Box>
                        <Box sx={{ p: 1.5, borderRadius: 1, bgcolor: 'action.hover' }}>
                          <Typography variant='caption' color='text.secondary'>Est. energy use</Typography>
                          <Typography variant='h6'>{Number(p.estimatedKcalPerMin ?? 0).toFixed(2)} <Typography component='span' variant='caption'>kcal/min</Typography></Typography>
                          <Typography variant='caption' color='text.secondary'>~70 kg athlete model</Typography>
                        </Box>
                        <Box sx={{ p: 1.5, borderRadius: 1, bgcolor: 'action.hover' }}>
                          <Typography variant='caption' color='text.secondary'>Energy load index</Typography>
                          <Typography variant='h6'>{p.energyLoadIndex ?? '–'} <Typography component='span' variant='caption'>/ 100</Typography></Typography>
                        </Box>
                      </Box>
                      <Box sx={{ mt: 1.5, display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                        <Chip
                          size='small'
                          label={`Fatigue: ${p.fatigueLevel}`}
                          color={getFatigueColor(p.fatigueLevel)}
                          sx={{ bgcolor: getFatigueBgColor(p.fatigueLevel), fontWeight: 600 }}
                        />
                        <Chip size='small' variant='outlined' label={`Work: ${p.workRate}`} />
                        {p.hrStatus && (
                          <Chip size='small' variant='outlined' label={`Sensor: ${p.hrStatus}`} />
                        )}
                        {p.irSignal != null && !Number.isNaN(p.irSignal) && (
                          <Chip size='small' variant='outlined' label={`IR: ${p.irSignal}`} />
                        )}
                      </Box>
                      {(historyByPlayer[p.playerId]?.length ?? 0) >= 2 && (
                        <PlayerTrendChart
                          history={historyByPlayer[p.playerId]}
                          playerName={p.name || p.playerId}
                        />
                      )}
                    </Collapse>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <Typography variant='body2' color='text.secondary'>Legend:</Typography>
        <Chip size='small' label='Low fatigue' color='success' variant='outlined' />
        <Chip size='small' label='Medium fatigue' color='warning' variant='outlined' />
        <Chip size='small' label='High fatigue' color='error' variant='outlined' />
        <Chip size='small' label='Injury risk' color='error' variant='outlined' />
      </Box>

      <ConfirmationDialog
        open={substituteDialog.open}
        onClose={() => setSubstituteDialog({ open: false, player: null })}
        onConfirm={handleSubstituteConfirm}
        title='Confirm substitution'
        content={substituteDialog.player ? `Substitute ${substituteDialog.player.name}? Device will stop sending data and final stats will be saved.` : ''}
        confirmText='Substitute'
        cancelText='Cancel'
        confirmColor='warning'
      />
    </div>
  )
}

export default LiveMatchDashboard
