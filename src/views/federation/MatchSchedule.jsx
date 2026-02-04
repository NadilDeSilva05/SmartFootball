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

const MatchSchedule = () => {
  const [formData, setFormData] = useState({
    homeTeam: '',
    awayTeam: '',
    venue: '',
    date: '',
    time: '',
    competition: 'League'
  })

  const teams = ['City FC', 'United SC', 'Rovers FC', 'Athletic Club', 'Stars FC', 'Dynamo FC']

  const handleSubmit = e => {
    e.preventDefault()
    setFormData({ homeTeam: '', awayTeam: '', venue: '', date: '', time: '', competition: 'League' })
  }

  return (
    <div className='space-y-6'>
      <div>
        <Typography variant='h4' className='font-semibold mb-1'>
          Schedule Matches
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          Create and schedule new matches in the federation.
        </Typography>
      </div>

      <Card>
        <CardHeader title='New Match' />
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={5}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label='Home Team'
                  value={formData.homeTeam}
                  onChange={e => setFormData({ ...formData, homeTeam: e.target.value })}
                >
                  {teams.map(t => (
                    <MenuItem key={t} value={t}>{t}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label='Away Team'
                  value={formData.awayTeam}
                  onChange={e => setFormData({ ...formData, awayTeam: e.target.value })}
                >
                  {teams.map(t => (
                    <MenuItem key={t} value={t}>{t}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label='Venue'
                  placeholder='e.g. National Stadium'
                  value={formData.venue}
                  onChange={e => setFormData({ ...formData, venue: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label='Competition'
                  value={formData.competition}
                  onChange={e => setFormData({ ...formData, competition: e.target.value })}
                >
                  <MenuItem value='League'>League</MenuItem>
                  <MenuItem value='Cup'>Cup</MenuItem>
                  <MenuItem value='Friendly'>Friendly</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type='date'
                  label='Match Date'
                  value={formData.date}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type='time'
                  label='Kick-off Time'
                  value={formData.time}
                  onChange={e => setFormData({ ...formData, time: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} className='flex gap-4'>
                <Button type='submit' variant='contained'>
                  Schedule Match
                </Button>
                <Button type='button' variant='outlined' color='secondary' onClick={() => setFormData({ homeTeam: '', awayTeam: '', venue: '', date: '', time: '', competition: 'League' })}>
                  Reset
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title='Upcoming Matches (Hardcoded)' />
        <CardContent>
          <div className='space-y-3'>
            {[
              { home: 'City FC', away: 'United SC', venue: 'National Stadium', date: '2025-02-15', time: '15:00' },
              { home: 'Rovers FC', away: 'Athletic Club', venue: 'City Arena', date: '2025-02-16', time: '17:00' },
              { home: 'Stars FC', away: 'Dynamo FC', venue: 'Regional Ground', date: '2025-02-18', time: '14:00' }
            ].map((m, i) => (
              <div key={i} className='flex items-center justify-between p-4 rounded-lg border border-solid border-default'>
                <Typography className='font-medium'>{m.home} vs {m.away}</Typography>
                <Typography variant='body2' color='text.secondary'>{m.venue} • {m.date} {m.time}</Typography>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default MatchSchedule
