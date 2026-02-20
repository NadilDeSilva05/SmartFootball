'use client'

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
import HorizontalWithSubtitle from '@components/card-statistics/HorizontalWithSubtitle'

// Premier League standings (sample)
const STANDINGS_DATA = [
  { position: 1, team: 'City FC', played: 14, won: 10, draw: 2, lost: 2, goalsFor: 28, goalsAgainst: 12, goalDiff: 16, points: 32 },
  { position: 2, team: 'United SC', played: 14, won: 9, draw: 3, lost: 2, goalsFor: 26, goalsAgainst: 14, goalDiff: 12, points: 30 },
  { position: 3, team: 'Rovers FC', played: 14, won: 7, draw: 4, lost: 3, goalsFor: 22, goalsAgainst: 16, goalDiff: 6, points: 25 },
  { position: 4, team: 'Athletic Club', played: 14, won: 6, draw: 3, lost: 5, goalsFor: 20, goalsAgainst: 19, goalDiff: 1, points: 21 },
  { position: 5, team: 'Stars FC', played: 14, won: 4, draw: 4, lost: 6, goalsFor: 18, goalsAgainst: 22, goalDiff: -4, points: 16 }
]

// Trending: upcoming matches & top scorers
const TRENDING_MATCHES = [
  { home: 'City FC', away: 'United SC', date: 'Sat 22 Feb', time: '15:00', venue: 'National Stadium' },
  { home: 'Rovers FC', away: 'Athletic Club', date: 'Sun 23 Feb', time: '17:00', venue: 'City Arena' },
  { home: 'Stars FC', away: 'Dynamo FC', date: 'Mon 24 Feb', time: '14:00', venue: 'Regional Ground' }
]

const TRENDING_SCORERS = [
  { player: 'A. Silva', team: 'City FC', goals: 12, trend: 'up' },
  { player: 'B. Fernando', team: 'United SC', goals: 10, trend: 'up' },
  { player: 'C. Perera', team: 'Rovers FC', goals: 9, trend: 'same' }
]

// Summary stats for federation overview (can be replaced with real API data later)
const SUMMARY_STATS = [
  { title: 'Leagues', value: '4', avatarIcon: 'ri-trophy-line', avatarColor: 'primary', change: 'positive', changeNumber: '0', subTitle: 'Active competitions' },
  { title: 'Clubs', value: '12', avatarIcon: 'ri-building-line', avatarColor: 'secondary', change: 'positive', changeNumber: '2', subTitle: 'Registered clubs' },
  { title: 'Referees', value: '18', avatarIcon: 'ri-user-star-line', avatarColor: 'success', change: 'positive', changeNumber: '3', subTitle: 'Licensed referees' },
  { title: 'Scheduled', value: '24', avatarIcon: 'ri-calendar-line', avatarColor: 'info', change: 'positive', changeNumber: '5', subTitle: 'Upcoming matches' },
  { title: 'Completed', value: '48', avatarIcon: 'ri-calendar-check-line', avatarColor: 'warning', change: 'positive', changeNumber: '12', subTitle: 'Past results' }
]

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

const FederationDashboard = () => {
  const user = useSelector(state => state?.authenticationReducer?.loginData?.user)
  const firstName = user?.fullName?.split(' ')[0] || user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'Admin'

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
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {SUMMARY_STATS.map((item, i) => (
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
              title='Premier League standings'
              subheader='2024-25 season'
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
                    {STANDINGS_DATA.map(row => (
                      <TableRow key={row.position} hover>
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
                            {row.goalDiff >= 0 ? '+' : ''}{row.goalDiff}
                          </Typography>
                        </TableCell>
                        <TableCell align='center'>
                          <Chip label={row.points} size='small' color='primary' variant='tonal' sx={{ fontWeight: 600, minWidth: 36 }} />
                        </TableCell>
                      </TableRow>
                    ))}
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
                {TRENDING_MATCHES.map((m, i) => (
                  <Box
                    key={i}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: 'action.hover',
                      border: '1px solid',
                      borderColor: 'divider'
                    }}
                  >
                    <Typography variant='body2' fontWeight={600} color='text.primary'>
                      {m.home} vs {m.away}
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      {m.date} {m.time} · {m.venue}
                    </Typography>
                  </Box>
                ))}
              </Box>
              <Typography variant='subtitle2' color='text.secondary' sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <i className='ri-medal-line text-primary' /> Top scorers
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {TRENDING_SCORERS.map((s, i) => (
                  <Box
                    key={i}
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
                        #{i + 1} {s.player}
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>({s.team})</Typography>
                    </Box>
                    <Chip label={`${s.goals} goals`} size='small' color='success' variant='tonal' />
                  </Box>
                ))}
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
