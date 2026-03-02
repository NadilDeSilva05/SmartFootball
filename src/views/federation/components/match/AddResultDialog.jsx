'use client'

import { useState, useMemo, useEffect } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Divider from '@mui/material/Divider'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { GOAL_TYPES } from '@views/federation/constants'

export default function AddResultDialog ({ open, onClose, onSave, scheduledMatches = [], clubs = [], leagues = [], referees = [] }) {
  const [formErrors, setFormErrors] = useState({})
  const [formData, setFormData] = useState({
    matchId: '',
    venue: '',
    date: '',
    referee: '',
    homeScore: '',
    awayScore: '',
    halfTimeScore: '',
    attendance: '',
    goals: [],
    cards: []
  })

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const clubMap = useMemo(() => {
    const m = {}
    clubs.forEach(c => { m[c.id] = c.clubName || c.name || '-' })
    return m
  }, [clubs])
  const leagueMap = useMemo(() => {
    const m = {}
    leagues.forEach(l => { m[l.id] = l.name || '-' })
    return m
  }, [leagues])
  const matchOptions = useMemo(() => scheduledMatches.map(m => ({
    ...m,
    homeTeamName: clubMap[m.homeClubId] || '-',
    awayTeamName: clubMap[m.awayClubId] || '-',
    leagueName: leagueMap[m.leagueId] || '-'
  })), [scheduledMatches, clubMap, leagueMap])
  const defaultGoal = () => ({ minute: '', scorer: '', team: 'home', type: 'open_play' })
  const defaultCard = () => ({ minute: '', player: '', team: 'home', type: 'yellow' })
  const resetForm = () => {
    setFormData({
      matchId: '',
      venue: '',
      date: '',
      referee: '',
      homeScore: '',
      awayScore: '',
      halfTimeScore: '',
      attendance: '',
      goals: [],
      cards: []
    })
    setFormErrors({})
    setError(null)
  }
  useEffect(() => {
    if (open) resetForm()
  }, [open])

  const validateForm = () => {
    const errors = {}
    if (!formData.matchId) errors.matchId = 'Match is required'
    if (!formData.venue?.trim()) errors.venue = 'Venue is required'
    if (!formData.date?.trim()) errors.date = 'Date is required'
    if (!formData.referee) errors.referee = 'Referee is required'
    if (formData.homeScore === '' || formData.homeScore === null) errors.homeScore = 'Home score is required'
    else if (isNaN(Number(formData.homeScore)) || Number(formData.homeScore) < 0) errors.homeScore = 'Enter a valid number'
    if (formData.awayScore === '' || formData.awayScore === null) errors.awayScore = 'Away score is required'
    else if (isNaN(Number(formData.awayScore)) || Number(formData.awayScore) < 0) errors.awayScore = 'Enter a valid number'
    if (!formData.halfTimeScore?.trim()) errors.halfTimeScore = 'Half-time score is required'
    if (formData.attendance !== '' && (isNaN(Number(formData.attendance)) || Number(formData.attendance) < 0)) errors.attendance = 'Enter a valid number'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!validateForm()) return
    const match = matchOptions.find(m => m.id === formData.matchId)
    if (!match) {
      setFormErrors(prev => ({ ...prev, matchId: 'Match not found' }))
      return
    }
    const goals = formData.goals
      .filter(g => g.minute !== '' && g.scorer?.trim())
      .map(g => ({ minute: Number(g.minute), scorer: g.scorer.trim(), team: g.team, type: g.type }))
    const cards = formData.cards
      .filter(c => c.minute !== '' && c.player?.trim())
      .map(c => ({ minute: Number(c.minute), player: c.player.trim(), team: c.team, type: c.type }))
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/matches/${formData.matchId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'played',
          homeScore: Number(formData.homeScore),
          awayScore: Number(formData.awayScore),
          halfTimeScore: formData.halfTimeScore.trim(),
          attendance: formData.attendance === '' ? undefined : Number(formData.attendance),
          refereeId: formData.referee,
          goals,
          cards
        })
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || 'Failed to save result')
      }
      setFormData({
        matchId: '',
        venue: '',
        date: '',
        referee: '',
        homeScore: '',
        awayScore: '',
        halfTimeScore: '',
        attendance: '',
        goals: [],
        cards: []
      })
      setFormErrors({})
      onSave()
    } catch (err) {
      setError(err.message || 'Failed to save result')
    } finally {
      setSaving(false)
    }
  }

  const handleMatchChange = matchId => {
    const match = matchOptions.find(m => m.id === matchId)
    setFormData(prev => ({
      ...prev,
      matchId,
      venue: match ? (match.venue || '') : prev.venue,
      date: match ? (match.matchDate || match.date || '') : prev.date
    }))
    if (formErrors.matchId) setFormErrors(prev => ({ ...prev, matchId: '' }))
  }

  const update = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (formErrors[field]) setFormErrors(prev => ({ ...prev, [field]: '' }))
  }

  const addGoal = () => setFormData(prev => ({ ...prev, goals: [...prev.goals, defaultGoal()] }))
  const updateGoal = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.map((g, i) => (i === index ? { ...g, [field]: value } : g))
    }))
  }
  const removeGoal = index => setFormData(prev => ({ ...prev, goals: prev.goals.filter((_, i) => i !== index) }))

  const addCard = () => setFormData(prev => ({ ...prev, cards: [...prev.cards, defaultCard()] }))
  const updateCard = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      cards: prev.cards.map((c, i) => (i === index ? { ...c, [field]: value } : c))
    }))
  }
  const removeCard = index => setFormData(prev => ({ ...prev, cards: prev.cards.filter((_, i) => i !== index) }))

  return (
    <Dialog open={open} onClose={onClose} maxWidth='lg' fullWidth scroll='paper' PaperProps={{ sx: { borderRadius: 2 } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 1 }}>
        <Typography variant='h5'>Add Match Result</Typography>
        <IconButton onClick={onClose} size='small' aria-label='close'>
          <i className='ri-close-line' />
        </IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 3 }}>
        <form onSubmit={handleSubmit}>
          <Typography variant='subtitle2' color='text.secondary' sx={{ mb: 2, display: 'block' }}>Match</Typography>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth size='small' error={!!formErrors.matchId}>
                <InputLabel id='add-result-match-label'>Select match</InputLabel>
                <Select
                  labelId='add-result-match-label'
                  value={formData.matchId}
                  label='Select match'
                  onChange={e => handleMatchChange(e.target.value)}
                >
                  <MenuItem value=''><em>Select match</em></MenuItem>
                  {matchOptions.map(m => (
                    <MenuItem key={m.id} value={m.id}>
                      {m.homeTeamName} vs {m.awayTeamName} ({m.leagueName} – {m.matchDate || m.date})
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.matchId && <FormHelperText>{formErrors.matchId}</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField fullWidth size='small' label='Venue' value={formData.venue} onChange={e => update('venue', e.target.value)} error={!!formErrors.venue} helperText={formErrors.venue} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField fullWidth size='small' type='date' label='Date' value={formData.date} onChange={e => update('date', e.target.value)} InputLabelProps={{ shrink: true }} error={!!formErrors.date} helperText={formErrors.date} />
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />
          <Typography variant='subtitle2' color='text.secondary' sx={{ mb: 2, display: 'block' }}>Score &amp; officials</Typography>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth size='small' error={!!formErrors.referee}>
                <InputLabel id='add-result-referee-label'>Referee</InputLabel>
                <Select value={formData.referee} label='Referee' onChange={e => update('referee', e.target.value)}>
                  <MenuItem value=''><em>Select referee</em></MenuItem>
                  {referees.map(r => (
                    <MenuItem key={r.id} value={r.id}>{r.fullName}</MenuItem>
                  ))}
                </Select>
                {formErrors.referee && <FormHelperText>{formErrors.referee}</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField fullWidth size='small' type='number' label='Home Score' inputProps={{ min: 0 }} value={formData.homeScore} onChange={e => update('homeScore', e.target.value)} error={!!formErrors.homeScore} helperText={formErrors.homeScore} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField fullWidth size='small' type='number' label='Away Score' inputProps={{ min: 0 }} value={formData.awayScore} onChange={e => update('awayScore', e.target.value)} error={!!formErrors.awayScore} helperText={formErrors.awayScore} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField fullWidth size='small' label='Half-time score' placeholder='e.g. 1-0' value={formData.halfTimeScore} onChange={e => update('halfTimeScore', e.target.value)} error={!!formErrors.halfTimeScore} helperText={formErrors.halfTimeScore} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField fullWidth size='small' type='number' label='Attendance' inputProps={{ min: 0 }} value={formData.attendance} onChange={e => update('attendance', e.target.value)} error={!!formErrors.attendance} helperText={formErrors.attendance} />
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant='subtitle2' color='text.secondary'>Goals</Typography>
            <Button type='button' size='small' variant='outlined' startIcon={<i className='ri-add-line' />} onClick={addGoal}>Add goal</Button>
          </Box>
          {formData.goals.map((goal, i) => (
            <Grid key={i} container spacing={2} sx={{ mb: 1.5 }}>
              <Grid size={{ xs: 6, sm: 3 }}>
                <TextField fullWidth size='small' type='number' placeholder='Min' value={goal.minute} onChange={e => updateGoal(i, 'minute', e.target.value)} inputProps={{ min: 0, max: 120 }} />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <TextField fullWidth size='small' placeholder='Scorer' value={goal.scorer} onChange={e => updateGoal(i, 'scorer', e.target.value)} />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <FormControl fullWidth size='small'>
                  <InputLabel>Team</InputLabel>
                  <Select value={goal.team} label='Team' onChange={e => updateGoal(i, 'team', e.target.value)}>
                    <MenuItem value='home'>Home</MenuItem>
                    <MenuItem value='away'>Away</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 5, sm: 2 }}>
                <FormControl fullWidth size='small'>
                  <InputLabel>Type</InputLabel>
                  <Select value={goal.type} label='Type' onChange={e => updateGoal(i, 'type', e.target.value)}>
                    {GOAL_TYPES.map(gt => (
                      <MenuItem key={gt.id} value={gt.id}>{gt.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 1 }} sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <IconButton size='small' onClick={() => removeGoal(i)} color='error'><i className='ri-delete-bin-line' /></IconButton>
              </Grid>
            </Grid>
          ))}

          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant='subtitle2' color='text.secondary'>Cards</Typography>
            <Button type='button' size='small' variant='outlined' startIcon={<i className='ri-add-line' />} onClick={addCard}>Add card</Button>
          </Box>
          {formData.cards.map((card, i) => (
            <Grid key={i} container spacing={2} sx={{ mb: 1.5 }}>
              <Grid size={{ xs: 6, sm: 3 }}>
                <TextField fullWidth size='small' type='number' placeholder='Min' value={card.minute} onChange={e => updateCard(i, 'minute', e.target.value)} inputProps={{ min: 0, max: 120 }} />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <TextField fullWidth size='small' placeholder='Player' value={card.player} onChange={e => updateCard(i, 'player', e.target.value)} />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <FormControl fullWidth size='small'>
                  <InputLabel>Team</InputLabel>
                  <Select value={card.team} label='Team' onChange={e => updateCard(i, 'team', e.target.value)}>
                    <MenuItem value='home'>Home</MenuItem>
                    <MenuItem value='away'>Away</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 5, sm: 2 }}>
                <FormControl fullWidth size='small'>
                  <InputLabel>Card</InputLabel>
                  <Select value={card.type} label='Card' onChange={e => updateCard(i, 'type', e.target.value)}>
                    <MenuItem value='yellow'>Yellow</MenuItem>
                    <MenuItem value='red'>Red</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 1 }} sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <IconButton size='small' onClick={() => removeCard(i)} color='error'><i className='ri-delete-bin-line' /></IconButton>
              </Grid>
            </Grid>
          ))}

          {error && (
            <Typography color='error' variant='body2' sx={{ mt: 2 }}>{error}</Typography>
          )}
          <div className='flex gap-2 mt-2'>
            <Button type='submit' variant='contained' size='small' disabled={saving} startIcon={saving ? <CircularProgress size={16} color='inherit' /> : null}>
              {saving ? 'Saving...' : 'Save Result'}
            </Button>
            <Button type='button' variant='outlined' color='secondary' size='small' onClick={onClose} disabled={saving}>Cancel</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
