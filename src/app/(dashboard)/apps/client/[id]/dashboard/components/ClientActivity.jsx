'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import {
  Grid,
  Card,
  CardHeader,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  Paper,
  Stack,
  Divider,
  Avatar
} from '@mui/material'
import { Timeline, TimelineItem, TimelineSeparator, TimelineConnector, TimelineContent, TimelineDot } from '@mui/lab'

const ClientActivity = ({ clientId }) => {
  // Mock activity data - replace with actual API call
  const [activities] = useState([
    {
      id: 1,
      type: 'loan_created',
      title: 'New loan created',
      description: 'Personal loan of $5,000 was created',
      timestamp: '2024-01-15T10:30:00',
      icon: 'ri-money-dollar-circle-line',
      color: 'success'
    },
    {
      id: 2,
      type: 'payment_made',
      title: 'Payment received',
      description: 'Payment of $500 received for loan #12345',
      timestamp: '2024-01-14T14:20:00',
      icon: 'ri-check-line',
      color: 'primary'
    },
    {
      id: 3,
      type: 'attendance_marked',
      title: 'Attendance marked',
      description: 'Client marked as present for today',
      timestamp: '2024-01-14T09:15:00',
      icon: 'ri-checkbox-circle-line',
      color: 'info'
    },
    {
      id: 4,
      type: 'document_uploaded',
      title: 'Document uploaded',
      description: 'Income certificate uploaded and verified',
      timestamp: '2024-01-13T16:45:00',
      icon: 'ri-file-text-line',
      color: 'warning'
    },
    {
      id: 5,
      type: 'profile_updated',
      title: 'Profile updated',
      description: 'Client contact information was updated',
      timestamp: '2024-01-12T11:30:00',
      icon: 'ri-user-line',
      color: 'secondary'
    },
    {
      id: 6,
      type: 'fingerprint_added',
      title: 'Fingerprint registered',
      description: 'Client fingerprint was successfully registered',
      timestamp: '2024-01-11T13:20:00',
      icon: 'ri-fingerprint-line',
      color: 'success'
    }
  ])

  // Helper function to get activity color
  const getActivityColor = color => {
    switch (color) {
      case 'success':
        return 'success.main'
      case 'primary':
        return 'primary.main'
      case 'info':
        return 'info.main'
      case 'warning':
        return 'warning.main'
      case 'secondary':
        return 'secondary.main'
      default:
        return 'grey.500'
    }
  }

  // Helper function to format relative time
  const formatRelativeTime = timestamp => {
    const now = new Date()
    const activityTime = new Date(timestamp)
    const diffInHours = Math.floor((now - activityTime) / (1000 * 60 * 60))

    if (diffInHours < 1) {
      return 'Just now'
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      return `${diffInDays} days ago`
    }
  }

  return (
    <Grid container spacing={6}>
      <Grid size={12}>
        <Card>
          <CardHeader
            title={
              <Box display='flex' justifyContent='space-between' alignItems='center'>
                <Typography variant='h5'>Activity Summary</Typography>
                <Button variant='outlined' startIcon={<i className='ri-download-line' />}>
                  Export Activity
                </Button>
              </Box>
            }
          />
          <CardContent>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Paper variant='outlined' sx={{ p: 3, textAlign: 'center' }}>
                  <i className='ri-time-line text-primary' style={{ fontSize: '2rem', marginBottom: '0.5rem' }} />
                  <Typography variant='h4' color='primary' gutterBottom>
                    {activities.length}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Total Activities
                  </Typography>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Paper variant='outlined' sx={{ p: 3, textAlign: 'center' }}>
                  <i
                    className='ri-money-dollar-circle-line text-success'
                    style={{ fontSize: '2rem', marginBottom: '0.5rem' }}
                  />
                  <Typography variant='h4' color='success.main' gutterBottom>
                    {activities.filter(activity => activity.type === 'loan_created').length}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Loans Created
                  </Typography>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Paper variant='outlined' sx={{ p: 3, textAlign: 'center' }}>
                  <i className='ri-check-line text-info' style={{ fontSize: '2rem', marginBottom: '0.5rem' }} />
                  <Typography variant='h4' color='info.main' gutterBottom>
                    {activities.filter(activity => activity.type === 'payment_made').length}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Payments Made
                  </Typography>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Paper variant='outlined' sx={{ p: 3, textAlign: 'center' }}>
                  <i
                    className='ri-checkbox-circle-line text-warning'
                    style={{ fontSize: '2rem', marginBottom: '0.5rem' }}
                  />
                  <Typography variant='h4' color='warning.main' gutterBottom>
                    {activities.filter(activity => activity.type === 'attendance_marked').length}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Attendance Records
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Activity Timeline */}
      <Grid size={12}>
        <Card>
          <CardHeader title='Recent Activity' titleTypographyProps={{ variant: 'h5' }} />
          <CardContent>
            <Timeline position='left'>
              {activities.map((activity, index) => (
                <TimelineItem key={activity.id}>
                  <TimelineSeparator>
                    <TimelineDot sx={{ bgcolor: getActivityColor(activity.color) }}>
                      <i className={activity.icon} style={{ fontSize: '1rem', color: 'white' }} />
                    </TimelineDot>
                    {index < activities.length - 1 && <TimelineConnector />}
                  </TimelineSeparator>
                  <TimelineContent>
                    <Paper variant='outlined' sx={{ p: 3, mb: 2 }}>
                      <Box display='flex' alignItems='center' justifyContent='space-between' mb={2}>
                        <Typography variant='h6' fontWeight='500'>
                          {activity.title}
                        </Typography>
                        <Chip label={formatRelativeTime(activity.timestamp)} size='small' color='default' />
                      </Box>
                      <Typography variant='body2' color='text.secondary' paragraph>
                        {activity.description}
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        {new Date(activity.timestamp).toLocaleString()}
                      </Typography>
                    </Paper>
                  </TimelineContent>
                </TimelineItem>
              ))}
            </Timeline>
          </CardContent>
        </Card>
      </Grid>

      {/* Activity Categories */}
      <Grid size={12}>
        <Card>
          <CardHeader title='Activity Categories' titleTypographyProps={{ variant: 'h5' }} />
          <CardContent>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Paper variant='outlined' sx={{ p: 3 }}>
                  <Box display='flex' alignItems='center' gap={2} mb={2}>
                    <Avatar sx={{ bgcolor: 'success.main' }}>
                      <i className='ri-money-dollar-circle-line' />
                    </Avatar>
                    <Box>
                      <Typography variant='h6'>Financial Activities</Typography>
                      <Typography variant='body2' color='text.secondary'>
                        Loans, payments, transactions
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant='h4' color='success.main' gutterBottom>
                    {
                      activities.filter(
                        activity => activity.type === 'loan_created' || activity.type === 'payment_made'
                      ).length
                    }
                  </Typography>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Paper variant='outlined' sx={{ p: 3 }}>
                  <Box display='flex' alignItems='center' gap={2} mb={2}>
                    <Avatar sx={{ bgcolor: 'info.main' }}>
                      <i className='ri-checkbox-circle-line' />
                    </Avatar>
                    <Box>
                      <Typography variant='h6'>Attendance</Typography>
                      <Typography variant='body2' color='text.secondary'>
                        Check-ins, attendance records
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant='h4' color='info.main' gutterBottom>
                    {activities.filter(activity => activity.type === 'attendance_marked').length}
                  </Typography>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Paper variant='outlined' sx={{ p: 3 }}>
                  <Box display='flex' alignItems='center' gap={2} mb={2}>
                    <Avatar sx={{ bgcolor: 'warning.main' }}>
                      <i className='ri-file-text-line' />
                    </Avatar>
                    <Box>
                      <Typography variant='h6'>Documents</Typography>
                      <Typography variant='body2' color='text.secondary'>
                        Uploads, verifications
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant='h4' color='warning.main' gutterBottom>
                    {activities.filter(activity => activity.type === 'document_uploaded').length}
                  </Typography>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Paper variant='outlined' sx={{ p: 3 }}>
                  <Box display='flex' alignItems='center' gap={2} mb={2}>
                    <Avatar sx={{ bgcolor: 'secondary.main' }}>
                      <i className='ri-user-line' />
                    </Avatar>
                    <Box>
                      <Typography variant='h6'>Profile Updates</Typography>
                      <Typography variant='body2' color='text.secondary'>
                        Information changes
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant='h4' color='secondary.main' gutterBottom>
                    {activities.filter(activity => activity.type === 'profile_updated').length}
                  </Typography>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Paper variant='outlined' sx={{ p: 3 }}>
                  <Box display='flex' alignItems='center' gap={2} mb={2}>
                    <Avatar sx={{ bgcolor: 'success.main' }}>
                      <i className='ri-fingerprint-line' />
                    </Avatar>
                    <Box>
                      <Typography variant='h6'>Security</Typography>
                      <Typography variant='body2' color='text.secondary'>
                        Fingerprint, authentication
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant='h4' color='success.main' gutterBottom>
                    {activities.filter(activity => activity.type === 'fingerprint_added').length}
                  </Typography>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Paper variant='outlined' sx={{ p: 3 }}>
                  <Box display='flex' alignItems='center' gap={2} mb={2}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <i className='ri-bar-chart-line' />
                    </Avatar>
                    <Box>
                      <Typography variant='h6'>Analytics</Typography>
                      <Typography variant='body2' color='text.secondary'>
                        View detailed analytics
                      </Typography>
                    </Box>
                  </Box>
                  <Button variant='contained' startIcon={<i className='ri-bar-chart-line' />} fullWidth>
                    View Analytics
                  </Button>
                </Paper>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default ClientActivity
