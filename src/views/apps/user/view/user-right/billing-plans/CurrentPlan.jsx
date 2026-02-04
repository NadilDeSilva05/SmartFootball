'use client'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import LinearProgress from '@mui/material/LinearProgress'
import Box from '@mui/material/Box'

// Component Imports
import UpgradePlan from '@components/dialogs/upgrade-plan'
import OpenDialogOnElementClick from '@components/dialogs/OpenDialogOnElementClick'

const CurrentPlan = ({ data }) => {
  // Vars
  const buttonProps = {
    variant: 'contained',
    children: 'Upgrade Plan'
  }

  return (
    <Card>
      <CardHeader
        title='Current Plan'
        action={<OpenDialogOnElementClick element={Button} elementProps={buttonProps} dialog={UpgradePlan} />}
      />
      <CardContent>
        <Grid container spacing={6}>
          <Grid size={{ xs: 12, md: 6 }} className='flex flex-col gap-4'>
            <Box>
              <Typography variant='h4' color='primary' gutterBottom>
                $99
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                per month
              </Typography>
            </Box>
            <Box>
              <Chip label='Current Plan' color='primary' size='small' />
            </Box>
            <Box>
              <Typography variant='body2' color='text.secondary'>
                We will send you a notification upon any subscription activity.
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box>
              <Typography variant='h6' gutterBottom>
                Plan Features
              </Typography>
              <Box display='flex' flexDirection='column' gap={2}>
                <Box display='flex' alignItems='center' gap={1}>
                  <i className='ri-check-line text-success' />
                  <Typography variant='body2'>Up to 10 users</Typography>
                </Box>
                <Box display='flex' alignItems='center' gap={1}>
                  <i className='ri-check-line text-success' />
                  <Typography variant='body2'>Up to 10 GB storage</Typography>
                </Box>
                <Box display='flex' alignItems='center' gap={1}>
                  <i className='ri-check-line text-success' />
                  <Typography variant='body2'>Basic Support</Typography>
                </Box>
              </Box>
            </Box>
          </Grid>
          <Grid size={12} className='flex gap-4 flex-wrap'>
            <Button variant='outlined'>Cancel Subscription</Button>
            <Button variant='outlined'>Download Invoice</Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default CurrentPlan
