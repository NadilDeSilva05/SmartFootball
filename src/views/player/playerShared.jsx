'use client'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import CustomAvatar from '@core/components/mui/Avatar'

export const getInitials = value =>
  value
    ?.split(' ')
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'P'

export const getStatusColor = status => {
  if (status === 'approved' || status === 'active') return 'success'
  if (status === 'pending') return 'warning'
  if (status === 'rejected' || status === 'inactive') return 'error'

  return 'secondary'
}

export const getFatigueColor = level => {
  if (level === 'High') return 'error'
  if (level === 'Medium') return 'warning'

  return 'success'
}

export const formatDateLabel = value => {
  if (!value) return '-'
  const parsed = new Date(value)

  if (Number.isNaN(parsed.getTime())) return value

  return new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(parsed)
}

export const formatDateTimeLabel = value => {
  if (!value) return '-'
  const parsed = new Date(value)

  if (Number.isNaN(parsed.getTime())) return value

  return new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(parsed)
}

export const formatMetric = (value, digits = 0) => {
  if (value === undefined || value === null || value === '') return '-'

  const parsed = Number(value)

  if (Number.isNaN(parsed)) return '-'

  return parsed.toFixed(digits)
}

export const PlayerHero = ({
  title,
  description,
  image,
  actions,
  badge,
  accent = 'rgba(25, 118, 210, 0.08)',
  children
}) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: { xs: 'column', lg: 'row' },
      alignItems: { xs: 'stretch', lg: 'center' },
      justifyContent: 'space-between',
      gap: 4,
      p: { xs: 3, sm: 4 },
      borderRadius: 3,
      border: '1px solid',
      borderColor: 'divider',
      background: `linear-gradient(135deg, ${accent} 0%, rgba(2, 136, 209, 0.05) 45%, transparent 100%)`
    }}
  >
    <Box sx={{ flex: 1, minWidth: 0 }}>
      {badge}
      <Typography variant='h4' fontWeight={700} sx={{ mb: 1.5 }}>
        {title}
      </Typography>
      <Typography variant='body1' color='text.secondary' sx={{ maxWidth: 720, mb: actions ? 3 : 0 }}>
        {description}
      </Typography>
      {children}
      {actions ? (
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 3 }}>
          {actions}
        </Box>
      ) : null}
    </Box>

    {image ? (
      <Box sx={{ flexShrink: 0, display: { xs: 'none', md: 'block' } }}>
        <img src={image} alt='' style={{ maxHeight: 220, width: 'auto', objectFit: 'contain' }} />
      </Box>
    ) : null}
  </Box>
)

export const PlayerIdentityCard = ({ profile, displayName, subtitle, chipLabel, chipColor, image }) => (
  <Card sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
    {image ? (
      <Box sx={{ position: 'absolute', top: 18, right: 18, opacity: 0.12 }}>
        <img src={image} alt='' style={{ height: 110, width: 'auto' }} />
      </Box>
    ) : null}
    <CardContent sx={{ p: 3, position: 'relative' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <CustomAvatar
          src={profile?.photo || ''}
          skin='light'
          color='primary'
          size={78}
          sx={{ fontSize: '1.8rem', boxShadow: theme => `0 0 0 6px ${theme.palette.background.paper}` }}
        >
          {getInitials(displayName)}
        </CustomAvatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant='h5' fontWeight={700} noWrap>
            {displayName}
          </Typography>
          {chipLabel ? (
            <Chip
              size='small'
              label={chipLabel}
              color={chipColor}
              variant='tonal'
              sx={{ mt: 1, mb: 1.5, textTransform: 'capitalize' }}
            />
          ) : null}
          <Typography variant='body2' color='text.secondary'>
            {subtitle}
          </Typography>
        </Box>
      </Box>
    </CardContent>
  </Card>
)

export const PlayerActionCard = ({ title, description, icon, href, buttonLabel, illustration }) => (
  <Card
    sx={{
      height: '100%',
      position: 'relative',
      overflow: 'hidden',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 }
    }}
  >
    {illustration ? (
      <Box sx={{ position: 'absolute', top: 16, right: 16, opacity: 0.12 }}>
        <img src={illustration} alt='' style={{ height: 82, width: 'auto' }} />
      </Box>
    ) : null}
    <CardContent sx={{ position: 'relative', p: 3 }}>
      <Box
        sx={{
          width: 42,
          height: 42,
          borderRadius: 2,
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 2
        }}
      >
        <i className={`${icon} text-xl`} />
      </Box>
      <Typography variant='h6' fontWeight={700} sx={{ mb: 1 }}>
        {title}
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 2.5 }}>
        {description}
      </Typography>
      <Button variant='contained' href={href} fullWidth>
        {buttonLabel}
      </Button>
    </CardContent>
  </Card>
)

export const SectionTitle = ({ title, subtitle, action }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: { xs: 'column', sm: 'row' },
      alignItems: { xs: 'flex-start', sm: 'center' },
      justifyContent: 'space-between',
      gap: 1.5,
      mb: 2
    }}
  >
    <Box>
      <Typography variant='h6' fontWeight={700}>
        {title}
      </Typography>
      {subtitle ? (
        <Typography variant='body2' color='text.secondary'>
          {subtitle}
        </Typography>
      ) : null}
    </Box>
    {action}
  </Box>
)

export const DetailItem = ({ label, value, icon }) => {
  if (value === undefined || value === null || value === '') return null

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        bgcolor: 'action.hover',
        border: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
        {icon ? <i className={icon} style={{ fontSize: 16, opacity: 0.7 }} /> : null}
        <Typography variant='caption' color='text.secondary' sx={{ textTransform: 'uppercase', letterSpacing: 0.6 }}>
          {label}
        </Typography>
      </Box>
      {typeof value === 'string' || typeof value === 'number' ? (
        <Typography variant='body1' fontWeight={600}>
          {value}
        </Typography>
      ) : (
        value
      )}
    </Box>
  )
}
