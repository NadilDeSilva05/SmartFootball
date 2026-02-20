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

// Current club (can come from auth/context later)
const MY_CLUB = 'City FC'

const SUMMARY_STATS = [
  { title: 'Players', value: '24', avatarIcon: 'ri-user-line', avatarColor: 'primary', change: 'positive', changeNumber: '3', subTitle: 'Squad size' },
  { title: 'Coaches', value: '8', avatarIcon: 'ri-user-star-line', avatarColor: 'secondary', change: 'positive', changeNumber: '1', subTitle: 'Staff' },
  { title: 'Upcoming', value: '5', avatarIcon: 'ri-calendar-line', avatarColor: 'info', change: 'positive', changeNumber: '2', subTitle: 'Next fixtures' },
  { title: 'Played', value: '14', avatarIcon: 'ri-calendar-check-line', avatarColor: 'success', change: 'positive', changeNumber: '4', subTitle: 'Matches played' },
  { title: 'League position', value: '1st', avatarIcon: 'ri-trophy-line', avatarColor: 'warning', change: 'positive', changeNumber: '0', subTitle: 'Premier League' }
]

const STANDINGS_DATA = [
  { position: 1, team: 'City FC', played: 14, won: 10, draw: 2, lost: 2, goalsFor: 28, goalsAgainst: 12, goalDiff: 16, points: 32 },
  { position: 2, team: 'United SC', played: 14, won: 9, draw: 3, lost: 2, goalsFor: 26, goalsAgainst: 14, goalDiff: 12, points: 30 },
  { position: 3, team: 'Rovers FC', played: 14, won: 7, draw: 4, lost: 3, goalsFor: 22, goalsAgainst: 16, goalDiff: 6, points: 25 },
  { position: 4, team: 'Athletic Club', played: 14, won: 6, draw: 3, lost: 5, goalsFor: 20, goalsAgainst: 19, goalDiff: 1, points: 21 },
  { position: 5, team: 'Stars FC', played: 14, won: 4, draw: 4, lost: 6, goalsFor: 18, goalsAgainst: 22, goalDiff: -4, points: 16 },
  { position: 6, team: 'Dynamo FC', played: 14, won: 1, draw: 2, lost: 11, goalsFor: 10, goalsAgainst: 31, goalDiff: -21, points: 5 }
]

const TOP_SCORERS = [
  { position: 1, player: 'A. Silva', team: 'City FC', goals: 12 },
  { position: 2, player: 'B. Fernando', team: 'United SC', goals: 10 },
  { position: 3, player: 'C. Perera', team: 'Rovers FC', goals: 9 },
  { position: 4, player: 'D. Gomes', team: 'Athletic Club', goals: 7 },
  { position: 5, player: 'E. Wilson', team: 'Stars FC', goals: 6 }
]

const TOP_ASSISTS = [
  { position: 1, player: 'J. Clark', team: 'City FC', assists: 9 },
  { position: 2, player: 'K. White', team: 'United SC', assists: 8 },
  { position: 3, player: 'L. Green', team: 'Rovers FC', assists: 6 },
  { position: 4, player: 'M. Hall', team: 'Athletic Club', assists: 5 },
  { position: 5, player: 'N. Lee', team: 'Stars FC', assists: 4 }
]

const QUICK_ACCESS = [
  { title: 'Players', description: 'Manage squad, registrations, and player details.', href: '/club/players', icon: 'ri-user-line', illustration: '/images/illustrations/football-player.svg' },
  { title: 'Coaches', description: 'Manage coaching staff and licenses.', href: '/club/coaches', icon: 'ri-user-star-line', illustration: '/images/illustrations/fitness-stats.svg' },
  { title: 'Upcoming matches', description: 'View and follow next fixtures.', href: '/club/matches/upcoming', icon: 'ri-calendar-line', illustration: '/images/illustrations/game-cheering.svg' },
  { title: 'Past results', description: 'View match results and statistics.', href: '/club/matches/past', icon: 'ri-calendar-check-line', illustration: '/images/illustrations/sports-core.svg' }
]

const ClubDashboard = () => {
  const user = useSelector(state => state?.authenticationReducer?.loginData?.user)
  const firstName = user?.fullName?.split(' ')[0] || user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'Club Admin'

  const isMyClub = team => team === MY_CLUB

  return (
    <Box sx={{ p: { xs: 3, sm: 4 } }}>
      {/* Hero / Welcome */}
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
          background: 'linear-gradient(135deg, rgba(46, 125, 50, 0.1) 0%, rgba(27, 94, 32, 0.05) 50%, transparent 100%)',
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Box sx={{ flex: 1, maxWidth: 520 }}>
          <Typography variant='h4' fontWeight='bold' sx={{ mb: 1 }}>
            {MY_CLUB}
          </Typography>
          <Typography variant='body1' color='text.secondary' sx={{ mb: 2 }}>
            Welcome, {firstName}. Overview of your club&apos;s squad, fixtures, and league position.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button variant='contained' href='/club/players' startIcon={<i className='ri-user-line' />}>
              Players
            </Button>
            <Button variant='outlined' href='/club/matches/upcoming' startIcon={<i className='ri-calendar-line' />}>
              Fixtures
            </Button>
          </Box>
        </Box>
        <Box sx={{ flexShrink: 0, display: { xs: 'none', md: 'block' } }}>
          <img
            src='/images/illustrations/football-player.svg'
            alt='Club'
            style={{ maxHeight: 240, width: 'auto', objectFit: 'contain' }}
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

      {/* Standings + Top scorers & assists */}
      <Typography variant='h6' fontWeight='600' sx={{ mb: 2 }}>
        League &amp; your players
      </Typography>
      <Grid container spacing={3}>
        {/* Standings – highlight our club */}
        <Grid size={{ xs: 12, lg: 7 }}>
          <Card sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
            <Box sx={{ position: 'absolute', top: 12, right: 12, opacity: 0.1 }}>
              <img src='/images/illustrations/football-goal.svg' alt='' style={{ height: 140, width: 'auto' }} />
            </Box>
            <CardHeader
              title='Premier League standings'
              subheader='2024-25 · Your club highlighted'
              action={
                <Button size='small' variant='outlined' href='/club/matches/past'>
                  Past results
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
                    {STANDINGS_DATA.map(row => {
                      const highlight = isMyClub(row.team)
                      return (
                        <TableRow
                          key={row.position}
                          hover
                          sx={{
                            ...(highlight && {
                              bgcolor: 'action.selected',
                              borderLeft: '4px solid',
                              borderLeftColor: 'primary.main'
                            })
                          }}
                        >
                          <TableCell>{row.position}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography fontWeight={500}>{row.team}</Typography>
                              {highlight && (
                                <Chip label='Your club' size='small' color='primary' sx={{ height: 20, fontSize: '0.7rem' }} />
                              )}
                            </Box>
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
                      )
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Top scorers & assists – highlight our players */}
        <Grid size={{ xs: 12, lg: 5 }}>
          <Card sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
            <Box sx={{ position: 'absolute', bottom: 12, right: 12, opacity: 0.12 }}>
              <img src='/images/illustrations/small-child-football-player.svg' alt='' style={{ height: 100, width: 'auto' }} />
            </Box>
            <CardHeader
              title='Top scorers & assists'
              subheader='Your players highlighted'
              sx={{ position: 'relative' }}
            />
            <CardContent sx={{ pt: 0, position: 'relative' }}>
              <Typography variant='subtitle2' color='text.secondary' sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <i className='ri-medal-line text-primary' /> Top scorers
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
                {TOP_SCORERS.map((s, i) => {
                  const myPlayer = isMyClub(s.team)
                  return (
                    <Box
                      key={i}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        py: 1,
                        px: 1.5,
                        borderRadius: 2,
                        bgcolor: myPlayer ? 'action.selected' : 'action.hover',
                        border: '1px solid',
                        borderColor: myPlayer ? 'primary.main' : 'divider',
                        ...(myPlayer && { borderLeft: '3px solid', borderLeftColor: 'primary.main' })
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant='body2' fontWeight={600} color='text.primary'>
                          #{s.position} {s.player}
                        </Typography>
                        {myPlayer && <Chip label={MY_CLUB} size='small' color='primary' sx={{ height: 18, fontSize: '0.65rem' }} />}
                        {!myPlayer && <Typography variant='caption' color='text.secondary'>({s.team})</Typography>}
                      </Box>
                      <Chip label={`${s.goals} goals`} size='small' color='success' variant='tonal' />
                    </Box>
                  )
                })}
              </Box>
              <Typography variant='subtitle2' color='text.secondary' sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <i className='ri-team-line text-info' /> Top assists
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {TOP_ASSISTS.map((a, i) => {
                  const myPlayer = isMyClub(a.team)
                  return (
                    <Box
                      key={i}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        py: 1,
                        px: 1.5,
                        borderRadius: 2,
                        bgcolor: myPlayer ? 'action.selected' : 'action.hover',
                        border: '1px solid',
                        borderColor: myPlayer ? 'primary.main' : 'divider',
                        ...(myPlayer && { borderLeft: '3px solid', borderLeftColor: 'primary.main' })
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant='body2' fontWeight={600} color='text.primary'>
                          #{a.position} {a.player}
                        </Typography>
                        {myPlayer && <Chip label={MY_CLUB} size='small' color='primary' sx={{ height: 18, fontSize: '0.65rem' }} />}
                        {!myPlayer && <Typography variant='caption' color='text.secondary'>({a.team})</Typography>}
                      </Box>
                      <Chip label={`${a.assists} assists`} size='small' color='info' variant='tonal' />
                    </Box>
                  )
                })}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick access */}
      <Typography variant='h6' fontWeight='600' sx={{ mb: 2, mt: 4 }}>
        Quick access
      </Typography>
      <Grid container spacing={3}>
        {QUICK_ACCESS.map((item, i) => (
          <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
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
                <img src={item.illustration} alt='' style={{ height: 72, width: 'auto' }} />
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
