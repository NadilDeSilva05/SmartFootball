'use client'

import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { useSelector } from 'react-redux'

const Dashboard = () => {
  const user = useSelector(state => state?.authenticationReducer?.loginData?.user)
  const firstName = user?.fullName?.split(' ')[0] || user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'there'

  return (
    <Box sx={{ p: 4 }}>
      {/* Hero section with illustration */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'center', md: 'flex-start' },
          justifyContent: 'space-between',
          gap: 4,
          mb: 5,
          p: 4,
          borderRadius: 3,
          background: 'linear-gradient(135deg, rgba(0, 128, 0, 0.06) 0%, rgba(0, 100, 0, 0.03) 50%, transparent 100%)',
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Box sx={{ flex: 1, maxWidth: 480 }}>
          <Typography variant='h4' fontWeight='bold' sx={{ mb: 1 }}>
            Welcome back, {firstName}! ⚽
          </Typography>
          <Typography variant='body1' color='text.secondary' sx={{ mb: 2 }}>
            Your football management system is ready. Track performance, manage clubs, leagues, matches, and gain insights across the platform.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button variant='contained' href='/dashboards/analytics' startIcon={<i className='ri-bar-chart-line' />}>
              Analytics
            </Button>
            <Button variant='outlined' href='/apps/calendar' startIcon={<i className='ri-calendar-line' />}>
              Calendar
            </Button>
          </Box>
        </Box>
        <Box sx={{ flexShrink: 0, display: { xs: 'none', md: 'block' } }}>
          <img
            src='/images/illustrations/football-player.svg'
            alt='Football illustration'
            style={{ maxHeight: 280, width: 'auto', objectFit: 'contain' }}
          />
        </Box>
      </Box>

      <Typography variant='h6' fontWeight='600' sx={{ mb: 2 }}>
        Quick access
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
            <Box sx={{ position: 'absolute', top: 16, right: 16, opacity: 0.15 }}>
              <img src='/images/illustrations/fitness-stats.svg' alt='' style={{ height: 80, width: 'auto' }} />
            </Box>
            <CardContent sx={{ position: 'relative' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <i className='ri-bar-chart-box-line text-2xl text-primary' />
                <Typography variant='h6' fontWeight='600'>
                  Analytics
                </Typography>
              </Box>
              <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                View analytics, charts, and performance metrics.
              </Typography>
              <Button variant='contained' href='/dashboards/analytics' size='small'>
                Open Analytics
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
            <Box sx={{ position: 'absolute', top: 16, right: 16, opacity: 0.15 }}>
              <img src='/images/illustrations/sports-core.svg' alt='' style={{ height: 80, width: 'auto' }} />
            </Box>
            <CardContent sx={{ position: 'relative' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <i className='ri-team-line text-2xl text-primary' />
                <Typography variant='h6' fontWeight='600'>
                  CRM
                </Typography>
              </Box>
              <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                Manage clubs, players, and relationships.
              </Typography>
              <Button variant='contained' href='/dashboards/crm' size='small'>
                Open CRM
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
            <Box sx={{ position: 'absolute', top: 16, right: 16, opacity: 0.15 }}>
              <img src='/images/illustrations/game-cheering.svg' alt='' style={{ height: 80, width: 'auto' }} />
            </Box>
            <CardContent sx={{ position: 'relative' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <i className='ri-shopping-cart-line text-2xl text-primary' />
                <Typography variant='h6' fontWeight='600'>
                  E‑commerce
                </Typography>
              </Box>
              <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                Sales, stats, and e‑commerce dashboard.
              </Typography>
              <Button variant='contained' href='/dashboards/ecommerce' size='small'>
                Open E‑commerce
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Dashboard
