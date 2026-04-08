'use client'

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
import Button from '@mui/material/Button'
import Link from 'next/link'
import { useCoachLivePlayers } from '@/hooks/useCoachLivePlayers'
import CoachAnalyticsNav from '@views/coach/CoachAnalyticsNav'

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
      reasonDetail = `Elevated heart rate / load (HR ${p.heartRate} bpm, fatigue ${p.fatigueLevel}, steps ${p.sprintCount})`
      confidence = 85
    } else if (p.fatigueLevel === 'High') {
      priority = 'high'
      reason = 'High fatigue'
      reasonDetail = `Fatigue level high – player load ${Number(p.playerLoad).toFixed(1)} m / energy index ${p.energyLoadIndex ?? '–'}`
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
  return list.sort((a, b) => {
    const rank = x => (x === 'critical' ? 0 : x === 'high' ? 1 : 2)
    return rank(a.priority) - rank(b.priority)
  })
}

const SubstitutionRecommendations = () => {
  const {
    coachClubId,
    isCoachRole,
    clubMatches,
    loadingMatches,
    selectedMatchId,
    setSelectedMatchId,
    selectedMatch,
    players
  } = useCoachLivePlayers()

  const recommendations = buildRecommendations(players)

  const matchLabel = selectedMatch
    ? `${selectedMatch.matchDate || ''} ${selectedMatch.matchTime || ''} – ${selectedMatch.homeClubName || selectedMatch.homeClubId || ''} vs ${selectedMatch.awayClubName || selectedMatch.awayClubId || ''}`
    : ''

  return (
    <div className='space-y-6'>
      <CoachAnalyticsNav matchLabel={matchLabel} />

      <div>
        <Typography variant='h4' className='font-semibold mb-1'>
          Substitution Recommendations
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          Uses the same live device feed as the dashboard (Realtime Database when configured). Scope matches your club as coach.
        </Typography>
      </div>

      {isCoachRole && !coachClubId && (
        <Alert severity='warning'>No club on your profile — recommendations may include all linked players in the match.</Alert>
      )}

      <FormControl fullWidth size='small' sx={{ maxWidth: 480 }}>
        <InputLabel>Match</InputLabel>
        <Select
          label='Match'
          value={selectedMatchId}
          onChange={e => setSelectedMatchId(e.target.value)}
          disabled={loadingMatches || clubMatches.length === 0}
        >
          {clubMatches.map(m => (
            <MenuItem key={m.id} value={m.id}>
              {m.matchDate} {m.matchTime} – {m.homeClubName || m.homeClubId} vs {m.awayClubName || m.awayClubId}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
        <Button component={Link} href='/coach/live-dashboard' variant='outlined' size='small' startIcon={<i className='ri-heart-pulse-line' />}>
          Substitute on live dashboard
        </Button>
        <Button component={Link} href='/coach/injury-alerts' variant='outlined' size='small' startIcon={<i className='ri-alarm-warning-line' />}>
          Open injury alerts
        </Button>
      </Box>

      <Alert severity='warning' icon={<i className='ri-repeat-line text-2xl' />}>
        Review recommendations below. Critical and high-priority items align with injury alerts for the same match.
      </Alert>

      {recommendations.length === 0 && selectedMatchId && (
        <Alert severity='info'>No substitution recommendations for this match. All club players are within safe metrics, or no live data yet.</Alert>
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
