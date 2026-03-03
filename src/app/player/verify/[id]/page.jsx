'use client'

import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Divider from '@mui/material/Divider'

export default function PlayerVerifyPage ({ params }) {
  const [id] = useState(() => (typeof params?.id === 'string' ? params.id : params?.id))
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) {
      setError('Invalid player link')
      setLoading(false)
      return
    }
    fetch(`/api/player-id-card/verify/${id}`)
      .then(res => {
        if (!res.ok) throw new Error(res.status === 404 ? 'Player not found' : 'Failed to load')
        return res.json()
      })
      .then(setData)
      .catch(e => setError(e?.message || 'Failed to load player details'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f5f5' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error || !data) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f5f5', p: 2 }}>
        <Typography color='error'>{error || 'Player not found'}</Typography>
      </Box>
    )
  }

  const { player, club } = data
  const fields = [
    { label: 'Full Name', value: player?.fullName },
    { label: 'Player ID', value: player?.playerId },
    { label: 'Position', value: player?.position },
    { label: 'Jersey No', value: player?.jerseyNo },
    { label: 'Date of Birth', value: player?.dateOfBirth },
    { label: 'NIC / Passport', value: player?.nicOrPassport },
    { label: 'Resident Status', value: player?.residentStatus },
    ...(player?.residentStatus === 'foreign' ? [{ label: 'Visa No', value: player?.visaNo }] : []),
    { label: 'Commentary Name', value: player?.commentaryName },
    { label: 'Email', value: player?.email }
  ].filter(f => f.value != null && f.value !== '')

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', py: 3, px: 2 }}>
      <Card sx={{ maxWidth: 420, mx: 'auto', borderRadius: 2, boxShadow: 2 }}>
        <Box sx={{ bgcolor: '#1a237e', color: 'white', p: 2, borderRadius: '8px 8px 0 0' }}>
          <Typography variant='h6' fontWeight={600}>Player Verification</Typography>
          <Typography variant='body2' sx={{ opacity: 0.9 }}>{club?.clubName || 'Club'}</Typography>
        </Box>
        <CardContent sx={{ pt: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            {player?.photo ? (
              <Box
                component='img'
                src={player.photo}
                alt={player.fullName}
                sx={{ width: 72, height: 72, borderRadius: 2, objectFit: 'cover', border: '1px solid', borderColor: 'divider' }}
              />
            ) : (
              <Box sx={{ width: 72, height: 72, borderRadius: 2, bgcolor: 'action.hover', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant='h5' color='text.secondary'>
                  {(player?.fullName || '?').split(' ').map(n => n[0]).join('').slice(0, 2)}
                </Typography>
              </Box>
            )}
            <Box>
              <Typography variant='subtitle1' fontWeight={600}>{player?.fullName || '—'}</Typography>
              <Typography variant='body2' color='text.secondary'>{player?.playerId} · {player?.position}</Typography>
            </Box>
          </Box>
          <Divider sx={{ my: 2 }} />
          {fields.map(({ label, value }) => (
            <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.75, gap: 2 }}>
              <Typography variant='body2' color='text.secondary'>{label}</Typography>
              <Typography variant='body2' fontWeight={500} sx={{ textAlign: 'right' }}>{value}</Typography>
            </Box>
          ))}
          <Typography variant='caption' color='text.secondary' display='block' sx={{ mt: 2 }}>
            This is an official verification. Scanned from player ID card.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}
