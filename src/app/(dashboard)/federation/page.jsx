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
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import HorizontalWithSubtitle from '@components/card-statistics/HorizontalWithSubtitle'

const QUICK_ACCESS = [
  {
    title: 'League Management',
    description: 'Manage leagues, standings, and competition settings.',
    href: '/federation/leagues',
    icon: 'ri-trophy-line',
    illustration: '/images/illustrations/football-goal.svg'
  },
  {
    title: 'Clubs',
    description: 'Manage registered clubs and club admins.',
    href: '/federation/clubs',
    icon: 'ri-building-line',
    illustration: '/images/illustrations/sports-core.svg'
  },
  {
    title: 'Referees',
    description: 'Manage referees and license levels.',
    href: '/federation/referees',
    icon: 'ri-user-star-line',
    illustration: '/images/illustrations/fitness-stats.svg'
  },
  {
    title: 'Schedule Matches',
    description: 'Create and edit match schedule.',
    href: '/federation/matches/schedule',
    icon: 'ri-calendar-line',
    illustration: '/images/illustrations/game-cheering.svg'
  },
  {
    title: 'Assign Referees',
    description: 'Assign referees to scheduled matches.',
    href: '/federation/matches/assign-referees',
    icon: 'ri-user-add-line',
    illustration: '/images/illustrations/football-player.svg'
  },
  {
    title: 'Past Results',
    description: 'View and add match results.',
    href: '/federation/matches/past-results',
    icon: 'ri-calendar-check-line',
    illustration: '/images/illustrations/small-child-football-player.svg'
  }
]

const SUMMARY_CARD_META = [
  { title: 'Leagues', avatarIcon: 'ri-trophy-line', avatarColor: 'primary', subTitle: 'Active competitions' },
  { title: 'Clubs', avatarIcon: 'ri-building-line', avatarColor: 'secondary', subTitle: 'Registered clubs' },
  { title: 'Referees', avatarIcon: 'ri-user-star-line', avatarColor: 'success', subTitle: 'Licensed referees' },
  { title: 'Scheduled', avatarIcon: 'ri-calendar-line', avatarColor: 'info', subTitle: 'Upcoming matches' },
  { title: 'Completed', avatarIcon: 'ri-calendar-check-line', avatarColor: 'warning', subTitle: 'Past results' }
]

const fetchJson = async (url, fallback = null) => {
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) throw new Error(`Request failed for ${url}: ${res.status}`)
  const data = await res.json()
  return data ?? fallback
}

const toTimestamp = (matchDate = '', matchTime = '') => {
  if (!matchDate) return Number.MAX_SAFE_INTEGER
  const parsed = new Date(`${matchDate}T${matchTime || '00:00'}`)
  const ts = parsed.getTime()

  return Number.isNaN(ts) ? Number.MAX_SAFE_INTEGER : ts
}

const formatMatchDate = value => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('en-US', { weekday: 'short', day: '2-digit', month: 'short' }).format(date)
}

const FederationDashboard = () => {
  const user = useSelector(state => state?.authenticationReducer?.loginData?.user)
  const firstName = user?.fullName?.split(' ')[0] || user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'Admin'

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [summaryCounts, setSummaryCounts] = useState({
    leagues: 0,
    clubs: 0,
    referees: 0,
    scheduled: 0,
    completed: 0
  })
  const [standingsData, setStandingsData] = useState([])
  const [trendingMatches, setTrendingMatches] = useState([])
  const [trendingScorers, setTrendingScorers] = useState([])
  const [featuredLeagueName, setFeaturedLeagueName] = useState('League')

  useEffect(() => {
    let active = true

    const loadDashboard = async () => {
      try {
        setLoading(true)
        setError('')

        const [leagues, clubs, referees, matches] = await Promise.all([
          fetchJson('/api/leagues', []),
          fetchJson('/api/clubs', []),
          fetchJson('/api/referees', []),
          fetchJson('/api/matches', [])
        ])

        const listLeagues = Array.isArray(leagues) ? leagues : []
        const listClubs = Array.isArray(clubs) ? clubs : []
        const listReferees = Array.isArray(referees) ? referees : []
        const listMatches = Array.isArray(matches) ? matches : []

        const featuredLeague = listLeagues[0] || null
        const standingsUrl = featuredLeague?.id
          ? `/api/standings?leagueId=${encodeURIComponent(featuredLeague.id)}`
          : '/api/standings'

        const standingsPayload = await fetchJson(standingsUrl, { standings: [], topScorers: [] })
        const standings = Array.isArray(standingsPayload?.standings) ? standingsPayload.standings : []
        const topScorers = Array.isArray(standingsPayload?.topScorers) ? standingsPayload.topScorers : []

        const clubsById = listClubs.reduce((acc, club) => {
          if (club?.id) acc[club.id] = club?.clubName || club?.name || '-'

          return acc
        }, {})

        const scheduledMatches = listMatches
          .filter(match => (match?.status || 'scheduled') === 'scheduled')
          .sort((a, b) => toTimestamp(a.matchDate, a.matchTime) - toTimestamp(b.matchDate, b.matchTime))

        const trending = scheduledMatches.slice(0, 3).map(match => ({
          id: match.id,
          home: clubsById[match.homeClubId] || '-',
          away: clubsById[match.awayClubId] || '-',
          date: formatMatchDate(match.matchDate),
          time: match.matchTime || '--:--',
          venue: match.venue || 'TBD'
        }))

        if (!active) return

        setSummaryCounts({
          leagues: listLeagues.length,
          clubs: listClubs.length,
          referees: listReferees.length,
          scheduled: scheduledMatches.length,
          completed: listMatches.filter(match => (match?.status || '') === 'played').length
        })
        setStandingsData(standings)
        setTrendingMatches(trending)
        setTrendingScorers(topScorers.slice(0, 3))
        setFeaturedLeagueName(featuredLeague?.name || 'League')
      } catch (e) {
        if (!active) return
        setError(e?.message || 'Failed to load dashboard data')
      } finally {
        if (active) setLoading(false)
      }
    }

    loadDashboard()

    return () => {
      active = false
    }
  }, [])

  const summaryStats = useMemo(
    () => [
      { ...SUMMARY_CARD_META[0], value: String(summaryCounts.leagues), change: 'positive', changeNumber: '0' },
      { ...SUMMARY_CARD_META[1], value: String(summaryCounts.clubs), change: 'positive', changeNumber: '0' },
      { ...SUMMARY_CARD_META[2], value: String(summaryCounts.referees), change: 'positive', changeNumber: '0' },
      { ...SUMMARY_CARD_META[3], value: String(summaryCounts.scheduled), change: 'positive', changeNumber: '0' },
      { ...SUMMARY_CARD_META[4], value: String(summaryCounts.completed), change: 'positive', changeNumber: '0' }
    ],
    [summaryCounts]
  )

  return (
    <Box sx={{ p: { xs: 3, sm: 4 } }}>
      {/* Hero / Welcome section */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'center', md: 'flex-start' },
          justifyContent: 'space-between',
          gap: 4,
          mb: 5,
          p: { xs: 3, sm: 4 },
          borderRadius: 3,
          background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.08) 0%, rgba(2, 136, 209, 0.04) 50%, transparent 100%)',
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Box sx={{ flex: 1, maxWidth: 520 }}>
          <Typography variant='h4' fontWeight='bold' sx={{ mb: 1 }}>
            Welcome, {firstName}
          </Typography>
          <Typography variant='body1' color='text.secondary' sx={{ mb: 2 }}>
            Federation admin dashboard. Manage leagues, clubs, referees, and matches in one place.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button variant='contained' href='/federation/leagues' startIcon={<i className='ri-trophy-line' />}>
              Leagues
            </Button>
            <Button variant='outlined' href='/federation/matches/schedule' startIcon={<i className='ri-calendar-line' />}>
              Schedule
            </Button>
          </Box>
        </Box>
        <Box sx={{ flexShrink: 0, display: { xs: 'none', md: 'block' } }}>
          <img
            src='/images/illustrations/game-cheering.svg'
            alt='Football'
            style={{ maxHeight: 260, width: 'auto', objectFit: 'contain' }}
          />
        </Box>
      </Box>

      {/* Summary stats */}
      <Typography variant='h6' fontWeight='600' sx={{ mb: 2 }}>
        Overview
      </Typography>
      {error && (
        <Alert severity='error' sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {summaryStats.map((item, i) => (
          <Grid key={i} size={{ xs: 12, sm: 6, lg: 4, xl: 2.4 }}>
            <HorizontalWithSubtitle {...item} />
          </Grid>
        ))}
      </Grid>

      {/* Quick access cards with illustrations */}
      <Typography variant='h6' fontWeight='600' sx={{ mb: 2 }}>
        Quick access
      </Typography>
      <Grid container spacing={3}>
        {QUICK_ACCESS.map((item, i) => (
          <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
            <Card
              sx={{
                height: '100%',
                position: 'relative',
                overflow: 'hidden',
                transition: 'box-shadow 0.2s ease, transform 0.2s ease',
                '&:hover': { boxShadow: 4, transform: 'translateY(-2px)' }
              }}
            >
              <Box sx={{ position: 'absolute', top: 16, right: 16, opacity: 0.12 }}>
                <img src={item.illustration} alt='' style={{ height: 88, width: 'auto' }} />
              </Box>
              <CardContent sx={{ position: 'relative' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <i className={`${item.icon} text-xl`} />
                  </Box>
                  <Typography variant='h6' fontWeight='600'>
                    {item.title}
                  </Typography>
                </Box>
                <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                  {item.description}
                </Typography>
                <Button variant='contained' href={item.href} size='small' fullWidth>
                  Open
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Standings & Most trending */}
      <Typography variant='h6' fontWeight='600' sx={{ mb: 2, mt: 4 }}>
        Standings & trending
      </Typography>
      <Grid container spacing={3}>
        {/* League standings table */}
        <Grid size={{ xs: 12, lg: 7 }}>
          <Card sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
            <Box sx={{ position: 'absolute', top: 12, right: 12, opacity: 0.1 }}>
              <img src='/images/illustrations/football-goal.svg' alt='' style={{ height: 140, width: 'auto' }} />
            </Box>
            <CardHeader
              title={`${featuredLeagueName} standings`}
              subheader='Live from database'
              action={
                <Button size='small' variant='outlined' href='/federation/leagues'>
                  View all
                </Button>
              }
              sx={{ position: 'relative' }}
            />
            <CardContent sx={{ pt: 0, position: 'relative' }}>
              <TableContainer>
                <Table size='small'>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>#</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Team</TableCell>
                      <TableCell align='center' sx={{ fontWeight: 600 }}>P</TableCell>
                      <TableCell align='center' sx={{ fontWeight: 600 }}>W</TableCell>
                      <TableCell align='center' sx={{ fontWeight: 600 }}>D</TableCell>
                      <TableCell align='center' sx={{ fontWeight: 600 }}>L</TableCell>
                      <TableCell align='center' sx={{ fontWeight: 600 }}>GF</TableCell>
                      <TableCell align='center' sx={{ fontWeight: 600 }}>GA</TableCell>
                      <TableCell align='center' sx={{ fontWeight: 600 }}>GD</TableCell>
                      <TableCell align='center' sx={{ fontWeight: 600 }}>Pts</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={10} align='center' sx={{ py: 4 }}>
                          <CircularProgress size={22} />
                        </TableCell>
                      </TableRow>
                    ) : standingsData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} align='center' sx={{ py: 4 }}>
                          No standings data available.
                        </TableCell>
                      </TableRow>
                    ) : (
                      standingsData.map(row => (
                        <TableRow key={`${row.position}-${row.team}`} hover>
                          <TableCell>{row.position}</TableCell>
                          <TableCell>
                            <Typography fontWeight={500}>{row.team}</Typography>
                          </TableCell>
                          <TableCell align='center'>{row.played}</TableCell>
                          <TableCell align='center'>{row.won}</TableCell>
                          <TableCell align='center'>{row.draw}</TableCell>
                          <TableCell align='center'>{row.lost}</TableCell>
                          <TableCell align='center'>{row.goalsFor}</TableCell>
                          <TableCell align='center'>{row.goalsAgainst}</TableCell>
                          <TableCell align='center'>
                            <Typography color={row.goalDiff >= 0 ? 'success.main' : 'error.main'} fontWeight={500}>
                              {row.goalDiff >= 0 ? '+' : ''}
                              {row.goalDiff}
                            </Typography>
                          </TableCell>
                          <TableCell align='center'>
                            <Chip label={row.points} size='small' color='primary' variant='tonal' sx={{ fontWeight: 600, minWidth: 36 }} />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Most trending */}
        <Grid size={{ xs: 12, lg: 5 }}>
          <Card sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
            <Box sx={{ position: 'absolute', bottom: 12, right: 12, opacity: 0.12 }}>
              <img src='/images/illustrations/football-player.svg' alt='' style={{ height: 120, width: 'auto' }} />
            </Box>
            <CardHeader
              title='Most trending'
              subheader='Upcoming matches & top scorers'
              sx={{ position: 'relative' }}
            />
            <CardContent sx={{ pt: 0, position: 'relative' }}>
              <Typography variant='subtitle2' color='text.secondary' sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <i className='ri-fire-line text-warning' /> Trending matches
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                    <CircularProgress size={22} />
                  </Box>
                ) : trendingMatches.length === 0 ? (
                  <Typography variant='body2' color='text.secondary'>
                    No upcoming matches available.
                  </Typography>
                ) : (
                  trendingMatches.map(match => (
                    <Box
                      key={match.id}
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: 'action.hover',
                        border: '1px solid',
                        borderColor: 'divider'
                      }}
                    >
                      <Typography variant='body2' fontWeight={600} color='text.primary'>
                        {match.home} vs {match.away}
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        {match.date} {match.time} - {match.venue}
                      </Typography>
                    </Box>
                  ))
                )}
              </Box>
              <Typography variant='subtitle2' color='text.secondary' sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <i className='ri-medal-line text-primary' /> Top scorers
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
                    <CircularProgress size={22} />
                  </Box>
                ) : trendingScorers.length === 0 ? (
                  <Typography variant='body2' color='text.secondary'>
                    No scorer data available.
                  </Typography>
                ) : (
                  trendingScorers.map((scorer, i) => (
                    <Box
                      key={`${scorer.player}-${scorer.team}-${i}`}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        py: 1,
                        px: 1.5,
                        borderRadius: 2,
                        bgcolor: 'action.hover',
                        border: '1px solid',
                        borderColor: 'divider',
                        borderLeft: i === 0 ? '3px solid' : undefined,
                        borderLeftColor: i === 0 ? 'primary.main' : undefined
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant='body2' fontWeight={600} color='text.primary'>
                          #{i + 1} {scorer.player}
                        </Typography>
                        <Typography variant='caption' color='text.secondary'>
                          ({scorer.team})
                        </Typography>
                      </Box>
                      <Chip label={`${scorer.goals} goals`} size='small' color='success' variant='tonal' />
                    </Box>
                  ))
                )}
              </Box>
              <Button size='small' variant='outlined' href='/federation/matches/past-results' fullWidth sx={{ mt: 2 }}>
                View past results
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default FederationDashboard

