'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Divider from '@mui/material/Divider'
import Box from '@mui/material/Box'

const PAST_MATCHES = [
  {
    id: '1',
    homeTeam: 'City FC',
    awayTeam: 'United SC',
    homeScore: 2,
    awayScore: 1,
    date: '2025-02-01',
    venue: 'National Stadium',
    competition: 'League',
    referee: 'John Silva',
    attendance: 12500,
    halfTimeScore: '1-0',
    goals: [
      { minute: 23, scorer: 'A. Smith', team: 'home', type: 'open_play' },
      { minute: 67, scorer: 'B. Jones', team: 'home', type: 'penalty' },
      { minute: 89, scorer: 'C. Brown', team: 'away', type: 'open_play' }
    ],
    cards: [
      { minute: 45, player: 'D. Lee', team: 'away', type: 'yellow' },
      { minute: 78, player: 'E. Wilson', team: 'home', type: 'yellow' }
    ]
  },
  {
    id: '2',
    homeTeam: 'Rovers FC',
    awayTeam: 'Athletic Club',
    homeScore: 0,
    awayScore: 0,
    date: '2025-01-28',
    venue: 'City Arena',
    competition: 'League',
    referee: 'Maria Perera',
    attendance: 8200,
    halfTimeScore: '0-0',
    goals: [],
    cards: [
      { minute: 34, player: 'F. Davis', team: 'home', type: 'yellow' },
      { minute: 56, player: 'G. Taylor', team: 'away', type: 'yellow' }
    ]
  },
  {
    id: '3',
    homeTeam: 'Stars FC',
    awayTeam: 'Dynamo FC',
    homeScore: 3,
    awayScore: 2,
    date: '2025-01-25',
    venue: 'Regional Ground',
    competition: 'Cup',
    referee: 'David Fernando',
    attendance: 5400,
    halfTimeScore: '2-1',
    goals: [
      { minute: 12, scorer: 'H. Martinez', team: 'home', type: 'open_play' },
      { minute: 28, scorer: 'I. Garcia', team: 'away', type: 'free_kick' },
      { minute: 41, scorer: 'J. Lopez', team: 'home', type: 'open_play' },
      { minute: 65, scorer: 'K. Hernandez', team: 'away', type: 'open_play' },
      { minute: 82, scorer: 'L. Rodriguez', team: 'home', type: 'penalty' }
    ],
    cards: []
  }
]

const MatchPastResults = () => {
  const [detailMatch, setDetailMatch] = useState(null)

  return (
    <div className='space-y-6'>
      <div>
        <Typography variant='h4' className='font-semibold mb-1'>
          Past Match Results
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          View past match results with detailed statistics.
        </Typography>
      </div>

      <Card>
        <CardHeader title='Recent Results' />
        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Match</TableCell>
                <TableCell align='center'>Score</TableCell>
                <TableCell>Competition</TableCell>
                <TableCell>Referee</TableCell>
                <TableCell align='right'>Details</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {PAST_MATCHES.map(match => (
                <TableRow key={match.id}>
                  <TableCell>{match.date}</TableCell>
                  <TableCell>
                    <Typography className='font-medium'>{match.homeTeam} vs {match.awayTeam}</Typography>
                    <Typography variant='caption' color='text.secondary'>{match.venue}</Typography>
                  </TableCell>
                  <TableCell align='center'>
                    <Chip
                      label={`${match.homeScore} - ${match.awayScore}`}
                      color='primary'
                      variant='tonal'
                      size='small'
                    />
                  </TableCell>
                  <TableCell>{match.competition}</TableCell>
                  <TableCell>{match.referee}</TableCell>
                  <TableCell align='right'>
                    <Button size='small' variant='outlined' onClick={() => setDetailMatch(match)}>
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!detailMatch} onClose={() => setDetailMatch(null)} maxWidth='sm' fullWidth>
        {detailMatch && (
          <>
            <DialogTitle className='flex items-center justify-between'>
              <span>Match Details: {detailMatch.homeTeam} vs {detailMatch.awayTeam}</span>
              <IconButton size='small' onClick={() => setDetailMatch(null)}>
                <i className='ri-close-line' />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              <Box className='space-y-4'>
                <div className='flex items-center justify-center gap-4 py-4'>
                  <Typography variant='h5' className='font-semibold'>{detailMatch.homeTeam}</Typography>
                  <Chip label={`${detailMatch.homeScore} - ${detailMatch.awayScore}`} color='primary' />
                  <Typography variant='h5' className='font-semibold'>{detailMatch.awayTeam}</Typography>
                </div>
                <Divider />
                <div className='grid grid-cols-2 gap-2 text-sm'>
                  <Typography color='text.secondary'>Date</Typography>
                  <Typography>{detailMatch.date}</Typography>
                  <Typography color='text.secondary'>Venue</Typography>
                  <Typography>{detailMatch.venue}</Typography>
                  <Typography color='text.secondary'>Competition</Typography>
                  <Typography>{detailMatch.competition}</Typography>
                  <Typography color='text.secondary'>Referee</Typography>
                  <Typography>{detailMatch.referee}</Typography>
                  <Typography color='text.secondary'>Attendance</Typography>
                  <Typography>{detailMatch.attendance?.toLocaleString()}</Typography>
                  <Typography color='text.secondary'>Half-time</Typography>
                  <Typography>{detailMatch.halfTimeScore}</Typography>
                </div>
                <Divider />
                <Typography variant='subtitle2'>Goals</Typography>
                {detailMatch.goals?.length > 0 ? (
                  <ul className='list-disc pl-5 space-y-1'>
                    {detailMatch.goals.map((g, i) => (
                      <li key={i}>{g.minute}&apos; - {g.scorer} ({g.team === 'home' ? detailMatch.homeTeam : detailMatch.awayTeam}) - {g.type?.replace('_', ' ')}</li>
                    ))}
                  </ul>
                ) : (
                  <Typography variant='body2' color='text.secondary'>No goals</Typography>
                )}
                <Typography variant='subtitle2'>Cards</Typography>
                {detailMatch.cards?.length > 0 ? (
                  <ul className='list-disc pl-5 space-y-1'>
                    {detailMatch.cards.map((c, i) => (
                      <li key={i}>{c.minute}&apos; - {c.player} - {c.type}</li>
                    ))}
                  </ul>
                ) : (
                  <Typography variant='body2' color='text.secondary'>No cards</Typography>
                )}
              </Box>
            </DialogContent>
          </>
        )}
      </Dialog>
    </div>
  )
}

export default MatchPastResults
