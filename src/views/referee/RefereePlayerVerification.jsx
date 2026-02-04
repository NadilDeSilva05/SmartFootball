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
import Grid from '@mui/material/Grid'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'

// Hardcoded: verified player (after QR scan or manual lookup)
const VERIFIED_PLAYER = {
  photo: null,
  name: 'John Silva',
  club: 'City FC',
  position: 'Forward',
  jerseyNumber: '10',
  playerId: 'PLR-2024-001',
  eligibilityStatus: 'eligible',
  federationApproval: true,
  approvedDate: '2024-01-15'
}

// Hardcoded: upcoming matches assigned to this referee
const ASSIGNED_MATCHES = [
  { id: '1', date: '2025-02-15', time: '15:00', home: 'City FC', away: 'Rovers FC', venue: 'National Stadium', position: 'Main Referee' },
  { id: '2', date: '2025-02-18', time: '14:00', home: 'United SC', away: 'City FC', venue: 'Regional Ground', position: 'Side Referee' },
  { id: '3', date: '2025-02-22', time: '17:00', home: 'Stars FC', away: 'Dynamo FC', venue: 'City Arena', position: 'Match Commissioner Referee' }
]

const RefereePlayerVerification = () => {
  const [player] = useState(VERIFIED_PLAYER)
  const [matches] = useState(ASSIGNED_MATCHES)

  const getEligibilityColor = status => (status === 'eligible' ? 'success' : 'error')
  const getPositionIcon = pos => {
    if (pos === 'Main Referee') return 'ri-user-star-line'
    if (pos === 'Side Referee') return 'ri-user-line'
    return 'ri-user-shared-line'
  }

  return (
    <div className='space-y-6'>
      <div>
        <Typography variant='h4' className='font-semibold mb-1'>
          Player Verification
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          Verify player identity and eligibility. View your upcoming assigned matches and role.
        </Typography>
      </div>

      <Card>
        <CardHeader title='Verified Player' subheader='Player details from ID scan or manual entry' />
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { sm: 'flex-start' }, gap: 4 }}>
            <CustomAvatar
              src={player.photo}
              skin='light'
              color='primary'
              size={100}
              sx={{ fontSize: '2.5rem' }}
            >
              {player.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'P'}
            </CustomAvatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant='h6' className='font-semibold' gutterBottom>
                {player.name}
              </Typography>
              <Typography variant='body2' color='text.secondary' gutterBottom>
                {player.club} • {player.position} #{player.jerseyNumber}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                <Chip
                  size='small'
                  label={player.eligibilityStatus === 'eligible' ? 'Eligible' : 'Not eligible'}
                  color={getEligibilityColor(player.eligibilityStatus)}
                  variant='tonal'
                />
                <Chip
                  size='small'
                  label={player.federationApproval ? 'Federation approved' : 'Not approved'}
                  color={player.federationApproval ? 'success' : 'error'}
                  variant='tonal'
                  icon={<i className='ri-verified-badge-line' style={{ fontSize: 16 }} />}
                />
              </Box>
              <Typography variant='caption' display='block' sx={{ mt: 1 }} color='text.secondary'>
                Player ID: {player.playerId} • Approved: {player.approvedDate}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title='My upcoming assigned matches' subheader='Matches where you are assigned and your position' />
        <CardContent>
          <Table size='small'>
            <TableHead>
              <TableRow>
                <TableCell>Date & Time</TableCell>
                <TableCell>Match</TableCell>
                <TableCell>Venue</TableCell>
                <TableCell>Your position</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {matches.map(m => (
                <TableRow key={m.id} hover>
                  <TableCell>
                    <Typography variant='body2'>{m.date}</Typography>
                    <Typography variant='caption' color='text.secondary'>{m.time}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography className='font-medium'>{m.home} vs {m.away}</Typography>
                  </TableCell>
                  <TableCell>{m.venue}</TableCell>
                  <TableCell>
                    <Chip
                      size='small'
                      label={m.position}
                      variant='tonal'
                      color='primary'
                      icon={<i className={getPositionIcon(m.position)} style={{ fontSize: 16 }} />}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

export default RefereePlayerVerification
