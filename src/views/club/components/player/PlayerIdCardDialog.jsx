'use client'

import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { toPng } from 'html-to-image'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import { useTheme } from '@mui/material/styles'

function formatExpiryIso (date) {
  if (!date || Number.isNaN(date.getTime())) return '—'
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function calculateAge (dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return '—'
  let age = new Date().getFullYear() - d.getFullYear()
  const m = new Date().getMonth() - d.getMonth()
  if (m < 0 || (m === 0 && new Date().getDate() < d.getDate())) age--
  return String(Math.max(0, age))
}

function splitNameForCard (fullName) {
  const s = (fullName || '').trim()
  if (!s) return { given: '—', family: '—' }
  const parts = s.split(/\s+/).filter(Boolean)
  if (parts.length === 1) return { given: parts[0], family: '—' }
  return { given: parts.slice(0, -1).join(' '), family: parts[parts.length - 1] }
}

export default function PlayerIdCardDialog ({ open, onClose, player, clubName }) {
  const theme = useTheme()
  const g = theme.palette.success
  const cardRef = useRef(null)
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState('')
  const [qrDataUrl, setQrDataUrl] = useState('')

  const verifyUrl = useMemo(() => {
    if (typeof window === 'undefined' || !player?.id) return ''
    return `${window.location.origin}/player/verify/${player.id}`
  }, [player?.id])

  const previewMeta = useMemo(() => {
    if (!player) return null
    const now = new Date()
    const expiry = new Date(now)
    expiry.setFullYear(expiry.getFullYear() + 1)
    const { given, family } = splitNameForCard(player.fullName)
    const idLabel = player.nicOrPassport?.trim() ? 'NIC / Passport' : 'Player #'
    const idVal = player.nicOrPassport?.trim() || player.playerId || '—'
    return {
      expiry: formatExpiryIso(expiry),
      given,
      family,
      age: calculateAge(player.dateOfBirth),
      idLabel,
      idVal,
      host: typeof window !== 'undefined' ? window.location.host : ''
    }
  }, [player])

  useEffect(() => {
    if (!open || !verifyUrl) {
      setQrDataUrl('')
      return
    }
    let cancelled = false
    import('qrcode').then(({ default: QR }) => {
      QR.toDataURL(verifyUrl, { width: 200, margin: 1, color: { dark: '#0f172a', light: '#ffffff' } })
        .then(url => {
          if (!cancelled) setQrDataUrl(url)
        })
        .catch(() => {
          if (!cancelled) setQrDataUrl('')
        })
    })
    return () => { cancelled = true }
  }, [open, verifyUrl])

  const handleDownloadPng = useCallback(async () => {
    const node = cardRef.current
    if (!node || !player?.id) return
    if (!qrDataUrl) {
      setError('Please wait for the QR code to finish loading before saving the image.')
      return
    }
    setDownloading(true)
    setError('')
    try {
      if (document.fonts?.ready) await document.fonts.ready
      const dataUrl = await toPng(node, {
        pixelRatio: 2.5,
        cacheBust: true,
        backgroundColor: null
      })
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = `player-id-${player.playerId || player.id}.png`
      a.click()
      onClose?.()
    } catch (e) {
      setError(e?.message || 'Could not save image. Try again or use a different browser.')
    } finally {
      setDownloading(false)
    }
  }, [player, qrDataUrl, onClose])

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth scroll='body'>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>Player ID Card</span>
        <IconButton size='small' onClick={onClose} aria-label='close'>
          <i className='ri-close-line' />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {player && previewMeta && (
          <>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
              Official player ID preview — system green styling with QR verification. Download as a PNG image to print or share.
            </Typography>
            {error && <Alert severity='error' sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <Box
                ref={cardRef}
                sx={{
                  width: '100%',
                  maxWidth: 280,
                  borderRadius: '14px',
                  overflow: 'hidden',
                  boxShadow: theme.shadows[8],
                  background: `linear-gradient(165deg, ${g.light} 0%, ${g.main} 42%, ${g.dark} 100%)`
                }}
              >
                {/* Photo + profile */}
                <Box sx={{ pt: 3, pb: 1.5, px: 2, textAlign: 'center' }}>
                  <Box
                    sx={{
                      width: 96,
                      height: 96,
                      mx: 'auto',
                      borderRadius: '50%',
                      p: '3px',
                      background: `linear-gradient(135deg, ${g.light}, ${g.contrastText})`,
                      boxShadow: `0 0 0 3px rgba(255,255,255,0.25), 0 8px 24px rgba(0,0,0,0.2)`
                    }}
                  >
                    <Box
                      sx={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        bgcolor: 'rgba(255,255,255,0.15)'
                      }}
                    >
                      {player.photo ? (
                        <Box component='img' src={player.photo} alt='' sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.85)', fontSize: 12 }}>
                          Photo
                        </Box>
                      )}
                    </Box>
                  </Box>

                  {[
                    ['Expiry date', previewMeta.expiry],
                    ['Surname', previewMeta.family],
                    ['Name', previewMeta.given],
                    ['Age', previewMeta.age]
                  ].map(([label, val]) => (
                    <Typography key={label} variant='body2' sx={{ color: 'rgba(255,255,255,0.95)', mt: 0.75, lineHeight: 1.35 }}>
                      <Box component='span' sx={{ fontWeight: 500, opacity: 0.92 }}>{label}: </Box>
                      <Box component='span' sx={{ fontWeight: 700 }}>{val}</Box>
                    </Typography>
                  ))}
                </Box>

                {/* Verify panel */}
                <Box sx={{ mx: 1.75, mb: 1.75, borderRadius: '10px', bgcolor: '#fff', overflow: 'hidden' }}>
                  <Box sx={{ bgcolor: '#171717', color: '#fff', px: 1.25, py: 1.1, textAlign: 'center' }}>
                    <Typography variant='caption' sx={{ fontSize: '0.65rem', lineHeight: 1.35, display: 'block' }}>
                      Verify ID: scan QR below or open verify page · {previewMeta.host}
                    </Typography>
                  </Box>
                  <Box sx={{ height: 2, bgcolor: g.main }} />
                  <Box sx={{ px: 1.5, pt: 1.25, pb: 1.5, textAlign: 'center' }}>
                    <Typography variant='body2' sx={{ color: 'text.secondary', mb: 0.5 }}>
                      <Box component='span' sx={{ fontWeight: 500 }}>{previewMeta.idLabel}: </Box>
                      <Box component='span' sx={{ fontWeight: 700, color: 'text.primary' }}>{previewMeta.idVal}</Box>
                    </Typography>
                    {qrDataUrl ? (
                      <Box component='img' src={qrDataUrl} alt='Verification QR' sx={{ width: 148, height: 148, mx: 'auto', display: 'block' }} />
                    ) : (
                      <Box sx={{ height: 148, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CircularProgress size={28} sx={{ color: g.main }} />
                      </Box>
                    )}
                    <Typography
                      variant='caption'
                      component='a'
                      href={verifyUrl}
                      target='_blank'
                      rel='noopener noreferrer'
                      sx={{ display: 'block', mt: 1, color: g.main, fontWeight: 600, textDecoration: 'underline', cursor: 'pointer' }}
                    >
                      Data shared via QR code
                    </Typography>
                    <Typography variant='caption' color='text.disabled' sx={{ display: 'block', mt: 0.5 }}>
                      {clubName ? `${clubName} · Official player ID` : 'Smart Football · Official player ID'}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <Button onClick={onClose} disabled={downloading}>Cancel</Button>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          variant='contained'
          color='success'
          onClick={handleDownloadPng}
          disabled={downloading || !qrDataUrl}
          startIcon={downloading ? <CircularProgress size={16} color='inherit' /> : <i className='ri-download-2-line' />}
        >
          Download image (PNG)
        </Button>
      </DialogActions>
    </Dialog>
  )
}
