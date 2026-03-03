'use client'

import { useState, useEffect, useCallback } from 'react'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'
import LinearProgress from '@mui/material/LinearProgress'
import Alert from '@mui/material/Alert'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'

const getPriorityColor = p => {
  if (p === 'critical') return 'error'
  if (p === 'high') return 'warning'
  return 'info'
}

const getPriorityIcon = p => {
  if (p === 'critical') return 'ri-error-warning-fill'
  if (p === 'high') return 'ri-alert-fill'
  return 'ri-information-fill'
}

function buildRecommendations (players) {
  const list = []
  const live = (players || []).filter(p => p.status === 'live')
  live.forEach((p, i) => {
    let priority = 'medium'
    let reason = 'Monitor'
    let reasonDetail = ''
    let confidence = 50
    if (p.injuryRisk) {
      priority = 'critical'
      reason = 'Injury risk'
      reasonDetail = `Elevated injury risk – high sprint count (${p.sprintCount}) with fatigue ${p.fatigueLevel}`
      confidence = 85
    } else if (p.fatigueLevel === 'High') {
      priority = 'high'
      reason = 'High fatigue'
      reasonDetail = `Fatigue level high – player load ${Number(p.playerLoad).toFixed(1)}`
      confidence = 80
    } else if (p.fatigueLevel === 'Medium') {
      priority = 'medium'
      reason = 'Moderate fatigue'
      reasonDetail = `Sustained work rate ${p.workRate} – consider rotation`
      confidence = 65
    } else return
    list.push({
      id: `${p.playerId}-${i}`,
      reason,
      reasonDetail,
      playerOut: p.name || p.playerId,
      priority,
      confidence
    })
  })
  return list.sort((a, b) => (a.priority === 'critical' ? -1 : a.priority === 'high' ? 0 : 1) - (b.priority === 'critical' ? -1 : b.priority === 'high' ? 0 : 1))
}

const SubstitutionRecommendations = () => {
  const [matches, setMatches] = useState([])
  const [selectedMatchId, setSelectedMatchId] = useState('')
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(false)
  const recommendations = buildRecommendations(players)

  const fetchMatches = useCallback(() => {
    setLoading(true)
    fetch('/api/matches?status=scheduled')
      .then(r => r.json())
      .then(arr => {
        const list = Array.isArray(arr) ? arr : []
        setMatches(list)
        if (list.length > 0) setSelectedMatchId(prev => prev || list[0].id)
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchMatches()
  }, [fetchMatches])

  useEffect(() => {
    if (!selectedMatchId) {
      setPlayers([])
      return
    }
    let cancelled = false
    fetch(`/api/iot/live?matchId=${encodeURIComponent(selectedMatchId)}`)
      .then(r => r.json())
      .then(arr => { if (!cancelled) setPlayers(Array.isArray(arr) ? arr : []) })
      .catch(() => { if (!cancelled) setPlayers([]) })
    const t = setInterval(() => {
      fetch(`/api/iot/live?matchId=${encodeURIComponent(selectedMatchId)}`)
        .then(r => r.json())
        .then(arr => { if (!cancelled) setPlayers(Array.isArray(arr) ? arr : []) })
        .catch(() => {})
    }, 5000)
    return () => { cancelled = true; clearInterval(t) }
  }, [selectedMatchId])

  return (
    <div className='space-y-6'>
      <div>
        <Typography variant='h4' className='font-semibold mb-1'>
          Substitution Recommendations
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          Recommendations from live IoT metrics (fatigue and injury risk). Select a match to see suggestions.
        </Typography>
      </div>

      <FormControl fullWidth size='small' sx={{ maxWidth: 400 }}>
        <InputLabel>Match</InputLabel>
        <Select
          label='Match'
          value={selectedMatchId}
          onChange={e => setSelectedMatchId(e.target.value)}
          disabled={loading}
        >
          {matches.map(m => (
            <MenuItem key={m.id} value={m.id}>
              {m.matchDate} {m.matchTime} – {m.homeClubName || m.homeClubId} vs {m.awayClubName || m.awayClubId}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Alert severity='warning' icon={<i className='ri-repeat-line text-2xl' />}>
        Review recommendations below. Critical and high-priority items require immediate attention.
      </Alert>

      {recommendations.length === 0 && selectedMatchId && (
        <Alert severity='info'>No substitution recommendations for this match. All players are within safe metrics, or no live data yet.</Alert>
      )}

      <div className='space-y-4'>
        {recommendations.map(rec => (
          <Card key={rec.id} sx={{ borderLeft: 4, borderLeftColor: `${getPriorityColor(rec.priority)}.main` }}>
            <CardHeader
              avatar={
                <Box sx={{ color: `${getPriorityColor(rec.priority)}.main` }}>
                  <i className={getPriorityIcon(rec.priority)} style={{ fontSize: 28 }} />
                </Box>
              }
              title={
                <Box className='flex items-center gap-2 flex-wrap'>
                  <Typography variant='h6'>{rec.reason}</Typography>
                  <Chip size='small' label={rec.priority} color={getPriorityColor(rec.priority)} variant='tonal' />
                </Box>
              }
              subheader={rec.reasonDetail}
            />
            <CardContent>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, alignItems: 'center' }}>
                <Box>
                  <Typography variant='caption' color='text.secondary'>Player (consider substitution)</Typography>
                  <Typography className='font-medium' color='error.main'>
                    {rec.playerOut}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant='caption' color='text.secondary'>Confidence</Typography>
                  <Box className='flex items-center gap-1'>
                    <LinearProgress
                      variant='determinate'
                      value={rec.confidence}
                      color={rec.confidence >= 80 ? 'success' : rec.confidence >= 60 ? 'warning' : 'primary'}
                      sx={{ flex: 1, height: 8, borderRadius: 1 }}
                    />
                    <Typography variant='body2' fontWeight='bold'>
                      {rec.confidence}%
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default SubstitutionRecommendations
