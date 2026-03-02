'use client'

// React Imports
import { useState, useMemo, useEffect, useCallback } from 'react'

// MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import TablePagination from '@mui/material/TablePagination'
import useMediaQuery from '@mui/material/useMediaQuery'
import Alert from '@mui/material/Alert'
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
import AddClubDrawer from '@views/federation/components/club/AddClubDrawer'
import EditClubDrawer from '@views/federation/components/club/EditClubDrawer'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

const columnHelper = createColumnHelper()

const ClubList = () => {
  const [clubs, setClubs] = useState([])
  const [leagues, setLeagues] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [globalFilter, setGlobalFilter] = useState('')
  const [addDrawerOpen, setAddDrawerOpen] = useState(false)
  const [editDrawerOpen, setEditDrawerOpen] = useState(false)
  const [selectedClub, setSelectedClub] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [clubToDelete, setClubToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const isMobile = useMediaQuery(theme => theme.breakpoints.down('md'))

  const fetchClubs = useCallback(async () => {
    try {
      const res = await fetch('/api/clubs')
      if (!res.ok) throw new Error('Failed to fetch clubs')
      const data = await res.json()
      setClubs(data)
    } catch (e) {
      setError(e.message)
      setClubs([])
    }
  }, [])

  const fetchLeagues = useCallback(async () => {
    try {
      const res = await fetch('/api/leagues')
      if (!res.ok) return
      const data = await res.json()
      setLeagues(data)
    } catch {
      setLeagues([])
    }
  }, [])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      await Promise.all([fetchClubs(), fetchLeagues()])
      setLoading(false)
    }
    load()
  }, [fetchClubs, fetchLeagues])

  useEffect(() => {
    if (addDrawerOpen) fetchLeagues()
  }, [addDrawerOpen, fetchLeagues])

  const leagueMap = useMemo(() => {
    const m = {}
    leagues.forEach(l => { m[l.id] = l.name })
    return m
  }, [leagues])

  const data = useMemo(() => clubs.map(c => ({
    ...c,
    name: c.clubName,
    leagueName: leagueMap[c.league] || c.league || '-'
  })), [clubs, leagueMap])

  const totalClubs = clubs.length
  const activeCount = clubs.filter(c => c.status === 'active').length
  const pendingCount = clubs.filter(c => c.status === 'pending').length
  const inactiveCount = clubs.filter(c => c.status === 'inactive').length

  const clubCardsData = [
    { title: 'Total Clubs', value: String(totalClubs), avatarIcon: 'ri-building-line', avatarColor: 'primary', change: 'positive', changeNumber: '0', subTitle: 'Registered clubs' },
    { title: 'Active', value: String(activeCount), avatarIcon: 'ri-checkbox-circle-line', avatarColor: 'success', change: 'positive', changeNumber: '0', subTitle: 'Active clubs' },
    { title: 'Pending', value: String(pendingCount), avatarIcon: 'ri-time-line', avatarColor: 'warning', change: 'positive', changeNumber: '0', subTitle: 'Pending approval' },
    { title: 'Inactive', value: String(inactiveCount), avatarIcon: 'ri-close-circle-line', avatarColor: 'error', change: 'negative', changeNumber: '0', subTitle: 'Inactive clubs' }
  ]

  const columns = useMemo(
    () => [
      columnHelper.accessor('logo', {
        header: 'Logo',
        cell: ({ row }) => {
          const logo = row.original.logo
          return logo && typeof logo === 'string' ? (
            <Box
              component='img'
              src={logo}
              alt={row.original.clubName || 'Club logo'}
              sx={{ width: 40, height: 40, borderRadius: 1, objectFit: 'contain', border: '1px solid', borderColor: 'divider', bgcolor: 'action.hover' }}
            />
          ) : (
            <Box sx={{ width: 40, height: 40, borderRadius: 1, bgcolor: 'action.hover', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className='ri-building-line text-xl text-textSecondary' />
            </Box>
          )
        }
      }),
      columnHelper.accessor('clubId', {
        header: 'Club ID',
        cell: ({ row }) => <Typography variant='body2'>{row.original.clubId || '-'}</Typography>
      }),
      columnHelper.accessor('name', {
        header: 'Club Name',
        cell: ({ row }) => (
          <Typography className='font-medium' color='text.primary'>
            {row.original.clubName || row.original.name}
          </Typography>
        )
      }),
      columnHelper.accessor('city', {
        header: 'City',
        cell: ({ row }) => <Typography variant='body2'>{row.original.city || '-'}</Typography>
      }),
      columnHelper.accessor('leagueName', {
        header: 'League',
        cell: ({ row }) => <Typography variant='body2'>{row.original.leagueName || '-'}</Typography>
      }),
      columnHelper.accessor('adminFullName', {
        header: 'Admin Name',
        cell: ({ row }) => <Typography variant='body2'>{row.original.adminFullName || '-'}</Typography>
      }),
      columnHelper.accessor('adminEmail', {
        header: 'Admin Email',
        cell: ({ row }) => <Typography variant='body2'>{row.original.adminEmail || '-'}</Typography>
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: ({ row }) => (
          <Chip
            variant='tonal'
            className='capitalize'
            label={row.original.status || 'active'}
            color={row.original.status === 'active' ? 'success' : row.original.status === 'pending' ? 'warning' : 'secondary'}
            size='small'
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
                setSelectedClub(row.original)
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
                      setSelectedClub(row.original)
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
                      setClubToDelete(row.original)
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
    if (!clubToDelete?.id) {
      setDeleteDialogOpen(false)
      setClubToDelete(null)
      return
    }
    setDeleting(true)
    try {
      const res = await fetch(`/api/clubs/${clubToDelete.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      await fetchClubs()
      setDeleteDialogOpen(false)
      setClubToDelete(null)
    } catch (e) {
      setError(e.message)
    } finally {
      setDeleting(false)
    }
  }

  const handleAddSuccess = () => {
    setAddDrawerOpen(false)
    fetchClubs()
  }

  const handleEditSuccess = () => {
    setEditDrawerOpen(false)
    setSelectedClub(null)
    fetchClubs()
  }

  return (
    <>
      <div className='space-y-6'>
        <div>
          <Typography variant='h4' className='font-semibold mb-1'>
            Club Admin Management
          </Typography>
          <Typography variant='body1' color='text.secondary'>
            Add, edit, and manage clubs in the federation.
          </Typography>
        </div>

        {error && (
          <Alert severity='error' onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <div className='grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'>
          {clubCardsData.map((item, i) => (
            <HorizontalWithSubtitle key={i} {...item} />
          ))}
        </div>

        <Card>
          <CardHeader
            title='Clubs List'
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
                  placeholder='Search clubs...'
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
                  Add Club
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
                <Typography color='text.secondary' className='text-center py-8'>No clubs found</Typography>
              ) : (
                table.getRowModel().rows.map(row => {
                  const club = row.original
                  const statusColor = club.status === 'active' ? 'success' : club.status === 'pending' ? 'warning' : 'secondary'

                  return (
                    <Card
                      key={club.id}
                      elevation={0}
                      variant='outlined'
                      sx={{
                        borderRadius: 2,
                        transition: 'box-shadow 0.2s ease',
                        '&:hover': { boxShadow: 1 }
                      }}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                          {club.logo && typeof club.logo === 'string' ? (
                            <Box
                              component='img'
                              src={club.logo}
                              alt={club.clubName || 'Club logo'}
                              sx={{ width: 48, height: 48, borderRadius: 1, objectFit: 'contain', border: '1px solid', borderColor: 'divider', bgcolor: 'action.hover', flexShrink: 0 }}
                            />
                          ) : (
                            <Box sx={{ width: 48, height: 48, borderRadius: 1, bgcolor: 'action.hover', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <i className='ri-building-line text-2xl text-textSecondary' />
                            </Box>
                          )}
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
                              <Typography variant='subtitle1' fontWeight={600} color='text.primary'>
                                {club.clubName || club.name}
                              </Typography>
                              <Chip label={club.status || 'active'} color={statusColor} size='small' variant='tonal' sx={{ textTransform: 'capitalize' }} />
                            </Box>
                            <Typography variant='caption' color='text.secondary'>
                              {club.clubId} • {club.leagueName}
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <i className='ri-map-pin-line text-base text-textSecondary' />
                            <Typography variant='body2' color='text.secondary'>{club.city || '-'}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <i className='ri-user-line text-base text-textSecondary' />
                            <Typography variant='body2' color='text.secondary'>{club.adminFullName || '-'}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <i className='ri-mail-line text-base text-textSecondary' />
                            <Typography variant='body2' color='text.secondary' component='a' href={`mailto:${club.adminEmail}`} sx={{ color: 'text.secondary', textDecoration: 'none' }}>
                              {club.adminEmail || '-'}
                            </Typography>
                          </Box>
                        </Box>
                        <Divider sx={{ my: 2 }} />
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                          <Button
                            size='small'
                            variant='outlined'
                            startIcon={<i className='ri-edit-box-line' />}
                            onClick={() => { setSelectedClub(club); setEditDrawerOpen(true) }}
                          >
                            Edit
                          </Button>
                          <Button
                            size='small'
                            variant='outlined'
                            color='error'
                            startIcon={<i className='ri-delete-bin-7-line' />}
                            onClick={() => { setClubToDelete(club); setDeleteDialogOpen(true) }}
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
                      <td colSpan={8} className='text-center'>
                        No clubs found
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
          {!loading && (
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component='div'
              count={table.getFilteredRowModel().rows.length}
              rowsPerPage={table.getState().pagination.pageSize}
              page={table.getState().pagination.pageIndex}
              onPageChange={(_, page) => table.setPageIndex(page)}
              onRowsPerPageChange={e => table.setPageSize(Number(e.target.value))}
            />
          )}
        </Card>
      </div>

      <AddClubDrawer
        open={addDrawerOpen}
        onClose={() => setAddDrawerOpen(false)}
        onSuccess={handleAddSuccess}
        leagues={leagues}
      />
      <EditClubDrawer
        open={editDrawerOpen}
        onClose={() => { setEditDrawerOpen(false); setSelectedClub(null) }}
        club={selectedClub}
        onSuccess={handleEditSuccess}
      />

      <ConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => { setDeleteDialogOpen(false); setClubToDelete(null) }}
        onConfirm={handleDeleteConfirm}
        title='Delete Club'
        content={clubToDelete ? `Are you sure you want to delete "${clubToDelete.clubName || clubToDelete.name}"? This action cannot be undone.` : ''}
        confirmText='Delete'
        cancelText='Cancel'
        confirmColor='error'
        confirmDisabled={deleting}
      />
    </>
  )
}

export default ClubList
