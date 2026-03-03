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
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import HorizontalWithSubtitle from '@components/card-statistics/HorizontalWithSubtitle'

const QUICK_ACCESS = [
  {
    title: 'Players',
    description: 'Manage squad registration and player details.',
    href: '/club/players',
    icon: 'ri-user-line',
    illustration: '/images/illustrations/football-player.svg'
  },
  {
    title: 'Coaches',
    description: 'Manage coaching staff and licenses.',
    href: '/club/coaches',
    icon: 'ri-user-star-line',
    illustration: '/images/illustrations/fitness-stats.svg'
  },
  {
    title: 'Upcoming Matches',
    description: 'View your next scheduled fixtures.',
    href: '/club/matches/upcoming',
    icon: 'ri-calendar-line',
    illustration: '/images/illustrations/game-cheering.svg'
  },
  {
    title: 'Past Results',
    description: 'Review completed matches and outcomes.',
    href: '/club/matches/past',
    icon: 'ri-calendar-check-line',
    illustration: '/images/illustrations/sports-core.svg'
  }
]

const resolveCurrentClub = (clubs, user) => {
  if (!Array.isArray(clubs) || clubs.length === 0 || !user) return null

  const userClubIds = [user?.clubId, user?.clubDocId, user?.club?.id]
    .map(value => String(value || '').trim())
    .filter(Boolean)
  const userUids = [user?.uid, user?.id, user?.userId, user?.adminUserId]
    .map(value => String(value || '').trim())
    .filter(Boolean)
  const userEmails = [user?.email, user?.emailAddress, user?.adminEmail]
    .map(value => String(value || '').trim().toLowerCase())
    .filter(Boolean)

  const byUserClubId = userClubIds.length
    ? clubs.find(club => {
      const clubDocId = String(club?.id || '').trim()
      const businessClubId = String(club?.clubId || '').trim()
      return userClubIds.includes(clubDocId) || userClubIds.includes(businessClubId)
    })
    : null
  if (byUserClubId) return byUserClubId

  const byAdminUid = userUids.length
    ? clubs.find(club => userUids.includes(String(club?.adminUserId || '').trim()))
    : null
  if (byAdminUid) return byAdminUid

  return userEmails.length
    ? clubs.find(club => userEmails.includes(String(club?.adminEmail || '').trim().toLowerCase())) || null
    : null
}

const fetchJson = async (url, options = {}) => {
  const res = await fetch(url, { cache: 'no-store', ...options })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data?.error || `Request failed: ${url}`)
  return data
}

const formatDate = value => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('en-US', { day: '2-digit', month: 'short', year: 'numeric' }).format(date)
}

const ClubDashboard = () => {
  const user = useSelector(state => state?.authenticationReducer?.loginData?.user)
  const token = useSelector(state => state?.authenticationReducer?.loginData?.token)
  const firstName = user?.fullName?.split(' ')[0] || user?.email?.split('@')[0] || 'Club Admin'

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [club, setClub] = useState(null)
  const [leagueMap, setLeagueMap] = useState({})
  const [players, setPlayers] = useState([])
  const [coaches, setCoaches] = useState([])
  const [clubMatches, setClubMatches] = useState([])
  const [standings, setStandings] = useState([])
  const [topScorers, setTopScorers] = useState([])

  useEffect(() => {
    let active = true

    const loadDashboard = async () => {
      try {
        setLoading(true)
        setError('')

        const [clubs, leagues] = await Promise.all([
          fetchJson('/api/clubs'),
          fetchJson('/api/leagues')
        ])

        let me = user
        let currentClub = resolveCurrentClub(Array.isArray(clubs) ? clubs : [], me)

        if (!currentClub && token) {
          me = await fetchJson('/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          })
          currentClub = resolveCurrentClub(Array.isArray(clubs) ? clubs : [], me)
        }

        if (!currentClub?.id) {
          throw new Error('Could not resolve your club for this account')
        }

        const leagueLookup = {}
        ;(Array.isArray(leagues) ? leagues : []).forEach(league => {
          leagueLookup[league.id] = league.name || '-'
        })

        const [playersRes, coachesRes, matchesRes, standingsRes] = await Promise.all([
          fetchJson(`/api/club-players?clubId=${encodeURIComponent(currentClub.id)}`),
          fetchJson(`/api/club-coaches?clubId=${encodeURIComponent(currentClub.id)}`),
          fetchJson('/api/matches'),
          fetchJson(
            currentClub.league
              ? `/api/standings?leagueId=${encodeURIComponent(currentClub.league)}`
              : '/api/standings'
          )
        ])

        const allMatches = Array.isArray(matchesRes) ? matchesRes : []
        const ownMatches = allMatches
          .filter(match => match.homeClubId === currentClub.id || match.awayClubId === currentClub.id)
          .sort((a, b) => String(b.matchDate || '').localeCompare(String(a.matchDate || '')))

        if (!active) return

        setClub(currentClub)
        setLeagueMap(leagueLookup)
        setPlayers(Array.isArray(playersRes) ? playersRes : [])
        setCoaches(Array.isArray(coachesRes) ? coachesRes : [])
        setClubMatches(ownMatches)
        setStandings(Array.isArray(standingsRes?.standings) ? standingsRes.standings : [])
        setTopScorers(Array.isArray(standingsRes?.topScorers) ? standingsRes.topScorers.slice(0, 5) : [])
      } catch (e) {
        if (!active) return
        setError(e?.message || 'Failed to load club dashboard')
      } finally {
        if (active) setLoading(false)
      }
    }

    loadDashboard()

    return () => {
      active = false
    }
  }, [user, token])

  const playedMatches = useMemo(
    () => clubMatches.filter(match => (match.status || '') === 'played'),
    [clubMatches]
  )
  const upcomingMatches = useMemo(
    () => clubMatches.filter(match => (match.status || 'scheduled') === 'scheduled'),
    [clubMatches]
  )

  const standingRow = useMemo(
    () => standings.find(row => row.clubId === club?.id) || null,
    [standings, club]
  )

  const summaryStats = useMemo(
    () => [
      { title: 'Players', value: String(players.length), avatarIcon: 'ri-user-line', avatarColor: 'primary', change: 'neutral', changeNumber: '0', subTitle: 'Registered squad' },
      { title: 'Coaches', value: String(coaches.length), avatarIcon: 'ri-user-star-line', avatarColor: 'secondary', change: 'neutral', changeNumber: '0', subTitle: 'Coaching staff' },
      { title: 'Upcoming', value: String(upcomingMatches.length), avatarIcon: 'ri-calendar-line', avatarColor: 'info', change: 'neutral', changeNumber: '0', subTitle: 'Scheduled matches' },
      { title: 'Played', value: String(playedMatches.length), avatarIcon: 'ri-calendar-check-line', avatarColor: 'success', change: 'neutral', changeNumber: '0', subTitle: 'Completed matches' },
      { title: 'League Position', value: standingRow ? `#${standingRow.position}` : '-', avatarIcon: 'ri-trophy-line', avatarColor: 'warning', change: 'neutral', changeNumber: '0', subTitle: 'Current table rank' }
    ],
    [players.length, coaches.length, upcomingMatches.length, playedMatches.length, standingRow]
  )

  return (
    <Box sx={{ p: { xs: 3, sm: 4 } }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          gap: 4,
          mb: 4,
          p: { xs: 3, sm: 4 },
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          background: 'linear-gradient(135deg, rgba(46, 125, 50, 0.1) 0%, rgba(27, 94, 32, 0.05) 50%, transparent 100%)'
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Typography variant='h4' fontWeight='bold' sx={{ mb: 1 }}>
            {club?.clubName || 'Club Dashboard'}
          </Typography>
          <Typography variant='body1' color='text.secondary' sx={{ mb: 2 }}>
            Welcome, {firstName}. Track your club profile, admin details, and performance in one place.
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            <Chip label={`League: ${leagueMap[club?.league] || '-'}`} color='primary' variant='tonal' />
            <Chip label={`City: ${club?.city || '-'}`} variant='tonal' />
            <Chip label={`Status: ${club?.status || '-'}`} variant='tonal' color={club?.status === 'active' ? 'success' : 'warning'} />
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {club?.logo ? (
            <Box
              component='img'
              src={club.logo}
              alt='Club logo'
              sx={{ width: 90, height: 90, borderRadius: 2, objectFit: 'contain', bgcolor: 'background.paper', p: 1, border: '1px solid', borderColor: 'divider' }}
            />
          ) : (
            <Box sx={{ width: 90, height: 90, borderRadius: 2, border: '1px dashed', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className='ri-shield-line text-3xl text-textSecondary' />
            </Box>
          )}
        </Box>
      </Box>

      {error && (
        <Alert severity='error' sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Typography variant='h6' fontWeight='600' sx={{ mb: 2 }}>
        Overview
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {summaryStats.map((item, i) => (
          <Grid key={i} size={{ xs: 12, sm: 6, lg: 4, xl: 2.4 }}>
            <HorizontalWithSubtitle {...item} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ height: '100%' }}>
            <CardHeader title='Club Admin Details' />
            <CardContent>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                  <CircularProgress size={22} />
                </Box>
              ) : (
                <Box sx={{ display: 'grid', gridTemplateColumns: '140px 1fr', rowGap: 1.2, columnGap: 2 }}>
                  <Typography color='text.secondary'>Club Name</Typography><Typography>{club?.clubName || '-'}</Typography>
                  <Typography color='text.secondary'>Admin Name</Typography><Typography>{club?.adminFullName || user?.fullName || '-'}</Typography>
                  <Typography color='text.secondary'>Admin Email</Typography><Typography>{club?.adminEmail || user?.email || '-'}</Typography>
                  <Typography color='text.secondary'>Club ID</Typography><Typography>{club?.clubId || club?.id || '-'}</Typography>
                  <Typography color='text.secondary'>City</Typography><Typography>{club?.city || '-'}</Typography>
                  <Typography color='text.secondary'>League</Typography><Typography>{leagueMap[club?.league] || '-'}</Typography>
                  <Typography color='text.secondary'>Status</Typography><Typography>{club?.status || '-'}</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <Card sx={{ height: '100%' }}>
            <CardHeader title='League Standings' subheader='Current competition table' />
            <CardContent sx={{ pt: 0 }}>
              <TableContainer>
                <Table size='small'>
                  <TableHead>
                    <TableRow>
                      <TableCell>#</TableCell>
                      <TableCell>Team</TableCell>
                      <TableCell align='center'>P</TableCell>
                      <TableCell align='center'>W</TableCell>
                      <TableCell align='center'>D</TableCell>
                      <TableCell align='center'>L</TableCell>
                      <TableCell align='center'>Pts</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7} align='center'>
                          <CircularProgress size={20} />
                        </TableCell>
                      </TableRow>
                    ) : standings.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align='center'>No standings data</TableCell>
                      </TableRow>
                    ) : (
                      standings.slice(0, 8).map(row => (
                        <TableRow
                          key={row.clubId || row.position}
                          sx={row.clubId === club?.id ? { bgcolor: 'action.selected' } : undefined}
                        >
                          <TableCell>{row.position}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography>{row.team}</Typography>
                              {row.clubId === club?.id && <Chip size='small' label='Your Club' color='primary' sx={{ height: 18, fontSize: '0.65rem' }} />}
                            </Box>
                          </TableCell>
                          <TableCell align='center'>{row.played}</TableCell>
                          <TableCell align='center'>{row.won}</TableCell>
                          <TableCell align='center'>{row.draw}</TableCell>
                          <TableCell align='center'>{row.lost}</TableCell>
                          <TableCell align='center'>{row.points}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card>
            <CardHeader title='Recent Club Matches' />
            <CardContent sx={{ pt: 0 }}>
              <TableContainer>
                <Table size='small'>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Match</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align='center'>Score</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={4} align='center'>
                          <CircularProgress size={20} />
                        </TableCell>
                      </TableRow>
                    ) : clubMatches.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align='center'>No matches found for this club</TableCell>
                      </TableRow>
                    ) : (
                      clubMatches.slice(0, 8).map(match => (
                        <TableRow key={match.id}>
                          <TableCell>{formatDate(match.matchDate)}</TableCell>
                          <TableCell>
                            {match.homeClubId === club?.id ? 'Home' : 'Away'} match
                          </TableCell>
                          <TableCell>
                            <Chip
                              size='small'
                              label={match.status || 'scheduled'}
                              color={(match.status || 'scheduled') === 'played' ? 'success' : 'info'}
                              variant='tonal'
                            />
                          </TableCell>
                          <TableCell align='center'>
                            {(match.status || '') === 'played'
                              ? `${match.homeScore ?? 0} - ${match.awayScore ?? 0}`
                              : '-'}
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
        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ height: '100%' }}>
            <CardHeader title='Top Scorers' subheader='From current standings feed' />
            <CardContent>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                  <CircularProgress size={22} />
                </Box>
              ) : topScorers.length === 0 ? (
                <Typography color='text.secondary'>No scorer data available.</Typography>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {topScorers.map((item, idx) => (
                    <Box
                      key={`${item.player}-${idx}`}
                      sx={{
                        px: 1.5,
                        py: 1,
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        bgcolor: 'action.hover',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <Box>
                        <Typography variant='body2' fontWeight={600}>
                          #{idx + 1} {item.player}
                        </Typography>
                        <Typography variant='caption' color='text.secondary'>
                          {item.team}
                        </Typography>
                      </Box>
                      <Chip label={`${item.goals} goals`} size='small' color='success' variant='tonal' />
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Typography variant='h6' fontWeight='600' sx={{ mb: 2 }}>
        Quick Access
      </Typography>
      <Grid container spacing={3}>
        {QUICK_ACCESS.map((item, idx) => (
          <Grid key={idx} size={{ xs: 12, sm: 6, md: 3 }}>
            <Card
              sx={{
                height: '100%',
                position: 'relative',
                overflow: 'hidden',
                transition: 'box-shadow 0.2s ease, transform 0.2s ease',
                '&:hover': { boxShadow: 4, transform: 'translateY(-2px)' }
              }}
            >
              <Box sx={{ position: 'absolute', top: 12, right: 12, opacity: 0.12 }}>
                <img src={item.illustration} alt='' style={{ height: 64, width: 'auto' }} />
              </Box>
              <CardContent sx={{ position: 'relative' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: 2,
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <i className={`${item.icon} text-lg`} />
                  </Box>
                  <Typography variant='subtitle1' fontWeight='600'>
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
    </Box>
  )
}

export default ClubDashboard
