'use client'

import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'

const Dashboard = () => {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant='h4' fontWeight='bold' sx={{ mb: 1 }}>
        SmartFootball
      </Typography>
      <Typography variant='body1' color='text.secondary' sx={{ mb: 4 }}>
        Welcome to SmartFootball. Your football management system is ready. Explore the template dashboards below or start building your features.
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                Analytics
              </Typography>
              <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                View analytics and charts.
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
                Customer relationship management dashboard.
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
                E‑commerce
              </Typography>
              <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                E‑commerce sales and stats.
              </Typography>
              <Button variant='contained' href='/dashboards/ecommerce'>
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
