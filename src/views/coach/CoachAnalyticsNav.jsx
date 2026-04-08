'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

const LINKS = [
  { href: '/coach/live-dashboard', label: 'Live dashboard', icon: 'ri-heart-pulse-line' },
  { href: '/coach/substitutions', label: 'Substitutions', icon: 'ri-repeat-line' },
  { href: '/coach/injury-alerts', label: 'Injury alerts', icon: 'ri-alarm-warning-line' },
  { href: '/coach/performance-history', label: 'Performance history', icon: 'ri-bar-chart-line' }
]

export default function CoachAnalyticsNav ({ matchLabel }) {
  const pathname = usePathname() || ''

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 1,
        py: 1.5,
        px: 0,
        borderBottom: '1px solid',
        borderColor: 'divider',
        mb: 2
      }}
    >
      {LINKS.map(({ href, label, icon }) => {
        const active = pathname.includes(href)
        return (
          <Button
            key={href}
            component={Link}
            href={href}
            size='small'
            variant={active ? 'contained' : 'outlined'}
            color={active ? 'primary' : 'inherit'}
            startIcon={<i className={icon} />}
          >
            {label}
          </Button>
        )
      })}
      {matchLabel ? (
        <Typography variant='caption' color='text.secondary' sx={{ ml: 'auto', maxWidth: { xs: '100%', sm: 280 } }}>
          Match: {matchLabel}
        </Typography>
      ) : null}
    </Box>
  )
}
