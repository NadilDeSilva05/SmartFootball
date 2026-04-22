'use client'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Alert from '@mui/material/Alert'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'
import Link from 'next/link'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useCoachLivePlayers } from '@/hooks/useCoachLivePlayers'
import CoachAnalyticsNav from '@views/coach/CoachAnalyticsNav'

const getRiskColor = level => {
  if (level === 'High') return 'error'
  if (level === 'Elevated') return 'warning'
  return 'info'
}

const getRiskIcon = level => {
  if (level === 'High') return 'ri-error-warning-fill'
  if (level === 'Elevated') return 'ri-alert-fill'
  return 'ri-information-line'
}

function buildAlerts (players) {
  const live = (players || []).filter(p => p.status === 'live')
  return live
    .filter(p => p.injuryRisk || p.fatigueLevel === 'High' || p.fatigueLevel === 'Medium')
    .map((p, i) => {
      let riskLevel = 'Moderate'
      let suggestedAction = 'Monitor. Advise reduced sprint frequency.'
      if (p.injuryRisk || p.fatigueLevel === 'High') {
        riskLevel = p.injuryRisk ? 'High' : 'Elevated'
        suggestedAction = p.injuryRisk
          ? 'Consider immediate substitution. Monitor for muscle strain.'
          : 'Reduce intensity or substitute within 10–15 min.'
      } else if (p.fatigueLevel === 'Medium') {
        riskLevel = 'Elevated'
        suggestedAction = 'Reduce intensity or substitute within 10–15 min.'
      }
      return {
        id: `${p.playerId}-${i}`,
        playerName: p.name || p.playerId,
        riskLevel,
        suggestedAction,
        updatedAt: p.updatedAt
      }
    })
}

const InjuryRiskAlerts = () => {
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
  const isMobile = useMediaQuery(theme => theme.breakpoints.down('md'))

  const alerts = buildAlerts(players)

  const matchLabel = selectedMatch
    ? `${selectedMatch.matchDate || ''} ${selectedMatch.matchTime || ''} – ${selectedMatch.homeClubName || selectedMatch.homeClubId || ''} vs ${selectedMatch.awayClubName || selectedMatch.awayClubId || ''}`
    : ''

  const formatTime = (iso) => {
    if (!iso) return '–'
    const d = new Date(iso)
    const diff = (Date.now() - d.getTime()) / 60000
    if (diff < 1) return 'Just now'
    if (diff < 60) return `${Math.floor(diff)} min ago`
    return d.toLocaleTimeString()
  }

  return (
    <div className='space-y-6'>
      <CoachAnalyticsNav matchLabel={matchLabel} />

      <div className='flex items-center justify-between flex-wrap gap-2'>
        <div>
          <Typography variant='h4' className='font-semibold mb-1'>
            Injury Risk Alerts
          </Typography>
          <Typography variant='body1' color='text.secondary'>
            Same live feed as the dashboard and substitution recommendations — scoped to your club when you are logged in as coach.
          </Typography>
        </div>
        <Chip color='error' variant='tonal' label={`${alerts.length} active alert${alerts.length !== 1 ? 's' : ''}`} icon={<i className='ri-alarm-warning-line' />} />
      </div>

      {isCoachRole && !coachClubId && (
        <Alert severity='warning'>No club on your profile — alerts may include all linked players in the match.</Alert>
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
        <Button component={Link} href='/coach/substitutions' variant='outlined' size='small' startIcon={<i className='ri-repeat-line' />}>
          Substitution recommendations
        </Button>
        <Button component={Link} href='/coach/performance-history' variant='outlined' size='small' startIcon={<i className='ri-bar-chart-line' />}>
          Performance history (after subs)
        </Button>
      </Box>

      <Alert severity='error' icon={<i className='ri-alarm-warning-line text-2xl' />}>
        High and elevated risk levels require immediate attention. Coordinate with live dashboard substitution actions.
      </Alert>

      {selectedMatchId && alerts.length === 0 && (
        <Alert severity='success'>No injury risk alerts for this match. Club players with devices are within current thresholds.</Alert>
      )}

      <Card>
        <CardHeader title='Real-time Alerts List' subheader={selectedMatchId ? 'From connected IoT devices (club players)' : 'Select a match'} />
        <CardContent>
          {isMobile ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {alerts.map(alert => (
                <Card key={alert.id} elevation={0} variant='outlined' sx={{ bgcolor: alert.riskLevel === 'High' ? 'error.light' : alert.riskLevel === 'Elevated' ? 'warning.light' : 'transparent' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                      <Box sx={{ color: `${getRiskColor(alert.riskLevel)}.main` }}>
                        <i className={getRiskIcon(alert.riskLevel)} style={{ fontSize: 22 }} />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography className='font-medium'>{alert.playerName}</Typography>
                        <Typography variant='caption' color='text.secondary'>{formatTime(alert.updatedAt)}</Typography>
                      </Box>
                      <Chip size='small' label={alert.riskLevel} color={getRiskColor(alert.riskLevel)} variant='tonal' />
                    </Box>
                    <Typography variant='body2'>{alert.suggestedAction}</Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          ) : (
            <Table size='small'>
              <TableHead>
                <TableRow>
                  <TableCell>Status</TableCell>
                  <TableCell>Player Name</TableCell>
                  <TableCell>Risk Level</TableCell>
                  <TableCell>Suggested Action</TableCell>
                  <TableCell>Time</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {alerts.map(alert => (
                  <TableRow key={alert.id} sx={{ bgcolor: alert.riskLevel === 'High' ? 'error.light' : alert.riskLevel === 'Elevated' ? 'warning.light' : 'transparent' }}>
                    <TableCell>
                      <Box sx={{ color: `${getRiskColor(alert.riskLevel)}.main` }}>
                        <i className={getRiskIcon(alert.riskLevel)} style={{ fontSize: 22 }} />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography className='font-medium'>{alert.playerName}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size='small'
                        label={alert.riskLevel}
                        color={getRiskColor(alert.riskLevel)}
                        variant='tonal'
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2'>{alert.suggestedAction}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant='caption' color='text.secondary'>{formatTime(alert.updatedAt)}</Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default InjuryRiskAlerts
