'use client'

// React Imports
import { useState, useMemo, useEffect } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import TablePagination from '@mui/material/TablePagination'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
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
import AddCoachDrawer from '@views/club/components/coach/AddCoachDrawer'
import EditCoachDrawer from '@views/club/components/coach/EditCoachDrawer'

// Style Imports
import tableStyles from '@core/styles/table.module.css'
import { ROLE_OPTIONS } from '@views/club/constants'

const COACHES_DATA = [
  { id: '1', coachId: 'CH-001', fullName: 'James Wilson', role: 'head_coach', license: 'A', nicOrPassport: '198512345678', dateOfBirth: '1985-03-20', status: 'approved' },
  { id: '2', coachId: 'CH-002', fullName: 'Anna Lopez', role: 'analyst', license: null, nicOrPassport: '199012345679', dateOfBirth: '1990-07-15', status: 'approved' },
  { id: '3', coachId: 'CH-003', fullName: 'Michael Brown', role: 'assistant_coach', license: 'C', nicOrPassport: 'PASS-123456', dateOfBirth: '1988-11-08', status: 'pending' }
]

const CoachCardsData = [
  { title: 'Total Coaches', value: '8', avatarIcon: 'ri-user-star-line', avatarColor: 'primary', change: 'positive', changeNumber: '2%', subTitle: 'Staff' },
  { title: 'Approved', value: '6', avatarIcon: 'ri-checkbox-circle-line', avatarColor: 'success', change: 'positive', changeNumber: '1%', subTitle: 'Federation approved' },
  { title: 'Pending', value: '2', avatarIcon: 'ri-time-line', avatarColor: 'warning', change: 'negative', changeNumber: '0%', subTitle: 'Awaiting approval' }
]

const columnHelper = createColumnHelper()

const ClubCoachList = () => {
  const [data] = useState(COACHES_DATA)
  const [globalFilter, setGlobalFilter] = useState('')
  const [addDrawerOpen, setAddDrawerOpen] = useState(false)
  const [editDrawerOpen, setEditDrawerOpen] = useState(false)
  const [selectedCoach, setSelectedCoach] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [coachToDelete, setCoachToDelete] = useState(null)
  const [requestSent, setRequestSent] = useState(false)
  const isMobile = useMediaQuery(theme => theme.breakpoints.down('md'))

  const columns = useMemo(
    () => [
      columnHelper.accessor('coachId', { header: 'Coach Id', cell: ({ row }) => <Typography variant='body2'>{row.original.coachId}</Typography> }),
      columnHelper.accessor('fullName', {
        header: 'Full Name',
        cell: ({ row }) => (
          <Typography className='font-medium' color='text.primary'>
            {row.original.fullName}
          </Typography>
        )
      }),
      columnHelper.accessor('role', {
        header: 'Role',
        cell: ({ row }) => (
          <Typography variant='body2'>{ROLE_OPTIONS.find(o => o.value === row.original.role)?.label ?? row.original.role}</Typography>
        )
      }),
      columnHelper.accessor('license', {
        header: 'License',
        cell: ({ row }) => {
          const c = row.original
          if (c.role === 'analyst') return <Typography variant='body2' color='text.secondary'>–</Typography>
          return <Chip variant='tonal' size='small' label={LICENSE_OPTIONS.find(o => o.value === c.license)?.label ?? c.license ?? '–'} color='primary' />
        }
      }),
      columnHelper.accessor('nicOrPassport', { header: 'NIC / Passport', cell: ({ row }) => <Typography variant='body2'>{row.original.nicOrPassport}</Typography> }),
      columnHelper.accessor('dateOfBirth', { header: 'DOB', cell: ({ row }) => <Typography variant='body2'>{row.original.dateOfBirth}</Typography> }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: ({ row }) => (
          <Chip variant='tonal' size='small' label={row.original.status} color={row.original.status === 'approved' ? 'success' : 'warning'} />
        )
      }),
      columnHelper.accessor('action', {
        header: 'Actions',
        cell: ({ row }) => (
          <div className='flex items-center gap-1'>
            <IconButton size='small' onClick={() => { setSelectedCoach(row.original); setEditDrawerOpen(true) }}>
              <i className='ri-edit-box-line text-[22px] text-textSecondary' />
            </IconButton>
            <OptionMenu
              iconClassName='text-[22px] text-textSecondary'
              options={[
                {
                  text: 'Edit',
                  icon: 'ri-edit-box-line text-[22px]',
                  menuItemProps: { className: 'flex items-center gap-2 text-textSecondary', onClick: () => { setSelectedCoach(row.original); setEditDrawerOpen(true) } }
                },
                {
                  text: 'Delete',
                  icon: 'ri-delete-bin-7-line text-[22px]',
                  menuItemProps: { className: 'flex items-center gap-2 text-error', onClick: () => { setCoachToDelete(row.original); setDeleteDialogOpen(true) } }
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

  return (
    <>
      <div className='space-y-6'>
        <div>
          <Typography variant='h4' className='font-semibold mb-1'>
            Coach Management
          </Typography>
          <Typography variant='body1' color='text.secondary'>
            Add, edit, and manage coaches. New coaches are sent to federation admin for approval.
          </Typography>
        </div>

        {requestSent && (
          <Alert severity='success' onClose={() => setRequestSent(false)}>
            Coach registration request sent to federation admin. You will be notified once reviewed.
          </Alert>
        )}

        <div className='grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'>
          {CoachCardsData.map((item, i) => (
            <HorizontalWithSubtitle key={i} {...item} />
          ))}
        </div>

        <Card>
          <CardHeader
            title='Coaches'
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
                  placeholder='Search coaches...'
                  value={globalFilter ?? ''}
                  onChange={e => setGlobalFilter(e.target.value)}
                  sx={{ minWidth: { xs: 0, sm: 200 }, flex: { xs: '1 1 auto', sm: '0 0 auto' } }}
                />
                <Button variant='contained' startIcon={<i className='ri-add-line' />} onClick={() => setAddDrawerOpen(true)} sx={{ flexShrink: 0 }}>
                  Add Coach
                </Button>
              </Box>
            }
            sx={{
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'stretch', sm: 'center' },
              gap: 2,
              '& .MuiCardHeader-action': { margin: 0, alignSelf: { xs: 'stretch', sm: 'center' }, width: { xs: '100%', sm: 'auto' } }
            }}
          />
          <Divider />
          {isMobile ? (
            <div className='p-4 flex flex-col gap-4'>
              {table.getFilteredRowModel().rows.length === 0 ? (
                <Typography color='text.secondary' className='text-center py-8'>No coaches found</Typography>
              ) : (
                table.getRowModel().rows.map(row => {
                  const c = row.original
                  const licenseLabel = LICENSE_OPTIONS.find(o => o.value === c.license)?.label ?? c.license
                  return (
                    <Card
                      key={c.id}
                      elevation={0}
                      variant='outlined'
                      sx={{ borderRadius: 2, transition: 'box-shadow 0.2s ease', '&:hover': { boxShadow: 1 } }}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, mb: 2 }}>
                          <Box>
                            <Typography variant='subtitle1' fontWeight={600} color='text.primary'>
                              {c.fullName}
                            </Typography>
                            <Typography variant='caption' color='text.secondary'>
                              {c.coachId} • {ROLE_OPTIONS.find(o => o.value === c.role)?.label ?? c.role}
                              {c.role !== 'analyst' && ` • License: ${licenseLabel}`}
                            </Typography>
                          </Box>
                          <Chip variant='tonal' size='small' label={c.status} color={c.status === 'approved' ? 'success' : 'warning'} />
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <i className='ri-id-card-line text-base text-textSecondary' />
                            <Typography variant='body2' color='text.secondary'>NIC/Passport: {c.nicOrPassport}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <i className='ri-calendar-line text-base text-textSecondary' />
                            <Typography variant='body2' color='text.secondary'>DOB: {c.dateOfBirth}</Typography>
                          </Box>
                        </Box>
                        <Divider sx={{ my: 2 }} />
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                          <Button size='small' variant='outlined' startIcon={<i className='ri-edit-box-line' />} onClick={() => { setSelectedCoach(c); setEditDrawerOpen(true) }}>
                            Edit
                          </Button>
                          <Button size='small' variant='outlined' color='error' startIcon={<i className='ri-delete-bin-7-line' />} onClick={() => { setCoachToDelete(c); setDeleteDialogOpen(true) }}>
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
                            <div className={classnames({ 'cursor-pointer select-none': header.column.getCanSort() })} onClick={header.column.getToggleSortingHandler()}>
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
                      <td colSpan={columns.length} className='text-center'>No coaches found</td>
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

      <AddCoachDrawer open={addDrawerOpen} onClose={() => setAddDrawerOpen(false)} onRequestSent={() => { setAddDrawerOpen(false); setRequestSent(true) }} />
      <EditCoachDrawer open={editDrawerOpen} onClose={() => { setEditDrawerOpen(false); setSelectedCoach(null) }} coach={selectedCoach} />
      <ConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => { setDeleteDialogOpen(false); setCoachToDelete(null) }}
        onConfirm={() => { setDeleteDialogOpen(false); setCoachToDelete(null) }}
        title='Delete Coach'
        content={coachToDelete ? `Are you sure you want to remove "${coachToDelete.fullName}"?` : ''}
        confirmText='Delete'
        cancelText='Cancel'
        confirmColor='error'
      />
    </>
  )
}

export default ClubCoachList
