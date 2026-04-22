'use client'

import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Area,
  Line,
  ComposedChart,
  PieChart,
  Pie,
  Cell
} from 'recharts'

const FATIGUE_COLORS = {
  Low: '#2e7d32',
  Medium: '#ed6c02',
  High: '#d32f2f'
}

export function SquadOverviewCharts ({ players }) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme => theme.breakpoints.down('md'))
  const primary = theme.palette.primary.main
  const secondary = theme.palette.secondary.main

  const barData = players.map(p => {
    const raw = p.name || p.playerId || 'Player'
    const name = raw.length > 14 ? `${raw.slice(0, 14)}…` : raw
    return {
      name,
      heartRate: Math.round(Number(p.heartRate) || 0),
      energyLoad: Math.round(Number(p.energyLoadIndex) || 0),
      speed: Number(Number(p.speedKmh || 0).toFixed(1)),
      distance: Number(Number(p.distanceM || 0).toFixed(1))
    }
  })

  const fatigueMap = players.reduce((acc, p) => {
    const f = p.fatigueLevel || 'Low'
    acc[f] = (acc[f] || 0) + 1
    return acc
  }, {})
  const pieData = ['Low', 'Medium', 'High']
    .filter(k => fatigueMap[k])
    .map(k => ({ name: `${k} fatigue`, value: fatigueMap[k] }))

  if (!barData.length) return null

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant='subtitle1' fontWeight={600} gutterBottom sx={{ mb: 2 }}>
        Squad overview
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', xl: '2fr 2fr 1fr' },
          gap: 2,
          alignItems: 'stretch'
        }}
      >
        <Box sx={{ height: isMobile ? 220 : 260, width: '100%', p: 1, borderRadius: 2, bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider' }}>
          <Typography variant='caption' color='text.secondary' display='block' sx={{ mb: 0.5 }}>
            Heart rate (bpm)
          </Typography>
          <ResponsiveContainer width='100%' height='92%'>
            <BarChart data={barData} margin={{ top: 4, right: 8, left: -8, bottom: 4 }}>
              <CartesianGrid strokeDasharray='3 3' stroke={theme.palette.divider} vertical={false} />
              <XAxis dataKey='name' tick={{ fontSize: isMobile ? 9 : 10 }} interval={0} angle={isMobile ? -28 : -20} textAnchor='end' height={isMobile ? 56 : 48} />
              <YAxis tick={{ fontSize: isMobile ? 9 : 10 }} width={isMobile ? 30 : 36} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: `1px solid ${theme.palette.divider}` }}
                labelStyle={{ fontWeight: 600 }}
              />
              <Bar dataKey='heartRate' name='BPM' fill={primary} radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </Box>

        <Box sx={{ height: isMobile ? 220 : 260, width: '100%', p: 1, borderRadius: 2, bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider' }}>
          <Typography variant='caption' color='text.secondary' display='block' sx={{ mb: 0.5 }}>
            Energy load index & speed
          </Typography>
          <ResponsiveContainer width='100%' height='92%'>
            <BarChart data={barData} margin={{ top: 4, right: 8, left: -8, bottom: 4 }}>
              <CartesianGrid strokeDasharray='3 3' stroke={theme.palette.divider} vertical={false} />
              <XAxis dataKey='name' tick={{ fontSize: isMobile ? 9 : 10 }} interval={0} angle={isMobile ? -28 : -20} textAnchor='end' height={isMobile ? 56 : 48} />
              <YAxis yAxisId='left' tick={{ fontSize: isMobile ? 9 : 10 }} width={isMobile ? 28 : 32} />
              <YAxis yAxisId='right' orientation='right' tick={{ fontSize: isMobile ? 9 : 10 }} width={isMobile ? 28 : 32} />
              <Tooltip contentStyle={{ borderRadius: 8, border: `1px solid ${theme.palette.divider}` }} />
              <Legend wrapperStyle={{ fontSize: isMobile ? 10 : 12 }} />
              <Bar yAxisId='left' dataKey='energyLoad' name='Load /100' fill={secondary} radius={[4, 4, 0, 0]} maxBarSize={28} />
              <Bar yAxisId='right' dataKey='speed' name='km/h' fill={theme.palette.info.main} radius={[4, 4, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </Box>

        {pieData.length > 0 && (
          <Box sx={{ height: isMobile ? 220 : 260, width: '100%', p: 1, borderRadius: 2, bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider' }}>
            <Typography variant='caption' color='text.secondary' display='block' sx={{ mb: 0.5 }}>
              Fatigue distribution
            </Typography>
            <ResponsiveContainer width='100%' height='92%'>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey='value'
                  nameKey='name'
                  cx='50%'
                  cy='50%'
                  innerRadius={isMobile ? 36 : 48}
                  outerRadius={isMobile ? 58 : 72}
                  paddingAngle={2}
                >
                  {pieData.map((entry, index) => {
                    const level = String(entry.name || '').split(' ')[0]
                    return <Cell key={`cell-${index}`} fill={FATIGUE_COLORS[level] || theme.palette.grey[500]} />
                  })}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: isMobile ? 10 : 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        )}
      </Box>
    </Box>
  )
}

/** Rolling live samples for one player (HR + speed). */
export function PlayerTrendChart ({ history, playerName }) {
  const theme = useTheme()
  if (!history?.length) return null

  const data = history.map((h, idx) => ({
    idx,
    hr: h.hr,
    speed: h.speed,
    load: h.load
  }))

  return (
    <Box sx={{ mt: 2, p: 1.5, borderRadius: 2, bgcolor: 'background.default', border: '1px dashed', borderColor: 'divider' }}>
      <Typography variant='caption' color='text.secondary' display='block' sx={{ mb: 1 }}>
        Live trend (last {data.length} readings) — {playerName}
      </Typography>
      <Box sx={{ height: 200, width: '100%' }}>
        <ResponsiveContainer width='100%' height='100%'>
          <ComposedChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
            <CartesianGrid strokeDasharray='3 3' stroke={theme.palette.divider} />
            <XAxis dataKey='idx' hide />
            <YAxis yAxisId='hr' orientation='left' tick={{ fontSize: 10 }} width={36} domain={['auto', 'auto']} />
            <YAxis yAxisId='sp' orientation='right' tick={{ fontSize: 10 }} width={36} domain={['auto', 'auto']} />
            <Tooltip
              contentStyle={{ borderRadius: 8, border: `1px solid ${theme.palette.divider}` }}
              labelFormatter={(_, p) => (p?.[0]?.payload?.idx === data.length - 1 ? 'Latest' : `Sample ${(p?.[0]?.payload?.idx ?? 0) + 1}`)}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Area
              yAxisId='hr'
              type='monotone'
              dataKey='hr'
              name='Heart rate (bpm)'
              stroke={theme.palette.error.main}
              fill={theme.palette.error.light}
              fillOpacity={0.25}
              strokeWidth={2}
            />
            <Line
              yAxisId='sp'
              type='monotone'
              dataKey='speed'
              name='Speed (km/h)'
              stroke={theme.palette.info.dark}
              dot={false}
              strokeWidth={2}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  )
}
