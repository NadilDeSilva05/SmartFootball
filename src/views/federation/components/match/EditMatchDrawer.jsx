'use client'

import { useState, useEffect } from 'react'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import FormControl from '@mui/material/FormControl'
import IconButton from '@mui/material/IconButton'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { LEAGUES_OPTIONS, TEAMS_OPTIONS } from '@views/federation/constants'

export default function EditMatchDrawer ({ open, onClose, match }) {
  const [formData, setFormData] = useState({
    league: '',
    homeTeam: '',
    awayTeam: '',
    venue: '',
    date: '',
    time: ''
  })

  useEffect(() => {
    if (match) {
      setFormData({
        league: match.leagueId || '',
        homeTeam: match.homeTeamId || '',
        awayTeam: match.awayTeamId || '',
        venue: match.venue || '',
        date: match.date || '',
        time: match.time || ''
      })
    }
  }, [match])

  const handleSubmit = e => {
    e.preventDefault()
    onClose()
  }

  return (
    <Drawer open={open} anchor='right' variant='temporary' onClose={onClose} ModalProps={{ keepMounted: true }} sx={{ '& .MuiDrawer-paper': { width: { xs: 320, sm: 420 } } }}>
      <div className='flex items-center justify-between pli-5 plb-[15px]'>
        <Typography variant='h5'>Edit Match</Typography>
        <IconButton onClick={onClose} size='small'>
          <i className='ri-close-line' />
        </IconButton>
      </div>
      <Divider />
      <div className='p-5 overflow-y-auto'>
        {match && (
          <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
            <FormControl fullWidth size='small'>
              <InputLabel id='edit-match-league-label'>League</InputLabel>
              <Select labelId='edit-match-league-label' value={formData.league} label='League' onChange={e => setFormData({ ...formData, league: e.target.value })}>
                {LEAGUES_OPTIONS.map(league => (
                  <MenuItem key={league.id} value={league.id}>{league.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth size='small'>
              <InputLabel id='edit-match-home-label'>Home Team</InputLabel>
              <Select labelId='edit-match-home-label' value={formData.homeTeam} label='Home Team' onChange={e => setFormData({ ...formData, homeTeam: e.target.value })}>
                {TEAMS_OPTIONS.map(team => (
                  <MenuItem key={team.id} value={team.id}>{team.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth size='small'>
              <InputLabel id='edit-match-away-label'>Away Team</InputLabel>
              <Select labelId='edit-match-away-label' value={formData.awayTeam} label='Away Team' onChange={e => setFormData({ ...formData, awayTeam: e.target.value })}>
                {TEAMS_OPTIONS.map(team => (
                  <MenuItem key={team.id} value={team.id}>{team.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField fullWidth size='small' label='Venue' value={formData.venue} onChange={e => setFormData({ ...formData, venue: e.target.value })} />
            <TextField fullWidth size='small' type='date' label='Date' value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} InputLabelProps={{ shrink: true }} />
            <TextField fullWidth size='small' type='time' label='Time' value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} InputLabelProps={{ shrink: true }} />
            <div className='flex gap-2 mt-2'>
              <Button type='submit' variant='contained' size='small'>Save</Button>
              <Button type='button' variant='outlined' color='secondary' size='small' onClick={onClose}>Cancel</Button>
            </div>
          </form>
        )}
      </div>
    </Drawer>
  )
}
