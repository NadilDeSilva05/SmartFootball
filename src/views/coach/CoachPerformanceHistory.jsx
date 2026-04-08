'use client'

import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import Link from 'next/link'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'

import { getCompletedSessions } from '@views/coach/liveMatchConstants'
import CoachAnalyticsNav from '@views/coach/CoachAnalyticsNav'

const CoachPerformanceHistory = () => {
  const user = useSelector(state => state?.authenticationReducer?.loginData?.user)
  const coachClubId = user?.clubId ? String(user.clubId) : ''
  const isCoach =
    user?.role === 'coach' ||
    user?.accountRole === 'coach'

  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    const url =
      isCoach && coachClubId
        ? `/api/sessions?clubId=${encodeURIComponent(coachClubId)}`
        : '/api/sessions'
    fetch(url)
      .then(r => r.json())
      .then(arr => {
        if (cancelled) return
        const fromApi = Array.isArray(arr)
          ? arr.map(s => ({ ...s, id: s.id || `api-${s.matchId}-${s.playerId}-${s.endedAt}` }))
          : []

        if (isCoach && coachClubId) {
          fromApi.sort((a, b) => (b.endedAt || '').localeCompare(a.endedAt || ''))
          setSessions(fromApi)
          return
        }

        const fromMemory = getCompletedSessions()
        const seen = new Set(fromApi.map(s => s.id))
        const merged = [...fromApi]
        fromMemory.forEach(s => {
          if (!seen.has(s.id)) {
            merged.push(s)
            seen.add(s.id)
          }
        })
        merged.sort((a, b) => (b.endedAt || '').localeCompare(a.endedAt || ''))
        setSessions(merged)
      })
      .catch(() => { if (!cancelled) setSessions(getCompletedSessions()) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [isCoach, coachClubId])

  return (
    <div className='space-y-6'>
      <CoachAnalyticsNav />

      <div>
        <Typography variant='h4' className='font-semibold mb-1'>
          Performance History
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          Sessions saved when you substitute from the live dashboard or end tracking. Tied to the same matches as substitutions and injury alerts.
        </Typography>
      </div>

      {isCoach && coachClubId && (
        <Alert severity='info' icon={<i className='ri-team-line' />}>
          Showing sessions only for fixtures involving your club.
        </Alert>
      )}

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        <Button href='/coach/live-dashboard' component={Link} variant='outlined' size='small' startIcon={<i className='ri-heart-pulse-line' />}>
          Live dashboard
        </Button>
        <Button href='/coach/substitutions' component={Link} variant='outlined' size='small' startIcon={<i className='ri-repeat-line' />}>
          Substitution recommendations
        </Button>
        <Button href='/coach/injury-alerts' component={Link} variant='outlined' size='small' startIcon={<i className='ri-alarm-warning-line' />}>
          Injury alerts
        </Button>
      </Box>

      <Card>
        <CardHeader
          title='Match sessions'
          subheader='Session results saved when a player was substituted or when the match reached full time.'
        />
        <CardContent>
          {loading ? (
            <Box sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>
              <Typography variant='body1'>Loading sessions…</Typography>
            </Box>
          ) : sessions.length === 0 ? (
            <Box sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>
              <i className='ri-file-list-3-line' style={{ fontSize: 48, opacity: 0.5 }} />
              <Typography variant='body1' sx={{ mt: 1 }}>No session data yet.</Typography>
              <Typography variant='body2'>Substitute players from the live dashboard to persist stats here.</Typography>
            </Box>
          ) : (
            <Table size='small'>
              <TableHead>
                <TableRow>
                  <TableCell>Match</TableCell>
                  <TableCell>Player</TableCell>
                  <TableCell align='center'>Reason</TableCell>
                  <TableCell align='center'>Minutes</TableCell>
                  <TableCell align='center'>Heart Rate</TableCell>
                  <TableCell align='center'>Fatigue</TableCell>
                  <TableCell align='center'>Player Load</TableCell>
                  <TableCell align='center'>Sprints</TableCell>
                  <TableCell align='center'>High-Int. Dist. (m)</TableCell>
                  <TableCell align='center'>Work Rate</TableCell>
                  <TableCell>Ended at</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sessions.map(s => (
                  <TableRow key={s.id} hover>
                    <TableCell>
                      <Typography variant='body2' className='font-medium'>{s.matchName}</Typography>
                    </TableCell>
                    <TableCell>{s.playerName}</TableCell>
                    <TableCell align='center'>
                      <Chip size='small' label={s.reason === 'substitution' ? 'Substituted' : 'Full time'} color={s.reason === 'substitution' ? 'warning' : 'info'} variant='tonal' />
                    </TableCell>
                    <TableCell align='center'>{s.minutesPlayed}</TableCell>
                    <TableCell align='center'>{s.heartRate} bpm</TableCell>
                    <TableCell align='center'>
                      <Chip size='small' label={s.fatigueLevel} color={s.fatigueLevel === 'High' ? 'error' : s.fatigueLevel === 'Medium' ? 'warning' : 'success'} variant='outlined' />
                    </TableCell>
                    <TableCell align='center'>{s.playerLoad?.toFixed(1)}</TableCell>
                    <TableCell align='center'>{s.sprintCount}</TableCell>
                    <TableCell align='center'>{s.highIntensityDist}</TableCell>
                    <TableCell align='center'>{s.workRate}</TableCell>
                    <TableCell>
                      <Typography variant='caption' color='text.secondary'>
                        {s.endedAt ? new Date(s.endedAt).toLocaleString() : '–'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default CoachPerformanceHistory
