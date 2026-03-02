'use client'

import { useState, useEffect, useCallback } from 'react'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
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

export default function StandingsModal ({ open, onClose, league }) {
  const [tabValue, setTabValue] = useState(0)
  const [standings, setStandings] = useState([])
  const [topScorers, setTopScorers] = useState([])
  const [loading, setLoading] = useState(false)
  const [topAssists] = useState([])
  const leagueId = league?.id

  const fetchStandings = useCallback(async () => {
    if (!leagueId || !open) return
    setLoading(true)
    try {
      const url = leagueId ? `/api/standings?leagueId=${encodeURIComponent(leagueId)}` : '/api/standings'
      const res = await fetch(url, { cache: 'no-store' })
      const data = await res.json().catch(() => ({}))
      setStandings(Array.isArray(data.standings) ? data.standings : [])
      setTopScorers(Array.isArray(data.topScorers) ? data.topScorers : [])
    } catch {
      setStandings([])
      setTopScorers([])
    } finally {
      setLoading(false)
    }
  }, [leagueId, open])

  useEffect(() => {
    if (open && leagueId) fetchStandings()
  }, [open, leagueId, fetchStandings])

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
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 6 }}>
                <CircularProgress size={32} />
              </Box>
            ) : (
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
                      key={row.clubId || row.team || row.position}
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
            )}
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
