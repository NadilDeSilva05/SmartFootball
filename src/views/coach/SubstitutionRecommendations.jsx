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
import LinearProgress from '@mui/material/LinearProgress'
import Alert from '@mui/material/Alert'

// Hardcoded substitution recommendations
const RECOMMENDATIONS = [
  {
    id: '1',
    reason: 'High fatigue',
    reasonDetail: 'Fatigue level critical – player load 9.8',
    playerOut: 'James Wilson',
    suggestedReplacement: 'Carlos Ruiz',
    confidence: 92,
    priority: 'high'
  },
  {
    id: '2',
    reason: 'Injury risk',
    reasonDetail: 'Elevated injury risk – high sprint count with rising fatigue',
    playerOut: 'Maria Perera',
    suggestedReplacement: 'Emma Davis',
    confidence: 78,
    priority: 'critical'
  },
  {
    id: '3',
    reason: 'High fatigue',
    reasonDetail: 'Sustained high work rate – consider rotation',
    playerOut: 'John Silva',
    suggestedReplacement: 'Liam Brown',
    confidence: 65,
    priority: 'medium'
  }
]

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

const SubstitutionRecommendations = () => {
  const [recommendations] = useState(RECOMMENDATIONS)

  return (
    <div className='space-y-6'>
      <div>
        <Typography variant='h4' className='font-semibold mb-1'>
          Substitution Recommendations
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          AI-suggested substitutions with reason and confidence. Use warning colors for high-priority actions.
        </Typography>
      </div>

      <Alert severity='warning' icon={<i className='ri-repeat-line text-2xl' />}>
        Review recommendations below. Critical and high-priority items require immediate attention.
      </Alert>

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
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2, alignItems: 'center' }}>
                <Box>
                  <Typography variant='caption' color='text.secondary'>Player out</Typography>
                  <Typography className='font-medium' color='error.main'>
                    {rec.playerOut}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant='caption' color='text.secondary'>Suggested replacement</Typography>
                  <Typography className='font-medium' color='success.main'>
                    {rec.suggestedReplacement}
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
