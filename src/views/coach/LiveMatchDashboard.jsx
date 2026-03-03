'use client'

import { useState, useEffect, useCallback } from 'react'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import CircularProgress from '@mui/material/CircularProgress'
import { ref, onValue, off } from 'firebase/database'
import ConfirmationDialog from '@components/dialogs/confirmation-dialog'
import { getRealtimeDbClient } from '@/lib/firebase-client'
import { addCompletedSession, MATCH_DURATION_MINUTES } from '@views/coach/liveMatchConstants'

const safeRtdbKey = (s) => String(s ?? '').replace(/[.#$\[\]/]/g, '_')

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
  const [matches, setMatches] = useState([])
  const [selectedMatchId, setSelectedMatchId] = useState('')
  const [players, setPlayers] = useState([])
  const [loadingMatches, setLoadingMatches] = useState(true)
  const [substituteDialog, setSubstituteDialog] = useState({ open: false, player: null })
  const [elapsedMinutes, setElapsedMinutes] = useState(0)

  const selectedMatch = matches.find(m => m.id === selectedMatchId)
  const livePlayers = players.filter(p => p.status === 'live')
  const isLive = livePlayers.length > 0

  useEffect(() => {
    let cancelled = false
    fetch('/api/matches?status=scheduled')
      .then(r => r.json())
      .then(list => {
        if (!cancelled) {
          setMatches(Array.isArray(list) ? list : [])
          if (list?.length && !selectedMatchId) setSelectedMatchId(list[0]?.id || '')
        }
      })
      .catch(() => { if (!cancelled) setMatches([]) })
      .finally(() => { if (!cancelled) setLoadingMatches(false) })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (!selectedMatchId) {
      setPlayers([])
      return
    }
    const mapPayload = (d, id) => ({
      id: id || `${selectedMatchId}_${d.playerId}`,
      playerId: d.playerId,
      name: d.playerName || d.playerId || '–',
      heartRate: Number(d.heartRate) || 0,
      fatigueLevel: d.fatigueLevel || 'Low',
      playerLoad: Number(d.playerLoad) || 0,
      sprintCount: Number(d.sprintCount) || 0,
      highIntensityDist: Number(d.highIntensityDist) || 0,
      workRate: d.workRate || '–',
      status: d.status === 'stopped' ? 'substituted' : 'live',
      injuryRisk: Boolean(d.injuryRisk)
    })

    const rtdb = getRealtimeDbClient()
    if (rtdb) {
      const path = `live_metrics/${safeRtdbKey(selectedMatchId)}`
      const r = ref(rtdb, path)
      const handler = (snapshot) => {
        const val = snapshot.val()
        if (!val || typeof val !== 'object') {
          setPlayers([])
          return
        }
        const list = Object.entries(val).map(([playerKey, d]) => mapPayload(d, `${selectedMatchId}_${d.playerId || playerKey}`))
        setPlayers(list)
      }
      onValue(r, handler)
      return () => off(r)
    }

    let cancelled = false
    const poll = () => {
      if (cancelled) return
      fetch(`/api/iot/live?matchId=${encodeURIComponent(selectedMatchId)}`)
        .then(res => res.json())
        .then(arr => {
          if (cancelled) return
          setPlayers(Array.isArray(arr) ? arr.map(d => mapPayload(d, d.id)) : [])
        })
        .catch(() => { if (!cancelled) setPlayers([]) })
    }
    poll()
    const interval = setInterval(poll, 3000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [selectedMatchId])

  useEffect(() => {
    if (!selectedMatchId || players.length === 0) return
    const t = setInterval(() => {
      setElapsedMinutes(prev => Math.min(prev + 1, MATCH_DURATION_MINUTES))
    }, 60000)
    return () => clearInterval(t)
  }, [selectedMatchId, players.length])

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
      fatigueLevel: p.fatigueLevel,
      playerLoad: p.playerLoad,
      sprintCount: p.sprintCount,
      highIntensityDist: p.highIntensityDist,
      workRate: p.workRate,
      minutesPlayed: elapsedMinutes
    }
    try {
      await fetch('/api/iot/ingest/stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId: selectedMatchId, playerId: p.playerId })
      })
      await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionPayload)
      })
      addCompletedSession(sessionPayload)
    } catch (e) {
      console.error(e)
    }
    setSubstituteDialog({ open: false, player: null })
  }, [substituteDialog.player, selectedMatchId, selectedMatch, elapsedMinutes])

  const matchLabel = selectedMatch
    ? `${selectedMatch.matchDate || ''} ${selectedMatch.matchTime || ''} – ${selectedMatch.homeClubName || selectedMatch.homeClubId || ''} vs ${selectedMatch.awayClubName || selectedMatch.awayClubId || ''}`
    : 'Select match'

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between flex-wrap gap-2'>
        <div>
          <Typography variant='h4' className='font-semibold mb-1'>
            Live Match Dashboard
          </Typography>
          <Typography variant='body1' color='text.secondary'>
            Real-time player metrics from connected IoT devices (ESP32 / energy management). Select a match to see live data. Substitute a player to stop their device stream.
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

      <Card>
        <CardHeader
          title='Select match'
          subheader='Players with connected devices will appear below in real time.'
        />
        <CardContent>
          <FormControl fullWidth size='small' sx={{ maxWidth: 480 }}>
            <InputLabel id='match-select-label'>Match</InputLabel>
            <Select
              labelId='match-select-label'
              label='Match'
              value={selectedMatchId}
              onChange={e => setSelectedMatchId(e.target.value)}
              disabled={loadingMatches}
            >
              {matches.map(m => (
                <MenuItem key={m.id} value={m.id}>
                  {m.matchDate} {m.matchTime} – {m.homeClubName || m.homeClubId} vs {m.awayClubName || m.awayClubId}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          title={selectedMatch ? matchLabel : 'Live metrics'}
          subheader={selectedMatchId ? `Elapsed: ${elapsedMinutes}' · Data updates in real time from IoT devices` : 'Select a match above'}
          action={selectedMatchId && (
            <Typography variant='h6' fontWeight='bold' color='primary'>
              {elapsedMinutes}' / {MATCH_DURATION_MINUTES}'
            </Typography>
          )}
        />
        <CardContent>
          {!selectedMatchId ? (
            <Typography color='text.secondary'>Select a match to view live player metrics from connected devices.</Typography>
          ) : players.length === 0 ? (
            <Typography color='text.secondary'>No players with connected devices for this match yet. Referee must scan player IDs and connect their IoT devices first.</Typography>
          ) : (
            <Table size='small'>
              <TableHead>
                <TableRow>
                  <TableCell>Player Name</TableCell>
                  <TableCell align='center'>Heart Rate</TableCell>
                  <TableCell align='center'>Fatigue Level</TableCell>
                  <TableCell align='center'>Player Load</TableCell>
                  <TableCell align='center'>Sprint Count</TableCell>
                  <TableCell align='center'>High-Intensity Dist. (m)</TableCell>
                  <TableCell align='center'>Work Rate</TableCell>
                  <TableCell align='center'>Status</TableCell>
                  <TableCell align='center'>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {players.map(p => (
                  <TableRow
                    key={p.id}
                    hover
                    sx={{
                      ...(p.injuryRisk && p.status === 'live' ? { bgcolor: 'error.light', '&:hover': { bgcolor: 'error.light' } } : {})
                    }}
                  >
                    <TableCell>
                      <Box className='flex items-center gap-1'>
                        <Typography className='font-medium'>{p.name}</Typography>
                        {p.injuryRisk && p.status === 'live' && (
                          <Chip size='small' label='Injury risk' color='error' variant='outlined' />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell align='center'>
                      <Typography>{p.heartRate}</Typography>
                      <Typography variant='caption' color='text.secondary'>bpm</Typography>
                    </TableCell>
                    <TableCell align='center'>
                      <Chip
                        size='small'
                        label={p.fatigueLevel}
                        color={getFatigueColor(p.fatigueLevel)}
                        sx={{ bgcolor: getFatigueBgColor(p.fatigueLevel), fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell align='center'>{Number(p.playerLoad).toFixed(1)}</TableCell>
                    <TableCell align='center'>{p.sprintCount}</TableCell>
                    <TableCell align='center'>{p.highIntensityDist}</TableCell>
                    <TableCell align='center'><Typography variant='body2'>{p.workRate}</Typography></TableCell>
                    <TableCell align='center'>
                      {p.status === 'live' ? (
                        <Chip size='small' label='Live' color='success' variant='tonal' icon={<i className='ri-record-circle-line' style={{ fontSize: 14 }} />} />
                      ) : (
                        <Chip size='small' label='Substituted' color='default' variant='tonal' />
                      )}
                    </TableCell>
                    <TableCell align='center'>
                      {p.status === 'live' ? (
                        <Button size='small' variant='outlined' color='warning' onClick={() => handleSubstituteClick(p)}>
                          Substitute
                        </Button>
                      ) : (
                        <Typography variant='caption' color='text.secondary'>–</Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
