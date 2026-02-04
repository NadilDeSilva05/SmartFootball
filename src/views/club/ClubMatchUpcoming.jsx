'use client'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'

const MY_CLUB = 'City FC'

const UPCOMING_MATCHES = [
  { id: '1', home: 'City FC', away: 'Rovers FC', date: '2025-02-15', time: '15:00', venue: 'National Stadium' },
  { id: '2', home: 'Athletic Club', away: 'Stars FC', date: '2025-02-16', time: '17:00', venue: 'City Arena' },
  { id: '3', home: 'United SC', away: 'City FC', date: '2025-02-18', time: '14:00', venue: 'Regional Ground' },
  { id: '4', home: 'Dynamo FC', away: 'Rovers FC', date: '2025-02-20', time: '16:00', venue: 'Stadium A' }
]

const isClubMatch = (home, away) => home === MY_CLUB || away === MY_CLUB

const ClubMatchUpcoming = () => {
  return (
    <div className='space-y-6'>
      <div>
        <Typography variant='h4' className='font-semibold mb-1'>
          Upcoming Matches
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          Matches involving <strong>{MY_CLUB}</strong> are highlighted.
        </Typography>
      </div>

      <Card>
        <CardHeader title='Upcoming Fixtures' />
        <CardContent>
          <div className='space-y-3'>
            {UPCOMING_MATCHES.map(m => {
              const highlight = isClubMatch(m.home, m.away)
              return (
                <Box
                  key={m.id}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: highlight ? 'action.selected' : 'transparent'
                  }}
                >
                  <div className='flex items-center justify-between flex-wrap gap-2'>
                    <div className='flex items-center gap-2'>
                      <Typography className='font-medium'>{m.home}</Typography>
                      <Typography color='text.secondary'>vs</Typography>
                      <Typography className='font-medium'>{m.away}</Typography>
                      {highlight && (
                        <Chip size='small' label='My Club' color='info' variant='tonal' />
                      )}
                    </div>
                    <Typography variant='body2' color='text.secondary'>
                      {m.date} {m.time} • {m.venue}
                    </Typography>
                  </div>
                </Box>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ClubMatchUpcoming
