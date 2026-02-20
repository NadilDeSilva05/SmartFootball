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
import Alert from '@mui/material/Alert'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'

// Upcoming matches (referee selects one before scanning)
const UPCOMING_MATCHES = [
  { id: 'M1', name: 'City FC vs Rovers FC', date: '2025-02-22', startTime: '15:00', venue: 'National Stadium' },
  { id: 'M2', name: 'United SC vs Stars FC', date: '2025-02-23', startTime: '14:00', venue: 'Regional Ground' }
]

// Simulated scan result (in production would come from QR decode)
const SCAN_RESULT = { playerId: 'PLR-001', name: 'John Silva', club: 'City FC', jerseyNumber: '10' }

const RefereeQRScanner = () => {
  const [scanning, setScanning] = useState(false)
  const [selectedMatchId, setSelectedMatchId] = useState(UPCOMING_MATCHES[0]?.id || '')
  const [lastScanned, setLastScanned] = useState(null)
  const [registered, setRegistered] = useState([])

  const selectedMatch = UPCOMING_MATCHES.find(m => m.id === selectedMatchId)
  const matchLabel = selectedMatch ? `${selectedMatch.name} (${selectedMatch.date} ${selectedMatch.startTime})` : 'Select match'

  const handleScan = () => {
    setScanning(true)
    setTimeout(() => {
      setScanning(false)
      setLastScanned({ ...SCAN_RESULT, scannedAt: new Date().toISOString() })
      setRegistered(prev => {
        const key = `${selectedMatchId}-${SCAN_RESULT.playerId}`
        if (prev.some(r => r.matchId === selectedMatchId && r.playerId === SCAN_RESULT.playerId)) return prev
        return [...prev, { matchId: selectedMatchId, matchName: selectedMatch?.name, startTime: selectedMatch?.startTime, ...SCAN_RESULT, scannedAt: new Date().toISOString() }]
      })
    }, 2000)
  }

  const registeredForMatch = registered.filter(r => r.matchId === selectedMatchId)

  return (
    <div className='space-y-6'>
      <div>
        <Typography variant='h4' className='font-semibold mb-1'>
          QR Scanner
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          Scan player ID cards before the match. When the match starts, each player&apos;s device will connect automatically and send real-time data to the coach dashboard.
        </Typography>
      </div>

      <Card>
        <CardHeader title='Scan Player ID' />
        <CardContent>
          <FormControl fullWidth size='small' sx={{ mb: 2 }}>
            <InputLabel id='match-select-label'>Current match</InputLabel>
            <Select
              labelId='match-select-label'
              label='Current match'
              value={selectedMatchId}
              onChange={e => setSelectedMatchId(e.target.value)}
            >
              {UPCOMING_MATCHES.map(m => (
                <MenuItem key={m.id} value={m.id}>{m.name} – {m.date} {m.startTime}</MenuItem>
              ))}
            </Select>
          </FormControl>

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
              disabled={scanning || !selectedMatchId}
            >
              {scanning ? 'Scanning...' : 'Scan'}
            </Button>
          </Box>

          {lastScanned && selectedMatch && (
            <Alert severity='success' icon={<i className='ri-checkbox-circle-line' />} sx={{ mt: 2 }}>
              <strong>{lastScanned.name}</strong> (ID: {lastScanned.playerId}) registered for <strong>{selectedMatch.name}</strong>. Device will connect automatically at match start time (<strong>{selectedMatch.startTime}</strong>).
            </Alert>
          )}
        </CardContent>
      </Card>

      {selectedMatch && (
        <Card>
          <CardHeader
            title='Players registered for this match'
            subheader={`${selectedMatch.name} – ${selectedMatch.date} ${selectedMatch.startTime}. Devices connect at start time.`}
          />
          <CardContent>
            {registeredForMatch.length === 0 ? (
              <Typography color='text.secondary'>No players scanned yet for this match. Scan player ID cards to register.</Typography>
            ) : (
              <Table size='small'>
                <TableHead>
                  <TableRow>
                    <TableCell>Player name</TableCell>
                    <TableCell>Player ID</TableCell>
                    <TableCell>Club</TableCell>
                    <TableCell>Jersey</TableCell>
                    <TableCell>Scanned at</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {registeredForMatch.map((r, i) => (
                    <TableRow key={`${r.matchId}-${r.playerId}-${i}`}>
                      <TableCell>{r.name}</TableCell>
                      <TableCell>{r.playerId}</TableCell>
                      <TableCell>{r.club}</TableCell>
                      <TableCell>{r.jerseyNumber}</TableCell>
                      <TableCell>
                        <Typography variant='caption' color='text.secondary'>
                          {new Date(r.scannedAt).toLocaleString()}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader title='Instructions for scanning player ID' />
        <CardContent>
          <List dense>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <i className='ri-number-1' style={{ fontSize: 20 }} />
              </ListItemIcon>
              <ListItemText primary='Select the current match above. Only players scanned for this match will have their devices connected at match start time.' />
            </ListItem>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <i className='ri-number-2' style={{ fontSize: 20 }} />
              </ListItemIcon>
              <ListItemText primary='Position the player’s ID card within the camera frame so the QR code is clearly visible.' />
            </ListItem>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <i className='ri-number-3' style={{ fontSize: 20 }} />
              </ListItemIcon>
              <ListItemText primary='Tap Scan. When the scan succeeds, the player is registered for the selected match. Their IoT device will connect automatically when the match starts.' />
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
