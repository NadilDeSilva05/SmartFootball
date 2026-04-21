'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Alert from '@mui/material/Alert'
import Skeleton from '@mui/material/Skeleton'
import Divider from '@mui/material/Divider'
import HorizontalWithSubtitle from '@components/card-statistics/HorizontalWithSubtitle'
import { getSessionsByPlayerId } from '@views/coach/liveMatchConstants'
import {
  PlayerHero,
  PlayerIdentityCard,
  PlayerActionCard,
  SectionTitle,
  getFatigueColor,
  formatDateLabel,
  formatDateTimeLabel,
  formatMetric
} from '@views/player/playerShared'

const QUICK_ACCESS = [
  {
    title: 'Player Profile',
    description: 'Review your registration details, jersey assignment, and club information.',
    href: '/player/profile',
    buttonLabel: 'Open profile',
    icon: 'ri-user-line',
    illustration: '/images/illustrations/football-player.svg'
  },
  {
    title: 'Performance History',
    description: 'Check your match-by-match metrics, fatigue, and physical output trends.',
    href: '/player/performance',
    buttonLabel: 'View history',
    icon: 'ri-bar-chart-line',
    illustration: '/images/illustrations/fitness-stats.svg'
  },
  {
    title: 'Upcoming Fixtures',
    description: 'Track your next scheduled matches and stay ready for kickoff.',
    href: '/player/performance',
    buttonLabel: 'See fixtures',
    icon: 'ri-calendar-line',
    illustration: '/images/illustrations/game-cheering.svg'
  }
]

const PlayerDashboard = () => {
  const user = useSelector(state => state?.authenticationReducer?.loginData?.user)
  const token = useSelector(state => state?.authenticationReducer?.loginData?.token)

  const [profile, setProfile] = useState(null)
  const [sessions, setSessions] = useState([])
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [resolvedPlayerDocId, setResolvedPlayerDocId] = useState(null)

  const playerDocId = user?.clubPlayerDocId || resolvedPlayerDocId || ''
  const displayName = profile?.fullName || user?.fullName || user?.email?.split('@')[0] || 'Player'
  const upcomingMatches = useMemo(() => matches.filter(match => match.status === 'scheduled').slice(0, 3), [matches])
  const pastMatches = useMemo(() => matches.filter(match => match.status === 'played').slice(0, 3), [matches])
  const latestSession = sessions[0] || null

  useEffect(() => {
    if (user?.clubPlayerDocId) {
      setResolvedPlayerDocId(user.clubPlayerDocId)

      return
    }

    if (!token) return

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
    if (!playerDocId) {
      setLoading(false)

      return
    }

    let cancelled = false
    setLoading(true)

    const profileRequest = fetch(`/api/club-players/${encodeURIComponent(playerDocId)}`)
      .then(r => r.json().catch(() => ({})))
      .then(data => {
        if (!cancelled && !data.error) setProfile(data)
      })
      .catch(() => {})

    const sessionsRequest = fetch(`/api/sessions?playerId=${encodeURIComponent(playerDocId)}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json().catch(() => []))
      .then(data => {
        if (cancelled) return

        const apiList = Array.isArray(data) ? data : []
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
      .catch(() => {})

    const matchesRequest = fetch(`/api/player/matches?playerId=${encodeURIComponent(playerDocId)}`)
      .then(r => r.json().catch(() => []))
      .then(data => {
        if (!cancelled) setMatches(Array.isArray(data) ? data : [])
      })
      .catch(() => {})

    Promise.all([profileRequest, sessionsRequest, matchesRequest]).finally(() => {
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

    return { totalSessions: sessions.length, totalMinutes, totalDistance, totalSteps, avgHr }
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
        subTitle: 'Matches tracked'
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
        subTitle: 'Distance covered'
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
        title: 'Fixtures',
        value: String(upcomingMatches.length),
        avatarIcon: 'ri-calendar-line',
        avatarColor: 'warning',
        change: 'positive',
        changeNumber: '0',
        subTitle: 'Upcoming matches'
      }
    ],
    [stats, upcomingMatches.length]
  )

  return (
    <Box sx={{ p: { xs: 3, sm: 4 } }}>
      <PlayerHero
        title={`Welcome back, ${displayName}`}
        description='Your player workspace now follows the same polished dashboard style as the federation admin area. Track your profile, fixtures, and match output from one place.'
        image='/images/illustrations/game-cheering.svg'
        badge={<Chip size='small' color='primary' variant='tonal' label='Player Command Center' sx={{ mb: 2 }} />}
        actions={[
          <Button key='profile' variant='contained' href='/player/profile' startIcon={<i className='ri-user-line' />}>
            View profile
          </Button>,
          <Button key='performance' variant='outlined' href='/player/performance' startIcon={<i className='ri-bar-chart-line' />}>
            Performance history
          </Button>
        ]}
      >
        <Typography variant='body2' color='text.secondary'>
          {profile?.position || 'Player'}
          {profile?.jerseyNo ? ` | #${profile.jerseyNo}` : ''}
          {profile?.playerId ? ` | ID ${profile.playerId}` : ''}
        </Typography>
      </PlayerHero>

      {!playerDocId && !loading ? (
        <Alert severity='warning' sx={{ mt: 3 }}>
          No club player profile is linked to this account yet. Ask your club admin to register this email on your player record.
        </Alert>
      ) : null}

      <Box sx={{ mt: 4 }}>
        <SectionTitle title='Overview' subtitle='The same quick-scan metrics pattern used on federation dashboards.' />
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
        <SectionTitle title='Quick access' subtitle='Jump straight into the most important player tools.' />
        <Grid container spacing={3}>
          {QUICK_ACCESS.map(item => (
            <Grid key={item.title} size={{ xs: 12, md: 4 }}>
              <PlayerActionCard {...item} />
            </Grid>
          ))}
        </Grid>
      </Box>

      <Box sx={{ mt: 4 }}>
        <SectionTitle title='Match center' subtitle='Upcoming games, your latest performance snapshot, and recent appearances.' />
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, lg: 4 }}>
            {loading ? (
              <Skeleton variant='rectangular' height={240} sx={{ borderRadius: 3 }} />
            ) : (
              <PlayerIdentityCard
                profile={profile}
                displayName={displayName}
                chipLabel={profile?.status || 'approved'}
                chipColor='success'
                subtitle={`${profile?.position || 'Player'}${profile?.clubId ? ` | ${profile.clubId}` : ''}`}
                image='/images/illustrations/football-player.svg'
              />
            )}
          </Grid>

          <Grid size={{ xs: 12, lg: 8 }}>
            <Card sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
              <Box sx={{ position: 'absolute', top: 16, right: 16, opacity: 0.1 }}>
                <img src='/images/illustrations/football-goal.svg' alt='' style={{ height: 120, width: 'auto' }} />
              </Box>
              <CardHeader
                title='Upcoming matches'
                subheader={
                  upcomingMatches.length
                    ? `${upcomingMatches.length} fixture${upcomingMatches.length > 1 ? 's' : ''} scheduled`
                    : 'No fixtures scheduled right now'
                }
                action={
                  <Button size='small' variant='outlined' href='/player/performance'>
                    View history
                  </Button>
                }
              />
              <CardContent sx={{ pt: 0, position: 'relative' }}>
                {loading ? (
                  <Skeleton variant='rectangular' height={150} sx={{ borderRadius: 2 }} />
                ) : upcomingMatches.length === 0 ? (
                  <Typography variant='body2' color='text.secondary'>
                    Your next fixtures will appear here once they are scheduled by the federation and your club.
                  </Typography>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {upcomingMatches.map(match => (
                      <Box
                        key={match.id}
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          bgcolor: 'action.hover',
                          border: '1px solid',
                          borderColor: 'divider'
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mb: 1, flexWrap: 'wrap' }}>
                          <Typography variant='subtitle2' fontWeight={700}>
                            {match.homeClubName} vs {match.awayClubName}
                          </Typography>
                          <Chip
                            size='small'
                            label={match.isHome ? 'Home' : 'Away'}
                            color={match.isHome ? 'primary' : 'secondary'}
                            variant='tonal'
                          />
                        </Box>
                        <Typography variant='body2' color='text.secondary'>
                          {formatDateLabel(match.matchDate)} | {match.matchTime || '--:--'} | {match.venue || 'Venue TBC'}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ height: '100%' }}>
              <CardHeader
                title='Latest performance snapshot'
                subheader={latestSession ? latestSession.matchName || 'Most recent session' : 'No session data yet'}
                action={
                  <Button size='small' variant='outlined' href='/player/performance'>
                    Open analytics
                  </Button>
                }
              />
              <CardContent sx={{ pt: 0 }}>
                {loading ? (
                  <Skeleton variant='rectangular' height={180} sx={{ borderRadius: 2 }} />
                ) : !latestSession ? (
                  <Typography variant='body2' color='text.secondary'>
                    Performance data is saved after tracking ends during or after a match.
                  </Typography>
                ) : (
                  <>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 6 }}>
                        <MetricTile label='Minutes' value={latestSession.minutesPlayed ?? '-'} icon='ri-time-line' />
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <MetricTile label='Heart rate' value={`${latestSession.heartRate ?? '-'} bpm`} icon='ri-heart-pulse-line' />
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <MetricTile label='Distance' value={`${formatMetric(latestSession.distanceM, 1)} m`} icon='ri-run-line' />
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <MetricTile label='Steps' value={latestSession.steps != null ? Number(latestSession.steps).toLocaleString() : '-'} icon='ri-footprint-line' />
                      </Grid>
                    </Grid>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                      <Chip
                        size='small'
                        label={`${latestSession.fatigueLevel || 'Low'} fatigue`}
                        color={getFatigueColor(latestSession.fatigueLevel)}
                        variant='tonal'
                      />
                      <Typography variant='caption' color='text.secondary'>
                        Saved {formatDateTimeLabel(latestSession.endedAt)}
                      </Typography>
                    </Box>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ height: '100%' }}>
              <CardHeader title='Recent appearances' subheader='Your latest completed matches' />
              <CardContent sx={{ pt: 0 }}>
                {loading ? (
                  <Skeleton variant='rectangular' height={180} sx={{ borderRadius: 2 }} />
                ) : pastMatches.length === 0 ? (
                  <Typography variant='body2' color='text.secondary'>
                    Completed match appearances will appear here after full-time records are saved.
                  </Typography>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {pastMatches.map(match => (
                      <Box
                        key={match.id}
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          bgcolor: 'action.hover',
                          border: '1px solid',
                          borderColor: 'divider'
                        }}
                      >
                        <Typography variant='subtitle2' fontWeight={700}>
                          {match.homeClubName} vs {match.awayClubName}
                        </Typography>
                        <Typography variant='body2' color='text.secondary' sx={{ mt: 0.75 }}>
                          {formatDateLabel(match.matchDate)} | {match.matchTime || '--:--'} | {match.venue || 'Venue TBC'}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1.5 }}>
                          <Chip size='small' label={match.isHome ? 'Home' : 'Away'} variant='tonal' />
                          <Chip size='small' label='Played' color='success' variant='outlined' />
                        </Box>
                      </Box>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  )
}

function MetricTile ({ label, value, icon }) {
  return (
    <Box
      sx={{
        p: 1.75,
        borderRadius: 2,
        bgcolor: 'background.default',
        border: '1px solid',
        borderColor: 'divider'
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

export default PlayerDashboard
