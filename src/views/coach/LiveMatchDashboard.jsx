'use client'

// React Imports
import { useState, useEffect, useCallback } from 'react'

// MUI Imports
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

// Component Imports
import ConfirmationDialog from '@components/dialogs/confirmation-dialog'
import { addCompletedSession, MATCH_DURATION_MINUTES, TICK_MS, FATIGUE_LEVELS, WORK_RATE_OPTIONS } from '@views/coach/liveMatchConstants'

// Simulated initial squad (would come from "referee scanned" players when match starts)
const INITIAL_PLAYERS = [
  { id: '1', playerId: 'PLR-001', name: 'John Silva', heartRate: 142, fatigueLevel: 'Medium', playerLoad: 8.2, sprintCount: 12, highIntensityDist: 420, workRate: 'High', status: 'live', injuryRisk: false },
  { id: '2', playerId: 'PLR-002', name: 'Maria Perera', heartRate: 168, fatigueLevel: 'High', playerLoad: 9.5, sprintCount: 18, highIntensityDist: 580, workRate: 'Very High', status: 'live', injuryRisk: true },
  { id: '3', playerId: 'PLR-003', name: 'David Fernando', heartRate: 125, fatigueLevel: 'Low', playerLoad: 6.1, sprintCount: 7, highIntensityDist: 280, workRate: 'Medium', status: 'live', injuryRisk: false },
  { id: '4', playerId: 'PLR-004', name: 'James Wilson', heartRate: 155, fatigueLevel: 'High', playerLoad: 9.8, sprintCount: 15, highIntensityDist: 510, workRate: 'High', status: 'live', injuryRisk: true },
  { id: '5', playerId: 'PLR-005', name: 'Anna Lopez', heartRate: 132, fatigueLevel: 'Low', playerLoad: 5.4, sprintCount: 5, highIntensityDist: 190, workRate: 'Medium', status: 'live', injuryRisk: false }
]

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

// Small random delta to simulate live device updates
const randomDelta = (value, range) => Math.max(0, value + (Math.random() * 2 - 1) * range)
const pickNear = (arr, current) => {
  const i = arr.indexOf(current)
  if (i < 0) return arr[0]
  const next = Math.random() > 0.7 ? (i + (Math.random() > 0.5 ? 1 : -1)) : i
  return arr[Math.max(0, Math.min(next, arr.length - 1))]
}

const LiveMatchDashboard = () => {
  const [players, setPlayers] = useState(INITIAL_PLAYERS.map(p => ({ ...p })))
  const [matchStartTime] = useState(() => Date.now())
  const [elapsedMinutes, setElapsedMinutes] = useState(0)
  const [sessionEnded, setSessionEnded] = useState(false)
  const [substituteDialog, setSubstituteDialog] = useState({ open: false, player: null })
  const [matchInfo] = useState({ id: 'M1', name: 'City FC vs Rovers FC', startTime: '15:00' })

  const livePlayers = players.filter(p => p.status === 'live')

  const tick = useCallback(() => {
    setElapsedMinutes(prev => {
      const next = Math.min(prev + 1, MATCH_DURATION_MINUTES)
      return next
    })
  }, [])

  useEffect(() => {
    if (sessionEnded) return
    const t = setInterval(tick, TICK_MS)
    return () => clearInterval(t)
  }, [sessionEnded, tick])

  useEffect(() => {
    if (sessionEnded || livePlayers.length === 0) return
    const id = setInterval(() => {
      setPlayers(prev => prev.map(p => {
        if (p.status !== 'live') return p
        const heartRate = Math.round(randomDelta(p.heartRate, 8))
        const fatigueLevel = pickNear(FATIGUE_LEVELS, p.fatigueLevel)
        const playerLoad = Math.round(randomDelta(p.playerLoad, 0.6) * 10) / 10
        const sprintCount = p.sprintCount + (Math.random() > 0.6 ? 1 : 0)
        const highIntensityDist = p.highIntensityDist + (Math.random() > 0.5 ? 10 : 0)
        const workRate = pickNear(WORK_RATE_OPTIONS, p.workRate)
        const injuryRisk = fatigueLevel === 'High' || heartRate >= 175
        return {
          ...p,
          heartRate: Math.min(220, Math.max(60, heartRate)),
          fatigueLevel,
          playerLoad: Math.min(15, Math.max(0, playerLoad)),
          sprintCount: Math.min(50, sprintCount),
          highIntensityDist: Math.min(2000, highIntensityDist),
          workRate,
          injuryRisk
        }
      }))
    }, 3000)
    return () => clearInterval(id)
  }, [sessionEnded, livePlayers.length])

  useEffect(() => {
    if (elapsedMinutes >= MATCH_DURATION_MINUTES && !sessionEnded) {
      setSessionEnded(true)
      livePlayers.forEach(p => {
        addCompletedSession({
          matchId: matchInfo.id,
          matchName: matchInfo.name,
          playerId: p.playerId,
          playerName: p.name,
          reason: 'full_time',
          heartRate: p.heartRate,
          fatigueLevel: p.fatigueLevel,
          playerLoad: p.playerLoad,
          sprintCount: p.sprintCount,
          highIntensityDist: p.highIntensityDist,
          workRate: p.workRate,
          minutesPlayed: MATCH_DURATION_MINUTES
        })
      })
    }
  }, [elapsedMinutes, sessionEnded, matchInfo.id, matchInfo.name, livePlayers])

  const handleSubstituteClick = player => setSubstituteDialog({ open: true, player })

  const handleSubstituteConfirm = () => {
    const p = substituteDialog.player
    if (!p) return
    setPlayers(prev => prev.map(x => x.id === p.id ? { ...x, status: 'substituted' } : x))
    addCompletedSession({
      matchId: matchInfo.id,
      matchName: matchInfo.name,
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
    })
    setSubstituteDialog({ open: false, player: null })
  }

  const isLive = !sessionEnded && livePlayers.length > 0

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between flex-wrap gap-2'>
        <div>
          <Typography variant='h4' className='font-semibold mb-1'>
            Live Match Dashboard
          </Typography>
          <Typography variant='body1' color='text.secondary'>
            Real-time player metrics from IoT devices. Substitute a player to stop their device and save final stats to Performance History.
          </Typography>
        </div>
        <Box className='flex items-center gap-2'>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: isLive ? 'error.main' : 'text.disabled' }} />
          <Typography variant='body2' color='text.secondary'>
            {isLive ? 'LIVE' : sessionEnded ? 'Session ended' : 'No active devices'}
          </Typography>
          <Chip size='small' label={isLive ? 'Live' : 'Ended'} color={isLive ? 'error' : 'default'} variant='tonal' icon={<i className={isLive ? 'ri-record-circle-line' : 'ri-stop-circle-line'} style={{ fontSize: 16 }} />} />
        </Box>
      </div>

      <Card>
        <CardHeader
          title={matchInfo.name}
          subheader={`Match started ${matchInfo.startTime} • Elapsed: ${elapsedMinutes}' / ${MATCH_DURATION_MINUTES}'`}
          action={
            <Typography variant='h5' fontWeight='bold' color='primary'>
              {elapsedMinutes}' / {MATCH_DURATION_MINUTES}'
            </Typography>
          }
        />
        <CardContent>
          {sessionEnded && (
            <Alert severity='info' sx={{ mb: 2 }}>
              Session ended (90 minutes). All final stats have been saved to Performance History for coach and players.
            </Alert>
          )}
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
                  <TableCell align='center'>{p.playerLoad.toFixed(1)}</TableCell>
                  <TableCell align='center'>{p.sprintCount}</TableCell>
                  <TableCell align='center'>{p.highIntensityDist}</TableCell>
                  <TableCell align='center'>
                    <Typography variant='body2'>{p.workRate}</Typography>
                  </TableCell>
                  <TableCell align='center'>
                    {p.status === 'live' ? (
                      <Chip size='small' label='Live' color='success' variant='tonal' icon={<i className='ri-record-circle-line' style={{ fontSize: 14 }} />} />
                    ) : (
                      <Chip size='small' label='Substituted' color='default' variant='tonal' />
                    )}
                  </TableCell>
                  <TableCell align='center'>
                    {p.status === 'live' && !sessionEnded ? (
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
        content={substituteDialog.player ? `Substitute ${substituteDialog.player.name}? Device will stop sending data and final stats will be saved to Performance History.` : ''}
        confirmText='Substitute'
        cancelText='Cancel'
        confirmColor='warning'
      />
    </div>
  )
}

export default LiveMatchDashboard
