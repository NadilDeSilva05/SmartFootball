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

const REFEREES_DATA = [
  { id: '1', name: 'John Silva', email: 'john.silva@ref.com', level: 'FIFA', status: 'active' },
  { id: '2', name: 'Maria Perera', email: 'maria.perera@ref.com', level: 'National', status: 'active' },
  { id: '3', name: 'David Fernando', email: 'david.f@ref.com', level: 'Regional', status: 'pending' },
  { id: '4', name: 'Sarah Gomes', email: 'sarah.g@ref.com', level: 'National', status: 'inactive' }
]

const RefereeCardsData = [
  { title: 'Total Referees', value: '42', avatarIcon: 'ri-user-star-line', avatarColor: 'primary', change: 'positive', changeNumber: '10%', subTitle: 'Registered referees' },
  { title: 'Active', value: '35', avatarIcon: 'ri-checkbox-circle-line', avatarColor: 'success', change: 'positive', changeNumber: '5%', subTitle: 'Active referees' },
  { title: 'Pending', value: '5', avatarIcon: 'ri-time-line', avatarColor: 'warning', change: 'negative', changeNumber: '2%', subTitle: 'Pending approval' },
  { title: 'FIFA Level', value: '8', avatarIcon: 'ri-medal-line', avatarColor: 'info', change: 'positive', changeNumber: '1%', subTitle: 'FIFA certified' }
]

const columnHelper = createColumnHelper()

const RefereeList = () => {
  const [data] = useState(REFEREES_DATA)
  const [globalFilter, setGlobalFilter] = useState('')
  const [addDrawerOpen, setAddDrawerOpen] = useState(false)
  const [editDrawerOpen, setEditDrawerOpen] = useState(false)
  const [selectedReferee, setSelectedReferee] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [refereeToDelete, setRefereeToDelete] = useState(null)

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
      columnHelper.accessor('email', {
        header: 'Email',
        cell: ({ row }) => <Typography>{row.original.email}</Typography>
      }),
      columnHelper.accessor('level', {
        header: 'Level',
        cell: ({ row }) => (
          <Chip variant='tonal' size='small' color='info' label={row.original.level} />
        )
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
                setSelectedReferee(row.original)
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
                      setSelectedReferee(row.original)
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
                      setRefereeToDelete(row.original)
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
    setRefereeToDelete(null)
  }

  return (
    <>
      <div className='space-y-6'>
        <div>
          <Typography variant='h4' className='font-semibold mb-1'>
            Referee Management
          </Typography>
          <Typography variant='body1' color='text.secondary'>
            Add, edit, and manage referees in the federation.
          </Typography>
        </div>

        <div className='grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'>
          {RefereeCardsData.map((item, i) => (
            <HorizontalWithSubtitle key={i} {...item} />
          ))}
        </div>

        <Card>
          <CardHeader
            title='Referees List'
            action={
              <div className='flex items-center gap-4 flex-wrap'>
                <TextField
                  size='small'
                  placeholder='Search referees...'
                  value={globalFilter ?? ''}
                  onChange={e => setGlobalFilter(e.target.value)}
                  className='is-full sm:is-auto min-is-[200px]'
                />
                <Button variant='contained' startIcon={<i className='ri-add-line' />} onClick={() => setAddDrawerOpen(true)}>
                  Add Referee
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
                      No referees found
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

      <AddRefereeDrawer open={addDrawerOpen} onClose={() => setAddDrawerOpen(false)} />
      <EditRefereeDrawer open={editDrawerOpen} onClose={() => { setEditDrawerOpen(false); setSelectedReferee(null) }} referee={selectedReferee} />

      <ConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => { setDeleteDialogOpen(false); setRefereeToDelete(null) }}
        onConfirm={handleDeleteConfirm}
        title='Delete Referee'
        content={refereeToDelete ? `Are you sure you want to delete "${refereeToDelete.name}"?` : ''}
        confirmText='Delete'
        cancelText='Cancel'
        confirmColor='error'
      />
    </>
  )
}

const AddRefereeDrawer = ({ open, onClose }) => {
  const [formData, setFormData] = useState({ name: '', email: '', level: 'Regional', status: 'active' })

  const handleSubmit = e => {
    e.preventDefault()
    onClose()
    setFormData({ name: '', email: '', level: 'Regional', status: 'active' })
  }

  return (
    <Drawer open={open} anchor='right' variant='temporary' onClose={onClose} ModalProps={{ keepMounted: true }} sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}>
      <div className='flex items-center justify-between pli-5 plb-[15px]'>
        <Typography variant='h5'>Add New Referee</Typography>
        <IconButton onClick={onClose} size='small'>
          <i className='ri-close-line' />
        </IconButton>
      </div>
      <Divider />
      <div className='p-5'>
        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
          <TextField fullWidth label='Full Name' value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
          <TextField fullWidth label='Email' type='email' value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
          <TextField fullWidth select SelectProps={{ native: true }} label='Level' value={formData.level} onChange={e => setFormData({ ...formData, level: e.target.value })}>
            <option value='FIFA'>FIFA</option>
            <option value='National'>National</option>
            <option value='Regional'>Regional</option>
          </TextField>
          <div className='flex gap-2'>
            <Button type='submit' variant='contained'>Submit</Button>
            <Button type='button' variant='outlined' color='secondary' onClick={onClose}>Cancel</Button>
          </div>
        </form>
      </div>
    </Drawer>
  )
}

const EditRefereeDrawer = ({ open, onClose, referee }) => {
  const [formData, setFormData] = useState({ name: '', email: '', level: 'Regional', status: 'active' })

  useEffect(() => {
    if (referee) {
      setFormData({ name: referee.name, email: referee.email, level: referee.level, status: referee.status })
    }
  }, [referee])

  const handleSubmit = e => {
    e.preventDefault()
    onClose()
  }

  return (
    <Drawer open={open} anchor='right' variant='temporary' onClose={onClose} ModalProps={{ keepMounted: true }} sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}>
      <div className='flex items-center justify-between pli-5 plb-[15px]'>
        <Typography variant='h5'>Edit Referee</Typography>
        <IconButton onClick={onClose} size='small'>
          <i className='ri-close-line' />
        </IconButton>
      </div>
      <Divider />
      <div className='p-5'>
        {referee && (
          <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
            <TextField fullWidth label='Full Name' value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
            <TextField fullWidth label='Email' type='email' value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
            <TextField fullWidth select SelectProps={{ native: true }} label='Level' value={formData.level} onChange={e => setFormData({ ...formData, level: e.target.value })}>
              <option value='FIFA'>FIFA</option>
              <option value='National'>National</option>
              <option value='Regional'>Regional</option>
            </TextField>
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

export default RefereeList
