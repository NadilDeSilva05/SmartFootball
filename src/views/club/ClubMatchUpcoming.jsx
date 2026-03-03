'use client'

// React Imports
import { useState, useMemo, useEffect } from 'react'
import { useSelector } from 'react-redux'

// MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Divider from '@mui/material/Divider'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import TablePagination from '@mui/material/TablePagination'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
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

// Style Imports
import tableStyles from '@core/styles/table.module.css'

const columnHelper = createColumnHelper()

const resolveCurrentClub = (clubs, user) => {
  if (!Array.isArray(clubs) || clubs.length === 0 || !user) return null

  const userClubIds = [user?.clubId, user?.clubDocId, user?.club?.id]
    .map(value => String(value || '').trim())
    .filter(Boolean)
  const userUids = [user?.uid, user?.id, user?.userId, user?.adminUserId]
    .map(value => String(value || '').trim())
    .filter(Boolean)
  const userEmails = [user?.email, user?.emailAddress, user?.adminEmail]
    .map(value => String(value || '').trim().toLowerCase())
    .filter(Boolean)

  const byUserClubId = userClubIds.length
    ? clubs.find(club => {
      const clubDocId = String(club?.id || '').trim()
      const businessClubId = String(club?.clubId || '').trim()
      return userClubIds.includes(clubDocId) || userClubIds.includes(businessClubId)
    })
    : null
  if (byUserClubId) return byUserClubId

  const byAdminUid = userUids.length
    ? clubs.find(club => userUids.includes(String(club?.adminUserId || '').trim()))
    : null
  if (byAdminUid) return byAdminUid

  return userEmails.length
    ? clubs.find(club => userEmails.includes(String(club?.adminEmail || '').trim().toLowerCase())) || null
    : null
}

const getStatsForData = data => {
  const total = data.length
  const today = new Date().toISOString().slice(0, 10)
  const todayCount = data.filter(match => match.date === today).length
  const weekFromNow = new Date()
  weekFromNow.setDate(weekFromNow.getDate() + 7)
  const weekEnd = weekFromNow.toISOString().slice(0, 10)
  const thisWeekCount = data.filter(match => match.date >= today && match.date <= weekEnd).length

  return [
    { title: 'Scheduled', value: String(total), avatarIcon: 'ri-calendar-check-line', avatarColor: 'primary', change: 'positive', changeNumber: '0', subTitle: 'Upcoming matches' },
    { title: 'Today', value: String(todayCount), avatarIcon: 'ri-calendar-today-line', avatarColor: 'success', change: 'neutral', changeNumber: '0', subTitle: 'Matches today' },
    { title: 'This Week', value: String(thisWeekCount), avatarIcon: 'ri-calendar-week-line', avatarColor: 'info', change: 'positive', changeNumber: '0', subTitle: 'Next 7 days' },
    { title: 'Total', value: String(total), avatarIcon: 'ri-calendar-line', avatarColor: 'secondary', change: 'neutral', changeNumber: '0', subTitle: 'In this list' }
  ]
}

const ClubMatchUpcoming = () => {
  const user = useSelector(state => state?.authenticationReducer?.loginData?.user)
  const [tabValue, setTabValue] = useState(0)
  const [globalFilter, setGlobalFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [rawMatches, setRawMatches] = useState([])
  const [clubs, setClubs] = useState([])
  const [leagues, setLeagues] = useState([])
  const isMobile = useMediaQuery(theme => theme.breakpoints.down('md'))

  useEffect(() => {
    let active = true

    const loadData = async () => {
      try {
        setLoading(true)
        setError('')

        const [matchesRes, clubsRes, leaguesRes] = await Promise.all([
          fetch('/api/matches?status=scheduled', { cache: 'no-store' }),
          fetch('/api/clubs', { cache: 'no-store' }),
          fetch('/api/leagues', { cache: 'no-store' })
        ])

        if (!matchesRes.ok || !clubsRes.ok || !leaguesRes.ok) {
          throw new Error('Failed to load match management data')
        }

        const [matchesPayload, clubsPayload, leaguesPayload] = await Promise.all([
          matchesRes.json().catch(() => []),
          clubsRes.json().catch(() => []),
          leaguesRes.json().catch(() => [])
        ])

        if (!active) return

        setRawMatches(Array.isArray(matchesPayload) ? matchesPayload : [])
        setClubs(Array.isArray(clubsPayload) ? clubsPayload : [])
        setLeagues(Array.isArray(leaguesPayload) ? leaguesPayload : [])
      } catch (e) {
        if (!active) return
        setError(e?.message || 'Unable to load upcoming matches')
        setRawMatches([])
        setClubs([])
        setLeagues([])
      } finally {
        if (active) setLoading(false)
      }
    }

    loadData()

    return () => {
      active = false
    }
  }, [])

  const clubMap = useMemo(() => {
    const map = {}
    clubs.forEach(club => {
      map[club.id] = club.clubName || club.name || '-'
    })

    return map
  }, [clubs])

  const leagueMap = useMemo(() => {
    const map = {}
    leagues.forEach(league => {
      map[league.id] = league.name || '-'
    })

    return map
  }, [leagues])

  const currentClub = useMemo(() => resolveCurrentClub(clubs, user), [clubs, user])
  const currentClubId = currentClub?.id || null
  const currentClubName = currentClub?.clubName || currentClub?.name || 'your club'

  const matchesData = useMemo(
    () => rawMatches.map(match => ({
      id: match.id,
      leagueName: leagueMap[match.leagueId] || '-',
      homeClubId: match.homeClubId || null,
      awayClubId: match.awayClubId || null,
      homeTeamName: clubMap[match.homeClubId] || '-',
      awayTeamName: clubMap[match.awayClubId] || '-',
      venue: match.venue || '-',
      date: match.matchDate || match.date || '',
      time: match.matchTime || ''
    })),
    [rawMatches, leagueMap, clubMap]
  )

  const filteredByTab = useMemo(() => {
    const isMyClubMatch = match => {
      if (!currentClubId) return false
      return match.homeClubId === currentClubId || match.awayClubId === currentClubId
    }

    return tabValue === 0
      ? matchesData.filter(isMyClubMatch)
      : matchesData.filter(match => !isMyClubMatch(match))
  }, [matchesData, tabValue, currentClubId])

  const matchCardsData = useMemo(() => getStatsForData(filteredByTab), [filteredByTab])

  const columns = useMemo(
    () => [
      columnHelper.accessor('leagueName', {
        header: 'League',
        cell: ({ row }) => <Typography variant='body2'>{row.original.leagueName || '-'}</Typography>
      }),
      columnHelper.accessor('homeTeamName', {
        header: 'Home Team',
        cell: ({ row }) => (
          <Typography className='font-medium' color='text.primary'>
            {row.original.homeTeamName}
          </Typography>
        )
      }),
      columnHelper.accessor('awayTeamName', {
        header: 'Away Team',
        cell: ({ row }) => (
          <Typography className='font-medium' color='text.primary'>
            {row.original.awayTeamName}
          </Typography>
        )
      }),
      columnHelper.accessor('venue', {
        header: 'Venue',
        cell: ({ row }) => <Typography variant='body2'>{row.original.venue || '-'}</Typography>
      }),
      columnHelper.accessor('date', {
        header: 'Date & Time',
        cell: ({ row }) => (
          <Typography variant='body2'>
            {row.original.date} {row.original.time}
          </Typography>
        )
      })
    ],
    []
  )

  const table = useReactTable({
    data: filteredByTab,
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
    <div className='space-y-6'>
      <div>
        <Typography variant='h4' className='font-semibold mb-1'>
          Upcoming Matches
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          View scheduled fixtures. Matches involving <strong>{currentClubName}</strong> are in My Club matches.
        </Typography>
      </div>

      {error && <Alert severity='error'>{error}</Alert>}

      <Tabs value={tabValue} onChange={(_, value) => setTabValue(value)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tab label='My Club matches' />
        <Tab label='Other team matches' />
      </Tabs>

      <div className='grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'>
        {matchCardsData.map((item, i) => (
          <HorizontalWithSubtitle key={i} {...item} />
        ))}
      </div>

      <Card>
        <CardHeader
          title='Matches'
          action={
            <TextField
              size='small'
              placeholder='Search matches...'
              value={globalFilter ?? ''}
              onChange={e => setGlobalFilter(e.target.value)}
              sx={{ minWidth: { xs: 0, sm: 200 }, flex: { xs: '1 1 auto', sm: '0 0 auto' } }}
            />
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
          <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress size={22} />
          </Box>
        ) : isMobile ? (
          <div className='p-4 flex flex-col gap-4'>
            {table.getFilteredRowModel().rows.length === 0 ? (
              <Typography color='text.secondary' className='text-center py-8'>No matches found</Typography>
            ) : (
              table.getRowModel().rows.map(row => {
                const match = row.original

                return (
                  <Card
                    key={match.id}
                    elevation={0}
                    variant='outlined'
                    sx={{
                      borderRadius: 2,
                      transition: 'box-shadow 0.2s ease',
                      '&:hover': { boxShadow: 1 }
                    }}
                  >
                    <CardContent>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant='subtitle1' fontWeight={600} color='text.primary'>
                          {match.homeTeamName} vs {match.awayTeamName}
                        </Typography>
                        <Typography variant='caption' color='text.secondary'>
                          {match.leagueName}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <i className='ri-map-pin-line text-base text-textSecondary' />
                          <Typography variant='body2' color='text.secondary'>{match.venue}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <i className='ri-calendar-line text-base text-textSecondary' />
                          <Typography variant='body2' color='text.secondary'>{match.date} {match.time}</Typography>
                        </Box>
                      </Box>
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
                      No matches found
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
  )
}

export default ClubMatchUpcoming
