'use client'

import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'

export default function ResultDetailDrawer ({ open, onClose, match }) {
  if (!match) return null

  const teamName = team => (team === 'home' ? match.homeTeam : match.awayTeam)

  return (
    <Drawer open={open} anchor='right' variant='temporary' onClose={onClose} ModalProps={{ keepMounted: true }} sx={{ '& .MuiDrawer-paper': { width: { xs: 320, sm: 400 } } }}>
      <div className='flex items-center justify-between pli-5 plb-[15px]'>
        <Typography variant='h6'>Match details</Typography>
        <IconButton onClick={onClose} size='small'>
          <i className='ri-close-line' />
        </IconButton>
      </div>
      <Divider />
      <div className='p-5 overflow-y-auto space-y-5'>
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 1 }}>{match.date} • {match.venue}</Typography>
          <Typography variant='subtitle1' fontWeight={600} color='text.primary'>{match.homeTeam}</Typography>
          <Chip
            label={`${match.homeScore} – ${match.awayScore}`}
            color={match.homeScore === match.awayScore ? 'info' : match.homeScore > match.awayScore ? 'success' : 'secondary'}
            variant='tonal'
            sx={{ my: 1.5, fontWeight: 600, fontSize: '1rem' }}
          />
          <Typography variant='subtitle1' fontWeight={600} color='text.primary'>{match.awayTeam}</Typography>
          <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mt: 1 }}>{match.leagueName}</Typography>
        </Box>

        <Divider />

        <Box>
          <Typography variant='subtitle2' color='text.secondary' sx={{ mb: 1 }}>Info</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 0.5, alignItems: 'center' }}>
            <Typography variant='body2' color='text.secondary'>Referee</Typography>
            <Typography variant='body2'>{match.referee}</Typography>
            <Typography variant='body2' color='text.secondary'>Attendance</Typography>
            <Typography variant='body2'>{match.attendance?.toLocaleString() ?? '–'}</Typography>
            <Typography variant='body2' color='text.secondary'>Half-time</Typography>
            <Typography variant='body2'>{match.halfTimeScore ?? '–'}</Typography>
          </Box>
        </Box>

        <Box>
          <Typography variant='subtitle2' color='text.secondary' sx={{ mb: 1 }}>Goals</Typography>
          {match.goals?.length > 0 ? (
            <Box component='ul' sx={{ m: 0, pl: 2.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {match.goals.map((g, i) => (
                <Typography key={i} component='li' variant='body2'>
                  {g.minute}&apos; {g.scorer} ({teamName(g.team)}) – {g.type?.replace('_', ' ')}
                </Typography>
              ))}
            </Box>
          ) : (
            <Typography variant='body2' color='text.secondary'>No goals</Typography>
          )}
        </Box>

        <Box>
          <Typography variant='subtitle2' color='text.secondary' sx={{ mb: 1 }}>Cards</Typography>
          {match.cards?.length > 0 ? (
            <Box component='ul' sx={{ m: 0, pl: 2.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {match.cards.map((c, i) => (
                <Typography key={i} component='li' variant='body2'>
                  {c.minute}&apos; {c.player} – <span className={c.type === 'red' ? 'text-error' : 'text-warning'} style={{ textTransform: 'capitalize' }}>{c.type}</span>
                </Typography>
              ))}
            </Box>
          ) : (
            <Typography variant='body2' color='text.secondary'>No cards</Typography>
          )}
        </Box>
      </div>
    </Drawer>
  )
}
