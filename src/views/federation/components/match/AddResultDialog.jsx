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
import { GOAL_TYPES, REFEREE_ROLES } from '@views/federation/constants'

/** @param {Record<string, unknown>} match */
function getMainRefereeId (match) {
  const r = match?.referees
  if (r && typeof r === 'object' && !Array.isArray(r)) return r.mainReferee || match?.refereeId || ''
  if (Array.isArray(r) && r.length) return r[0]
  return match?.refereeId || ''
}

/** Ordered crew entries for this match (for dropdown labels). */
function getMatchOfficialEntries (match) {
  const r = match?.referees
  if (r && typeof r === 'object' && !Array.isArray(r)) {
    return REFEREE_ROLES.map(({ key, label }) => {
      const id = r[key]
      return id ? { roleLabel: label, id } : null
    }).filter(Boolean)
  }
  if (Array.isArray(r) && r.length) {
    return r.map((id, i) => ({ roleLabel: i === 0 ? 'Main referee' : `Official ${i + 1}`, id }))
  }
  return []
}

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
  const refereeNameById = useMemo(() => {
    const m = {}
    referees.forEach(r => { if (r?.id) m[r.id] = r.fullName || r.name || r.id })
    return m
  }, [referees])
  const selectedMatch = useMemo(
    () => matchOptions.find(m => m.id === formData.matchId) || null,
    [matchOptions, formData.matchId]
  )
  const matchOfficialMenuEntries = useMemo(
    () => (selectedMatch ? getMatchOfficialEntries(selectedMatch) : []),
    [selectedMatch]
  )
  const [matchRosters, setMatchRosters] = useState({ home: [], away: [] })
  const [rostersLoading, setRostersLoading] = useState(false)

  useEffect(() => {
    if (!open || !selectedMatch?.homeClubId || !selectedMatch?.awayClubId) {
      setMatchRosters({ home: [], away: [] })
      setRostersLoading(false)
      return
    }
    let cancelled = false
    setRostersLoading(true)
    const hid = selectedMatch.homeClubId
    const aid = selectedMatch.awayClubId
    ;(async () => {
      try {
        const [hRes, aRes] = await Promise.all([
          fetch(`/api/club-players?clubId=${encodeURIComponent(hid)}`),
          fetch(`/api/club-players?clubId=${encodeURIComponent(aid)}`)
        ])
        const h = hRes.ok ? await hRes.json().catch(() => []) : []
        const a = aRes.ok ? await aRes.json().catch(() => []) : []
        if (!cancelled) {
          setMatchRosters({
            home: Array.isArray(h) ? h : [],
            away: Array.isArray(a) ? a : []
          })
        }
      } catch {
        if (!cancelled) setMatchRosters({ home: [], away: [] })
      } finally {
        if (!cancelled) setRostersLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [open, selectedMatch?.id, selectedMatch?.homeClubId, selectedMatch?.awayClubId])

  const defaultGoal = () => ({ minute: '', scorerDocId: '', team: 'home', type: 'open_play' })
  const defaultCard = () => ({ minute: '', playerDocId: '', team: 'home', type: 'yellow' })
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
    if (!formData.referee) {
      errors.referee = selectedMatch
        ? 'This match has no main referee assigned. Assign referees to the match first.'
        : 'Referee is required'
    }
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
      .filter(g => g.minute !== '' && g.scorerDocId)
      .map(g => {
        const roster = g.team === 'home' ? matchRosters.home : matchRosters.away
        const p = roster.find(x => x.id === g.scorerDocId)
        const scorer = (p?.fullName || '').trim()
        return { minute: Number(g.minute), scorer, team: g.team, type: g.type }
      })
      .filter(g => g.scorer)
    const cards = formData.cards
      .filter(c => c.minute !== '' && c.playerDocId)
      .map(c => {
        const roster = c.team === 'home' ? matchRosters.home : matchRosters.away
        const p = roster.find(x => x.id === c.playerDocId)
        const player = (p?.fullName || '').trim()
        return { minute: Number(c.minute), player, team: c.team, type: c.type }
      })
      .filter(c => c.player)
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
    const mainId = match ? getMainRefereeId(match) : ''
    setFormData(prev => ({
      ...prev,
      matchId,
      venue: match ? (match.venue || '') : '',
      date: match ? (match.matchDate || match.date || '') : '',
      referee: mainId,
      goals: [],
      cards: []
    }))
    if (formErrors.matchId) setFormErrors(prev => ({ ...prev, matchId: '' }))
    if (formErrors.referee) setFormErrors(prev => ({ ...prev, referee: '' }))
    if (formErrors.venue) setFormErrors(prev => ({ ...prev, venue: '' }))
    if (formErrors.date) setFormErrors(prev => ({ ...prev, date: '' }))
  }

  const update = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (formErrors[field]) setFormErrors(prev => ({ ...prev, [field]: '' }))
  }

  const addGoal = () => setFormData(prev => ({ ...prev, goals: [...prev.goals, defaultGoal()] }))
  const updateGoal = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.map((g, i) => {
        if (i !== index) return g
        const next = { ...g, [field]: value }
        if (field === 'team' && value !== g.team) next.scorerDocId = ''
        return next
      })
    }))
  }
  const removeGoal = index => setFormData(prev => ({ ...prev, goals: prev.goals.filter((_, i) => i !== index) }))

  const addCard = () => setFormData(prev => ({ ...prev, cards: [...prev.cards, defaultCard()] }))
  const updateCard = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      cards: prev.cards.map((c, i) => {
        if (i !== index) return c
        const next = { ...c, [field]: value }
        if (field === 'team' && value !== c.team) next.playerDocId = ''
        return next
      })
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
              <TextField
                fullWidth
                size='small'
                label='Venue'
                value={formData.venue}
                onChange={e => update('venue', e.target.value)}
                error={!!formErrors.venue}
                helperText={formErrors.venue}
                disabled={!!formData.matchId}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                size='small'
                type='date'
                label='Date'
                value={formData.date}
                onChange={e => update('date', e.target.value)}
                InputLabelProps={{ shrink: true }}
                error={!!formErrors.date}
                helperText={formErrors.date}
                disabled={!!formData.matchId}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />
          <Typography variant='subtitle2' color='text.secondary' sx={{ mb: 2, display: 'block' }}>Score &amp; officials</Typography>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth size='small' error={!!formErrors.referee}>
                <InputLabel id='add-result-referee-label'>Main referee (from match)</InputLabel>
                <Select
                  labelId='add-result-referee-label'
                  value={formData.referee}
                  label='Main referee (from match)'
                  disabled
                >
                  {!formData.matchId && (
                    <MenuItem value=''><em>Select a match first</em></MenuItem>
                  )}
                  {formData.matchId && matchOfficialMenuEntries.length === 0 && (
                    <MenuItem value=''><em>No referees assigned to this match</em></MenuItem>
                  )}
                  {formData.matchId && matchOfficialMenuEntries.length > 0 && !formData.referee && (
                    <MenuItem value=''><em>No main referee assigned</em></MenuItem>
                  )}
                  {formData.matchId && matchOfficialMenuEntries.map(({ id, roleLabel }) => (
                    <MenuItem key={`${roleLabel}-${id}`} value={id}>
                      {roleLabel}: {refereeNameById[id] || id}
                    </MenuItem>
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
            <Button type='button' size='small' variant='outlined' startIcon={<i className='ri-add-line' />} onClick={addGoal} disabled={!formData.matchId}>
              Add goal
            </Button>
          </Box>
          {!formData.matchId && (
            <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 1 }}>
              {`Select a match to add goals using each club's roster.`}
            </Typography>
          )}
          {formData.goals.map((goal, i) => {
            const roster = goal.team === 'home' ? matchRosters.home : matchRosters.away
            const rosterReady = !!formData.matchId && !rostersLoading
            return (
              <Grid key={i} container spacing={2} sx={{ mb: 1.5 }} alignItems='flex-start'>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <FormControl fullWidth size='small' disabled={!selectedMatch}>
                    <InputLabel id={`goal-team-${i}`}>Team</InputLabel>
                    <Select
                      labelId={`goal-team-${i}`}
                      value={goal.team}
                      label='Team'
                      onChange={e => updateGoal(i, 'team', e.target.value)}
                    >
                      <MenuItem value='home'>{selectedMatch?.homeTeamName || 'Home'}</MenuItem>
                      <MenuItem value='away'>{selectedMatch?.awayTeamName || 'Away'}</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <FormControl fullWidth size='small' disabled={!rosterReady}>
                    <InputLabel id={`goal-scorer-${i}`}>Scorer</InputLabel>
                    <Select
                      labelId={`goal-scorer-${i}`}
                      value={goal.scorerDocId}
                      label='Scorer'
                      onChange={e => updateGoal(i, 'scorerDocId', e.target.value)}
                    >
                      <MenuItem value=''><em>Select player</em></MenuItem>
                      {roster.map(p => (
                        <MenuItem key={p.id} value={p.id}>
                          {p.fullName || p.name || p.playerId || p.id}
                          {p.jerseyNo != null && p.jerseyNo !== '' ? ` (#${p.jerseyNo})` : ''}
                        </MenuItem>
                      ))}
                    </Select>
                    {rosterReady && roster.length === 0 && (
                      <FormHelperText>No players listed for this club.</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 6, sm: 2 }}>
                  <TextField fullWidth size='small' type='number' label='Min' placeholder='Min' value={goal.minute} onChange={e => updateGoal(i, 'minute', e.target.value)} inputProps={{ min: 0, max: 120 }} />
                </Grid>
                <Grid size={{ xs: 5, sm: 3 }}>
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
            )
          })}

          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant='subtitle2' color='text.secondary'>Cards</Typography>
            <Button type='button' size='small' variant='outlined' startIcon={<i className='ri-add-line' />} onClick={addCard} disabled={!formData.matchId}>
              Add card
            </Button>
          </Box>
          {!formData.matchId && (
            <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 1 }}>
              {`Select a match to add cards using each club's roster.`}
            </Typography>
          )}
          {formData.cards.map((card, i) => {
            const roster = card.team === 'home' ? matchRosters.home : matchRosters.away
            const rosterReady = !!formData.matchId && !rostersLoading
            return (
              <Grid key={i} container spacing={2} sx={{ mb: 1.5 }} alignItems='flex-start'>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <FormControl fullWidth size='small' disabled={!selectedMatch}>
                    <InputLabel id={`card-team-${i}`}>Team</InputLabel>
                    <Select
                      labelId={`card-team-${i}`}
                      value={card.team}
                      label='Team'
                      onChange={e => updateCard(i, 'team', e.target.value)}
                    >
                      <MenuItem value='home'>{selectedMatch?.homeTeamName || 'Home'}</MenuItem>
                      <MenuItem value='away'>{selectedMatch?.awayTeamName || 'Away'}</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <FormControl fullWidth size='small' disabled={!rosterReady}>
                    <InputLabel id={`card-player-${i}`}>Player</InputLabel>
                    <Select
                      labelId={`card-player-${i}`}
                      value={card.playerDocId}
                      label='Player'
                      onChange={e => updateCard(i, 'playerDocId', e.target.value)}
                    >
                      <MenuItem value=''><em>Select player</em></MenuItem>
                      {roster.map(p => (
                        <MenuItem key={p.id} value={p.id}>
                          {p.fullName || p.name || p.playerId || p.id}
                          {p.jerseyNo != null && p.jerseyNo !== '' ? ` (#${p.jerseyNo})` : ''}
                        </MenuItem>
                      ))}
                    </Select>
                    {rosterReady && roster.length === 0 && (
                      <FormHelperText>No players listed for this club.</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 6, sm: 2 }}>
                  <TextField fullWidth size='small' type='number' label='Min' placeholder='Min' value={card.minute} onChange={e => updateCard(i, 'minute', e.target.value)} inputProps={{ min: 0, max: 120 }} />
                </Grid>
                <Grid size={{ xs: 5, sm: 3 }}>
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
            )
          })}

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
