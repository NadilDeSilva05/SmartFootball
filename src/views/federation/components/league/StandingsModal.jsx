'use client'

import { useState } from 'react'
import Box from '@mui/material/Box'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'

const STANDINGS_BY_LEAGUE = {
  '1': [
    { position: 1, team: 'City FC', played: 14, won: 10, draw: 2, lost: 2, goalsFor: 28, goalsAgainst: 12, goalDiff: 16, points: 32 },
    { position: 2, team: 'United SC', played: 14, won: 9, draw: 3, lost: 2, goalsFor: 26, goalsAgainst: 14, goalDiff: 12, points: 30 },
    { position: 3, team: 'Rovers FC', played: 14, won: 7, draw: 4, lost: 3, goalsFor: 22, goalsAgainst: 16, goalDiff: 6, points: 25 },
    { position: 4, team: 'Athletic Club', played: 14, won: 6, draw: 3, lost: 5, goalsFor: 20, goalsAgainst: 19, goalDiff: 1, points: 21 },
    { position: 5, team: 'Stars FC', played: 14, won: 4, draw: 4, lost: 6, goalsFor: 18, goalsAgainst: 22, goalDiff: -4, points: 16 },
    { position: 6, team: 'Dynamo FC', played: 14, won: 1, draw: 2, lost: 11, goalsFor: 10, goalsAgainst: 31, goalDiff: -21, points: 5 }
  ],
  '2': [
    { position: 1, team: 'Eagles FC', played: 12, won: 8, draw: 2, lost: 2, goalsFor: 24, goalsAgainst: 10, goalDiff: 14, points: 26 },
    { position: 2, team: 'Lions SC', played: 12, won: 7, draw: 2, lost: 3, goalsFor: 20, goalsAgainst: 14, goalDiff: 6, points: 23 },
    { position: 3, team: 'Tigers FC', played: 12, won: 5, draw: 4, lost: 3, goalsFor: 18, goalsAgainst: 15, goalDiff: 3, points: 19 }
  ],
  '3': [],
  '4': [
    { position: 1, team: 'City FC', played: 20, won: 14, draw: 4, lost: 2, goalsFor: 42, goalsAgainst: 18, goalDiff: 24, points: 46 },
    { position: 2, team: 'Rovers FC', played: 20, won: 12, draw: 5, lost: 3, goalsFor: 38, goalsAgainst: 22, goalDiff: 16, points: 41 }
  ]
}

const TOP_SCORERS_BY_LEAGUE = {
  '1': [
    { position: 1, player: 'A. Silva', team: 'City FC', goals: 12 },
    { position: 2, player: 'B. Fernando', team: 'United SC', goals: 10 },
    { position: 3, player: 'C. Perera', team: 'Rovers FC', goals: 9 },
    { position: 4, player: 'D. Gomes', team: 'Athletic Club', goals: 7 },
    { position: 5, player: 'E. Wilson', team: 'Stars FC', goals: 6 }
  ],
  '2': [
    { position: 1, player: 'F. Martinez', team: 'Eagles FC', goals: 8 },
    { position: 2, player: 'G. Rodriguez', team: 'Lions SC', goals: 6 }
  ],
  '3': [],
  '4': [
    { position: 1, player: 'A. Silva', team: 'City FC', goals: 15 },
    { position: 2, player: 'H. Brown', team: 'Rovers FC', goals: 11 }
  ]
}

const TOP_ASSISTS_BY_LEAGUE = {
  '1': [
    { position: 1, player: 'J. Clark', team: 'City FC', assists: 9 },
    { position: 2, player: 'K. White', team: 'United SC', assists: 8 },
    { position: 3, player: 'L. Green', team: 'Rovers FC', assists: 6 },
    { position: 4, player: 'M. Hall', team: 'Athletic Club', assists: 5 },
    { position: 5, player: 'N. Lee', team: 'Stars FC', assists: 4 }
  ],
  '2': [
    { position: 1, player: 'P. Davis', team: 'Eagles FC', assists: 5 },
    { position: 2, player: 'Q. Taylor', team: 'Lions SC', assists: 4 }
  ],
  '3': [],
  '4': [
    { position: 1, player: 'J. Clark', team: 'City FC', assists: 10 },
    { position: 2, player: 'R. Moore', team: 'Rovers FC', assists: 7 }
  ]
}

export default function StandingsModal ({ open, onClose, league }) {
  const [tabValue, setTabValue] = useState(0)
  const leagueId = league?.id
  const standings = leagueId ? (STANDINGS_BY_LEAGUE[leagueId] || []) : []
  const topScorers = leagueId ? (TOP_SCORERS_BY_LEAGUE[leagueId] || []) : []
  const topAssists = leagueId ? (TOP_ASSISTS_BY_LEAGUE[leagueId] || []) : []

  const handleClose = () => {
    setTabValue(0)
    onClose()
  }

  const getPositionSx = position => {
    if (position === 1) return { fontWeight: 700, color: 'primary.main' }
    if (position === 2) return { fontWeight: 600, color: 'text.secondary' }
    if (position === 3) return { fontWeight: 600, color: 'warning.main' }
    return {}
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='md' fullWidth scroll='paper' PaperProps={{ sx: { borderRadius: 2 } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 1, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 40, height: 40, borderRadius: 1, bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className='ri-trophy-line text-white text-2xl' />
          </Box>
          <Box>
            <Typography variant='h6'>{league?.name ?? 'League'} – Standings</Typography>
            <Typography variant='caption' color='text.secondary'>{league?.season ?? ''}</Typography>
          </Box>
        </Box>
        <IconButton onClick={handleClose} size='small' aria-label='close'>
          <i className='ri-close-line' />
        </IconButton>
      </DialogTitle>
      <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
        <Tab icon={<i className='ri-table-line' />} iconPosition='start' label='Points table' />
        <Tab icon={<i className='ri-football-line' />} iconPosition='start' label='Top scorers' />
        <Tab icon={<i className='ri-hand-heart-line' />} iconPosition='start' label='Top assists' />
      </Tabs>
      <DialogContent sx={{ p: 0 }}>
        {tabValue === 0 && (
          <TableContainer sx={{ maxHeight: 440 }}>
            <Table stickyHeader size='small'>
              <TableHead>
                <TableRow sx={{ bgcolor: 'action.hover' }}>
                  <TableCell align='center' sx={{ fontWeight: 700, width: 48 }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Team</TableCell>
                  <TableCell align='center' sx={{ fontWeight: 700 }}>P</TableCell>
                  <TableCell align='center' sx={{ fontWeight: 700 }}>W</TableCell>
                  <TableCell align='center' sx={{ fontWeight: 700 }}>D</TableCell>
                  <TableCell align='center' sx={{ fontWeight: 700 }}>L</TableCell>
                  <TableCell align='center' sx={{ fontWeight: 700 }}>GF</TableCell>
                  <TableCell align='center' sx={{ fontWeight: 700 }}>GA</TableCell>
                  <TableCell align='center' sx={{ fontWeight: 700 }}>GD</TableCell>
                  <TableCell align='center' sx={{ fontWeight: 700, bgcolor: 'primary.main', color: 'primary.contrastText' }}>Pts</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {standings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} align='center' sx={{ py: 4 }}>No standings data for this league.</TableCell>
                  </TableRow>
                ) : (
                  standings.map(row => (
                    <TableRow
                      key={row.team}
                      sx={{
                        '&:nth-of-type(even)': { bgcolor: 'action.hover' },
                        '&:hover': { bgcolor: 'action.selected' }
                      }}
                    >
                      <TableCell align='center' sx={{ ...getPositionSx(row.position), width: 48 }}>{row.position}</TableCell>
                      <TableCell sx={{ fontWeight: row.position <= 3 ? 600 : 400 }}>{row.team}</TableCell>
                      <TableCell align='center'>{row.played}</TableCell>
                      <TableCell align='center'>{row.won}</TableCell>
                      <TableCell align='center'>{row.draw}</TableCell>
                      <TableCell align='center'>{row.lost}</TableCell>
                      <TableCell align='center'>{row.goalsFor}</TableCell>
                      <TableCell align='center'>{row.goalsAgainst}</TableCell>
                      <TableCell align='center' sx={{ color: row.goalDiff > 0 ? 'success.main' : row.goalDiff < 0 ? 'error.main' : 'text.secondary' }}>{row.goalDiff > 0 ? '+' : ''}{row.goalDiff}</TableCell>
                      <TableCell align='center' sx={{ fontWeight: 700, bgcolor: 'primary.main', color: 'primary.contrastText' }}>{row.points}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        {tabValue === 1 && (
          <TableContainer sx={{ maxHeight: 440 }}>
            <Table stickyHeader size='small'>
              <TableHead>
                <TableRow sx={{ bgcolor: 'action.hover' }}>
                  <TableCell align='center' sx={{ fontWeight: 700, width: 48 }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Player</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Team</TableCell>
                  <TableCell align='center' sx={{ fontWeight: 700, bgcolor: 'success.dark', color: 'success.contrastText' }}>Goals</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {topScorers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align='center' sx={{ py: 4 }}>No top scorers data for this league.</TableCell>
                  </TableRow>
                ) : (
                  topScorers.map(row => (
                    <TableRow
                      key={`${row.player}-${row.team}`}
                      sx={{
                        '&:nth-of-type(even)': { bgcolor: 'action.hover' },
                        '&:hover': { bgcolor: 'action.selected' }
                      }}
                    >
                      <TableCell align='center' sx={{ ...getPositionSx(row.position), width: 48 }}>{row.position}</TableCell>
                      <TableCell sx={{ fontWeight: row.position <= 3 ? 600 : 400 }}>{row.player}</TableCell>
                      <TableCell>{row.team}</TableCell>
                      <TableCell align='center' sx={{ fontWeight: 700, bgcolor: 'success.main', color: 'success.contrastText' }}>{row.goals}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        {tabValue === 2 && (
          <TableContainer sx={{ maxHeight: 440 }}>
            <Table stickyHeader size='small'>
              <TableHead>
                <TableRow sx={{ bgcolor: 'action.hover' }}>
                  <TableCell align='center' sx={{ fontWeight: 700, width: 48 }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Player</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Team</TableCell>
                  <TableCell align='center' sx={{ fontWeight: 700, bgcolor: 'info.dark', color: 'info.contrastText' }}>Assists</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {topAssists.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align='center' sx={{ py: 4 }}>No assists data for this league.</TableCell>
                  </TableRow>
                ) : (
                  topAssists.map(row => (
                    <TableRow
                      key={`${row.player}-${row.team}`}
                      sx={{
                        '&:nth-of-type(even)': { bgcolor: 'action.hover' },
                        '&:hover': { bgcolor: 'action.selected' }
                      }}
                    >
                      <TableCell align='center' sx={{ ...getPositionSx(row.position), width: 48 }}>{row.position}</TableCell>
                      <TableCell sx={{ fontWeight: row.position <= 3 ? 600 : 400 }}>{row.player}</TableCell>
                      <TableCell>{row.team}</TableCell>
                      <TableCell align='center' sx={{ fontWeight: 700, bgcolor: 'info.main', color: 'info.contrastText' }}>{row.assists}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
    </Dialog>
  )
}
