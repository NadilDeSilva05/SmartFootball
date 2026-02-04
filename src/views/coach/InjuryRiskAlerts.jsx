'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
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

// Hardcoded injury risk alerts (real-time list)
const INJURY_ALERTS = [
  {
    id: '1',
    playerName: 'Maria Perera',
    riskLevel: 'High',
    suggestedAction: 'Consider immediate substitution. Monitor for muscle strain.',
    timestamp: 'Just now'
  },
  {
    id: '2',
    playerName: 'James Wilson',
    riskLevel: 'Elevated',
    suggestedAction: 'Reduce intensity or substitute within 10–15 min.',
    timestamp: '2 min ago'
  },
  {
    id: '3',
    playerName: 'John Silva',
    riskLevel: 'Moderate',
    suggestedAction: 'Monitor. Advise reduced sprint frequency.',
    timestamp: '5 min ago'
  }
]

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

const InjuryRiskAlerts = () => {
  const [alerts] = useState(INJURY_ALERTS)

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between flex-wrap gap-2'>
        <div>
          <Typography variant='h4' className='font-semibold mb-1'>
            Injury Risk Alerts
          </Typography>
          <Typography variant='body1' color='text.secondary'>
            Real-time alerts for player injury risk. Review suggested actions promptly.
          </Typography>
        </div>
        <Chip color='error' variant='tonal' label={`${alerts.length} active alert${alerts.length !== 1 ? 's' : ''}`} icon={<i className='ri-alarm-warning-line' />} />
      </div>

      <Alert severity='error' icon={<i className='ri-alarm-warning-line text-2xl' />}>
        High and elevated risk levels require immediate attention. Follow suggested actions to minimise injury.
      </Alert>

      <Card>
        <CardHeader title='Real-time Alerts List' />
        <CardContent>
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
                    <Typography variant='caption' color='text.secondary'>{alert.timestamp}</Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

export default InjuryRiskAlerts
