'use client'

// React Imports
import { useState, useMemo, useEffect, useCallback } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
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
import StandingsModal from '@views/federation/components/league/StandingsModal'
import AddLeagueDrawer from '@views/federation/components/league/AddLeagueDrawer'
import EditLeagueDrawer from '@views/federation/components/league/EditLeagueDrawer'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

const columnHelper = createColumnHelper()

const LeagueList = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [globalFilter, setGlobalFilter] = useState('')
  const [addDrawerOpen, setAddDrawerOpen] = useState(false)
  const [editDrawerOpen, setEditDrawerOpen] = useState(false)
  const [selectedLeague, setSelectedLeague] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [leagueToDelete, setLeagueToDelete] = useState(null)
  const [standingsModalOpen, setStandingsModalOpen] = useState(false)
  const [leagueForStandings, setLeagueForStandings] = useState(null)
  const isMobile = useMediaQuery(theme => theme.breakpoints.down('md'))

  const fetchLeagues = useCallback(async () => {
    try {
      const res = await fetch('/api/leagues')
      const list = await res.json().catch(() => [])
      setData(Array.isArray(list) ? list : [])
    } catch {
      setData([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLeagues()
  }, [fetchLeagues])

  const leagueCardsData = useMemo(() => {
    const total = data.length
    const active = data.filter(l => l.status === 'active').length
    const upcoming = data.filter(l => l.status === 'upcoming').length
    const completed = data.filter(l => l.status === 'completed').length
    return [
      { title: 'Total Leagues', value: String(total), avatarIcon: 'ri-trophy-line', avatarColor: 'primary', change: 'neutral', changeNumber: '', subTitle: 'All leagues' },
      { title: 'Active', value: String(active), avatarIcon: 'ri-checkbox-circle-line', avatarColor: 'success', change: 'neutral', changeNumber: '', subTitle: 'Current season' },
      { title: 'Upcoming', value: String(upcoming), avatarIcon: 'ri-calendar-line', avatarColor: 'info', change: 'neutral', changeNumber: '', subTitle: 'Scheduled' },
      { title: 'Completed', value: String(completed), avatarIcon: 'ri-archive-line', avatarColor: 'secondary', change: 'neutral', changeNumber: '', subTitle: 'Past seasons' }
    ]
  }, [data])

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: 'League Name',
        cell: ({ row }) => (
          <Typography className='font-medium' color='text.primary'>
            {row.original.name}
          </Typography>
        )
      }),
      columnHelper.accessor('season', {
        header: 'Season',
        cell: ({ row }) => <Typography>{row.original.season}</Typography>
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: ({ row }) => (
          <Chip
            variant='tonal'
            className='capitalize'
            label={row.original.status}
            color={
              row.original.status === 'active'
                ? 'success'
                : row.original.status === 'upcoming'
                  ? 'info'
                  : 'secondary'
            }
            size='small'
          />
        )
      }),
      columnHelper.accessor('action', {
        header: 'Actions',
        cell: ({ row }) => (
          <div className='flex items-center gap-1'>
            <Button
              size='small'
              variant='outlined'
              startIcon={<i className='ri-bar-chart-box-line text-[18px]' />}
              onClick={() => {
                setLeagueForStandings(row.original)
                setStandingsModalOpen(true)
              }}
              sx={{ mr: 0.5 }}
            >
              View standings
            </Button>
            <IconButton
              size='small'
              onClick={() => {
                setSelectedLeague(row.original)
                setEditDrawerOpen(true)
              }}
            >
              <i className='ri-edit-box-line text-[22px] text-textSecondary' />
            </IconButton>
            <OptionMenu
              iconClassName='text-[22px] text-textSecondary'
              options={[
                {
                  text: 'View standings',
                  icon: 'ri-bar-chart-box-line text-[22px]',
                  menuItemProps: {
                    className: 'flex items-center gap-2 text-textSecondary',
                    onClick: () => {
                      setLeagueForStandings(row.original)
                      setStandingsModalOpen(true)
                    }
                  }
                },
                {
                  text: 'Edit',
                  icon: 'ri-edit-box-line text-[22px]',
                  menuItemProps: {
                    className: 'flex items-center gap-2 text-textSecondary',
                    onClick: () => {
                      setSelectedLeague(row.original)
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
                      setLeagueToDelete(row.original)
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
    if (!leagueToDelete?.id) {
      setDeleteDialogOpen(false)
      setLeagueToDelete(null)
      return
    }
    try {
      const res = await fetch(`/api/leagues/${leagueToDelete.id}`, { method: 'DELETE' })
      if (res.ok) {
        setData(prev => prev.filter(l => l.id !== leagueToDelete.id))
        setDeleteDialogOpen(false)
        setLeagueToDelete(null)
      }
    } catch {
      // ignore
    } finally {
      setDeleteDialogOpen(false)
      setLeagueToDelete(null)
    }
  }

  return (
    <>
      <div className='space-y-6'>
        <div>
          <Typography variant='h4' className='font-semibold mb-1'>
            League Management
          </Typography>
          <Typography variant='body1' color='text.secondary'>
            Add, edit, and manage leagues in the federation.
          </Typography>
        </div>

        <div className='grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'>
          {leagueCardsData.map((item, i) => (
            <HorizontalWithSubtitle key={i} {...item} />
          ))}
        </div>

        <Card>
          <CardHeader
            title='Leagues List'
            action={
              <div className='flex items-center gap-4 flex-wrap'>
                <TextField
                  size='small'
                  placeholder='Search leagues...'
                  value={globalFilter ?? ''}
                  onChange={e => setGlobalFilter(e.target.value)}
                  className='is-full sm:is-auto min-is-[200px]'
                />
                <Button variant='contained' startIcon={<i className='ri-add-line' />} onClick={() => setAddDrawerOpen(true)}>
                  Add League
                </Button>
              </div>
            }
          />
          <Divider />
          {loading ? (
            <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
              <CircularProgress size={24} />
            </Box>
          ) : isMobile ? (
            <div className='p-4 flex flex-col gap-4'>
              {table.getFilteredRowModel().rows.length === 0 ? (
                <Typography color='text.secondary' className='text-center py-8'>
                  No leagues found
                </Typography>
              ) : (
                table.getRowModel().rows.map(row => {
                  const league = row.original
                  const statusColor =
                    league.status === 'active' ? 'success' : league.status === 'upcoming' ? 'info' : 'secondary'

                  return (
                    <Card key={league.id} elevation={0} variant='outlined' sx={{ borderRadius: 2, '&:hover': { boxShadow: 1 } }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1, mb: 2 }}>
                          <Box>
                            <Typography variant='subtitle1' fontWeight={600} color='text.primary'>
                              {league.name}
                            </Typography>
                            <Typography variant='caption' color='text.secondary'>
                              Season {league.season || '-'}
                            </Typography>
                          </Box>
                          <Chip label={league.status} color={statusColor} size='small' variant='tonal' className='capitalize' />
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                          <Button
                            size='small'
                            variant='outlined'
                            startIcon={<i className='ri-bar-chart-box-line' />}
                            onClick={() => {
                              setLeagueForStandings(league)
                              setStandingsModalOpen(true)
                            }}
                          >
                            Standings
                          </Button>
                          <Button
                            size='small'
                            variant='outlined'
                            startIcon={<i className='ri-edit-box-line' />}
                            onClick={() => {
                              setSelectedLeague(league)
                              setEditDrawerOpen(true)
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            size='small'
                            variant='outlined'
                            color='error'
                            startIcon={<i className='ri-delete-bin-7-line' />}
                            onClick={() => {
                              setLeagueToDelete(league)
                              setDeleteDialogOpen(true)
                            }}
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
                        No leagues found
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

      <AddLeagueDrawer open={addDrawerOpen} onClose={() => setAddDrawerOpen(false)} onSuccess={fetchLeagues} />
      <EditLeagueDrawer
        open={editDrawerOpen}
        onClose={() => {
          setEditDrawerOpen(false)
          setSelectedLeague(null)
        }}
        league={selectedLeague}
        onSuccess={fetchLeagues}
      />

      <StandingsModal
        open={standingsModalOpen}
        onClose={() => {
          setStandingsModalOpen(false)
          setLeagueForStandings(null)
        }}
        league={leagueForStandings}
      />

      <ConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false)
          setLeagueToDelete(null)
        }}
        onConfirm={handleDeleteConfirm}
        title='Delete League'
        content={
          leagueToDelete
            ? `Are you sure you want to delete "${leagueToDelete.name}"? This action cannot be undone.`
            : ''
        }
        confirmText='Delete'
        cancelText='Cancel'
        confirmColor='error'
      />
    </>
  )
}

export default LeagueList
