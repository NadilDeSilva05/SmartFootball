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

const LEAGUES_DATA = [
  { id: '1', name: 'Premier League', region: 'National', season: '2024-25', status: 'active' },
  { id: '2', name: 'Division One', region: 'National', season: '2024-25', status: 'active' },
  { id: '3', name: 'Regional Cup', region: 'Regional', season: '2024-25', status: 'upcoming' },
  { id: '4', name: 'Super League', region: 'National', season: '2023-24', status: 'completed' }
]

const LeagueCardsData = [
  { title: 'Total Leagues', value: '12', avatarIcon: 'ri-trophy-line', avatarColor: 'primary', change: 'positive', changeNumber: '5%', subTitle: 'All leagues' },
  { title: 'Active', value: '6', avatarIcon: 'ri-checkbox-circle-line', avatarColor: 'success', change: 'positive', changeNumber: '2%', subTitle: 'Current season' },
  { title: 'Upcoming', value: '3', avatarIcon: 'ri-calendar-line', avatarColor: 'info', change: 'neutral', changeNumber: '0%', subTitle: 'Scheduled' },
  { title: 'Completed', value: '3', avatarIcon: 'ri-archive-line', avatarColor: 'secondary', change: 'negative', changeNumber: '1%', subTitle: 'Past seasons' }
]

const columnHelper = createColumnHelper()

const LeagueList = () => {
  const [data] = useState(LEAGUES_DATA)
  const [globalFilter, setGlobalFilter] = useState('')
  const [addDrawerOpen, setAddDrawerOpen] = useState(false)
  const [editDrawerOpen, setEditDrawerOpen] = useState(false)
  const [selectedLeague, setSelectedLeague] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [leagueToDelete, setLeagueToDelete] = useState(null)

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
      columnHelper.accessor('region', {
        header: 'Region',
        cell: ({ row }) => <Typography>{row.original.region}</Typography>
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

  const handleDeleteConfirm = () => {
    setDeleteDialogOpen(false)
    setLeagueToDelete(null)
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
          {LeagueCardsData.map((item, i) => (
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

      <AddLeagueDrawer open={addDrawerOpen} onClose={() => setAddDrawerOpen(false)} />
      <EditLeagueDrawer
        open={editDrawerOpen}
        onClose={() => {
          setEditDrawerOpen(false)
          setSelectedLeague(null)
        }}
        league={selectedLeague}
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

const AddLeagueDrawer = ({ open, onClose }) => {
  const [formData, setFormData] = useState({ name: '', region: 'National', season: '2024-25', status: 'active' })

  const handleSubmit = e => {
    e.preventDefault()
    onClose()
    setFormData({ name: '', region: 'National', season: '2024-25', status: 'active' })
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
        <Typography variant='h5'>Add New League</Typography>
        <IconButton onClick={onClose} size='small'>
          <i className='ri-close-line' />
        </IconButton>
      </div>
      <Divider />
      <div className='p-5'>
        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
          <TextField
            fullWidth
            label='League Name'
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
          />
          <TextField
            fullWidth
            select
            SelectProps={{ native: true }}
            label='Region'
            value={formData.region}
            onChange={e => setFormData({ ...formData, region: e.target.value })}
          >
            <option value='National'>National</option>
            <option value='Regional'>Regional</option>
            <option value='District'>District</option>
          </TextField>
          <TextField
            fullWidth
            label='Season'
            placeholder='e.g. 2024-25'
            value={formData.season}
            onChange={e => setFormData({ ...formData, season: e.target.value })}
          />
          <TextField
            fullWidth
            select
            SelectProps={{ native: true }}
            label='Status'
            value={formData.status}
            onChange={e => setFormData({ ...formData, status: e.target.value })}
          >
            <option value='active'>Active</option>
            <option value='upcoming'>Upcoming</option>
            <option value='completed'>Completed</option>
          </TextField>
          <div className='flex gap-2'>
            <Button type='submit' variant='contained'>
              Submit
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

const EditLeagueDrawer = ({ open, onClose, league }) => {
  const [formData, setFormData] = useState({ name: '', region: 'National', season: '', status: 'active' })

  useEffect(() => {
    if (league) {
      setFormData({
        name: league.name,
        region: league.region,
        season: league.season,
        status: league.status
      })
    }
  }, [league])

  const handleSubmit = e => {
    e.preventDefault()
    onClose()
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
        <Typography variant='h5'>Edit League</Typography>
        <IconButton onClick={onClose} size='small'>
          <i className='ri-close-line' />
        </IconButton>
      </div>
      <Divider />
      <div className='p-5'>
        {league && (
          <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
            <TextField
              fullWidth
              label='League Name'
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
            <TextField
              fullWidth
              select
              SelectProps={{ native: true }}
              label='Region'
              value={formData.region}
              onChange={e => setFormData({ ...formData, region: e.target.value })}
            >
              <option value='National'>National</option>
              <option value='Regional'>Regional</option>
              <option value='District'>District</option>
            </TextField>
            <TextField
              fullWidth
              label='Season'
              value={formData.season}
              onChange={e => setFormData({ ...formData, season: e.target.value })}
            />
            <TextField
              fullWidth
              select
              SelectProps={{ native: true }}
              label='Status'
              value={formData.status}
              onChange={e => setFormData({ ...formData, status: e.target.value })}
            >
              <option value='active'>Active</option>
              <option value='upcoming'>Upcoming</option>
              <option value='completed'>Completed</option>
            </TextField>
            <div className='flex gap-2'>
              <Button type='submit' variant='contained'>
                Save
              </Button>
              <Button type='button' variant='outlined' color='secondary' onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        )}
      </div>
    </Drawer>
  )
}

export default LeagueList
