'use client'

import { useState } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'

export default function PlayerIdCardDialog ({ open, onClose, player, clubName }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleDownload = async () => {
    if (!player?.id) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/player-id-card?playerId=${encodeURIComponent(player.id)}`)
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error || 'Failed to generate ID card')
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `player-id-${player.playerId || player.id}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      onClose?.()
    } catch (e) {
      setError(e?.message || 'Download failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth='xs' fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>Player ID Card</span>
        <IconButton size='small' onClick={onClose} aria-label='close'>
          <i className='ri-close-line' />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {player && (
          <>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
              Generate a professional ID card for <strong>{player.fullName}</strong>
              {clubName && <> ({clubName})</>}. The card includes a unique QR code — when scanned, it shows all player details.
            </Typography>
            {error && <Alert severity='error' sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button
          variant='contained'
          onClick={handleDownload}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} color='inherit' /> : <i className='ri-download-line' />}
        >
          Download PDF
        </Button>
      </DialogActions>
    </Dialog>
  )
}
