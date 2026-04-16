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
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import { Html5Qrcode } from 'html5-qrcode'
import { useSelector } from 'react-redux'
import { ref, onValue, off } from 'firebase/database'
import { getRealtimeDbClient } from '@/lib/firebase-client'

function parsePlayerIdFromUrl(urlString) {
  const raw = typeof urlString === 'string' ? urlString.trim() : ''
  if (!raw) return null
  try {
    const url = new URL(raw)
    const path = url.pathname || ''
    const match = path.match(/\/player\/verify\/([^/]+)/)
    return match ? match[1].trim() : null
  } catch {
    if (raw.includes('/player/verify/')) {
      const parts = raw.split('/player/verify/')
      const tail = parts[1]
      return tail ? tail.split('/')[0].split('?')[0].trim() : null
    }
    return null
  }
}

/** Prefer rear/environment camera — first enumerated camera is often the selfie cam on phones. */
function pickCameraIdOrConfig(cameras) {
  if (!cameras?.length) return { facingMode: 'environment' }
  const backByLabel = cameras.find(c => /back|rear|environment|wide|world/i.test(c.label || ''))
  if (backByLabel) return backByLabel.id
  if (cameras.length > 1) return cameras[cameras.length - 1].id
  return cameras[0].id
}

async function safeStopAndClear(scanner) {
  if (!scanner) return
  try {
    if (typeof scanner.stop === 'function') await scanner.stop()
  } catch {
    // ignore
  }
  try {
    if (typeof scanner.clear === 'function') await scanner.clear()
  } catch {
    // ignore
  }
}

const RefereeQRScanner = () => {
  const token = useSelector(state => state?.authenticationReducer?.loginData?.token)
  const [refereeId, setRefereeId] = useState(undefined)
  const [scanning, setScanning] = useState(false)
  const [matches, setMatches] = useState([])
  const [selectedMatchId, setSelectedMatchId] = useState('')
  const [lastScanned, setLastScanned] = useState(null)
  const [playerDetails, setPlayerDetails] = useState(null)
  const [devices, setDevices] = useState([])
  const [activeLinks, setActiveLinks] = useState([])
  const [connectModalOpen, setConnectModalOpen] = useState(false)
  const [playerToConnect, setPlayerToConnect] = useState(null)
  const [linkingDeviceId, setLinkingDeviceId] = useState(null)
  const [registered, setRegistered] = useState([])
  const [loadingMatches, setLoadingMatches] = useState(true)
  const [scanError, setScanError] = useState('')
  const html5QrRef = useRef(null)
  const invalidQrHintAtRef = useRef(0)

  const selectedMatch = matches.find(m => m.id === selectedMatchId)
  const selectedMatchRef = useRef(null)
  const registeredRef = useRef([])

  useEffect(() => {
    selectedMatchRef.current = selectedMatch
  }, [selectedMatch])

  useEffect(() => {
    registeredRef.current = registered
  }, [registered])

  useEffect(() => {
    if (!token) {
      setRefereeId(null)
      return
    }
    let cancelled = false
    fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(me => { if (!cancelled) setRefereeId(me.refereeId || null) })
      .catch(() => { if (!cancelled) setRefereeId(null) })
    return () => { cancelled = true }
  }, [token])

  const fetchMatches = useCallback(async () => {
    if (refereeId === undefined) return
    try {
      setLoadingMatches(true)
      const url = refereeId
        ? `/api/matches?status=scheduled&refereeId=${encodeURIComponent(refereeId)}`
        : '/api/matches?status=scheduled'
      const res = await fetch(url)
      const list = await res.json().catch(() => [])
      setMatches(Array.isArray(list) ? list : [])
      if (list?.length && !selectedMatchId) setSelectedMatchId(list[0]?.id || '')
    } finally {
      setLoadingMatches(false)
    }
  }, [selectedMatchId, refereeId])

  const fetchDevicesFirestoreFallback = useCallback(async () => {
    try {
      const res = await fetch('/api/iot/devices')
      const list = await res.json().catch(() => [])
      setDevices(Array.isArray(list) ? list : [])
    } catch {
      setDevices([])
    }
  }, [])

  const fetchActiveLinks = useCallback(async () => {
    try {
      const res = await fetch('/api/iot/player-device-link')
      const list = await res.json().catch(() => [])
      setActiveLinks(Array.isArray(list) ? list : [])
    } catch {
      setActiveLinks([])
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
    const rtdb = getRealtimeDbClient()
    if (!rtdb) {
      fetchDevicesFirestoreFallback()
      const t = setInterval(fetchDevicesFirestoreFallback, 15000)
      return () => clearInterval(t)
    }
    const devicesRef = ref(rtdb, 'devices')
    const handler = snapshot => {
      const val = snapshot.val()
      if (!val || typeof val !== 'object') {
        setDevices([])
        return
      }
      const list = Object.keys(val)
        .filter(deviceId => {
          const node = val[deviceId]
          return node && typeof node === 'object'
        })
        .map(deviceId => {
          const data = val[deviceId] || {}
          const sensor = data.sensor || {}
          const hr = sensor.heartRate || {}
          const motion = sensor.motion || {}
          const hasSensor = sensor && Object.keys(sensor).length > 0
          return {
            id: deviceId,
            deviceId,
            name: deviceId,
            status: hasSensor ? 'online' : 'offline',
            previewBpm: typeof hr.bpm === 'number' ? hr.bpm : null,
            previewSteps: typeof motion.steps === 'number' ? motion.steps : null
          }
        })
        .sort((a, b) => a.deviceId.localeCompare(b.deviceId))
      setDevices(list)
    }
    onValue(devicesRef, handler)
    return () => off(devicesRef, 'value', handler)
  }, [fetchDevicesFirestoreFallback])

  useEffect(() => {
    fetchActiveLinks()
    const t = setInterval(fetchActiveLinks, 15000)
    return () => clearInterval(t)
  }, [fetchActiveLinks])

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
    void safeStopAndClear(html5QrRef.current)
    html5QrRef.current = null
  }, [])

  useEffect(() => {
    if (!scanning) return
    let cancelled = false
    let html5Qr

    const scannerConfig = {
      fps: 15,
      qrbox: (viewfinderW, viewfinderH) => {
        const edge = Math.min(viewfinderW, viewfinderH)
        const size = Math.max(180, Math.min(320, Math.floor(edge * 0.72)))
        return { width: size, height: size }
      }
    }

    const onDecoded = decodedText => {
      const playerId = parsePlayerIdFromUrl(decodedText)
      if (!playerId) {
        const now = Date.now()
        if (now - invalidQrHintAtRef.current > 2800) {
          invalidQrHintAtRef.current = now
          setScanError('QR detected but it is not a Smart Football player ID link. Use the QR on the official ID card.')
        }
        return
      }

      const matchId = selectedMatchRef.current?.id
      if (matchId && registeredRef.current.some(r => r.matchId === matchId && r.playerId === playerId)) {
        void safeStopAndClear(html5Qr)
        html5QrRef.current = null
        setScanning(false)
        setScanError('This player has already been registered for the current match.')
        return
      }

      void safeStopAndClear(html5Qr)
      html5QrRef.current = null
      setScanning(false)
      setScanError('')
      setLastScanned({ playerId, scannedAt: new Date().toISOString() })
      fetch(`/api/player-id-card/verify/${playerId}`)
        .then(r => r.json())
        .then(data => {
          const match = selectedMatchRef.current
          const clubId = data.club?.id || data.club?.clubId
          if (match && clubId !== match.homeClubId && clubId !== match.awayClubId) {
            setScanError(`Player's club does not match the playing clubs (${match.homeClubName || match.homeClubId} vs ${match.awayClubName || match.awayClubId}). Scanned club: ${data.club?.clubName || data.club?.name || clubId}`)
            setPlayerDetails(null)
          } else {
            setPlayerDetails({ player: data.player, club: data.club })
          }
        })
        .catch(() => setPlayerDetails(null))
    }

    const startWithCamera = async () => {
      try {
        const cameras = await Html5Qrcode.getCameras()
        if (cancelled) return
        if (!cameras?.length) {
          setScanError('No camera found')
          setScanning(false)
          return
        }

        html5Qr = new Html5Qrcode('qr-reader', { verbose: false })
        html5QrRef.current = html5Qr

        const preferred = pickCameraIdOrConfig(cameras)
        const attempts = []
        const pushCam = c => {
          if (c == null) return
          const key = typeof c === 'string' ? `id:${c}` : 'facing:environment'
          if (attempts.some(a => (typeof a === 'string' ? `id:${a}` : 'facing:environment') === key)) return
          attempts.push(c)
        }
        pushCam(preferred)
        if (typeof preferred === 'string') pushCam({ facingMode: 'environment' })
        pushCam(cameras[cameras.length - 1]?.id)
        pushCam(cameras[0]?.id)

        let lastErr
        for (const cam of attempts) {
          if (cancelled || !html5Qr) break
          try {
            await html5Qr.start(cam, scannerConfig, onDecoded, () => {})
            lastErr = null
            break
          } catch (e) {
            lastErr = e
            await safeStopAndClear(html5Qr)
            if (cancelled) break
            html5Qr = new Html5Qrcode('qr-reader', { verbose: false })
            html5QrRef.current = html5Qr
          }
        }
        if (lastErr && !cancelled) {
          setScanError(lastErr?.message || 'Could not start camera')
          setScanning(false)
        }
      } catch (err) {
        if (!cancelled) {
          setScanError(err?.message || 'Camera error')
          setScanning(false)
        }
      }
    }

    void startWithCamera()

    return () => {
      cancelled = true
      void safeStopAndClear(html5QrRef.current || html5Qr)
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
          clubId: club?.id || '',
          jerseyNumber: player.jerseyNo || ''
        })
      })
      fetchRegistered()
    } catch (e) {
      console.error(e)
    }
  }, [playerDetails, selectedMatchId, selectedMatch, fetchRegistered])

  const handleConnectDevice = useCallback(async (deviceId) => {
    if (!playerToConnect || !selectedMatchId) return
    setLinkingDeviceId(deviceId)
    try {
      const res = await fetch('/api/iot/player-device-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: playerToConnect.playerId,
          deviceId,
          matchId: selectedMatchId
        })
      })
      if (res.ok) {
        setPlayerDetails(prev => prev ? { ...prev, linkedDeviceId: deviceId } : null)
        fetchActiveLinks()
        setConnectModalOpen(false)
        setPlayerToConnect(null)
      }
    } finally {
      setLinkingDeviceId(null)
    }
  }, [playerToConnect, selectedMatchId, fetchActiveLinks])

  const connectedDeviceIds = activeLinks.map(l => l.deviceId)
  const availableDevices = devices.filter(d => !connectedDeviceIds.includes(d.deviceId || d.id))

  const registeredForMatch = registered.filter(r => r.matchId === selectedMatchId)

  const homeTeamPlayers = registeredForMatch.filter(r => r.clubId ? r.clubId === selectedMatch?.homeClubId : r.club === (selectedMatch?.homeClubName || selectedMatch?.homeClubId))
  const awayTeamPlayers = registeredForMatch.filter(r => r.clubId ? r.clubId === selectedMatch?.awayClubId : r.club === (selectedMatch?.awayClubName || selectedMatch?.awayClubId))

  const renderPlayersTable = (players, teamName) => (
    <Box sx={{ mt: 3, mb: 1 }}>
      <Typography variant='subtitle1' className='font-semibold mb-2'>{teamName}</Typography>
      {players.length === 0 ? (
        <Typography color='text.secondary' variant='body2'>No players registered yet.</Typography>
      ) : (
        <Table size='small'>
          <TableHead>
            <TableRow>
              <TableCell>Player</TableCell>
              <TableCell>Player ID</TableCell>
              <TableCell>Club</TableCell>
              <TableCell>Jersey</TableCell>
              <TableCell>Scanned at</TableCell>
              <TableCell align='center'>Device</TableCell>
              <TableCell align='center'>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {players.map((r, i) => {
              const link = activeLinks.find(l => l.playerId === r.playerId && l.matchId === r.matchId && l.status === 'active')
              return (
              <TableRow key={`${r.matchId}-${r.playerId}-${i}`}>
                <TableCell>{r.playerName}</TableCell>
                <TableCell>{r.playerId}</TableCell>
                <TableCell>{r.club}</TableCell>
                <TableCell>{r.jerseyNumber || '–'}</TableCell>
                <TableCell>{new Date(r.scannedAt).toLocaleTimeString()}</TableCell>
                <TableCell align='center'>
                  {link ? (
                    <Chip size='small' label={link.deviceId} color='success' variant='outlined' />
                  ) : (
                    <Typography variant='caption' color='text.secondary'>–</Typography>
                  )}
                </TableCell>
                <TableCell align='center'>
                  {!link && (
                    <Button size='small' variant='outlined' onClick={() => {
                        setPlayerToConnect(r)
                        setConnectModalOpen(true)
                    }}>
                      Connect Device
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            )})}
          </TableBody>
        </Table>
      )}
    </Box>
  )

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
              {availableDevices.length > 0 && (
                <Box sx={{ mt: 2, p: 2, borderRadius: 2, bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant='subtitle2' sx={{ mb: 1 }}>Energy IoT devices (live from database)</Typography>
                  <Typography variant='caption' color='text.secondary' display='block' sx={{ mb: 1 }}>
                    After registering, use Connect Device in the match list to assign one of these device IDs to the player.
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {availableDevices.map(d => (
                      <Chip
                        key={d.deviceId || d.id}
                        size='small'
                        label={d.previewBpm != null ? `${d.deviceId} · ${d.previewBpm} bpm` : `${d.deviceId}`}
                        color={d.status === 'online' ? 'success' : 'default'}
                        variant='outlined'
                      />
                    ))}
                  </Box>
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
              <>
                {renderPlayersTable(homeTeamPlayers, `Home Team: ${selectedMatch.homeClubName || selectedMatch.homeClubId}`)}
                {renderPlayersTable(awayTeamPlayers, `Away Team: ${selectedMatch.awayClubName || selectedMatch.awayClubId}`)}
              </>
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

      <Dialog open={connectModalOpen} onClose={() => setConnectModalOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle>Connect IoT Device for {playerToConnect?.playerName}</DialogTitle>
        <DialogContent dividers>
          {availableDevices.length === 0 ? (
             <Typography color='text.secondary'>No available devices found. Ensure your ESP32 devices are powered and communicating.</Typography>
          ) : (
             <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
               {availableDevices.map(d => (
                 <Box key={d.id || d.deviceId} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                   <Box>
                     <Typography fontWeight={600}>{d.name || d.deviceId}</Typography>
                     <Typography variant='caption' color='text.secondary' component='span' sx={{ display: 'block' }}>
                       {d.previewBpm != null && `${d.previewBpm} bpm`}
                       {d.previewBpm != null && d.previewSteps != null && ' · '}
                       {d.previewSteps != null && `${d.previewSteps} steps`}
                       {(d.previewBpm == null && d.previewSteps == null) && 'Awaiting sensor data'}
                     </Typography>
                     <Typography variant='caption' color='text.secondary'>{d.deviceId || d.id} · <Chip size='small' label={d.status || 'unknown'} color={d.status === 'online' ? 'success' : 'default'} /></Typography>
                   </Box>
                   <Button
                     variant='contained'
                     size='small'
                     onClick={() => handleConnectDevice(d.deviceId || d.id)}
                     disabled={linkingDeviceId !== null}
                     startIcon={linkingDeviceId === (d.deviceId || d.id) ? <CircularProgress size={16} color='inherit' /> : <i className='ri-link' />}
                   >
                     Connect
                   </Button>
                 </Box>
               ))}
             </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConnectModalOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default RefereeQRScanner
