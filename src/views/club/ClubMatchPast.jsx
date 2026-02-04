'use client'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'

// Hardcoded: current club name for highlighting
const MY_CLUB = 'City FC'

const PAST_MATCHES = [
  { id: '1', home: 'City FC', away: 'United SC', homeScore: 2, awayScore: 1, date: '2025-02-01', venue: 'National Stadium' },
  { id: '2', home: 'Rovers FC', away: 'Athletic Club', homeScore: 0, awayScore: 0, date: '2025-01-28', venue: 'City Arena' },
  { id: '3', home: 'Stars FC', away: 'City FC', homeScore: 1, awayScore: 3, date: '2025-01-25', venue: 'Regional Ground' },
  { id: '4', home: 'Dynamo FC', away: 'United SC', homeScore: 2, awayScore: 2, date: '2025-01-20', venue: 'Stadium A' }
]

const isClubMatch = (home, away) => home === MY_CLUB || away === MY_CLUB

const ClubMatchPast = () => {
  return (
    <div className='space-y-6'>
      <div>
        <Typography variant='h4' className='font-semibold mb-1'>
          Past Matches
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          Matches involving <strong>{MY_CLUB}</strong> are highlighted.
        </Typography>
      </div>

      <Card>
        <CardHeader title='Past Match Results' />
        <CardContent>
          <div className='space-y-3'>
            {PAST_MATCHES.map(m => {
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
                      <Chip size='small' label={`${m.homeScore} - ${m.awayScore}`} color='primary' variant='tonal' />
                      <Typography className='font-medium'>{m.away}</Typography>
                      {highlight && (
                        <Chip size='small' label='My Club' color='success' variant='tonal' />
                      )}
                    </div>
                    <Typography variant='body2' color='text.secondary'>
                      {m.date} • {m.venue}
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

export default ClubMatchPast
