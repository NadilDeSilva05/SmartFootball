'use client'

// React Imports
import { useSelector } from 'react-redux'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Divider from '@mui/material/Divider'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'

// Hardcoded player profile (can be replaced with user from Redux)
const PLAYER_PROFILE = {
  photo: null,
  fullName: 'John Silva',
  dateOfBirth: '1998-05-15',
  email: 'john.silva@club.com',
  phone: '+94 77 123 4567',
  nationality: 'Sri Lankan',
  address: '123 Main Street, Colombo',
  clubName: 'City FC',
  clubLeague: 'Premier League',
  clubSince: '2022-08-01',
  position: 'Forward',
  jerseyNumber: '10',
  registrationStatus: 'approved',
  playerId: 'PLR-2024-001',
  registeredAt: '2024-01-15'
}

const PlayerProfile = () => {
  const user = useSelector(state => state?.authenticationReducer?.loginData?.user)
  const profile = { ...PLAYER_PROFILE, fullName: user?.fullName || user?.name || PLAYER_PROFILE.fullName, email: user?.email || PLAYER_PROFILE.email }

  const getStatusColor = status => {
    if (status === 'approved') return 'success'
    if (status === 'pending') return 'warning'
    return 'secondary'
  }

  return (
    <div className='space-y-6'>
      <div>
        <Typography variant='h4' className='font-semibold mb-1'>
          Player Profile
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          Your personal and club details, position, and registration status.
        </Typography>
      </div>

      <Card>
        <CardContent sx={{ pt: 6 }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { sm: 'flex-start' }, gap: 4 }}>
            <CustomAvatar
              src={profile.photo}
              skin='light'
              color='primary'
              size={120}
              sx={{ fontSize: '3rem' }}
            >
              {profile.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'P'}
            </CustomAvatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant='h5' className='font-semibold' gutterBottom>
                {profile.fullName}
              </Typography>
              <Chip
                size='small'
                label={profile.registrationStatus}
                color={getStatusColor(profile.registrationStatus)}
                variant='tonal'
                sx={{ mb: 2 }}
              />
              <Typography variant='body2' color='text.secondary'>
                {profile.position} • #{profile.jerseyNumber} • {profile.clubName}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title='Personal Details' />
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant='caption' color='text.secondary'>Full Name</Typography>
                  <Typography>{profile.fullName}</Typography>
                </Box>
                <Box>
                  <Typography variant='caption' color='text.secondary'>Date of Birth</Typography>
                  <Typography>{profile.dateOfBirth}</Typography>
                </Box>
                <Box>
                  <Typography variant='caption' color='text.secondary'>Email</Typography>
                  <Typography>{profile.email}</Typography>
                </Box>
                <Box>
                  <Typography variant='caption' color='text.secondary'>Phone</Typography>
                  <Typography>{profile.phone}</Typography>
                </Box>
                <Box>
                  <Typography variant='caption' color='text.secondary'>Nationality</Typography>
                  <Typography>{profile.nationality}</Typography>
                </Box>
                <Box>
                  <Typography variant='caption' color='text.secondary'>Address</Typography>
                  <Typography>{profile.address}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title='Club Details' />
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant='caption' color='text.secondary'>Club</Typography>
                  <Typography className='font-medium'>{profile.clubName}</Typography>
                </Box>
                <Box>
                  <Typography variant='caption' color='text.secondary'>League</Typography>
                  <Typography>{profile.clubLeague}</Typography>
                </Box>
                <Box>
                  <Typography variant='caption' color='text.secondary'>Club since</Typography>
                  <Typography>{profile.clubSince}</Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box>
                  <Typography variant='caption' color='text.secondary'>Position</Typography>
                  <Typography className='font-medium'>{profile.position}</Typography>
                </Box>
                <Box>
                  <Typography variant='caption' color='text.secondary'>Jersey Number</Typography>
                  <Typography>#{profile.jerseyNumber}</Typography>
                </Box>
                <Box>
                  <Typography variant='caption' color='text.secondary'>Player ID</Typography>
                  <Typography>{profile.playerId}</Typography>
                </Box>
                <Box>
                  <Typography variant='caption' color='text.secondary'>Registration Status</Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip size='small' label={profile.registrationStatus} color={getStatusColor(profile.registrationStatus)} variant='tonal' />
                  </Box>
                </Box>
                <Box>
                  <Typography variant='caption' color='text.secondary'>Registered</Typography>
                  <Typography>{profile.registeredAt}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  )
}

export default PlayerProfile
