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
import IconButton from '@mui/material/IconButton'
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
import OptionMenu from '@core/components/option-menu'
import HorizontalWithSubtitle from '@components/card-statistics/HorizontalWithSubtitle'
import AssignRefereesDrawer from '@views/federation/components/match/AssignRefereesDrawer'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

const columnHelper = createColumnHelper()

const MatchAssignReferees = () => {
  const [rawMatches, setRawMatches] = useState([])
  const [clubs, setClubs] = useState([])
  const [referees, setReferees] = useState([])
  const [loading, setLoading] = useState(true)
  const [globalFilter, setGlobalFilter] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedMatch, setSelectedMatch] = useState(null)
  const isMobile = useMediaQuery(theme => theme.breakpoints.down('md'))

  const fetchReferees = useCallback(async () => {
    try {
      const res = await fetch('/api/referees')
      const list = await res.json().catch(() => [])
      setReferees(Array.isArray(list) ? list : [])
    } catch {
      setReferees([])
    }
  }, [])

  const fetchMatches = useCallback(async () => {
    try {
      const res = await fetch('/api/matches?status=scheduled')
      const list = await res.json().catch(() => [])
      setRawMatches(Array.isArray(list) ? list : [])
    } catch {
      setRawMatches([])
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


  const clubMap = useMemo(() => {
    const m = {}
    clubs.forEach(c => { m[c.id] = c.clubName || c.name || '-' })
    return m
  }, [clubs])

  const getRefereeName = id => referees.find(r => r.id === id)?.fullName || '-'
  const getAssignment = m => (m.referees && typeof m.referees === 'object' ? m.referees : {}) || {}
  const isAssigned = m => !!getAssignment(m)?.mainReferee

  const [leagues, setLeagues] = useState([])

  const fetchLeagues = useCallback(async () => {
    try {
      const res = await fetch('/api/leagues')
      const list = await res.json().catch(() => [])
      setLeagues(Array.isArray(list) ? list : [])
    } catch {
      setLeagues([])
    }
  }, [])

  useEffect(() => {
    setLoading(true)
    Promise.all([fetchMatches(), fetchReferees(), fetchClubs(), fetchLeagues()]).finally(() => setLoading(false))
  }, [fetchMatches, fetchReferees, fetchClubs, fetchLeagues])

  const leagueMap = useMemo(() => {
    const m = {}
    leagues.forEach(l => { m[l.id] = l.name || '-' })
    return m
  }, [leagues])

  const dataWithAssignments = useMemo(() => rawMatches.map(m => {
    const a = getAssignment(m)
    return {
      ...m,
      homeTeamName: clubMap[m.homeClubId] || '-',
      awayTeamName: clubMap[m.awayClubId] || '-',
      leagueName: leagueMap[m.leagueId] || '-',
      date: m.matchDate || m.date || '',
      time: m.matchTime || m.time || '',
      mainRefereeName: getRefereeName(a.mainReferee),
      assistant1Name: getRefereeName(a.assistant1),
      assistant2Name: getRefereeName(a.assistant2),
      fourthOfficialName: getRefereeName(a.fourthOfficial),
      assigned: isAssigned(m)
    }
  }), [rawMatches, clubs, referees, clubMap, leagueMap])

  const assignCardsData = useMemo(() => {
    const total = rawMatches.length
    const assigned = rawMatches.filter(isAssigned).length
    const pending = total - assigned
    return [
      { title: 'Total Matches', value: String(total), avatarIcon: 'ri-calendar-line', avatarColor: 'primary', change: 'neutral', changeNumber: '', subTitle: 'Scheduled matches' },
      { title: 'Pending', value: String(pending), avatarIcon: 'ri-time-line', avatarColor: 'warning', change: 'neutral', changeNumber: '', subTitle: 'Awaiting referees' },
      { title: 'Assigned', value: String(assigned), avatarIcon: 'ri-checkbox-circle-line', avatarColor: 'success', change: 'neutral', changeNumber: '', subTitle: 'Referees assigned' }
    ]
  }, [rawMatches])

  const columns = useMemo(
    () => [
      columnHelper.accessor(row => `${row.homeTeamName} vs ${row.awayTeamName}`, {
        id: 'match',
        header: 'Match',
        cell: ({ row }) => (
          <Box>
            <Typography className='font-medium' color='text.primary'>
              {row.original.homeTeamName} vs {row.original.awayTeamName}
            </Typography>
            <Typography variant='caption' color='text.secondary'>{row.original.leagueName}</Typography>
          </Box>
        )
      }),
      columnHelper.accessor('date', {
        header: 'Date & Time',
        cell: ({ row }) => (
          <Typography variant='body2'>{row.original.date} {row.original.time}</Typography>
        )
      }),
      columnHelper.accessor('venue', {
        header: 'Venue',
        cell: ({ row }) => <Typography variant='body2'>{row.original.venue}</Typography>
      }),
      columnHelper.accessor('mainRefereeName', {
        header: 'Main Referee',
        cell: ({ row }) => <Typography variant='body2'>{row.original.mainRefereeName}</Typography>
      }),
      columnHelper.accessor('assistant1Name', {
        header: 'AR 1',
        cell: ({ row }) => <Typography variant='body2'>{row.original.assistant1Name}</Typography>
      }),
      columnHelper.accessor('assistant2Name', {
        header: 'AR 2',
        cell: ({ row }) => <Typography variant='body2'>{row.original.assistant2Name}</Typography>
      }),
      columnHelper.accessor('fourthOfficialName', {
        header: 'Fourth Official',
        cell: ({ row }) => <Typography variant='body2'>{row.original.fourthOfficialName}</Typography>
      }),
      columnHelper.accessor('assigned', {
        header: 'Status',
        cell: ({ row }) => (
          <Chip
            variant='tonal'
            size='small'
            label={row.original.assigned ? 'Assigned' : 'Pending'}
            color={row.original.assigned ? 'success' : 'warning'}
          />
        )
      }),
      columnHelper.accessor('action', {
        header: 'Actions',
        cell: ({ row }) => (
          <div className='flex items-center gap-1'>
            <IconButton
              size='small'
              onClick={() => {
                setSelectedMatch(row.original)
                setDrawerOpen(true)
              }}
            >
              <i className='ri-edit-box-line text-[22px] text-textSecondary' />
            </IconButton>
            <OptionMenu
              iconClassName='text-[22px] text-textSecondary'
              options={[
                {
                  text: row.original.assigned ? 'Edit Assignment' : 'Assign Referees',
                  icon: 'ri-user-add-line text-[22px]',
                  menuItemProps: {
                    className: 'flex items-center gap-2 text-textSecondary',
                    onClick: () => {
                      setSelectedMatch(row.original)
                      setDrawerOpen(true)
                    }
                  }
                }
              ]}
            />
          </div>
        ),
        enableSorting: false
      })
    ],
    []
  )

  const table = useReactTable({
    data: dataWithAssignments,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } }
  })

  const handleSaveAssignment = async formData => {
    if (!selectedMatch?.id) return
    try {
      const res = await fetch(`/api/matches/${selectedMatch.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referees: {
            mainReferee: formData.mainReferee,
            assistant1: formData.assistant1,
            assistant2: formData.assistant2,
            fourthOfficial: formData.fourthOfficial
          }
        })
      })
      if (res.ok) {
        setRawMatches(prev => prev.map(m => m.id === selectedMatch.id
          ? { ...m, referees: { mainReferee: formData.mainReferee, assistant1: formData.assistant1, assistant2: formData.assistant2, fourthOfficial: formData.fourthOfficial } }
          : m))
        setDrawerOpen(false)
        setSelectedMatch(null)
      }
    } catch {
      // ignore
    }
  }

  return (
    <>
      <div className='space-y-6'>
        <div>
          <Typography variant='h4' className='font-semibold mb-1'>
            Assign Referees to Matches
          </Typography>
          <Typography variant='body1' color='text.secondary'>
            Assign main referee, assistant referees, and fourth official to scheduled matches.
          </Typography>
        </div>

        <div className='grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'>
          {assignCardsData.map((item, i) => (
            <HorizontalWithSubtitle key={i} {...item} />
          ))}
        </div>

        <Card>
          <CardHeader
            title='Match Referee Assignments'
            action={
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { xs: 'stretch', sm: 'center' },
                  gap: 2,
                  width: { xs: '100%', sm: 'auto' },
                  minWidth: { xs: 0, sm: 200 }
                }}
              >
                <TextField
                  size='small'
                  placeholder='Search matches...'
                  value={globalFilter ?? ''}
                  onChange={e => setGlobalFilter(e.target.value)}
                  sx={{
                    minWidth: { xs: 0, sm: 200 },
                    flex: { xs: '1 1 auto', sm: '0 0 auto' }
                  }}
                />
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
          {isMobile ? (
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
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1, mb: 2 }}>
                          <Box>
                            <Typography variant='subtitle1' fontWeight={600} color='text.primary'>
                              {match.homeTeamName} vs {match.awayTeamName}
                            </Typography>
                            <Typography variant='caption' color='text.secondary'>
                              {match.leagueName} • {match.date} {match.time}
                            </Typography>
                          </Box>
                          <Chip
                            label={match.assigned ? 'Assigned' : 'Pending'}
                            color={match.assigned ? 'success' : 'warning'}
                            size='small'
                            variant='tonal'
                          />
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <i className='ri-map-pin-line text-base text-textSecondary' />
                            <Typography variant='body2' color='text.secondary'>{match.venue}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <i className='ri-user-star-line text-base text-textSecondary' />
                            <Typography variant='body2' color='text.secondary'>Main: {match.mainRefereeName}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <i className='ri-team-line text-base text-textSecondary' />
                            <Typography variant='body2' color='text.secondary'>AR1: {match.assistant1Name} • AR2: {match.assistant2Name} • 4th: {match.fourthOfficialName}</Typography>
                          </Box>
                        </Box>
                        <Divider sx={{ my: 2 }} />
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                          <Button
                            size='small'
                            variant='outlined'
                            startIcon={<i className='ri-user-add-line' />}
                            onClick={() => { setSelectedMatch(match); setDrawerOpen(true) }}
                          >
                            {match.assigned ? 'Edit' : 'Assign'} Referees
                          </Button>
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

      <AssignRefereesDrawer
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setSelectedMatch(null) }}
        referees={referees}
        match={selectedMatch}
        onSave={handleSaveAssignment}
      />
    </>
  )
}

export default MatchAssignReferees
