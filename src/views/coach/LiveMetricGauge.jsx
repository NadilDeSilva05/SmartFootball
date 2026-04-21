'use client'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import { useTheme, alpha } from '@mui/material/styles'

/**
 * Compact circular gauge for live wearable metrics (track ring + determinate arc + value).
 */
export default function LiveMetricGauge ({
  label,
  value,
  unit = '',
  max = 100,
  decimals = 0,
  colorKey = 'primary',
  muted = false
}) {
  const theme = useTheme()
  const n = Number(value)
  const safe = Number.isFinite(n) ? n : 0
  const pct = max > 0 ? Math.min(100, Math.max(0, (safe / max) * 100)) : 0
  const paletteColor = theme.palette[colorKey]?.main || theme.palette.primary.main
  const ring = muted ? theme.palette.action.disabled : paletteColor
  const bg = alpha(paletteColor, muted ? 0.06 : 0.1)
  const display = Number.isFinite(n) ? (decimals > 0 ? n.toFixed(decimals) : String(Math.round(n))) : '–'

  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: 2,
        bgcolor: bg,
        border: '1px solid',
        borderColor: muted ? 'divider' : alpha(paletteColor, 0.35),
        textAlign: 'center',
        transition: theme.transitions.create(['border-color', 'background-color'], { duration: 200 })
      }}
    >
      <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 0.75, fontWeight: 600, letterSpacing: 0.2 }}>
        {label}
      </Typography>
      <Box sx={{ position: 'relative', width: 108, height: 108, mx: 'auto' }}>
        <CircularProgress
          variant='determinate'
          value={100}
          size={108}
          thickness={5}
          sx={{
            color: alpha(ring, 0.14),
            position: 'absolute',
            left: 0,
            top: 0,
            '& .MuiCircularProgress-circle': { strokeLinecap: 'round' }
          }}
        />
        <CircularProgress
          variant='determinate'
          value={pct}
          size={108}
          thickness={5}
          sx={{
            color: ring,
            position: 'absolute',
            left: 0,
            top: 0,
            '& .MuiCircularProgress-circle': { strokeLinecap: 'round' }
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            px: 0.5
          }}
        >
          <Typography variant='h6' sx={{ fontWeight: 700, lineHeight: 1.1, color: muted ? 'text.disabled' : 'text.primary' }}>
            {display}
          </Typography>
          {unit ? (
            <Typography variant='caption' color='text.secondary' sx={{ fontWeight: 500 }}>
              {unit}
            </Typography>
          ) : null}
        </Box>
      </Box>
    </Box>
  )
}
