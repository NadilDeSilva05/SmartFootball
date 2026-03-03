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
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import TablePagination from '@mui/material/TablePagination'
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
import ResultDetailDrawer from '@views/federation/components/match/ResultDetailDrawer'

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
  const homeWins = data.filter(match => match.homeScore > match.awayScore).length
  const draws = data.filter(match => match.homeScore === match.awayScore).length
  const awayWins = data.filter(match => match.awayScore > match.homeScore).length

  return [
    { title: 'Total Matches', value: String(total), avatarIcon: 'ri-calendar-check-line', avatarColor: 'primary', change: 'positive', changeNumber: '0', subTitle: 'Completed' },
    { title: 'Home Wins', value: String(homeWins), avatarIcon: 'ri-home-heart-line', avatarColor: 'success', change: 'positive', changeNumber: total ? `${Math.round((homeWins / total) * 100)}%` : '0%', subTitle: 'Home victories' },
    { title: 'Draws', value: String(draws), avatarIcon: 'ri-equal-line', avatarColor: 'info', change: 'neutral', changeNumber: total ? `${Math.round((draws / total) * 100)}%` : '0%', subTitle: 'Draws' },
    { title: 'Away Wins', value: String(awayWins), avatarIcon: 'ri-roadster-line', avatarColor: 'secondary', change: 'positive', changeNumber: total ? `${Math.round((awayWins / total) * 100)}%` : '0%', subTitle: 'Away victories' }
  ]
}

const ClubMatchPast = () => {
  const user = useSelector(state => state?.authenticationReducer?.loginData?.user)
  const [tabValue, setTabValue] = useState(0)
  const [globalFilter, setGlobalFilter] = useState('')
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false)
  const [selectedMatch, setSelectedMatch] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [rawResults, setRawResults] = useState([])
  const [clubs, setClubs] = useState([])
  const [leagues, setLeagues] = useState([])
  const [referees, setReferees] = useState([])
  const isMobile = useMediaQuery(theme => theme.breakpoints.down('md'))

  useEffect(() => {
    let active = true

    const loadData = async () => {
      try {
        setLoading(true)
        setError('')

        const [matchesRes, clubsRes, leaguesRes, refereesRes] = await Promise.all([
          fetch('/api/matches?status=played', { cache: 'no-store' }),
          fetch('/api/clubs', { cache: 'no-store' }),
          fetch('/api/leagues', { cache: 'no-store' }),
          fetch('/api/referees', { cache: 'no-store' })
        ])

        if (!matchesRes.ok || !clubsRes.ok || !leaguesRes.ok || !refereesRes.ok) {
          throw new Error('Failed to load match results data')
        }

        const [matchesPayload, clubsPayload, leaguesPayload, refereesPayload] = await Promise.all([
          matchesRes.json().catch(() => []),
          clubsRes.json().catch(() => []),
          leaguesRes.json().catch(() => []),
          refereesRes.json().catch(() => [])
        ])

        if (!active) return

        setRawResults(Array.isArray(matchesPayload) ? matchesPayload : [])
        setClubs(Array.isArray(clubsPayload) ? clubsPayload : [])
        setLeagues(Array.isArray(leaguesPayload) ? leaguesPayload : [])
        setReferees(Array.isArray(refereesPayload) ? refereesPayload : [])
      } catch (e) {
        if (!active) return
        setError(e?.message || 'Unable to load past results')
        setRawResults([])
        setClubs([])
        setLeagues([])
        setReferees([])
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

  const refereeMap = useMemo(() => {
    const map = {}
    referees.forEach(referee => {
      map[referee.id] = referee.fullName || '-'
    })

    return map
  }, [referees])

  const currentClub = useMemo(() => resolveCurrentClub(clubs, user), [clubs, user])
  const currentClubId = currentClub?.id || null
  const currentClubName = currentClub?.clubName || currentClub?.name || 'your club'

  const data = useMemo(
    () => rawResults.map(match => ({
      id: match.id,
      homeClubId: match.homeClubId || null,
      awayClubId: match.awayClubId || null,
      homeTeam: clubMap[match.homeClubId] || '-',
      awayTeam: clubMap[match.awayClubId] || '-',
      homeScore: Number(match.homeScore ?? 0),
      awayScore: Number(match.awayScore ?? 0),
      date: match.matchDate || match.date || '',
      venue: match.venue || '-',
      leagueName: leagueMap[match.leagueId] || '-',
      referee: refereeMap[match?.referees?.mainReferee] || refereeMap[match?.refereeId] || '-',
      attendance: match.attendance,
      halfTimeScore: match.halfTimeScore || '',
      goals: Array.isArray(match.goals) ? match.goals : [],
      cards: Array.isArray(match.cards) ? match.cards : []
    })),
    [rawResults, clubMap, leagueMap, refereeMap]
  )

  const filteredByTab = useMemo(() => {
    const isMyClubMatch = match => {
      if (!currentClubId) return false
      return match.homeClubId === currentClubId || match.awayClubId === currentClubId
    }

    return tabValue === 0
      ? data.filter(isMyClubMatch)
      : data.filter(match => !isMyClubMatch(match))
  }, [data, tabValue, currentClubId])

  const resultCardsData = useMemo(() => getStatsForData(filteredByTab), [filteredByTab])

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
            <Typography variant='caption' color='text.secondary'>{row.original.venue} - {row.original.leagueName}</Typography>
          </Box>
        )
      }),
      columnHelper.accessor(row => `${row.homeScore}-${row.awayScore}`, {
        id: 'score',
        header: 'Score',
        cell: ({ row }) => {
          const match = row.original
          const isDraw = match.homeScore === match.awayScore
          const homeWon = match.homeScore > match.awayScore

          return (
            <Chip
              variant='tonal'
              size='small'
              label={`${match.homeScore} - ${match.awayScore}`}
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
    <>
      <div className='space-y-6'>
        <div>
          <Typography variant='h4' className='font-semibold mb-1'>
            Past Match Results
          </Typography>
          <Typography variant='body1' color='text.secondary'>
            View completed match results. Matches involving <strong>{currentClubName}</strong> are in My Club matches.
          </Typography>
        </div>

        {error && <Alert severity='error'>{error}</Alert>}

        <Tabs value={tabValue} onChange={(_, value) => setTabValue(value)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label='My Club matches' />
          <Tab label='Other team matches' />
        </Tabs>

        <div className='grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'>
          {resultCardsData.map((item, i) => (
            <HorizontalWithSubtitle key={i} {...item} />
          ))}
        </div>

        <Card>
          <CardHeader
            title='Results'
            action={
              <TextField
                size='small'
                placeholder='Search matches...'
                value={globalFilter ?? ''}
                onChange={e => setGlobalFilter(e.target.value)}
                sx={{ minWidth: { xs: 0, sm: 220 }, flex: { xs: '1 1 auto', sm: '0 0 auto' } }}
              />
            }
            sx={{
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'stretch', sm: 'center' },
              gap: 2,
              '& .MuiCardHeader-action': { margin: 0, alignSelf: { xs: 'stretch', sm: 'center' }, width: { xs: '100%', sm: 'auto' } }
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
                <Typography color='text.secondary' className='text-center py-8'>No results found</Typography>
              ) : (
                table.getRowModel().rows.map(row => {
                  const match = row.original
                  const isDraw = match.homeScore === match.awayScore
                  const homeWon = match.homeScore > match.awayScore

                  return (
                    <Card
                      key={match.id}
                      elevation={0}
                      variant='outlined'
                      sx={{ borderRadius: 2, transition: 'box-shadow 0.2s ease', '&:hover': { boxShadow: 1 } }}
                    >
                      <CardContent>
                        <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 1 }}>
                          {match.date} - {match.leagueName}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                          <Typography variant='body2' fontWeight={600} color='text.primary' sx={{ flex: '1 1 0', minWidth: 0 }}>
                            {match.homeTeam}
                          </Typography>
                          <Chip
                            variant='tonal'
                            size='small'
                            label={`${match.homeScore} - ${match.awayScore}`}
                            color={isDraw ? 'info' : homeWon ? 'success' : 'secondary'}
                            sx={{ fontWeight: 600, flexShrink: 0 }}
                          />
                          <Typography variant='body2' fontWeight={600} color='text.primary' sx={{ flex: '1 1 0', minWidth: 0, textAlign: 'right' }}>
                            {match.awayTeam}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                          <i className='ri-map-pin-line text-base text-textSecondary' />
                          <Typography variant='body2' color='text.secondary'>{match.venue}</Typography>
                        </Box>
                        <Button
                          size='small'
                          variant='outlined'
                          fullWidth
                          onClick={() => {
                            setSelectedMatch(match)
                            setDetailDrawerOpen(true)
                          }}
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
        onClose={() => {
          setDetailDrawerOpen(false)
          setSelectedMatch(null)
        }}
        match={selectedMatch}
      />
    </>
  )
}

export default ClubMatchPast
