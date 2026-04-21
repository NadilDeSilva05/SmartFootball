'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { useTheme } from '@mui/material/styles'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Alert from '@mui/material/Alert'
import Skeleton from '@mui/material/Skeleton'
import HorizontalWithSubtitle from '@components/card-statistics/HorizontalWithSubtitle'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Area,
  ComposedChart,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { getSessionsByPlayerId } from '@views/coach/liveMatchConstants'
import {
  PlayerHero,
  SectionTitle,
  getFatigueColor,
  formatDateTimeLabel,
  formatMetric
} from './playerShared'

const FATIGUE_COLORS = {
  Low: '#2e7d32',
  Medium: '#ed6c02',
  High: '#d32f2f'
}

const PerformanceHistory = () => {
  const token = useSelector(state => state?.authenticationReducer?.loginData?.token)
  const user = useSelector(state => state?.authenticationReducer?.loginData?.user)
  const theme = useTheme()

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

    return () => {
      cancelled = true
    }
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
      .then(async response => {
        const data = await response.json().catch(() => [])
        if (!response.ok) throw new Error(data?.error || 'Failed to load sessions')

        return Array.isArray(data) ? data : []
      })
      .then(apiList => {
        if (cancelled) return

        const fromMemory = getSessionsByPlayerId(playerDocId)
        const seen = new Set(apiList.map(session => session.id))
        const merged = [...apiList]

        fromMemory.forEach(session => {
          if (!seen.has(session.id)) {
            merged.push(session)
            seen.add(session.id)
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
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [playerDocId, token])

  const stats = useMemo(() => {
    if (!sessions.length) return null

    const totalMinutes = sessions.reduce((sum, session) => sum + (Number(session.minutesPlayed) || 0), 0)
    const totalDistance = sessions.reduce((sum, session) => sum + (Number(session.distanceM) || 0), 0)
    const totalSteps = sessions.reduce((sum, session) => sum + (Number(session.steps) || 0), 0)
    const avgHr = Math.round(
      sessions.reduce((sum, session) => sum + (Number(session.heartRate) || 0), 0) / sessions.length
    )
    const avgEnergy = Math.round(
      sessions.reduce((sum, session) => sum + (Number(session.energyLoadIndex) || 0), 0) / sessions.length
    )

    return { totalSessions: sessions.length, totalMinutes, totalDistance, totalSteps, avgHr, avgEnergy }
  }, [sessions])

  const summaryStats = useMemo(
    () => [
      {
        title: 'Sessions',
        value: String(stats?.totalSessions || 0),
        avatarIcon: 'ri-football-line',
        avatarColor: 'primary',
        change: 'positive',
        changeNumber: '0',
        subTitle: 'Tracked matches'
      },
      {
        title: 'Minutes',
        value: String(stats?.totalMinutes || 0),
        avatarIcon: 'ri-time-line',
        avatarColor: 'info',
        change: 'positive',
        changeNumber: '0',
        subTitle: 'Time on pitch'
      },
      {
        title: 'Distance',
        value: `${formatMetric(stats?.totalDistance || 0)} m`,
        avatarIcon: 'ri-run-line',
        avatarColor: 'success',
        change: 'positive',
        changeNumber: '0',
        subTitle: 'Total distance'
      },
      {
        title: 'Avg HR',
        value: stats?.avgHr ? `${stats.avgHr} bpm` : '0 bpm',
        avatarIcon: 'ri-heart-pulse-line',
        avatarColor: 'error',
        change: 'positive',
        changeNumber: '0',
        subTitle: 'Average heart rate'
      },
      {
        title: 'Load',
        value: String(stats?.avgEnergy || 0),
        avatarIcon: 'ri-flashlight-line',
        avatarColor: 'warning',
        change: 'positive',
        changeNumber: '0',
        subTitle: 'Avg energy load'
      }
    ],
    [stats]
  )

  const chartData = useMemo(
    () =>
      sessions
        .slice(0, 10)
        .map(session => ({
          label:
            (session.matchName || 'Match').length > 14
              ? `${(session.matchName || '').slice(0, 14)}...`
              : session.matchName || 'Match',
          load: Number(session.energyLoadIndex) || 0,
          hr: Number(session.heartRate) || 0,
          distance: Number(Number(session.distanceM || 0).toFixed(1)),
          steps: Number(session.steps) || 0,
          speed: Number(Number(session.speedKmh || 0).toFixed(2)),
          met: Number(Number(session.estimatedMet || 0).toFixed(2)),
          minutes: Number(session.minutesPlayed) || 0
        }))
        .reverse(),
    [sessions]
  )

  const fatigueData = useMemo(() => {
    const counts = sessions.reduce((accumulator, session) => {
      const level = session.fatigueLevel || 'Low'
      accumulator[level] = (accumulator[level] || 0) + 1

      return accumulator
    }, {})

    return ['Low', 'Medium', 'High']
      .filter(level => counts[level])
      .map(level => ({ name: `${level} fatigue`, value: counts[level] }))
  }, [sessions])

  const latestSession = sessions[0] || null

  return (
    <Box sx={{ p: { xs: 3, sm: 4 } }}>
      <PlayerHero
        title='Performance history'
        description='Your analytics page now mirrors the federation dashboard styling with stronger cards, cleaner charts, and a more professional session history table.'
        image='/images/illustrations/fitness-stats.svg'
        badge={<Chip size='small' color='primary' variant='tonal' label='Player Analytics Center' sx={{ mb: 2 }} />}
        actions={[
          <Button key='dashboard' variant='contained' href='/player' startIcon={<i className='ri-home-5-line' />}>
            Dashboard
          </Button>,
          <Button key='profile' variant='outlined' href='/player/profile' startIcon={<i className='ri-user-line' />}>
            Profile
          </Button>
        ]}
      />

      {!playerDocId && !loading ? (
        <Alert severity='warning' sx={{ mt: 3 }}>
          No club player profile is linked to this account yet. Ask your club admin to connect this email to your player record.
        </Alert>
      ) : null}

      {loadError ? (
        <Alert severity='error' sx={{ mt: 3 }}>
          {loadError}
        </Alert>
      ) : null}

      <Box sx={{ mt: 4 }}>
        <SectionTitle title='Overview' subtitle='Top-level performance metrics in the same summary-card pattern used across admin dashboards.' />
        {loading ? (
          <Grid container spacing={3}>
            {Array.from({ length: 5 }).map((_, index) => (
              <Grid key={index} size={{ xs: 12, sm: 6, lg: 4, xl: 2.4 }}>
                <Skeleton variant='rectangular' height={110} sx={{ borderRadius: 3 }} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Grid container spacing={3}>
            {summaryStats.map((item, index) => (
              <Grid key={index} size={{ xs: 12, sm: 6, lg: 4, xl: 2.4 }}>
                <HorizontalWithSubtitle {...item} />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      <Box sx={{ mt: 4 }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <Card sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
              <Box sx={{ position: 'absolute', top: 16, right: 16, opacity: 0.1 }}>
                <img src='/images/illustrations/game-cheering.svg' alt='' style={{ height: 110, width: 'auto' }} />
              </Box>
              <CardHeader title='Latest session highlight' subheader={latestSession ? latestSession.matchName || 'Most recent saved match' : 'No saved session yet'} />
              <CardContent sx={{ pt: 0, position: 'relative' }}>
                {loading ? (
                  <Skeleton variant='rectangular' height={150} sx={{ borderRadius: 2 }} />
                ) : !latestSession ? (
                  <Typography variant='body2' color='text.secondary'>
                    Your live match session summary will appear here when tracking is saved.
                  </Typography>
                ) : (
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <InsightTile label='Minutes' value={latestSession.minutesPlayed ?? '-'} icon='ri-time-line' />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <InsightTile label='Distance' value={`${formatMetric(latestSession.distanceM, 1)} m`} icon='ri-run-line' />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <InsightTile label='Heart rate' value={`${latestSession.heartRate ?? '-'} bpm`} icon='ri-heart-pulse-line' />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <InsightTile label='Energy load' value={latestSession.energyLoadIndex ?? '-'} icon='ri-flashlight-line' />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <Box
                        sx={{
                          mt: 1,
                          p: 2,
                          borderRadius: 2,
                          bgcolor: 'action.hover',
                          border: '1px solid',
                          borderColor: 'divider',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: 2,
                          flexWrap: 'wrap'
                        }}
                      >
                        <Chip
                          size='small'
                          label={`${latestSession.fatigueLevel || 'Low'} fatigue`}
                          color={getFatigueColor(latestSession.fatigueLevel)}
                          variant='tonal'
                        />
                        <Typography variant='body2' color='text.secondary'>
                          Saved {formatDateTimeLabel(latestSession.endedAt)}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }}>
            <Card sx={{ height: '100%' }}>
              <CardHeader title='Fatigue distribution' subheader='How recent sessions are distributed across fatigue levels.' />
              <CardContent sx={{ pt: 0 }}>
                {loading ? (
                  <Skeleton variant='rectangular' height={200} sx={{ borderRadius: 2 }} />
                ) : fatigueData.length === 0 ? (
                  <Typography variant='body2' color='text.secondary'>
                    Fatigue distribution will appear once session history is available.
                  </Typography>
                ) : (
                  <Box sx={{ height: 260 }}>
                    <ResponsiveContainer width='100%' height='100%'>
                      <PieChart>
                        <Pie data={fatigueData} dataKey='value' nameKey='name' cx='50%' cy='50%' innerRadius={54} outerRadius={82} paddingAngle={3}>
                          {fatigueData.map((entry, index) => {
                            const level = String(entry.name || '').split(' ')[0]

                            return <Cell key={`cell-${index}`} fill={FATIGUE_COLORS[level] || theme.palette.grey[500]} />
                          })}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: 8 }} />
                        <Legend wrapperStyle={{ fontSize: 12 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {!loading && chartData.length >= 2 ? (
        <Box sx={{ mt: 4 }}>
          <SectionTitle title='Trend analysis' subtitle='Chart blocks restyled to feel closer to the federation analytics sections.' />
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <AnalyticsCard title='Heart rate trend' subtitle='Average BPM per session'>
                <ResponsiveContainer width='100%' height='100%'>
                  <LineChart data={chartData} margin={{ top: 8, right: 8, left: -8, bottom: 8 }}>
                    <CartesianGrid strokeDasharray='3 3' stroke={theme.palette.divider} />
                    <XAxis dataKey='label' tick={{ fontSize: 10 }} interval={0} angle={-18} textAnchor='end' height={48} />
                    <YAxis tick={{ fontSize: 10 }} width={40} />
                    <Tooltip contentStyle={{ borderRadius: 8, border: `1px solid ${theme.palette.divider}` }} />
                    <Area
                      type='monotone'
                      dataKey='hr'
                      name='Heart rate (bpm)'
                      stroke={theme.palette.error.main}
                      fill={theme.palette.error.light}
                      fillOpacity={0.25}
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </AnalyticsCard>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <AnalyticsCard title='Distance and steps' subtitle='Session totals'>
                <ResponsiveContainer width='100%' height='100%'>
                  <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: -8, bottom: 8 }}>
                    <CartesianGrid strokeDasharray='3 3' stroke={theme.palette.divider} />
                    <XAxis dataKey='label' tick={{ fontSize: 10 }} interval={0} angle={-18} textAnchor='end' height={48} />
                    <YAxis yAxisId='left' tick={{ fontSize: 10 }} width={50} />
                    <YAxis yAxisId='right' orientation='right' tick={{ fontSize: 10 }} width={50} />
                    <Tooltip contentStyle={{ borderRadius: 8, border: `1px solid ${theme.palette.divider}` }} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar yAxisId='left' dataKey='distance' name='Distance (m)' fill={theme.palette.primary.main} radius={[4, 4, 0, 0]} maxBarSize={32} />
                    <Bar yAxisId='right' dataKey='steps' name='Steps' fill={theme.palette.success.main} radius={[4, 4, 0, 0]} maxBarSize={32} />
                  </ComposedChart>
                </ResponsiveContainer>
              </AnalyticsCard>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <AnalyticsCard title='Speed and energy load' subtitle='Per-session athletic output'>
                <ResponsiveContainer width='100%' height='100%'>
                  <BarChart data={chartData} margin={{ top: 8, right: 8, left: -8, bottom: 8 }}>
                    <CartesianGrid strokeDasharray='3 3' stroke={theme.palette.divider} vertical={false} />
                    <XAxis dataKey='label' tick={{ fontSize: 10 }} interval={0} angle={-18} textAnchor='end' height={48} />
                    <YAxis tick={{ fontSize: 10 }} width={40} />
                    <Tooltip contentStyle={{ borderRadius: 8, border: `1px solid ${theme.palette.divider}` }} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey='speed' name='Speed (km/h)' fill={theme.palette.info.main} radius={[4, 4, 0, 0]} maxBarSize={28} />
                    <Bar dataKey='load' name='Energy load /100' fill={theme.palette.warning.main} radius={[4, 4, 0, 0]} maxBarSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              </AnalyticsCard>
            </Grid>
          </Grid>
        </Box>
      ) : null}

      <Box sx={{ mt: 4 }}>
        <SectionTitle title='Session history' subtitle='A cleaner match session table with the same card treatment used across admin records screens.' />
        <Card>
          <CardHeader
            title='Match sessions'
            subheader={
              sessions.length
                ? `${sessions.length} session${sessions.length > 1 ? 's' : ''} recorded`
                : 'Full metrics are saved when live tracking ends'
            }
            action={
              <Button size='small' variant='outlined' href='/player/profile'>
                Player profile
              </Button>
            }
          />
          <CardContent sx={{ pt: 0 }}>
            {loading ? (
              <Skeleton variant='rectangular' height={220} sx={{ borderRadius: 2 }} />
            ) : sessions.length === 0 ? (
              <Typography color='text.secondary'>
                No saved sessions yet. Once you are tracked in a match, your metrics will appear here automatically.
              </Typography>
            ) : (
              <TableContainer component={Paper} variant='outlined' sx={{ borderRadius: 3 }}>
                <Table size='small'>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Match</TableCell>
                      <TableCell align='center' sx={{ fontWeight: 700 }}>Reason</TableCell>
                      <TableCell align='center' sx={{ fontWeight: 700 }}>Min</TableCell>
                      <TableCell align='center' sx={{ fontWeight: 700 }}>HR</TableCell>
                      <TableCell align='center' sx={{ fontWeight: 700 }}>Inst. HR</TableCell>
                      <TableCell align='center' sx={{ fontWeight: 700 }}>Fatigue</TableCell>
                      <TableCell align='center' sx={{ fontWeight: 700 }}>Steps</TableCell>
                      <TableCell align='center' sx={{ fontWeight: 700 }}>Dist (m)</TableCell>
                      <TableCell align='center' sx={{ fontWeight: 700 }}>Speed</TableCell>
                      <TableCell align='center' sx={{ fontWeight: 700 }}>Energy</TableCell>
                      <TableCell align='center' sx={{ fontWeight: 700 }}>MET</TableCell>
                      <TableCell align='center' sx={{ fontWeight: 700 }}>kcal/min</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Ended</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sessions.map(session => (
                      <TableRow key={session.id} hover>
                        <TableCell>
                          <Typography variant='body2' fontWeight={700}>
                            {session.matchName || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell align='center'>
                          <Chip
                            size='small'
                            label={session.reason === 'substitution' ? 'Sub' : 'FT'}
                            color={session.reason === 'substitution' ? 'warning' : 'info'}
                            variant='tonal'
                          />
                        </TableCell>
                        <TableCell align='center'>{session.minutesPlayed ?? '-'}</TableCell>
                        <TableCell align='center'>{session.heartRate ?? '-'}</TableCell>
                        <TableCell align='center'>{session.heartRateInstant ?? '-'}</TableCell>
                        <TableCell align='center'>
                          <Chip
                            size='small'
                            label={session.fatigueLevel || 'Low'}
                            color={getFatigueColor(session.fatigueLevel)}
                            variant='outlined'
                          />
                        </TableCell>
                        <TableCell align='center'>{session.steps != null ? Number(session.steps).toLocaleString() : '-'}</TableCell>
                        <TableCell align='center'>{session.distanceM != null ? Number(session.distanceM).toFixed(1) : '-'}</TableCell>
                        <TableCell align='center'>{session.speedKmh != null ? Number(session.speedKmh).toFixed(2) : '-'}</TableCell>
                        <TableCell align='center'>{session.energyLoadIndex ?? '-'}</TableCell>
                        <TableCell align='center'>{session.estimatedMet != null ? Number(session.estimatedMet).toFixed(2) : '-'}</TableCell>
                        <TableCell align='center'>
                          {session.estimatedKcalPerMin != null ? Number(session.estimatedKcalPerMin).toFixed(2) : '-'}
                        </TableCell>
                        <TableCell>
                          <Typography variant='caption' color='text.secondary'>
                            {formatDateTimeLabel(session.endedAt)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  )
}

function AnalyticsCard ({ title, subtitle, children }) {
  return (
    <Card>
      <CardHeader title={title} subheader={subtitle} />
      <CardContent>
        <Box sx={{ height: 260 }}>
          {children}
        </Box>
      </CardContent>
    </Card>
  )
}

function InsightTile ({ label, value, icon }) {
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        bgcolor: 'action.hover',
        border: '1px solid',
        borderColor: 'divider',
        height: '100%'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
        <i className={icon} style={{ fontSize: 16, opacity: 0.7 }} />
        <Typography variant='caption' color='text.secondary'>
          {label}
        </Typography>
      </Box>
      <Typography variant='body1' fontWeight={700}>
        {value}
      </Typography>
    </Box>
  )
}

export default PerformanceHistory
