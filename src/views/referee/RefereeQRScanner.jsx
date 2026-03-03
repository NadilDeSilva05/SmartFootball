'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
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
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import { Html5Qrcode } from 'html5-qrcode'

function safeStopScanner (scanner) {
  if (!scanner || typeof scanner.stop !== 'function') return
  try {
    scanner.stop().catch(() => {})
  } catch {
    // Library may throw synchronously e.g. "Cannot stop, scanner is not running"
  }
}

function parsePlayerIdFromUrl (urlString) {
  try {
    const url = new URL(urlString)
    const path = url.pathname || ''
    const match = path.match(/\/player\/verify\/([^/]+)/)
    return match ? match[1].trim() : null
  } catch {
    if (typeof urlString === 'string' && urlString.includes('/player/verify/')) {
      const parts = urlString.split('/player/verify/')
      const tail = parts[1]
      return tail ? tail.split('/')[0].split('?')[0].trim() : null
    }
    return null
  }
}

const RefereeQRScanner = () => {
  const [scanning, setScanning] = useState(false)
  const [matches, setMatches] = useState([])
  const [selectedMatchId, setSelectedMatchId] = useState('')
  const [lastScanned, setLastScanned] = useState(null)
  const [playerDetails, setPlayerDetails] = useState(null)
  const [devices, setDevices] = useState([])
  const [linkingDeviceId, setLinkingDeviceId] = useState(null)
  const [registered, setRegistered] = useState([])
  const [loadingMatches, setLoadingMatches] = useState(true)
  const [scanError, setScanError] = useState('')
  const html5QrRef = useRef(null)

  const selectedMatch = matches.find(m => m.id === selectedMatchId)

  const fetchMatches = useCallback(async () => {
    try {
      setLoadingMatches(true)
      const res = await fetch('/api/matches?status=scheduled')
      const list = await res.json().catch(() => [])
      setMatches(Array.isArray(list) ? list : [])
      if (list?.length && !selectedMatchId) setSelectedMatchId(list[0]?.id || '')
    } finally {
      setLoadingMatches(false)
    }
  }, [selectedMatchId])

  const fetchDevices = useCallback(async () => {
    try {
      const res = await fetch('/api/iot/devices')
      const list = await res.json().catch(() => [])
      setDevices(Array.isArray(list) ? list : [])
    } catch {
      setDevices([])
    }
  }, [])

  const fetchRegistered = useCallback(async () => {
    if (!selectedMatchId) return
    try {
      const res = await fetch(`/api/referee/registered?matchId=${encodeURIComponent(selectedMatchId)}`)
      const list = await res.json().catch(() => [])
      setRegistered(Array.isArray(list) ? list : [])
    } catch {
      setRegistered([])
    }
  }, [selectedMatchId])

  useEffect(() => {
    fetchMatches()
  }, [fetchMatches])

  useEffect(() => {
    fetchDevices()
    const t = setInterval(fetchDevices, 15000)
    return () => clearInterval(t)
  }, [fetchDevices])

  useEffect(() => {
    fetchRegistered()
  }, [fetchRegistered])

  const startScanner = useCallback(() => {
    setScanError('')
    setPlayerDetails(null)
    setLastScanned(null)
    setScanning(true)
  }, [])

  const stopScanner = useCallback(() => {
    setScanning(false)
    safeStopScanner(html5QrRef.current)
    html5QrRef.current = null
  }, [])

  useEffect(() => {
    if (!scanning) return
    let html5Qr
    Html5Qrcode.getCameras()
      .then(cameras => {
        if (!cameras?.length) {
          setScanError('No camera found')
          setScanning(false)
          return
        }
        const camId = cameras[0]?.id
        html5Qr = new Html5Qrcode('qr-reader')
        html5QrRef.current = html5Qr
        return html5Qr.start(
          camId,
          { fps: 10, qrbox: { width: 250, height: 250 } },
          decodedText => {
            const playerId = parsePlayerIdFromUrl(decodedText)
            if (!playerId) return
            safeStopScanner(html5Qr)
            setScanning(false)
            setLastScanned({ playerId, scannedAt: new Date().toISOString() })
            fetch(`/api/player-id-card/verify/${playerId}`)
              .then(r => r.json())
              .then(data => {
                setPlayerDetails({ player: data.player, club: data.club })
              })
              .catch(() => setPlayerDetails(null))
          },
          () => {}
        )
      })
      .catch(err => {
        setScanError(err?.message || 'Camera error')
        setScanning(false)
      })
    return () => {
      safeStopScanner(html5QrRef.current || html5Qr)
      html5QrRef.current = null
    }
  }, [scanning])

  const handleRegisterAndLink = useCallback(async () => {
    if (!playerDetails?.player || !selectedMatchId || !selectedMatch) return
    const { player, club } = playerDetails
    const playerDocId = player.id
    try {
      await fetch('/api/referee/register-player', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId: selectedMatchId,
          matchName: selectedMatch.name || `${selectedMatch.homeClubName || selectedMatch.homeClubId} vs ${selectedMatch.awayClubName || selectedMatch.awayClubId}`,
          startTime: selectedMatch.matchTime || '',
          playerId: playerDocId,
          playerName: player.fullName,
          club: club?.clubName || '',
          jerseyNumber: player.jerseyNo || ''
        })
      })
      fetchRegistered()
    } catch (e) {
      console.error(e)
    }
  }, [playerDetails, selectedMatchId, selectedMatch, fetchRegistered])

  const handleConnectDevice = useCallback(async (deviceId) => {
    if (!playerDetails?.player || !selectedMatchId) return
    setLinkingDeviceId(deviceId)
    try {
      const res = await fetch('/api/iot/player-device-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: playerDetails.player.id,
          deviceId,
          matchId: selectedMatchId
        })
      })
      if (res.ok) {
        setPlayerDetails(prev => prev ? { ...prev, linkedDeviceId: deviceId } : null)
        fetchDevices()
      }
    } finally {
      setLinkingDeviceId(null)
    }
  }, [playerDetails, selectedMatchId, fetchDevices])

  const registeredForMatch = registered.filter(r => r.matchId === selectedMatchId)

  return (
    <div className='space-y-6'>
      <div>
        <Typography variant='h4' className='font-semibold mb-1'>
          Player ID Scanner
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          Scan player ID cards, view details, and connect their energy management IoT device (ESP32). Coaches see live data for connected players.
        </Typography>
      </div>

      <Card>
        <CardHeader title='1. Select match & scan player ID' />
        <CardContent>
          <FormControl fullWidth size='small' sx={{ mb: 2 }}>
            <InputLabel id='match-select-label'>Current match</InputLabel>
            <Select
              labelId='match-select-label'
              label='Current match'
              value={selectedMatchId}
              onChange={e => setSelectedMatchId(e.target.value)}
              disabled={loadingMatches}
            >
              {matches.map(m => (
                <MenuItem key={m.id} value={m.id}>
                  {m.matchDate} {m.matchTime} – {m.homeClubName || m.homeClubId} vs {m.awayClubName || m.awayClubId}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {scanError && <Alert severity='error' sx={{ mb: 2 }}>{scanError}</Alert>}

          <Box sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden', bgcolor: 'action.hover', border: '2px solid', borderColor: 'divider' }}>
            <div id='qr-reader' style={{ width: '100%', minHeight: scanning ? 320 : 200 }} />
            {!scanning && (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <i className='ri-qr-scan-2-line' style={{ fontSize: 64, opacity: 0.4 }} />
                <Typography variant='body1' color='text.secondary' sx={{ mt: 2 }}>
                  Click Scan to start camera and scan the player&apos;s ID card QR code
                </Typography>
                <Button variant='contained' size='large' startIcon={<i className='ri-qr-scan-2-line' />} onClick={startScanner} sx={{ mt: 2 }} disabled={!selectedMatchId}>
                  Scan QR code
                </Button>
              </Box>
            )}
            {scanning && (
              <Button variant='outlined' color='secondary' size='small' onClick={stopScanner} sx={{ position: 'absolute', top: 8, right: 8 }}>
                Stop
              </Button>
            )}
          </Box>

          {lastScanned && playerDetails && (
            <Alert severity='success' icon={<i className='ri-checkbox-circle-line' />} sx={{ mt: 2 }}>
              Scanned: <strong>{playerDetails.player?.fullName}</strong> (ID: {playerDetails.player?.playerId}). Register and connect a device below.
            </Alert>
          )}
        </CardContent>
      </Card>

      {playerDetails && playerDetails.player && (
        <>
          <Card>
            <CardHeader title='2. Player details' subheader='Verify and register for match' />
            <CardContent>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, alignItems: 'flex-start' }}>
                {playerDetails.player.photo && (
                  <Box component='img' src={playerDetails.player.photo} alt='' sx={{ width: 80, height: 80, borderRadius: 2, objectFit: 'cover' }} />
                )}
                <Box sx={{ flex: 1, minWidth: 200 }}>
                  <Typography variant='h6'>{playerDetails.player.fullName}</Typography>
                  <Typography variant='body2' color='text.secondary'>{playerDetails.player.playerId} · {playerDetails.player.position} · #{playerDetails.player.jerseyNo || '–'}</Typography>
                  <Typography variant='body2' color='text.secondary'>{playerDetails.club?.clubName || '–'} · DOB: {playerDetails.player.dateOfBirth || '–'}</Typography>
                </Box>
                <Button variant='contained' onClick={handleRegisterAndLink} disabled={!selectedMatchId}>
                  Register for match
                </Button>
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title='3. Connect IoT device' subheader='Select the player’s energy management device (ESP32)' />
            <CardContent>
              {devices.length === 0 ? (
                <Typography color='text.secondary'>No devices found. Ensure your ESP32 device is powered and has called the registration API (POST /api/iot/devices).</Typography>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {devices.map(d => (
                    <Box key={d.id || d.deviceId} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                      <Box>
                        <Typography fontWeight={600}>{d.name || d.deviceId}</Typography>
                        <Typography variant='caption' color='text.secondary'>{d.deviceId || d.id} · {d.type || 'device'} · <Chip size='small' label={d.status || 'unknown'} color={d.status === 'online' ? 'success' : 'default'} /></Typography>
                      </Box>
                      <Button
                        variant='outlined'
                        size='small'
                        onClick={() => handleConnectDevice(d.deviceId || d.id)}
                        disabled={linkingDeviceId !== null}
                        startIcon={linkingDeviceId === (d.deviceId || d.id) ? <CircularProgress size={16} /> : <i className='ri-bluetooth-connect-line' />}
                      >
                        {playerDetails.linkedDeviceId === (d.deviceId || d.id) ? 'Connected' : 'Connect to player'}
                      </Button>
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {selectedMatch && (
        <Card>
          <CardHeader title='Players registered for this match' subheader={`Match: ${selectedMatch.matchDate} ${selectedMatch.matchTime}`} />
          <CardContent>
            {registeredForMatch.length === 0 ? (
              <Typography color='text.secondary'>No players scanned yet. Scan player ID cards and connect their devices.</Typography>
            ) : (
              <Table size='small'>
                <TableHead>
                  <TableRow>
                    <TableCell>Player</TableCell>
                    <TableCell>Player ID</TableCell>
                    <TableCell>Club</TableCell>
                    <TableCell>Jersey</TableCell>
                    <TableCell>Scanned at</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {registeredForMatch.map((r, i) => (
                    <TableRow key={`${r.matchId}-${r.playerId}-${i}`}>
                      <TableCell>{r.playerName}</TableCell>
                      <TableCell>{r.playerId}</TableCell>
                      <TableCell>{r.club}</TableCell>
                      <TableCell>{r.jerseyNumber || '–'}</TableCell>
                      <TableCell>{new Date(r.scannedAt).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader title='Instructions' />
        <CardContent>
          <List dense>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}><i className='ri-number-1' style={{ fontSize: 20 }} /></ListItemIcon>
              <ListItemText primary='Select the current match. Tap Scan and allow camera access. Point the camera at the player ID card QR code.' />
            </ListItem>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}><i className='ri-number-2' style={{ fontSize: 20 }} /></ListItemIcon>
              <ListItemText primary='On successful scan, player details appear. Tap "Register for match" to add them to the match list.' />
            </ListItem>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}><i className='ri-number-3' style={{ fontSize: 20 }} /></ListItemIcon>
              <ListItemText primary='Under "Connect IoT device", select the player’s ESP32 energy management device and tap "Connect to player". The coach will see live data for this player.' />
            </ListItem>
          </List>
        </CardContent>
      </Card>
    </div>
  )
}

export default RefereeQRScanner
