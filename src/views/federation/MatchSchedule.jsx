'use client'

// React Imports
import { useState, useMemo } from 'react'

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
import { LEAGUES_OPTIONS, TEAMS_OPTIONS } from '@views/federation/constants'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

const MATCHES_DATA = [
  { id: '1', leagueId: '1', leagueName: 'Premier League', homeTeamId: 'city-fc', homeTeamName: 'City FC', awayTeamId: 'united-sc', awayTeamName: 'United SC', venue: 'National Stadium', date: '2025-02-15', time: '15:00' },
  { id: '2', leagueId: '1', leagueName: 'Premier League', homeTeamId: 'rovers-fc', homeTeamName: 'Rovers FC', awayTeamId: 'athletic-club', awayTeamName: 'Athletic Club', venue: 'City Arena', date: '2025-02-16', time: '17:00' },
  { id: '3', leagueId: '2', leagueName: 'Division One', homeTeamId: 'stars-fc', homeTeamName: 'Stars FC', awayTeamId: 'dynamo-fc', awayTeamName: 'Dynamo FC', venue: 'Regional Ground', date: '2025-02-18', time: '14:00' }
]

const MatchCardsData = [
  { title: 'Scheduled', value: '24', avatarIcon: 'ri-calendar-check-line', avatarColor: 'primary', change: 'positive', changeNumber: '5', subTitle: 'Upcoming matches' },
  { title: 'Today', value: '3', avatarIcon: 'ri-calendar-today-line', avatarColor: 'success', change: 'neutral', changeNumber: '0', subTitle: 'Matches today' },
  { title: 'This Week', value: '12', avatarIcon: 'ri-calendar-week-line', avatarColor: 'info', change: 'positive', changeNumber: '2', subTitle: 'Next 7 days' },
  { title: 'Completed', value: '48', avatarIcon: 'ri-check-double-line', avatarColor: 'secondary', change: 'positive', changeNumber: '8%', subTitle: 'Season total' }
]

const columnHelper = createColumnHelper()

const MatchSchedule = () => {
  const [data] = useState(MATCHES_DATA)
  const [globalFilter, setGlobalFilter] = useState('')
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

  const handleDeleteConfirm = () => {
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
          {MatchCardsData.map((item, i) => (
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

      <AddMatchDrawer open={addDrawerOpen} onClose={() => setAddDrawerOpen(false)} />
      <EditMatchDrawer open={editDrawerOpen} onClose={() => { setEditDrawerOpen(false); setSelectedMatch(null) }} match={selectedMatch} />

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
