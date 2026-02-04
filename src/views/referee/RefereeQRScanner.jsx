'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'

const RefereeQRScanner = () => {
  const [scanning, setScanning] = useState(false)

  const handleScan = () => {
    setScanning(true)
    setTimeout(() => setScanning(false), 2000)
  }

  return (
    <div className='space-y-6'>
      <div>
        <Typography variant='h4' className='font-semibold mb-1'>
          QR Scanner
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          Scan player ID cards to verify eligibility at match entry.
        </Typography>
      </div>

      <Card>
        <CardHeader title='Scan Player ID' />
        <CardContent>
          <Box
            sx={{
              aspectRatio: '4/3',
              maxHeight: 400,
              bgcolor: 'action.hover',
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px dashed',
              borderColor: 'divider',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {scanning ? (
              <Box sx={{ textAlign: 'center' }}>
                <Box sx={{ width: 48, height: 48, border: '3px solid', borderColor: 'primary.main', borderRadius: 1, mb: 2 }} />
                <Typography color='text.secondary'>Scanning...</Typography>
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
                <i className='ri-qr-scan-2-line' style={{ fontSize: 80, opacity: 0.5 }} />
                <Typography variant='body1' sx={{ mt: 2 }}>
                  Camera placeholder
                </Typography>
                <Typography variant='body2'>Allow camera access to scan player ID QR codes</Typography>
              </Box>
            )}
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Button
              variant='contained'
              size='large'
              startIcon={<i className='ri-qr-scan-2-line' />}
              onClick={handleScan}
              disabled={scanning}
            >
              {scanning ? 'Scanning...' : 'Scan'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title='Instructions for scanning player ID' />
        <CardContent>
          <List dense>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <i className='ri-number-1' style={{ fontSize: 20 }} />
              </ListItemIcon>
              <ListItemText primary='Position the player’s ID card within the camera frame so the QR code is clearly visible.' />
            </ListItem>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <i className='ri-number-2' style={{ fontSize: 20 }} />
              </ListItemIcon>
              <ListItemText primary='Tap the Scan button or hold the device steady until the QR code is detected automatically.' />
            </ListItem>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <i className='ri-number-3' style={{ fontSize: 20 }} />
              </ListItemIcon>
              <ListItemText primary='Once scanned, you will be taken to the Player Verification screen to confirm identity and eligibility.' />
            </ListItem>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <i className='ri-number-4' style={{ fontSize: 20 }} />
              </ListItemIcon>
              <ListItemText primary='Ensure good lighting and avoid obstructions over the QR code for a successful scan.' />
            </ListItem>
          </List>
        </CardContent>
      </Card>
    </div>
  )
}

export default RefereeQRScanner
