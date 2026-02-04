'use client'

import { useSelector } from 'react-redux'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'

const FederationDashboard = () => {
  const user = useSelector(state => state?.authenticationReducer?.loginData?.user)

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant='h4' fontWeight='bold' sx={{ mb: 1 }}>
        Federation Admin Dashboard
      </Typography>
      <Typography variant='body1' color='text.secondary' sx={{ mb: 4 }}>
        Welcome, {user?.fullName || user?.email || 'Admin'}. Manage federation-wide analytics, clubs, and competitions.
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                Analytics
              </Typography>
              <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                View federation-wide analytics and charts.
              </Typography>
              <Button variant='contained' href='/dashboards/analytics'>
                Open Analytics
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                CRM
              </Typography>
              <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                Manage clubs and relationships.
              </Typography>
              <Button variant='contained' href='/dashboards/crm'>
                Open CRM
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                Dashboard
              </Typography>
              <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                Return to main dashboard.
              </Typography>
              <Button variant='contained' href='/dashboard'>
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default FederationDashboard
