'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import MenuItem from '@mui/material/MenuItem'
import Chip from '@mui/material/Chip'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'

const UNASSIGNED_MATCHES = [
  { id: '1', home: 'City FC', away: 'United SC', date: '2025-02-15', time: '15:00', venue: 'National Stadium' },
  { id: '2', home: 'Rovers FC', away: 'Athletic Club', date: '2025-02-16', time: '17:00', venue: 'City Arena' },
  { id: '3', home: 'Stars FC', away: 'Dynamo FC', date: '2025-02-18', time: '14:00', venue: 'Regional Ground' }
]

const REFEREES = [
  { id: '1', name: 'John Silva', level: 'FIFA' },
  { id: '2', name: 'Maria Perera', level: 'National' },
  { id: '3', name: 'David Fernando', level: 'Regional' }
]

const MatchAssignReferees = () => {
  const [assignments, setAssignments] = useState({})
  const [selectedMatch, setSelectedMatch] = useState(null)
  const [mainReferee, setMainReferee] = useState('')
  const [assistant1, setAssistant1] = useState('')
  const [assistant2, setAssistant2] = useState('')

  const handleAssign = () => {
    if (selectedMatch && mainReferee) {
      setAssignments(prev => ({
        ...prev,
        [selectedMatch.id]: { mainReferee, assistant1, assistant2 }
      }))
      setSelectedMatch(null)
      setMainReferee('')
      setAssistant1('')
      setAssistant2('')
    }
  }

  return (
    <div className='space-y-6'>
      <div>
        <Typography variant='h4' className='font-semibold mb-1'>
          Assign Referees to Matches
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          Assign main referee and assistants to scheduled matches.
        </Typography>
      </div>

      <Grid container spacing={6}>
        <Grid item xs={12} md={7}>
          <Card>
            <CardHeader title='Matches Pending Referee Assignment' />
            <CardContent>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Match</TableCell>
                    <TableCell>Date & Time</TableCell>
                    <TableCell>Venue</TableCell>
                    <TableCell>Assigned</TableCell>
                    <TableCell align='right'>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {UNASSIGNED_MATCHES.map(match => (
                    <TableRow key={match.id}>
                      <TableCell>
                        <Typography className='font-medium'>{match.home} vs {match.away}</Typography>
                      </TableCell>
                      <TableCell>{match.date} {match.time}</TableCell>
                      <TableCell>{match.venue}</TableCell>
                      <TableCell>
                        {assignments[match.id] ? (
                          <Chip label='Assigned' color='success' size='small' variant='tonal' />
                        ) : (
                          <Chip label='Pending' color='warning' size='small' variant='tonal' />
                        )}
                      </TableCell>
                      <TableCell align='right'>
                        <Button
                          size='small'
                          variant='outlined'
                          onClick={() => {
                            setSelectedMatch(match)
                            setMainReferee(assignments[match.id]?.mainReferee || '')
                            setAssistant1(assignments[match.id]?.assistant1 || '')
                            setAssistant2(assignments[match.id]?.assistant2 || '')
                          }}
                        >
                          {assignments[match.id] ? 'Edit' : 'Assign'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={5}>
          <Card>
            <CardHeader title={selectedMatch ? `Assign Referees: ${selectedMatch.home} vs ${selectedMatch.away}` : 'Select a match'} />
            <CardContent>
              {selectedMatch ? (
                <div className='space-y-4'>
                  <TextField
                    fullWidth
                    select
                    label='Main Referee'
                    value={mainReferee}
                    onChange={e => setMainReferee(e.target.value)}
                  >
                    {REFEREES.map(r => (
                      <MenuItem key={r.id} value={r.name}>{r.name} ({r.level})</MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    fullWidth
                    select
                    label='Assistant Referee 1'
                    value={assistant1}
                    onChange={e => setAssistant1(e.target.value)}
                  >
                    <MenuItem value=''>— None —</MenuItem>
                    {REFEREES.map(r => (
                      <MenuItem key={r.id} value={r.name}>{r.name}</MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    fullWidth
                    select
                    label='Assistant Referee 2'
                    value={assistant2}
                    onChange={e => setAssistant2(e.target.value)}
                  >
                    <MenuItem value=''>— None —</MenuItem>
                    {REFEREES.map(r => (
                      <MenuItem key={r.id} value={r.name}>{r.name}</MenuItem>
                    ))}
                  </TextField>
                  <div className='flex gap-2'>
                    <Button variant='contained' onClick={handleAssign}>
                      Save Assignment
                    </Button>
                    <Button variant='outlined' color='secondary' onClick={() => { setSelectedMatch(null); setMainReferee(''); setAssistant1(''); setAssistant2('') }}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Typography color='text.secondary'>Click &quot;Assign&quot; on a match to assign referees.</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  )
}

export default MatchAssignReferees
