'use client'

// React Imports
import { useState, useMemo, useEffect, useCallback } from 'react'

// MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import TablePagination from '@mui/material/TablePagination'
import useMediaQuery from '@mui/material/useMediaQuery'

// Third-party Imports
import classnames from 'classnames'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel
} from '@tanstack/react-table'

// Component Imports
import HorizontalWithSubtitle from '@components/card-statistics/HorizontalWithSubtitle'
import ResultDetailDrawer from '@views/federation/components/match/ResultDetailDrawer'
import AddResultDialog from '@views/federation/components/match/AddResultDialog'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

const columnHelper = createColumnHelper()

const MatchPastResults = () => {
  const [rawResults, setRawResults] = useState([])
  const [scheduledMatches, setScheduledMatches] = useState([])
  const [clubs, setClubs] = useState([])
  const [leagues, setLeagues] = useState([])
  const [referees, setReferees] = useState([])
  const [loading, setLoading] = useState(true)
  const [globalFilter, setGlobalFilter] = useState('')
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false)
  const [addResultDrawerOpen, setAddResultDrawerOpen] = useState(false)
  const [selectedMatch, setSelectedMatch] = useState(null)
  const isMobile = useMediaQuery(theme => theme.breakpoints.down('md'))

  const fetchResults = useCallback(async () => {
    try {
      const res = await fetch('/api/matches?status=played')
      const list = await res.json().catch(() => [])
      setRawResults(Array.isArray(list) ? list : [])
    } catch {
      setRawResults([])
    }
  }, [])

  const fetchScheduled = useCallback(async () => {
    try {
      const res = await fetch('/api/matches?status=scheduled')
      const list = await res.json().catch(() => [])
      setScheduledMatches(Array.isArray(list) ? list : [])
    } catch {
      setScheduledMatches([])
    }
  }, [])

  const fetchClubs = useCallback(async () => {
    try {
      const res = await fetch('/api/clubs')
      const list = await res.json().catch(() => [])
      setClubs(Array.isArray(list) ? list : [])
    } catch {
      setClubs([])
    }
  }, [])

  const fetchLeagues = useCallback(async () => {
    try {
      const res = await fetch('/api/leagues')
      const list = await res.json().catch(() => [])
      setLeagues(Array.isArray(list) ? list : [])
    } catch {
      setLeagues([])
    }
  }, [])

  const fetchReferees = useCallback(async () => {
    try {
      const res = await fetch('/api/referees')
      const list = await res.json().catch(() => [])
      setReferees(Array.isArray(list) ? list : [])
    } catch {
      setReferees([])
    }
  }, [])

  useEffect(() => {
    setLoading(true)
    Promise.all([fetchResults(), fetchScheduled(), fetchClubs(), fetchLeagues(), fetchReferees()]).finally(() => setLoading(false))
  }, [fetchResults, fetchScheduled, fetchClubs, fetchLeagues, fetchReferees])

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

  const getRefereeName = useCallback(id => referees.find(r => r.id === id)?.fullName || '-', [referees])

  const data = useMemo(() => {
    return rawResults.map(m => ({
      id: m.id,
      homeTeam: clubMap[m.homeClubId] || '-',
      awayTeam: clubMap[m.awayClubId] || '-',
      homeScore: m.homeScore ?? 0,
      awayScore: m.awayScore ?? 0,
      date: m.matchDate || m.date || '',
      venue: m.venue || '-',
      leagueName: leagueMap[m.leagueId] || '-',
      referee: getRefereeName(m.referees?.mainReferee || m.refereeId),
      attendance: m.attendance,
      halfTimeScore: m.halfTimeScore || '',
      goals: m.goals || [],
      cards: m.cards || []
    }))
  }, [rawResults, clubMap, leagueMap, getRefereeName])

  const resultCardsData = useMemo(() => {
    const total = data.length
    const homeWins = data.filter(m => m.homeScore > m.awayScore).length
    const draws = data.filter(m => m.homeScore === m.awayScore).length
    const awayWins = data.filter(m => m.awayScore > m.homeScore).length
    const homePct = total ? Math.round((homeWins / total) * 100) : 0
    const drawPct = total ? Math.round((draws / total) * 100) : 0
    const awayPct = total ? Math.round((awayWins / total) * 100) : 0
    return [
      { title: 'Total Matches', value: String(total), avatarIcon: 'ri-calendar-check-line', avatarColor: 'primary', change: 'neutral', changeNumber: '', subTitle: 'Completed' },
      { title: 'Home Wins', value: String(homeWins), avatarIcon: 'ri-home-heart-line', avatarColor: 'success', change: 'positive', changeNumber: `${homePct}%`, subTitle: 'Home victories' },
      { title: 'Draws', value: String(draws), avatarIcon: 'ri-equal-line', avatarColor: 'info', change: 'neutral', changeNumber: `${drawPct}%`, subTitle: 'Draws' },
      { title: 'Away Wins', value: String(awayWins), avatarIcon: 'ri-roadster-line', avatarColor: 'secondary', change: 'positive', changeNumber: `${awayPct}%`, subTitle: 'Away victories' }
    ]
  }, [data])

  const handleAddResult = useCallback(() => {
    fetchResults()
    setAddResultDrawerOpen(false)
  }, [fetchResults])

  const columns = useMemo(
    () => [
      columnHelper.accessor('date', {
        header: 'Date',
        cell: ({ row }) => <Typography variant='body2'>{row.original.date}</Typography>
      }),
      columnHelper.accessor(row => `${row.homeTeam} vs ${row.awayTeam}`, {
        id: 'match',
        header: 'Match',
        cell: ({ row }) => (
          <Box>
            <Typography className='font-medium' color='text.primary'>
              {row.original.homeTeam} vs {row.original.awayTeam}
            </Typography>
            <Typography variant='caption' color='text.secondary'>{row.original.venue} • {row.original.leagueName}</Typography>
          </Box>
        )
      }),
      columnHelper.accessor(row => `${row.homeScore}-${row.awayScore}`, {
        id: 'score',
        header: 'Score',
        cell: ({ row }) => {
          const m = row.original
          const isDraw = m.homeScore === m.awayScore
          const homeWon = m.homeScore > m.awayScore
          return (
            <Chip
              variant='tonal'
              size='small'
              label={`${m.homeScore} – ${m.awayScore}`}
              color={isDraw ? 'info' : homeWon ? 'success' : 'secondary'}
              sx={{ fontWeight: 600, minWidth: 64 }}
            />
          )
        }
      }),
      columnHelper.accessor('referee', {
        header: 'Referee',
        cell: ({ row }) => <Typography variant='body2'>{row.original.referee}</Typography>
      }),
      columnHelper.accessor('action', {
        header: '',
        cell: ({ row }) => (
          <Button
            size='small'
            variant='outlined'
            onClick={() => {
              setSelectedMatch(row.original)
              setDetailDrawerOpen(true)
            }}
          >
            View
          </Button>
        ),
        enableSorting: false
      })
    ],
    []
  )

  const table = useReactTable({
    data,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } }
  })

  return (
    <>
      <div className='space-y-6'>
        <div>
          <Typography variant='h4' className='font-semibold mb-1'>
            Past Match Results
          </Typography>
          <Typography variant='body1' color='text.secondary'>
            View completed match results and statistics.
          </Typography>
        </div>

        <div className='grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'>
          {resultCardsData.map((item, i) => (
            <HorizontalWithSubtitle key={i} {...item} />
          ))}
        </div>

        <Card>
          <CardHeader
            title='Results'
            action={
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'stretch', sm: 'center' }, gap: 2, width: { xs: '100%', sm: 'auto' }, minWidth: { xs: 0, sm: 200 } }}>
                <TextField
                  size='small'
                  placeholder='Search matches...'
                  value={globalFilter ?? ''}
                  onChange={e => setGlobalFilter(e.target.value)}
                  sx={{ minWidth: { xs: 0, sm: 220 }, flex: { xs: '1 1 auto', sm: '0 0 auto' } }}
                />
                <Button variant='contained' startIcon={<i className='ri-add-line' />} onClick={() => setAddResultDrawerOpen(true)} sx={{ flexShrink: 0 }}>
                  Add Result
                </Button>
              </Box>
            }
            sx={{
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'stretch', sm: 'center' },
              gap: 2,
              '& .MuiCardHeader-action': {
                margin: 0,
                alignSelf: { xs: 'stretch', sm: 'center' },
                width: { xs: '100%', sm: 'auto' }
              }
            }}
          />
          <Divider />
          {loading ? (
            <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Typography color='text.secondary'>Loading results...</Typography>
            </Box>
          ) : isMobile ? (
            <div className='p-4 flex flex-col gap-4'>
              {table.getFilteredRowModel().rows.length === 0 ? (
                <Typography color='text.secondary' className='text-center py-8'>No results found</Typography>
              ) : (
                table.getRowModel().rows.map(row => {
                  const m = row.original
                  const isDraw = m.homeScore === m.awayScore
                  const homeWon = m.homeScore > m.awayScore
                  return (
                    <Card
                      key={m.id}
                      elevation={0}
                      variant='outlined'
                      sx={{
                        borderRadius: 2,
                        transition: 'box-shadow 0.2s ease',
                        '&:hover': { boxShadow: 1 }
                      }}
                    >
                      <CardContent>
                        <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 1 }}>
                          {m.date} • {m.leagueName}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                          <Typography variant='body2' fontWeight={600} color='text.primary' sx={{ flex: '1 1 0', minWidth: 0 }}>
                            {m.homeTeam}
                          </Typography>
                          <Chip
                            variant='tonal'
                            size='small'
                            label={`${m.homeScore} – ${m.awayScore}`}
                            color={isDraw ? 'info' : homeWon ? 'success' : 'secondary'}
                            sx={{ fontWeight: 600, flexShrink: 0 }}
                          />
                          <Typography variant='body2' fontWeight={600} color='text.primary' sx={{ flex: '1 1 0', minWidth: 0, textAlign: 'right' }}>
                            {m.awayTeam}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                          <i className='ri-map-pin-line text-base text-textSecondary' />
                          <Typography variant='body2' color='text.secondary'>{m.venue}</Typography>
                        </Box>
                        <Button
                          size='small'
                          variant='outlined'
                          fullWidth
                          onClick={() => { setSelectedMatch(m); setDetailDrawerOpen(true) }}
                        >
                          View details
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })
              )}
            </div>
          ) : (
            <div className='overflow-x-auto'>
              <table className={tableStyles.table}>
                <thead>
                  {table.getHeaderGroups().map(headerGroup => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map(header => (
                        <th key={header.id}>
                          {header.isPlaceholder ? null : (
                            <div
                              className={classnames({ 'cursor-pointer select-none': header.column.getCanSort() })}
                              onClick={header.column.getToggleSortingHandler()}
                            >
                              {flexRender(header.column.columnDef.header, header.getContext())}
                            </div>
                          )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getFilteredRowModel().rows.length === 0 ? (
                    <tr>
                      <td colSpan={columns.length} className='text-center'>
                        No results found
                      </td>
                    </tr>
                  ) : (
                    table.getRowModel().rows.map(row => (
                      <tr key={row.id}>
                        {row.getVisibleCells().map(cell => (
                          <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component='div'
            count={table.getFilteredRowModel().rows.length}
            rowsPerPage={table.getState().pagination.pageSize}
            page={table.getState().pagination.pageIndex}
            onPageChange={(_, page) => table.setPageIndex(page)}
            onRowsPerPageChange={e => table.setPageSize(Number(e.target.value))}
          />
        </Card>
      </div>

      <ResultDetailDrawer
        open={detailDrawerOpen}
        onClose={() => { setDetailDrawerOpen(false); setSelectedMatch(null) }}
        match={selectedMatch}
      />
      <AddResultDialog
        open={addResultDrawerOpen}
        onClose={() => setAddResultDrawerOpen(false)}
        onSave={handleAddResult}
        scheduledMatches={scheduledMatches}
        clubs={clubs}
        leagues={leagues}
        referees={referees}
      />
    </>
  )
}

export default MatchPastResults
