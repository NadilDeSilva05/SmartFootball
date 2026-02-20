'use client'

// React Imports
import { useState, useMemo, useEffect } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import TablePagination from '@mui/material/TablePagination'
import Alert from '@mui/material/Alert'
import CardContent from '@mui/material/CardContent'
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
import CustomAvatar from '@core/components/mui/Avatar'
import OptionMenu from '@core/components/option-menu'
import HorizontalWithSubtitle from '@components/card-statistics/HorizontalWithSubtitle'
import ConfirmationDialog from '@components/dialogs/confirmation-dialog'
import AddPlayerDrawer from '@views/club/components/player/AddPlayerDrawer'
import EditPlayerDrawer from '@views/club/components/player/EditPlayerDrawer'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

const PLAYERS_DATA = [
  { id: '1', playerId: 'PLR-001', fullName: 'John Silva', commentaryName: 'J. Silva', jerseyNo: '10', nicOrPassport: '199012345678', dateOfBirth: '1990-05-15', residentStatus: 'local', visaNo: '', position: 'Forward', photo: null, status: 'approved' },
  { id: '2', playerId: 'PLR-002', fullName: 'Maria Perera', commentaryName: 'M. Perera', jerseyNo: '7', nicOrPassport: '199512345679', dateOfBirth: '1995-08-22', residentStatus: 'local', visaNo: '', position: 'Midfielder', photo: null, status: 'approved' },
  { id: '3', playerId: 'PLR-003', fullName: 'David Fernando', commentaryName: 'D. Fernando', jerseyNo: '1', nicOrPassport: 'PASS-987654', dateOfBirth: '1992-01-10', residentStatus: 'foreign', visaNo: 'V-2024-001', position: 'Goalkeeper', photo: null, status: 'pending' }
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
  const isMobile = useMediaQuery(theme => theme.breakpoints.down('md'))

  const columns = useMemo(
    () => [
      columnHelper.accessor('photo', {
        header: '',
        cell: ({ row }) => {
          const p = row.original
          const initials = p.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2) || '?'
          return (
            <CustomAvatar src={p.photo} size={36} color='primary' skin='light'>
              {initials}
            </CustomAvatar>
          )
        },
        enableSorting: false
      }),
      columnHelper.accessor('playerId', { header: 'Player Id', cell: ({ row }) => <Typography variant='body2'>{row.original.playerId}</Typography> }),
      columnHelper.accessor('fullName', {
        header: 'Full Name',
        cell: ({ row }) => (
          <Typography className='font-medium' color='text.primary'>
            {row.original.fullName}
          </Typography>
        )
      }),
      columnHelper.accessor('commentaryName', { header: 'Commentary Name', cell: ({ row }) => <Typography variant='body2'>{row.original.commentaryName || '–'}</Typography> }),
      columnHelper.accessor('nicOrPassport', { header: 'NIC / Passport', cell: ({ row }) => <Typography variant='body2'>{row.original.nicOrPassport}</Typography> }),
      columnHelper.accessor('dateOfBirth', { header: 'DOB', cell: ({ row }) => <Typography variant='body2'>{row.original.dateOfBirth}</Typography> }),
      columnHelper.accessor('residentStatus', {
        header: 'Resident',
        cell: ({ row }) => (
          <Chip variant='tonal' size='small' label={row.original.residentStatus === 'foreign' ? 'Foreign' : 'Local'} color={row.original.residentStatus === 'foreign' ? 'secondary' : 'default'} />
        )
      }),
      columnHelper.accessor('position', { header: 'Position', cell: ({ row }) => <Typography variant='body2'>{row.original.position}</Typography> }),
      columnHelper.accessor('jerseyNo', { header: 'Jersey No', cell: ({ row }) => <Typography variant='body2'>{row.original.jerseyNo || '–'}</Typography> }),
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
                  placeholder='Search players...'
                  value={globalFilter ?? ''}
                  onChange={e => setGlobalFilter(e.target.value)}
                  sx={{ minWidth: { xs: 0, sm: 200 }, flex: { xs: '1 1 auto', sm: '0 0 auto' } }}
                />
                <Button variant='contained' startIcon={<i className='ri-add-line' />} onClick={() => setAddDrawerOpen(true)} sx={{ flexShrink: 0 }}>
                  Add Player
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
                <Typography color='text.secondary' className='text-center py-8'>No players found</Typography>
              ) : (
                table.getRowModel().rows.map(row => {
                  const p = row.original
                  const initials = p.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2) || '?'
                  return (
                    <Card
                      key={p.id}
                      elevation={0}
                      variant='outlined'
                      sx={{
                        borderRadius: 2,
                        transition: 'box-shadow 0.2s ease',
                        '&:hover': { boxShadow: 1 }
                      }}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <CustomAvatar src={p.photo} size={44} color='primary' skin='light'>
                              {initials}
                            </CustomAvatar>
                            <Box>
                              <Typography variant='subtitle1' fontWeight={600} color='text.primary'>
                                {p.fullName}
                              </Typography>
                              <Typography variant='caption' color='text.secondary'>
                                {p.playerId} • #{p.jerseyNo || '–'} • {p.position}
                              </Typography>
                            </Box>
                          </Box>
                          <Chip
                            variant='tonal'
                            size='small'
                            label={p.status}
                            color={p.status === 'approved' ? 'success' : 'warning'}
                          />
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          {p.commentaryName && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <i className='ri-user-voice-line text-base text-textSecondary' />
                              <Typography variant='body2' color='text.secondary'>Commentary: {p.commentaryName}</Typography>
                            </Box>
                          )}
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <i className='ri-id-card-line text-base text-textSecondary' />
                            <Typography variant='body2' color='text.secondary'>NIC/Passport: {p.nicOrPassport}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <i className='ri-calendar-line text-base text-textSecondary' />
                            <Typography variant='body2' color='text.secondary'>DOB: {p.dateOfBirth}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <i className='ri-map-pin-user-line text-base text-textSecondary' />
                            <Typography variant='body2' color='text.secondary'>
                              {p.residentStatus === 'foreign' ? 'Foreign' : 'Local'}
                              {p.residentStatus === 'foreign' && p.visaNo ? ` (Visa: ${p.visaNo})` : ''}
                            </Typography>
                          </Box>
                        </Box>
                        <Divider sx={{ my: 2 }} />
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                          <Button
                            size='small'
                            variant='outlined'
                            startIcon={<i className='ri-edit-box-line' />}
                            onClick={() => { setSelectedPlayer(p); setEditDrawerOpen(true) }}
                          >
                            Edit
                          </Button>
                          <Button
                            size='small'
                            variant='outlined'
                            color='error'
                            startIcon={<i className='ri-delete-bin-7-line' />}
                            onClick={() => { setPlayerToDelete(p); setDeleteDialogOpen(true) }}
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
        content={playerToDelete ? `Are you sure you want to remove "${playerToDelete.fullName}" from the club?` : ''}
        confirmText='Delete'
        cancelText='Cancel'
        confirmColor='error'
      />
    </>
  )
}

export default ClubPlayerList
