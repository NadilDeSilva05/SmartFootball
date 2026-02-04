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

// Hardcoded data
const CLUBS_DATA = [
  { id: '1', name: 'City FC', city: 'Colombo', contactEmail: 'admin@cityfc.com', status: 'active' },
  { id: '2', name: 'United SC', city: 'Kandy', contactEmail: 'info@unitedsc.com', status: 'active' },
  { id: '3', name: 'Rovers FC', city: 'Galle', contactEmail: 'contact@roversfc.com', status: 'pending' },
  { id: '4', name: 'Athletic Club', city: 'Jaffna', contactEmail: 'admin@athletic.com', status: 'inactive' }
]

const ClubCardsData = [
  { title: 'Total Clubs', value: '24', avatarIcon: 'ri-building-line', avatarColor: 'primary', change: 'positive', changeNumber: '12%', subTitle: 'Registered clubs' },
  { title: 'Active', value: '18', avatarIcon: 'ri-checkbox-circle-line', avatarColor: 'success', change: 'positive', changeNumber: '8%', subTitle: 'Active clubs' },
  { title: 'Pending', value: '4', avatarIcon: 'ri-time-line', avatarColor: 'warning', change: 'negative', changeNumber: '2%', subTitle: 'Pending approval' },
  { title: 'Inactive', value: '2', avatarIcon: 'ri-close-circle-line', avatarColor: 'error', change: 'negative', changeNumber: '1%', subTitle: 'Inactive clubs' }
]

const columnHelper = createColumnHelper()

const ClubList = () => {
  const [data] = useState(CLUBS_DATA)
  const [globalFilter, setGlobalFilter] = useState('')
  const [addDrawerOpen, setAddDrawerOpen] = useState(false)
  const [editDrawerOpen, setEditDrawerOpen] = useState(false)
  const [selectedClub, setSelectedClub] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [clubToDelete, setClubToDelete] = useState(null)

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: 'Club Name',
        cell: ({ row }) => (
          <Typography className='font-medium' color='text.primary'>
            {row.original.name}
          </Typography>
        )
      }),
      columnHelper.accessor('city', {
        header: 'City',
        cell: ({ row }) => <Typography>{row.original.city}</Typography>
      }),
      columnHelper.accessor('contactEmail', {
        header: 'Contact Email',
        cell: ({ row }) => <Typography>{row.original.contactEmail}</Typography>
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: ({ row }) => (
          <Chip
            variant='tonal'
            className='capitalize'
            label={row.original.status}
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

  const handleDeleteConfirm = () => {
    setDeleteDialogOpen(false)
    setClubToDelete(null)
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

        <div className='grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'>
          {ClubCardsData.map((item, i) => (
            <HorizontalWithSubtitle key={i} {...item} />
          ))}
        </div>

        <Card>
          <CardHeader
            title='Clubs List'
            action={
              <div className='flex items-center gap-4 flex-wrap'>
                <TextField
                  size='small'
                  placeholder='Search clubs...'
                  value={globalFilter ?? ''}
                  onChange={e => setGlobalFilter(e.target.value)}
                  className='is-full sm:is-auto min-is-[200px]'
                />
                <Button variant='contained' startIcon={<i className='ri-add-line' />} onClick={() => setAddDrawerOpen(true)}>
                  Add Club
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

      <AddClubDrawer open={addDrawerOpen} onClose={() => setAddDrawerOpen(false)} />
      <EditClubDrawer open={editDrawerOpen} onClose={() => { setEditDrawerOpen(false); setSelectedClub(null) }} club={selectedClub} />

      <ConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => { setDeleteDialogOpen(false); setClubToDelete(null) }}
        onConfirm={handleDeleteConfirm}
        title='Delete Club'
        content={clubToDelete ? `Are you sure you want to delete "${clubToDelete.name}"? This action cannot be undone.` : ''}
        confirmText='Delete'
        cancelText='Cancel'
        confirmColor='error'
      />
    </>
  )
}

const AddClubDrawer = ({ open, onClose }) => {
  const [formData, setFormData] = useState({ name: '', city: '', contactEmail: '', status: 'active' })

  const handleSubmit = e => {
    e.preventDefault()
    onClose()
    setFormData({ name: '', city: '', contactEmail: '', status: 'active' })
  }

  return (
    <Drawer open={open} anchor='right' variant='temporary' onClose={onClose} ModalProps={{ keepMounted: true }} sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}>
      <div className='flex items-center justify-between pli-5 plb-[15px]'>
        <Typography variant='h5'>Add New Club</Typography>
        <IconButton onClick={onClose} size='small'>
          <i className='ri-close-line' />
        </IconButton>
      </div>
      <Divider />
      <div className='p-5'>
        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
          <TextField fullWidth label='Club Name' value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
          <TextField fullWidth label='City' value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} />
          <TextField fullWidth label='Contact Email' type='email' value={formData.contactEmail} onChange={e => setFormData({ ...formData, contactEmail: e.target.value })} />
          <div className='flex gap-2'>
            <Button type='submit' variant='contained'>Submit</Button>
            <Button type='button' variant='outlined' color='secondary' onClick={onClose}>Cancel</Button>
          </div>
        </form>
      </div>
    </Drawer>
  )
}

const EditClubDrawer = ({ open, onClose, club }) => {
  const [formData, setFormData] = useState({ name: '', city: '', contactEmail: '', status: 'active' })

  useEffect(() => {
    if (club) {
      setFormData({ name: club.name, city: club.city, contactEmail: club.contactEmail, status: club.status })
    }
  }, [club])

  const handleSubmit = e => {
    e.preventDefault()
    onClose()
  }

  return (
    <Drawer open={open} anchor='right' variant='temporary' onClose={onClose} ModalProps={{ keepMounted: true }} sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}>
      <div className='flex items-center justify-between pli-5 plb-[15px]'>
        <Typography variant='h5'>Edit Club</Typography>
        <IconButton onClick={onClose} size='small'>
          <i className='ri-close-line' />
        </IconButton>
      </div>
      <Divider />
      <div className='p-5'>
        {club && (
          <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
            <TextField fullWidth label='Club Name' value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
            <TextField fullWidth label='City' value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} />
            <TextField fullWidth label='Contact Email' type='email' value={formData.contactEmail} onChange={e => setFormData({ ...formData, contactEmail: e.target.value })} />
            <TextField fullWidth select SelectProps={{ native: true }} label='Status' value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
              <option value='active'>Active</option>
              <option value='pending'>Pending</option>
              <option value='inactive'>Inactive</option>
            </TextField>
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

export default ClubList
