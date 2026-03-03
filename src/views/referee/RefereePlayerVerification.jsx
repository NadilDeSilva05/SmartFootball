'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Button from '@mui/material/Button'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import CustomAvatar from '@core/components/mui/Avatar'

const getEligibilityColor = status => (status === 'eligible' ? 'success' : 'error')

const RefereePlayerVerification = () => {
  const token = useSelector(state => state?.authenticationReducer?.loginData?.token)
  const [refereeId, setRefereeId] = useState(null)
  const [matches, setMatches] = useState([])
  const [registered, setRegistered] = useState([])
  const [selectedMatchId, setSelectedMatchId] = useState('')
  const [verifiedPlayer, setVerifiedPlayer] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }
    let cancelled = false
    fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(me => {
        if (cancelled) return
        setRefereeId(me.refereeId || null)
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [token])

  const fetchMatches = useCallback(() => {
    if (!refereeId && refereeId !== undefined) return
    const url = refereeId
      ? `/api/matches?status=scheduled&refereeId=${encodeURIComponent(refereeId)}`
      : '/api/matches?status=scheduled'
    fetch(url)
      .then(r => r.json())
      .then(arr => {
        const list = Array.isArray(arr) ? arr : []
        setMatches(list)
        if (list.length > 0) setSelectedMatchId(prev => prev || list[0].id)
      })
      .catch(() => setMatches([]))
  }, [refereeId])

  useEffect(() => {
    fetchMatches()
  }, [fetchMatches])

  useEffect(() => {
    if (!selectedMatchId) {
      setRegistered([])
      setVerifiedPlayer(null)
      return
    }
    fetch(`/api/referee/registered?matchId=${encodeURIComponent(selectedMatchId)}`)
      .then(r => r.json())
      .then(arr => {
        const list = Array.isArray(arr) ? arr : []
        setRegistered(list)
        const last = list[0]
        if (last) {
          setVerifiedPlayer({
            name: last.playerName || last.playerId || '–',
            club: last.club || '–',
            playerId: last.playerId,
            jerseyNumber: last.jerseyNumber || '–',
            scannedAt: last.scannedAt
          })
        } else {
          setVerifiedPlayer(null)
        }
      })
      .catch(() => { setRegistered([]); setVerifiedPlayer(null) })
  }, [selectedMatchId])

  const assignedMatches = matches

  return (
    <div className='space-y-6'>
      <div>
        <Typography variant='h4' className='font-semibold mb-1'>
          Player Verification
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          View your assigned matches and last verified player per match. Use QR Scanner to verify players.
        </Typography>
      </div>

      <Card>
        <CardHeader title='Verified Player' subheader='Select a match to see the last registered (verified) player for that match' />
        <CardContent>
          <FormControl fullWidth size='small' sx={{ mb: 2, maxWidth: 400 }}>
            <InputLabel>Match</InputLabel>
            <Select
              label='Match'
              value={selectedMatchId}
              onChange={e => setSelectedMatchId(e.target.value)}
              disabled={loading}
            >
              {matches.map(m => (
                <MenuItem key={m.id} value={m.id}>
                  {m.matchDate} {m.matchTime} – {m.homeClubName || m.homeClubId} vs {m.awayClubName || m.awayClubId}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {verifiedPlayer ? (
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { sm: 'flex-start' }, gap: 4 }}>
              <CustomAvatar skin='light' color='primary' size={100} sx={{ fontSize: '2.5rem' }}>
                {verifiedPlayer.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'P'}
              </CustomAvatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant='h6' className='font-semibold' gutterBottom>
                  {verifiedPlayer.name}
                </Typography>
                <Typography variant='body2' color='text.secondary' gutterBottom>
                  {verifiedPlayer.club} #{verifiedPlayer.jerseyNumber}
                </Typography>
                <Chip size='small' label='Eligible' color={getEligibilityColor('eligible')} variant='tonal' sx={{ mt: 1 }} />
                <Typography variant='caption' display='block' sx={{ mt: 1 }} color='text.secondary'>
                  Player ID: {verifiedPlayer.playerId} • Scanned: {verifiedPlayer.scannedAt ? new Date(verifiedPlayer.scannedAt).toLocaleString() : '–'}
                </Typography>
              </Box>
            </Box>
          ) : (
            <Box sx={{ py: 3, textAlign: 'center', color: 'text.secondary' }}>
              <Typography variant='body1'>Select a match to see the last verified player, or use QR Scanner to verify players.</Typography>
              <Button variant='contained' href='/referee/qr-scanner' sx={{ mt: 2 }}>
                Open QR Scanner
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          title={refereeId ? 'My upcoming assigned matches' : 'Scheduled matches'}
          subheader={refereeId ? 'Matches where you are assigned' : 'Log in as referee and assign yourself to see filtered list'}
        />
        <CardContent>
          {loading ? (
            <Typography color='text.secondary'>Loading…</Typography>
          ) : assignedMatches.length === 0 ? (
            <Typography color='text.secondary'>No scheduled matches found.</Typography>
          ) : (
            <Table size='small'>
              <TableHead>
                <TableRow>
                  <TableCell>Date & Time</TableCell>
                  <TableCell>Match</TableCell>
                  <TableCell>Venue</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {assignedMatches.map(m => (
                  <TableRow key={m.id} hover>
                    <TableCell>
                      <Typography variant='body2'>{m.matchDate}</Typography>
                      <Typography variant='caption' color='text.secondary'>{m.matchTime}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography className='font-medium'>{m.homeClubName || m.homeClubId} vs {m.awayClubName || m.awayClubId}</Typography>
                    </TableCell>
                    <TableCell>{m.venue || '–'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default RefereePlayerVerification
