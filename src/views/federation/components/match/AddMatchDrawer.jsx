'use client'

import { useState } from 'react'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import IconButton from '@mui/material/IconButton'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { LEAGUES_OPTIONS, TEAMS_OPTIONS } from '@views/federation/constants'

export default function AddMatchDrawer ({ open, onClose }) {
  const [formErrors, setFormErrors] = useState({})
  const [leagueOpen, setLeagueOpen] = useState(false)
  const [homeTeamOpen, setHomeTeamOpen] = useState(false)
  const [awayTeamOpen, setAwayTeamOpen] = useState(false)

  const [formData, setFormData] = useState({
    league: '',
    homeTeam: '',
    awayTeam: '',
    venue: '',
    date: '',
    time: ''
  })

  const validateForm = () => {
    const errors = {}
    if (!formData.league) errors.league = 'League is required'
    if (!formData.homeTeam) errors.homeTeam = 'Home team is required'
    if (!formData.awayTeam) errors.awayTeam = 'Away team is required'
    if (formData.homeTeam && formData.awayTeam && formData.homeTeam === formData.awayTeam) {
      errors.awayTeam = 'Home and away team must be different'
    }
    if (!formData.venue?.trim()) errors.venue = 'Venue is required'
    if (!formData.date?.trim()) errors.date = 'Date is required'
    if (!formData.time?.trim()) errors.time = 'Time is required'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = e => {
    e.preventDefault()
    if (!validateForm()) return
    onClose()
    setFormData({ league: '', homeTeam: '', awayTeam: '', venue: '', date: '', time: '' })
    setFormErrors({})
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (formErrors[field]) setFormErrors(prev => ({ ...prev, [field]: '' }))
  }

  return (
    <Drawer open={open} anchor='right' variant='temporary' onClose={onClose} ModalProps={{ keepMounted: true }} sx={{ '& .MuiDrawer-paper': { width: { xs: 320, sm: 420 } } }}>
      <div className='flex items-center justify-between pli-5 plb-[15px]'>
        <Typography variant='h5'>Schedule New Match</Typography>
        <IconButton onClick={onClose} size='small'>
          <i className='ri-close-line' />
        </IconButton>
      </div>
      <Divider />
      <div className='p-5 overflow-y-auto'>
        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
          <FormControl fullWidth size='small' error={!!formErrors.league}>
            <InputLabel id='add-match-league-label'>League</InputLabel>
            <Select
              labelId='add-match-league-label'
              open={leagueOpen}
              onClose={() => setLeagueOpen(false)}
              onOpen={() => setLeagueOpen(true)}
              value={formData.league}
              label='League'
              onChange={e => handleInputChange('league', e.target.value)}
            >
              <MenuItem value=''><em>Select league</em></MenuItem>
              {LEAGUES_OPTIONS.map(league => (
                <MenuItem key={league.id} value={league.id}>{league.name}</MenuItem>
              ))}
            </Select>
            {formErrors.league && <FormHelperText>{formErrors.league}</FormHelperText>}
          </FormControl>
          <FormControl fullWidth size='small' error={!!formErrors.homeTeam}>
            <InputLabel id='add-match-home-label'>Home Team</InputLabel>
            <Select
              labelId='add-match-home-label'
              open={homeTeamOpen}
              onClose={() => setHomeTeamOpen(false)}
              onOpen={() => setHomeTeamOpen(true)}
              value={formData.homeTeam}
              label='Home Team'
              onChange={e => handleInputChange('homeTeam', e.target.value)}
            >
              <MenuItem value=''><em>Select home team</em></MenuItem>
              {TEAMS_OPTIONS.map(team => (
                <MenuItem key={team.id} value={team.id}>{team.name}</MenuItem>
              ))}
            </Select>
            {formErrors.homeTeam && <FormHelperText>{formErrors.homeTeam}</FormHelperText>}
          </FormControl>
          <FormControl fullWidth size='small' error={!!formErrors.awayTeam}>
            <InputLabel id='add-match-away-label'>Away Team</InputLabel>
            <Select
              labelId='add-match-away-label'
              open={awayTeamOpen}
              onClose={() => setAwayTeamOpen(false)}
              onOpen={() => setAwayTeamOpen(true)}
              value={formData.awayTeam}
              label='Away Team'
              onChange={e => handleInputChange('awayTeam', e.target.value)}
            >
              <MenuItem value=''><em>Select away team</em></MenuItem>
              {TEAMS_OPTIONS.map(team => (
                <MenuItem key={team.id} value={team.id}>{team.name}</MenuItem>
              ))}
            </Select>
            {formErrors.awayTeam && <FormHelperText>{formErrors.awayTeam}</FormHelperText>}
          </FormControl>
          <TextField fullWidth size='small' label='Venue' placeholder='e.g. National Stadium' value={formData.venue} onChange={e => handleInputChange('venue', e.target.value)} error={!!formErrors.venue} helperText={formErrors.venue} />
          <TextField fullWidth size='small' type='date' label='Date' value={formData.date} onChange={e => handleInputChange('date', e.target.value)} InputLabelProps={{ shrink: true }} error={!!formErrors.date} helperText={formErrors.date} />
          <TextField fullWidth size='small' type='time' label='Time' value={formData.time} onChange={e => handleInputChange('time', e.target.value)} InputLabelProps={{ shrink: true }} error={!!formErrors.time} helperText={formErrors.time} />
          <div className='flex gap-2 mt-2'>
            <Button type='submit' variant='contained' size='small'>Schedule Match</Button>
            <Button type='button' variant='outlined' color='secondary' size='small' onClick={onClose}>Cancel</Button>
          </div>
        </form>
      </div>
    </Drawer>
  )
}
