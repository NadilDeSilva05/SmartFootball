'use client'

// React Imports
import { useState, useEffect } from 'react'

// Next Imports
import dynamic from 'next/dynamic'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Chip from '@mui/material/Chip'

// Component Imports
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from '@/libs/Recharts'
import { getSessionsByPlayerId } from '@views/coach/liveMatchConstants'

const AppRecharts = dynamic(() => import('@/libs/styles/AppRecharts'))

// Demo: current player ID (in production from auth)
const CURRENT_PLAYER_ID = 'PLR-001'

// Hardcoded match list and performance data
const MATCH_LIST = [
  { id: '1', date: '2025-02-01', opponent: 'United SC', result: 'W 2-1', minutes: 90, goals: 1, rating: 8.2 },
  { id: '2', date: '2025-01-28', opponent: 'Rovers FC', result: 'D 0-0', minutes: 75, goals: 0, rating: 6.5 },
  { id: '3', date: '2025-01-25', opponent: 'Stars FC', result: 'W 3-2', minutes: 90, goals: 2, rating: 9.0 },
  { id: '4', date: '2025-01-20', opponent: 'Athletic Club', result: 'L 1-2', minutes: 60, goals: 0, rating: 5.8 },
  { id: '5', date: '2025-01-15', opponent: 'Dynamo FC', result: 'W 2-0', minutes: 90, goals: 1, rating: 7.5 }
]

const PERFORMANCE_BY_MATCH = [
  { match: 'vs United', rating: 8.2, minutes: 90 },
  { match: 'vs Rovers', rating: 6.5, minutes: 75 },
  { match: 'vs Stars', rating: 9.0, minutes: 90 },
  { match: 'vs Athletic', rating: 5.8, minutes: 60 },
  { match: 'vs Dynamo', rating: 7.5, minutes: 90 }
]

const GOALS_BY_MONTH = [
  { month: 'Jan', goals: 4 },
  { month: 'Feb', goals: 1 },
  { month: 'Mar', goals: 0 },
  { month: 'Apr', goals: 0 }
]

const PerformanceHistory = () => {
  const [matchList] = useState(MATCH_LIST)
  const [iotSessions, setIotSessions] = useState([])

  useEffect(() => {
    setIotSessions(getSessionsByPlayerId(CURRENT_PLAYER_ID))
  }, [])

  const handleDownloadReport = () => {
    // Hardcoded: simulate download
    window.alert('Performance report download started. (UI only – no file generated.)')
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between flex-wrap gap-2'>
        <div>
          <Typography variant='h4' className='font-semibold mb-1'>
            Performance History
          </Typography>
          <Typography variant='body1' color='text.secondary'>
            Match list, performance graphs, and download your report.
          </Typography>
        </div>
        <Button variant='contained' startIcon={<i className='ri-download-line' />} onClick={handleDownloadReport}>
          Download Report
        </Button>
      </div>

      <Card>
        <CardHeader title='Match List' subheader='Match results and ratings.' />
        <CardContent>
          <Table size='small'>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Opponent</TableCell>
                <TableCell>Result</TableCell>
                <TableCell align='center'>Minutes</TableCell>
                <TableCell align='center'>Goals</TableCell>
                <TableCell align='center'>Rating</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {matchList.map(m => (
                <TableRow key={m.id}>
                  <TableCell>{m.date}</TableCell>
                  <TableCell>{m.opponent}</TableCell>
                  <TableCell>{m.result}</TableCell>
                  <TableCell align='center'>{m.minutes}</TableCell>
                  <TableCell align='center'>{m.goals}</TableCell>
                  <TableCell align='center'>
                    <Typography fontWeight='medium'>{m.rating}</Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {iotSessions.length > 0 && (
        <Card>
          <CardHeader
            title='IoT match sessions'
            subheader='Final stats from wearable device (after substitution or full-time).'
          />
          <CardContent>
            <Table size='small'>
              <TableHead>
                <TableRow>
                  <TableCell>Match</TableCell>
                  <TableCell align='center'>Reason</TableCell>
                  <TableCell align='center'>Minutes</TableCell>
                  <TableCell align='center'>Heart Rate</TableCell>
                  <TableCell align='center'>Fatigue</TableCell>
                  <TableCell align='center'>Player Load</TableCell>
                  <TableCell align='center'>Sprints</TableCell>
                  <TableCell align='center'>High-Int. Dist. (m)</TableCell>
                  <TableCell align='center'>Work Rate</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {iotSessions.map(s => (
                  <TableRow key={s.id} hover>
                    <TableCell>
                      <Typography variant='body2' className='font-medium'>{s.matchName}</Typography>
                    </TableCell>
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title='Match Rating (Last 5)' />
            <CardContent>
              <Box sx={{ height: 280 }}>
                <AppRecharts>
                  <ResponsiveContainer width='100%' height='100%'>
                    <LineChart data={PERFORMANCE_BY_MATCH} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray='3 3' />
                      <XAxis dataKey='match' />
                      <YAxis domain={[0, 10]} />
                      <Tooltip />
                      <Line type='monotone' dataKey='rating' stroke='var(--mui-palette-primary-main)' strokeWidth={2} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </AppRecharts>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title='Goals by Month' />
            <CardContent>
              <Box sx={{ height: 280 }}>
                <AppRecharts>
                  <ResponsiveContainer width='100%' height='100%'>
                    <BarChart data={GOALS_BY_MONTH} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray='3 3' />
                      <XAxis dataKey='month' />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey='goals' fill='var(--mui-palette-primary-main)' radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </AppRecharts>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  )
}

export default PerformanceHistory
