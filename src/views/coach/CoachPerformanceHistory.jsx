'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
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

import { getCompletedSessions } from '@views/coach/liveMatchConstants'

const CoachPerformanceHistory = () => {
  const [sessions, setSessions] = useState([])

  useEffect(() => {
    setSessions(getCompletedSessions())
  }, [])

  return (
    <div className='space-y-6'>
      <div>
        <Typography variant='h4' className='font-semibold mb-1'>
          Performance History
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          Final match session data from IoT devices (after substitution or full-time). Coach and players can view these results.
        </Typography>
      </div>

      <Card>
        <CardHeader
          title='Match sessions'
          subheader='Session results saved when a player was substituted or when the match reached 90 minutes.'
        />
        <CardContent>
          {sessions.length === 0 ? (
            <Box sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>
              <i className='ri-file-list-3-line' style={{ fontSize: 48, opacity: 0.5 }} />
              <Typography variant='body1' sx={{ mt: 1 }}>No session data yet.</Typography>
              <Typography variant='body2'>Complete a live match (substitute players or run 90 min) to see final stats here.</Typography>
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
