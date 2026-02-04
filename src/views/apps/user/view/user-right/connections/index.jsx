'use client'

// Next Imports
import Link from 'next/link'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'

const ConnectionsTab = () => {
  const connections = [
    {
      name: 'Google',
      avatar: '/images/logos/google.png',
      connected: true,
      email: 'john.doe@gmail.com'
    },
    {
      name: 'GitHub',
      avatar: '/images/logos/github.png',
      connected: true,
      email: 'john.doe@github.com'
    },
    {
      name: 'Slack',
      avatar: '/images/logos/slack.png',
      connected: false,
      email: null
    },
    {
      name: 'Twitter',
      avatar: '/images/logos/twitter.png',
      connected: false,
      email: null
    }
  ]

  return (
    <Grid container spacing={6}>
      <Grid size={12}>
        <Card>
          <CardHeader title='Connected Accounts' />
          <CardContent>
            <Box display='flex' flexDirection='column' gap={3}>
              {connections.map((connection, index) => (
                <Box
                  key={index}
                  display='flex'
                  alignItems='center'
                  justifyContent='space-between'
                  p={2}
                  border={1}
                  borderColor='divider'
                  borderRadius={1}
                >
                  <Box display='flex' alignItems='center' gap={2}>
                    <Avatar src={connection.avatar} alt={connection.name} />
                    <Box>
                      <Typography variant='h6'>{connection.name}</Typography>
                      {connection.email && (
                        <Typography variant='body2' color='text.secondary'>
                          {connection.email}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                  <Box display='flex' alignItems='center' gap={2}>
                    {connection.connected ? (
                      <Chip label='Connected' color='success' size='small' />
                    ) : (
                      <Chip label='Not Connected' color='default' size='small' />
                    )}
                    <Button
                      variant={connection.connected ? 'outlined' : 'contained'}
                      color={connection.connected ? 'error' : 'primary'}
                      size='small'
                    >
                      {connection.connected ? 'Disconnect' : 'Connect'}
                    </Button>
                  </Box>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={12}>
        <Card>
          <CardHeader title='Social Accounts' />
          <CardContent>
            <Typography variant='body2' color='text.secondary'>
              No social accounts connected yet.
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default ConnectionsTab
