'use client'

// React Imports
import { useState, useMemo, useEffect } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import TablePagination from '@mui/material/TablePagination'
import Alert from '@mui/material/Alert'

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

// Style Imports
import tableStyles from '@core/styles/table.module.css'

const COACHES_DATA = [
  { id: '1', name: 'James Wilson', role: 'Head Coach', email: 'james@club.com', status: 'approved' },
  { id: '2', name: 'Anna Lopez', role: 'Analyst', email: 'anna@club.com', status: 'approved' },
  { id: '3', name: 'Michael Brown', role: 'Assistant Coach', email: 'michael@club.com', status: 'pending' }
]

const CoachCardsData = [
  { title: 'Total Coaches / Analysts', value: '8', avatarIcon: 'ri-user-star-line', avatarColor: 'primary', change: 'positive', changeNumber: '2%', subTitle: 'Staff' },
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

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: 'Name',
        cell: ({ row }) => (
          <Typography className='font-medium' color='text.primary'>
            {row.original.name}
          </Typography>
        )
      }),
      columnHelper.accessor('role', { header: 'Role', cell: ({ row }) => <Typography>{row.original.role}</Typography> }),
      columnHelper.accessor('email', { header: 'Email', cell: ({ row }) => <Typography>{row.original.email}</Typography> }),
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
            Coach / Analyst Management
          </Typography>
          <Typography variant='body1' color='text.secondary'>
            Add, edit, and manage coaches and analysts. New staff are sent to federation admin for approval.
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
            title='Coaches & Analysts'
            action={
              <div className='flex items-center gap-4 flex-wrap'>
                <TextField size='small' placeholder='Search...' value={globalFilter ?? ''} onChange={e => setGlobalFilter(e.target.value)} className='is-full sm:is-auto min-is-[200px]' />
                <Button variant='contained' startIcon={<i className='ri-add-line' />} onClick={() => setAddDrawerOpen(true)}>
                  Add Coach / Analyst
                </Button>
              </div>
            }
          />
          <Divider />
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
        content={coachToDelete ? `Are you sure you want to remove "${coachToDelete.name}"?` : ''}
        confirmText='Delete'
        cancelText='Cancel'
        confirmColor='error'
      />
    </>
  )
}

const AddCoachDrawer = ({ open, onClose, onRequestSent }) => {
  const [formData, setFormData] = useState({ name: '', role: 'Coach', email: '' })

  const handleSubmit = e => {
    e.preventDefault()
    onRequestSent()
    setFormData({ name: '', role: 'Coach', email: '' })
  }

  return (
    <Drawer open={open} anchor='right' variant='temporary' onClose={onClose} ModalProps={{ keepMounted: true }} sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}>
      <div className='flex items-center justify-between pli-5 plb-[15px]'>
        <Typography variant='h5'>Add Coach / Analyst (Request to Federation)</Typography>
        <IconButton onClick={onClose} size='small'><i className='ri-close-line' /></IconButton>
      </div>
      <Divider />
      <div className='p-5'>
        <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
          This will send a registration request to the federation admin for approval.
        </Typography>
        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
          <TextField fullWidth label='Full Name' value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
          <TextField fullWidth select SelectProps={{ native: true }} label='Role' value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
            <option value='Head Coach'>Head Coach</option>
            <option value='Assistant Coach'>Assistant Coach</option>
            <option value='Analyst'>Analyst</option>
            <option value='Coach'>Coach</option>
          </TextField>
          <TextField fullWidth label='Email' type='email' value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
          <div className='flex gap-2'>
            <Button type='submit' variant='contained'>Send Request to Federation</Button>
            <Button type='button' variant='outlined' color='secondary' onClick={onClose}>Cancel</Button>
          </div>
        </form>
      </div>
    </Drawer>
  )
}

const EditCoachDrawer = ({ open, onClose, coach }) => {
  const [formData, setFormData] = useState({ name: '', role: 'Coach', email: '' })

  useEffect(() => {
    if (coach) setFormData({ name: coach.name, role: coach.role, email: coach.email })
  }, [coach])

  const handleSubmit = e => {
    e.preventDefault()
    onClose()
  }

  return (
    <Drawer open={open} anchor='right' variant='temporary' onClose={onClose} ModalProps={{ keepMounted: true }} sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}>
      <div className='flex items-center justify-between pli-5 plb-[15px]'>
        <Typography variant='h5'>Edit Coach / Analyst</Typography>
        <IconButton onClick={onClose} size='small'><i className='ri-close-line' /></IconButton>
      </div>
      <Divider />
      <div className='p-5'>
        {coach && (
          <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
            <TextField fullWidth label='Full Name' value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
            <TextField fullWidth select SelectProps={{ native: true }} label='Role' value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
              <option value='Head Coach'>Head Coach</option>
              <option value='Assistant Coach'>Assistant Coach</option>
              <option value='Analyst'>Analyst</option>
              <option value='Coach'>Coach</option>
            </TextField>
            <TextField fullWidth label='Email' type='email' value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
            <div className='flex gap-2'>
              <Button type='submit' variant='contained'>Save</Button>
              <Button type='button' variant='outlined' color='secondary' onClick={onClose}>Cancel</Button>
            </div>
          </form>
        )}
      </div>
    </Drawer>
  )
}

export default ClubCoachList
