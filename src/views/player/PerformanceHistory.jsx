'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSelector } from 'react-redux'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Alert from '@mui/material/Alert'
import dynamic from 'next/dynamic'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from '@/libs/Recharts'
import { getSessionsByPlayerId } from '@views/coach/liveMatchConstants'

const AppRecharts = dynamic(() => import('@/libs/styles/AppRecharts'))

const PerformanceHistory = () => {
  const token = useSelector(state => state?.authenticationReducer?.loginData?.token)
  const user = useSelector(state => state?.authenticationReducer?.loginData?.user)

  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [resolvedPlayerDocId, setResolvedPlayerDocId] = useState(null)

  const playerDocId = user?.clubPlayerDocId || resolvedPlayerDocId || ''

  useEffect(() => {
    if (user?.clubPlayerDocId) {
      setResolvedPlayerDocId(user.clubPlayerDocId)
      return
    }
    if (!token || user?.clubPlayerDocId) return
    let cancelled = false
    fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(me => {
        if (!cancelled && me?.clubPlayerDocId) setResolvedPlayerDocId(me.clubPlayerDocId)
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [token, user?.clubPlayerDocId])

  useEffect(() => {
    if (!playerDocId || !token) {
      setSessions(playerDocId ? getSessionsByPlayerId(playerDocId) : [])
      setLoadError('')
      return
    }
    let cancelled = false
    setLoading(true)
    setLoadError('')
    fetch(`/api/sessions?playerId=${encodeURIComponent(playerDocId)}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(async r => {
        const data = await r.json().catch(() => [])
        if (!r.ok) throw new Error(data?.error || 'Failed to load sessions')
        return Array.isArray(data) ? data : []
      })
      .then(apiList => {
        if (cancelled) return
        const fromMemory = getSessionsByPlayerId(playerDocId)
        const seen = new Set(apiList.map(s => s.id))
        const merged = [...apiList]
        fromMemory.forEach(s => {
          if (!seen.has(s.id)) {
            merged.push(s)
            seen.add(s.id)
          }
        })
        merged.sort((a, b) => (b.endedAt || '').localeCompare(a.endedAt || ''))
        setSessions(merged)
      })
      .catch(e => {
        if (!cancelled) {
          setLoadError(e?.message || 'Could not load performance history')
          setSessions(getSessionsByPlayerId(playerDocId))
        }
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [playerDocId, token])

  const chartData = useMemo(() => {
    return sessions.slice(0, 8).map(s => ({
      label: (s.matchName || 'Match').length > 16 ? `${(s.matchName || '').slice(0, 16)}…` : (s.matchName || 'Match'),
      load: Number(s.energyLoadIndex) || 0,
      hr: Number(s.heartRate) || 0
    })).reverse()
  }, [sessions])

  return (
    <div className='space-y-6'>
      <div>
        <Typography variant='h4' className='font-semibold mb-1'>
          Performance History
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          IoT summaries saved when your coach substitutes you or ends tracking. Your login email must match the email on your club roster to link your account.
        </Typography>
      </div>

      {!playerDocId && !loading && (
        <Alert severity='warning'>
          No club player profile is linked to this account yet. Use the same email as on your official squad registration, or ask your club admin to add your email to your player record.
        </Alert>
      )}

      {loadError && (
        <Alert severity='error'>{loadError}</Alert>
      )}

      <Card>
        <CardHeader
          title='Wearable match sessions'
          subheader='Full metrics from substitution or full time — same data your coach sees in session history.'
        />
        <CardContent>
          {loading ? (
            <Typography color='text.secondary'>Loading…</Typography>
          ) : sessions.length === 0 ? (
            <Typography color='text.secondary'>
              No saved sessions yet. After you are substituted in a live match, stats appear here and your device is released for the next assignment.
            </Typography>
          ) : (
            <Table size='small'>
              <TableHead>
                <TableRow>
                  <TableCell>Match</TableCell>
                  <TableCell align='center'>Reason</TableCell>
                  <TableCell align='center'>Min</TableCell>
                  <TableCell align='center'>HR</TableCell>
                  <TableCell align='center'>Inst. HR</TableCell>
                  <TableCell align='center'>Fatigue</TableCell>
                  <TableCell align='center'>Load (m)</TableCell>
                  <TableCell align='center'>Steps</TableCell>
                  <TableCell align='center'>Dist (m)</TableCell>
                  <TableCell align='center'>Speed</TableCell>
                  <TableCell align='center'>Energy idx</TableCell>
                  <TableCell align='center'>MET</TableCell>
                  <TableCell align='center'>kcal/min</TableCell>
                  <TableCell align='center'>Device</TableCell>
                  <TableCell>Ended</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sessions.map(s => (
                  <TableRow key={s.id} hover>
                    <TableCell>
                      <Typography variant='body2' className='font-medium'>{s.matchName}</Typography>
                    </TableCell>
                    <TableCell align='center'>
                      <Chip size='small' label={s.reason === 'substitution' ? 'Sub' : 'FT'} color={s.reason === 'substitution' ? 'warning' : 'info'} variant='tonal' />
                    </TableCell>
                    <TableCell align='center'>{s.minutesPlayed}</TableCell>
                    <TableCell align='center'>{s.heartRate}</TableCell>
                    <TableCell align='center'>{s.heartRateInstant ?? '–'}</TableCell>
                    <TableCell align='center'>
                      <Chip
                        size='small'
                        label={s.fatigueLevel}
                        color={s.fatigueLevel === 'High' ? 'error' : s.fatigueLevel === 'Medium' ? 'warning' : 'success'}
                        variant='outlined'
                      />
                    </TableCell>
                    <TableCell align='center'>{s.playerLoad != null ? Number(s.playerLoad).toFixed(1) : '–'}</TableCell>
                    <TableCell align='center'>{s.sprintCount ?? '–'}</TableCell>
                    <TableCell align='center'>{s.distanceM != null ? Number(s.distanceM).toFixed(1) : '–'}</TableCell>
                    <TableCell align='center'>{s.speedKmh != null ? Number(s.speedKmh).toFixed(2) : '–'}</TableCell>
                    <TableCell align='center'>{s.energyLoadIndex ?? '–'}</TableCell>
                    <TableCell align='center'>{s.estimatedMet != null ? Number(s.estimatedMet).toFixed(2) : '–'}</TableCell>
                    <TableCell align='center'>{s.estimatedKcalPerMin != null ? Number(s.estimatedKcalPerMin).toFixed(2) : '–'}</TableCell>
                    <TableCell align='center'>
                      <Typography variant='caption'>{s.deviceId || '–'}</Typography>
                    </TableCell>
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

      {chartData.length >= 2 && (
        <Card>
          <CardHeader title='Recent sessions — load & heart rate' />
          <CardContent>
            <Box sx={{ height: 280 }}>
              <AppRecharts>
                <ResponsiveContainer width='100%' height='100%'>
                  <BarChart data={chartData} margin={{ top: 8, right: 8, left: -8, bottom: 8 }}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='label' tick={{ fontSize: 10 }} interval={0} angle={-18} textAnchor='end' height={56} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey='hr' name='Heart rate' fill='var(--mui-palette-error-main)' radius={[4, 4, 0, 0]} maxBarSize={28} />
                    <Bar dataKey='load' name='Energy index' fill='var(--mui-palette-primary-main)' radius={[4, 4, 0, 0]} maxBarSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              </AppRecharts>
            </Box>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default PerformanceHistory
