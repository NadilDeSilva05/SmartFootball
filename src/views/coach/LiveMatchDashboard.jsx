'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'

// Hardcoded live player metrics (simulated real-time)
const LIVE_PLAYERS = [
  { id: '1', name: 'John Silva', heartRate: 142, fatigueLevel: 'Medium', playerLoad: 8.2, sprintCount: 12, highIntensityDist: 420, workRate: 'High', status: 'live' },
  { id: '2', name: 'Maria Perera', heartRate: 168, fatigueLevel: 'High', playerLoad: 9.5, sprintCount: 18, highIntensityDist: 580, workRate: 'Very High', status: 'live' },
  { id: '3', name: 'David Fernando', heartRate: 125, fatigueLevel: 'Low', playerLoad: 6.1, sprintCount: 7, highIntensityDist: 280, workRate: 'Medium', status: 'live' },
  { id: '4', name: 'James Wilson', heartRate: 155, fatigueLevel: 'High', playerLoad: 9.8, sprintCount: 15, highIntensityDist: 510, workRate: 'High', status: 'live' },
  { id: '5', name: 'Anna Lopez', heartRate: 132, fatigueLevel: 'Low', playerLoad: 5.4, sprintCount: 5, highIntensityDist: 190, workRate: 'Medium', status: 'live' }
]

const getFatigueColor = level => {
  if (level === 'Low') return 'success'
  if (level === 'Medium') return 'warning'
  return 'error'
}

const getFatigueBgColor = level => {
  if (level === 'Low') return 'success.light'
  if (level === 'Medium') return 'warning.light'
  return 'error.light'
}

const LiveMatchDashboard = () => {
  const [players] = useState(LIVE_PLAYERS)

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between flex-wrap gap-2'>
        <div>
          <Typography variant='h4' className='font-semibold mb-1'>
            Live Match Dashboard
          </Typography>
          <Typography variant='body1' color='text.secondary'>
            Real-time player metrics during the match.
          </Typography>
        </div>
        <Box className='flex items-center gap-2'>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'error.main' }} />
          <Typography variant='body2' color='text.secondary'>
            LIVE
          </Typography>
          <Chip size='small' label='Live' color='error' variant='tonal' icon={<i className='ri-record-circle-line text-base' />} />
        </Box>
      </div>

      <Card>
        <CardHeader
          title='Real-time Player Metrics'
          subheader='Color-coded fatigue levels: Green = Low, Amber = Medium, Red = High'
        />
        <CardContent>
          <Table size='small'>
            <TableHead>
              <TableRow>
                <TableCell>Player Name</TableCell>
                <TableCell align='center'>Heart Rate</TableCell>
                <TableCell align='center'>Fatigue Level</TableCell>
                <TableCell align='center'>Player Load</TableCell>
                <TableCell align='center'>Sprint Count</TableCell>
                <TableCell align='center'>High-Intensity Dist. (m)</TableCell>
                <TableCell align='center'>Work Rate</TableCell>
                <TableCell align='center'>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {players.map(p => (
                <TableRow key={p.id} hover>
                  <TableCell>
                    <Typography className='font-medium'>{p.name}</Typography>
                  </TableCell>
                  <TableCell align='center'>
                    <Typography>{p.heartRate}</Typography>
                    <Typography variant='caption' color='text.secondary'>bpm</Typography>
                  </TableCell>
                  <TableCell align='center'>
                    <Chip
                      size='small'
                      label={p.fatigueLevel}
                      color={getFatigueColor(p.fatigueLevel)}
                      sx={{ bgcolor: `${getFatigueBgColor(p.fatigueLevel)}`, fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell align='center'>{p.playerLoad}</TableCell>
                  <TableCell align='center'>{p.sprintCount}</TableCell>
                  <TableCell align='center'>{p.highIntensityDist}</TableCell>
                  <TableCell align='center'>
                    <Typography variant='body2'>{p.workRate}</Typography>
                  </TableCell>
                  <TableCell align='center'>
                    <Chip size='small' label='Live' color='success' variant='tonal' />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <Typography variant='body2' color='text.secondary'>Legend:</Typography>
        <Chip size='small' label='Low fatigue' color='success' variant='outlined' />
        <Chip size='small' label='Medium fatigue' color='warning' variant='outlined' />
        <Chip size='small' label='High fatigue' color='error' variant='outlined' />
      </Box>
    </div>
  )
}

export default LiveMatchDashboard
