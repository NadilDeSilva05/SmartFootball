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
import IconButton from '@mui/material/IconButton'
import TablePagination from '@mui/material/TablePagination'
import useMediaQuery from '@mui/material/useMediaQuery'
import CircularProgress from '@mui/material/CircularProgress'

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
import ConfirmationDialog from '@components/dialogs/confirmation-dialog'
import AddMatchDrawer from '@views/federation/components/match/AddMatchDrawer'
import EditMatchDrawer from '@views/federation/components/match/EditMatchDrawer'
import { notifyError, notifySuccess } from '@/utils/toast'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

const columnHelper = createColumnHelper()

const MatchSchedule = () => {
  const [rawMatches, setRawMatches] = useState([])
  const [clubs, setClubs] = useState([])
  const [leagues, setLeagues] = useState([])
  const [loading, setLoading] = useState(true)
  const [globalFilter, setGlobalFilter] = useState('')

  const fetchMatches = useCallback(async () => {
    try {
      const res = await fetch('/api/matches', { cache: 'no-store' })
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
    Promise.all([fetchMatches(), fetchClubs(), fetchLeagues()]).finally(() => setLoading(false))
  }, [fetchMatches, fetchClubs, fetchLeagues])

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

  const data = useMemo(() => rawMatches.map(m => ({
    ...m,
    homeTeamName: clubMap[m.homeClubId] || '-',
    awayTeamName: clubMap[m.awayClubId] || '-',
    leagueName: leagueMap[m.leagueId] || '-',
    date: m.matchDate || m.date || '',
    time: m.matchTime || m.time || ''
  })), [rawMatches, clubMap, leagueMap])

  const matchCardsData = useMemo(() => {
    const scheduled = rawMatches.filter(m => m.status === 'scheduled').length
    const played = rawMatches.filter(m => m.status === 'played').length
    const today = new Date().toISOString().slice(0, 10)
    const todayCount = rawMatches.filter(m => (m.matchDate || m.date) === today).length
    const total = rawMatches.length
    return [
      { title: 'Scheduled', value: String(scheduled), avatarIcon: 'ri-calendar-check-line', avatarColor: 'primary', change: 'neutral', changeNumber: '', subTitle: 'Upcoming matches' },
      { title: 'Today', value: String(todayCount), avatarIcon: 'ri-calendar-today-line', avatarColor: 'success', change: 'neutral', changeNumber: '', subTitle: 'Matches today' },
      { title: 'Total', value: String(total), avatarIcon: 'ri-calendar-week-line', avatarColor: 'info', change: 'neutral', changeNumber: '', subTitle: 'All matches' },
      { title: 'Completed', value: String(played), avatarIcon: 'ri-check-double-line', avatarColor: 'secondary', change: 'neutral', changeNumber: '', subTitle: 'Played' }
    ]
  }, [rawMatches])
  const [addDrawerOpen, setAddDrawerOpen] = useState(false)
  const [editDrawerOpen, setEditDrawerOpen] = useState(false)
  const [selectedMatch, setSelectedMatch] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [matchToDelete, setMatchToDelete] = useState(null)
  const isMobile = useMediaQuery(theme => theme.breakpoints.down('md'))

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
      }),
      columnHelper.accessor('action', {
        header: 'Actions',
        cell: ({ row }) => (
          <div className='flex items-center gap-1'>
            <IconButton
              size='small'
              onClick={() => {
                setSelectedMatch(row.original)
                setEditDrawerOpen(true)
              }}
            >
              <i className='ri-edit-box-line text-[22px] text-textSecondary' />
            </IconButton>
            <OptionMenu
              iconClassName='text-[22px] text-textSecondary'
              options={[
                {
                  text: 'Edit',
                  icon: 'ri-edit-box-line text-[22px]',
                  menuItemProps: {
                    className: 'flex items-center gap-2 text-textSecondary',
                    onClick: () => {
                      setSelectedMatch(row.original)
                      setEditDrawerOpen(true)
                    }
                  }
                },
                {
                  text: 'Delete',
                  icon: 'ri-delete-bin-7-line text-[22px]',
                  menuItemProps: {
                    className: 'flex items-center gap-2 text-error',
                    onClick: () => {
                      setMatchToDelete(row.original)
                      setDeleteDialogOpen(true)
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

  const handleDeleteConfirm = async () => {
    if (!matchToDelete?.id) {
      setDeleteDialogOpen(false)
      setMatchToDelete(null)
      return
    }
    try {
      const res = await fetch(`/api/matches/${matchToDelete.id}`, { method: 'DELETE' })
      if (res.ok) {
        setRawMatches(prev => prev.filter(m => m.id !== matchToDelete.id))
        notifySuccess('Match deleted successfully.')
        setDeleteDialogOpen(false)
        setMatchToDelete(null)
      } else {
        const payload = await res.json().catch(() => ({}))
        throw new Error(payload?.error || 'Failed to delete match')
      }
    } catch (error) {
      notifyError(error, 'Failed to delete match')
    }
    setDeleteDialogOpen(false)
    setMatchToDelete(null)
  }

  return (
    <>
      <div className='space-y-6'>
        <div>
          <Typography variant='h4' className='font-semibold mb-1'>
            Schedule Matches
          </Typography>
          <Typography variant='body1' color='text.secondary'>
            Create and manage match schedules in the federation.
          </Typography>
        </div>

        <div className='grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'>
          {matchCardsData.map((item, i) => (
            <HorizontalWithSubtitle key={i} {...item} />
          ))}
        </div>

        <Card>
          <CardHeader
            title='Matches'
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
                <Button
                  variant='contained'
                  startIcon={<i className='ri-add-line' />}
                  onClick={() => setAddDrawerOpen(true)}
                  sx={{ flexShrink: 0 }}
                >
                  Schedule Match
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
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
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
                        <Divider sx={{ my: 2 }} />
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                          <Button
                            size='small'
                            variant='outlined'
                            startIcon={<i className='ri-edit-box-line' />}
                            onClick={() => { setSelectedMatch(match); setEditDrawerOpen(true) }}
                          >
                            Edit
                          </Button>
                          <Button
                            size='small'
                            variant='outlined'
                            color='error'
                            startIcon={<i className='ri-delete-bin-7-line' />}
                            onClick={() => { setMatchToDelete(match); setDeleteDialogOpen(true) }}
                          >
                            Delete
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
                  {!loading && table.getFilteredRowModel().rows.length === 0 ? (
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

      <AddMatchDrawer open={addDrawerOpen} onClose={() => setAddDrawerOpen(false)} onSuccess={fetchMatches} leagues={leagues} clubs={clubs} />
      <EditMatchDrawer open={editDrawerOpen} onClose={() => { setEditDrawerOpen(false); setSelectedMatch(null) }} match={selectedMatch} onSuccess={fetchMatches} leagues={leagues} clubs={clubs} />

      <ConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => { setDeleteDialogOpen(false); setMatchToDelete(null) }}
        onConfirm={handleDeleteConfirm}
        title='Delete Match'
        content={matchToDelete ? `Are you sure you want to delete "${matchToDelete.homeTeamName} vs ${matchToDelete.awayTeamName}"? This action cannot be undone.` : ''}
        confirmText='Delete'
        cancelText='Cancel'
        confirmColor='error'
      />
    </>
  )
}

export default MatchSchedule
