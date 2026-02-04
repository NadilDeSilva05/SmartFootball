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

const PLAYERS_DATA = [
  { id: '1', name: 'John Silva', jerseyNo: '10', position: 'Forward', status: 'approved' },
  { id: '2', name: 'Maria Perera', jerseyNo: '7', position: 'Midfielder', status: 'approved' },
  { id: '3', name: 'David Fernando', jerseyNo: '1', position: 'Goalkeeper', status: 'pending' }
]

const PlayerCardsData = [
  { title: 'Total Players', value: '24', avatarIcon: 'ri-user-line', avatarColor: 'primary', change: 'positive', changeNumber: '5%', subTitle: 'Squad size' },
  { title: 'Approved', value: '20', avatarIcon: 'ri-checkbox-circle-line', avatarColor: 'success', change: 'positive', changeNumber: '3%', subTitle: 'Federation approved' },
  { title: 'Pending', value: '4', avatarIcon: 'ri-time-line', avatarColor: 'warning', change: 'negative', changeNumber: '1%', subTitle: 'Awaiting approval' }
]

const columnHelper = createColumnHelper()

const ClubPlayerList = () => {
  const [data] = useState(PLAYERS_DATA)
  const [globalFilter, setGlobalFilter] = useState('')
  const [addDrawerOpen, setAddDrawerOpen] = useState(false)
  const [editDrawerOpen, setEditDrawerOpen] = useState(false)
  const [selectedPlayer, setSelectedPlayer] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [playerToDelete, setPlayerToDelete] = useState(null)
  const [requestSent, setRequestSent] = useState(false)

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: 'Player Name',
        cell: ({ row }) => (
          <Typography className='font-medium' color='text.primary'>
            {row.original.name}
          </Typography>
        )
      }),
      columnHelper.accessor('jerseyNo', { header: 'Jersey No', cell: ({ row }) => <Typography>{row.original.jerseyNo}</Typography> }),
      columnHelper.accessor('position', { header: 'Position', cell: ({ row }) => <Typography>{row.original.position}</Typography> }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: ({ row }) => (
          <Chip
            variant='tonal'
            size='small'
            label={row.original.status}
            color={row.original.status === 'approved' ? 'success' : 'warning'}
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
                setSelectedPlayer(row.original)
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
                      setSelectedPlayer(row.original)
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
                      setPlayerToDelete(row.original)
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
    setPlayerToDelete(null)
  }

  return (
    <>
      <div className='space-y-6'>
        <div>
          <Typography variant='h4' className='font-semibold mb-1'>
            Player Management
          </Typography>
          <Typography variant='body1' color='text.secondary'>
            Add, edit, and manage players. New players are sent to federation admin for approval.
          </Typography>
        </div>

        {requestSent && (
          <Alert severity='success' onClose={() => setRequestSent(false)}>
            Player registration request sent to federation admin. You will be notified once reviewed.
          </Alert>
        )}

        <div className='grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'>
          {PlayerCardsData.map((item, i) => (
            <HorizontalWithSubtitle key={i} {...item} />
          ))}
        </div>

        <Card>
          <CardHeader
            title='Players'
            action={
              <div className='flex items-center gap-4 flex-wrap'>
                <TextField
                  size='small'
                  placeholder='Search players...'
                  value={globalFilter ?? ''}
                  onChange={e => setGlobalFilter(e.target.value)}
                  className='is-full sm:is-auto min-is-[200px]'
                />
                <Button variant='contained' startIcon={<i className='ri-add-line' />} onClick={() => setAddDrawerOpen(true)}>
                  Add Player
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
                      No players found
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

      <AddPlayerDrawer
        open={addDrawerOpen}
        onClose={() => setAddDrawerOpen(false)}
        onRequestSent={() => {
          setAddDrawerOpen(false)
          setRequestSent(true)
        }}
      />
      <EditPlayerDrawer
        open={editDrawerOpen}
        onClose={() => {
          setEditDrawerOpen(false)
          setSelectedPlayer(null)
        }}
        player={selectedPlayer}
      />

      <ConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false)
          setPlayerToDelete(null)
        }}
        onConfirm={handleDeleteConfirm}
        title='Delete Player'
        content={playerToDelete ? `Are you sure you want to remove "${playerToDelete.name}" from the club?` : ''}
        confirmText='Delete'
        cancelText='Cancel'
        confirmColor='error'
      />
    </>
  )
}

const AddPlayerDrawer = ({ open, onClose, onRequestSent }) => {
  const [formData, setFormData] = useState({ name: '', jerseyNo: '', position: 'Forward', dob: '', idNumber: '' })

  const handleSubmit = e => {
    e.preventDefault()
    onRequestSent()
    setFormData({ name: '', jerseyNo: '', position: 'Forward', dob: '', idNumber: '' })
  }

  return (
    <Drawer
      open={open}
      anchor='right'
      variant='temporary'
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}
    >
      <div className='flex items-center justify-between pli-5 plb-[15px]'>
        <Typography variant='h5'>Add Player (Request to Federation)</Typography>
        <IconButton onClick={onClose} size='small'>
          <i className='ri-close-line' />
        </IconButton>
      </div>
      <Divider />
      <div className='p-5'>
        <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
          This will send a registration request to the federation admin for approval.
        </Typography>
        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
          <TextField fullWidth label='Full Name' value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
          <TextField fullWidth label='Jersey Number' value={formData.jerseyNo} onChange={e => setFormData({ ...formData, jerseyNo: e.target.value })} />
          <TextField fullWidth select SelectProps={{ native: true }} label='Position' value={formData.position} onChange={e => setFormData({ ...formData, position: e.target.value })}>
            <option value='Goalkeeper'>Goalkeeper</option>
            <option value='Defender'>Defender</option>
            <option value='Midfielder'>Midfielder</option>
            <option value='Forward'>Forward</option>
          </TextField>
          <TextField fullWidth label='Date of Birth' type='date' value={formData.dob} onChange={e => setFormData({ ...formData, dob: e.target.value })} InputLabelProps={{ shrink: true }} />
          <TextField fullWidth label='ID / Passport Number' value={formData.idNumber} onChange={e => setFormData({ ...formData, idNumber: e.target.value })} />
          <div className='flex gap-2'>
            <Button type='submit' variant='contained'>
              Send Request to Federation
            </Button>
            <Button type='button' variant='outlined' color='secondary' onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </Drawer>
  )
}

const EditPlayerDrawer = ({ open, onClose, player }) => {
  const [formData, setFormData] = useState({ name: '', jerseyNo: '', position: 'Forward' })

  useEffect(() => {
    if (player) setFormData({ name: player.name, jerseyNo: player.jerseyNo, position: player.position })
  }, [player])

  const handleSubmit = e => {
    e.preventDefault()
    onClose()
  }

  return (
    <Drawer open={open} anchor='right' variant='temporary' onClose={onClose} ModalProps={{ keepMounted: true }} sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}>
      <div className='flex items-center justify-between pli-5 plb-[15px]'>
        <Typography variant='h5'>Edit Player</Typography>
        <IconButton onClick={onClose} size='small'>
          <i className='ri-close-line' />
        </IconButton>
      </div>
      <Divider />
      <div className='p-5'>
        {player && (
          <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
            <TextField fullWidth label='Full Name' value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
            <TextField fullWidth label='Jersey Number' value={formData.jerseyNo} onChange={e => setFormData({ ...formData, jerseyNo: e.target.value })} />
            <TextField fullWidth select SelectProps={{ native: true }} label='Position' value={formData.position} onChange={e => setFormData({ ...formData, position: e.target.value })}>
              <option value='Goalkeeper'>Goalkeeper</option>
              <option value='Defender'>Defender</option>
              <option value='Midfielder'>Midfielder</option>
              <option value='Forward'>Forward</option>
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

export default ClubPlayerList
