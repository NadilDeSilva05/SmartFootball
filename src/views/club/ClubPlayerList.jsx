'use client'

// React Imports
import { useState, useMemo, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import TablePagination from '@mui/material/TablePagination'
import Alert from '@mui/material/Alert'
import CardContent from '@mui/material/CardContent'
import CircularProgress from '@mui/material/CircularProgress'
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
import PlayerIdCardDialog from '@views/club/components/player/PlayerIdCardDialog'
import { notifyError, notifySuccess } from '@/utils/toast'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

const columnHelper = createColumnHelper()

const resolveCurrentClub = (clubs, user) => {
  if (!Array.isArray(clubs) || clubs.length === 0) return null
  if (user == null || (typeof user === 'object' && !user.uid && !user.clubId && !user.email)) return null

  const userClubIds = [user?.clubId, user?.clubDocId, user?.club?.id]
    .map(value => String(value || '').trim())
    .filter(Boolean)
  const userUids = [user?.uid, user?.id, user?.userId, user?.adminUserId]
    .map(value => String(value || '').trim())
    .filter(Boolean)
  const userEmails = [user?.email, user?.emailAddress, user?.adminEmail]
    .map(value => String(value || '').trim().toLowerCase())
    .filter(Boolean)

  const byUserClubId = userClubIds.length
    ? clubs.find(club => {
      const clubDocId = String(club?.id || '').trim()
      const businessClubId = String(club?.clubId || '').trim()
      return userClubIds.includes(clubDocId) || userClubIds.includes(businessClubId)
    })
    : null
  if (byUserClubId) return byUserClubId

  const byAdminUid = userUids.length
    ? clubs.find(club => userUids.includes(String(club?.adminUserId || '').trim()))
    : null
  if (byAdminUid) return byAdminUid

  return userEmails.length
    ? clubs.find(club => userEmails.includes(String(club?.adminEmail || '').trim().toLowerCase())) || null
    : null
}

const ClubPlayerList = () => {
  const user = useSelector(state => state?.authenticationReducer?.loginData?.user)
  const token = useSelector(state => state?.authenticationReducer?.loginData?.token)

  const [club, setClub] = useState(null)
  const [players, setPlayers] = useState([])
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [globalFilter, setGlobalFilter] = useState('')
  const [addDrawerOpen, setAddDrawerOpen] = useState(false)
  const [editDrawerOpen, setEditDrawerOpen] = useState(false)
  const [selectedPlayer, setSelectedPlayer] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [playerToDelete, setPlayerToDelete] = useState(null)
  const [idCardDialogOpen, setIdCardDialogOpen] = useState(false)
  const [playerForIdCard, setPlayerForIdCard] = useState(null)
  const [requestSent, setRequestSent] = useState(false)
  const isMobile = useMediaQuery(theme => theme.breakpoints.down('md'))

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError('')

      const [clubsRes, meRes] = await Promise.all([
        fetch('/api/clubs', { cache: 'no-store' }),
        token
          ? fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' })
          : Promise.resolve({ ok: false })
      ])
      if (!clubsRes.ok) throw new Error('Failed to load club details')
      const [clubsPayload, mePayload] = await Promise.all([
        clubsRes.json().catch(() => []),
        meRes.ok ? meRes.json().catch(() => ({})) : Promise.resolve({})
      ])
      const clubs = Array.isArray(clubsPayload) ? clubsPayload : []
      const identity = { ...user, ...mePayload, uid: mePayload.uid || user?.uid, email: mePayload.email || user?.email }

      const currentClub = resolveCurrentClub(clubs, identity)

      if (!currentClub?.id) {
        setClub(null)
        setPlayers([])
        setRequests([])
        setError('Could not resolve your club. Please login with a club admin account.')
        return
      }

      setClub(currentClub)

      const [playersRes, requestsRes] = await Promise.all([
        fetch(`/api/club-players?clubId=${encodeURIComponent(currentClub.id)}`, { cache: 'no-store' }),
        fetch(`/api/player-requests?clubId=${encodeURIComponent(currentClub.id)}`, { cache: 'no-store' })
      ])

      if (!playersRes.ok || !requestsRes.ok) {
        throw new Error('Failed to load player management data')
      }

      const [playersPayload, requestsPayload] = await Promise.all([
        playersRes.json().catch(() => []),
        requestsRes.json().catch(() => [])
      ])

      setPlayers(Array.isArray(playersPayload) ? playersPayload : [])
      setRequests(Array.isArray(requestsPayload) ? requestsPayload : [])
    } catch (e) {
      setError(e?.message || 'Failed to load players')
      setPlayers([])
      setRequests([])
    } finally {
      setLoading(false)
    }
  }, [user, token])

  useEffect(() => {
    loadData()
  }, [loadData])

  const mergedRows = useMemo(() => {
    const approvedPlayers = players.map(player => ({
      ...player,
      source: 'player',
      status: player.status || 'approved',
      requestReason: ''
    }))

    const pendingOrRejected = requests
      .filter(request => request.status === 'pending' || request.status === 'rejected')
      .map(request => ({
        id: request.id,
        playerId: request.playerId,
        fullName: request.fullName,
        email: request.email || '',
        commentaryName: request.commentaryName || '',
        jerseyNo: request.jerseyNo || '',
        nicOrPassport: request.nicOrPassport || '',
        dateOfBirth: request.dateOfBirth || '',
        residentStatus: request.residentStatus || 'local',
        visaNo: request.visaNo || '',
        position: request.position || 'Forward',
        photo: request.photo || null,
        status: request.status,
        requestReason: request.reviewReason || '',
        createdAt: request.createdAt || '',
        source: 'request'
      }))

    return [...approvedPlayers, ...pendingOrRejected]
  }, [players, requests])

  const playerCardsData = useMemo(() => {
    const approved = mergedRows.filter(row => row.status === 'approved').length
    const pending = mergedRows.filter(row => row.status === 'pending').length
    const rejected = mergedRows.filter(row => row.status === 'rejected').length

    return [
      { title: 'Total Players', value: String(mergedRows.length), avatarIcon: 'ri-user-line', avatarColor: 'primary', change: 'neutral', changeNumber: '0', subTitle: 'Approved + requests' },
      { title: 'Approved', value: String(approved), avatarIcon: 'ri-checkbox-circle-line', avatarColor: 'success', change: 'positive', changeNumber: '0', subTitle: 'Federation approved' },
      { title: 'Pending', value: String(pending), avatarIcon: 'ri-time-line', avatarColor: 'warning', change: 'neutral', changeNumber: '0', subTitle: 'Awaiting review' },
      { title: 'Rejected', value: String(rejected), avatarIcon: 'ri-close-circle-line', avatarColor: 'error', change: 'neutral', changeNumber: '0', subTitle: 'Needs correction' }
    ]
  }, [mergedRows])

  const columns = useMemo(
    () => [
      columnHelper.accessor('photo', {
        header: '',
        cell: ({ row }) => {
          const player = row.original
          const initials = player.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2) || '?'
          return (
            <CustomAvatar src={player.photo} size={36} color='primary' skin='light'>
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
          <Box>
            <Typography className='font-medium' color='text.primary'>
              {row.original.fullName}
            </Typography>
            {!!row.original.email && <Typography variant='caption' color='text.secondary'>{row.original.email}</Typography>}
          </Box>
        )
      }),
      columnHelper.accessor('position', { header: 'Position', cell: ({ row }) => <Typography variant='body2'>{row.original.position}</Typography> }),
      columnHelper.accessor('jerseyNo', { header: 'Jersey No', cell: ({ row }) => <Typography variant='body2'>{row.original.jerseyNo || '-'}</Typography> }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: ({ row }) => {
          const status = row.original.status
          const color = status === 'approved' ? 'success' : status === 'pending' ? 'warning' : 'error'
          return <Chip variant='tonal' size='small' label={status} color={color} />
        }
      }),
      columnHelper.accessor('requestReason', {
        header: 'Review Notes',
        cell: ({ row }) => (
          <Typography variant='body2' color='text.secondary'>
            {row.original.requestReason || '-'}
          </Typography>
        )
      }),
      columnHelper.accessor('action', {
        header: 'Actions',
        cell: ({ row }) => {
          const item = row.original
          const isApprovedRecord = item.source === 'player' && item.status === 'approved'

          if (!isApprovedRecord) return <Typography variant='caption' color='text.secondary'>No actions</Typography>

          return (
            <div className='flex items-center gap-1'>
              <IconButton
                size='small'
                onClick={() => {
                  setSelectedPlayer(item)
                  setEditDrawerOpen(true)
                }}
              >
                <i className='ri-edit-box-line text-[22px] text-textSecondary' />
              </IconButton>
              <OptionMenu
                iconClassName='text-[22px] text-textSecondary'
                options={[
                  {
                    text: 'ID Card',
                    icon: 'ri-qr-code-line text-[22px]',
                    menuItemProps: {
                      className: 'flex items-center gap-2 text-textSecondary',
                      onClick: () => {
                        setPlayerForIdCard(item)
                        setIdCardDialogOpen(true)
                      }
                    }
                  },
                  {
                    text: 'Edit',
                    icon: 'ri-edit-box-line text-[22px]',
                    menuItemProps: {
                      className: 'flex items-center gap-2 text-textSecondary',
                      onClick: () => {
                        setSelectedPlayer(item)
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
                        setPlayerToDelete(item)
                        setDeleteDialogOpen(true)
                      }
                    }
                  }
                ]}
              />
            </div>
          )
        },
        enableSorting: false
      })
    ],
    []
  )

  const table = useReactTable({
    data: mergedRows,
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
    if (!playerToDelete?.id) return

    try {
      const res = await fetch(`/api/club-players/${playerToDelete.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}))
        throw new Error(payload?.error || 'Failed to delete player')
      }
      notifySuccess('Player deleted successfully.')
      setDeleteDialogOpen(false)
      setPlayerToDelete(null)
      loadData()
    } catch (e) {
      setDeleteDialogOpen(false)
      setPlayerToDelete(null)
      setError(e?.message || 'Failed to delete player')
      notifyError(e, 'Failed to delete player')
    }
  }

  return (
    <>
      <div className='space-y-6'>
        <div>
          <Typography variant='h4' className='font-semibold mb-1'>
            Player Management
          </Typography>
          <Typography variant='body1' color='text.secondary'>
            Create player requests to federation, monitor approvals, and manage approved players.
          </Typography>
        </div>

        {requestSent && (
          <Alert severity='success' onClose={() => setRequestSent(false)}>
            Player registration request sent to federation admin.
          </Alert>
        )}

        {error && <Alert severity='error'>{error}</Alert>}

        <div className='grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'>
          {playerCardsData.map((item, i) => (
            <HorizontalWithSubtitle key={i} {...item} />
          ))}
        </div>

        <Card>
          <CardHeader
            title={`Players${club?.clubName ? ` - ${club.clubName}` : ''}`}
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
                  sx={{ minWidth: { xs: 0, sm: 220 }, flex: { xs: '1 1 auto', sm: '0 0 auto' } }}
                />
                <Button variant='contained' startIcon={<i className='ri-add-line' />} onClick={() => setAddDrawerOpen(true)} sx={{ flexShrink: 0 }} disabled={!club?.id}>
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
          {loading ? (
            <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
              <CircularProgress size={24} />
            </Box>
          ) : isMobile ? (
            <div className='p-4 flex flex-col gap-4'>
              {table.getFilteredRowModel().rows.length === 0 ? (
                <Typography color='text.secondary' className='text-center py-8'>No players found</Typography>
              ) : (
                table.getRowModel().rows.map(row => {
                  const player = row.original
                  const initials = player.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2) || '?'
                  const statusColor = player.status === 'approved' ? 'success' : player.status === 'pending' ? 'warning' : 'error'
                  return (
                    <Card
                      key={`${player.source}-${player.id}`}
                      elevation={0}
                      variant='outlined'
                      sx={{ borderRadius: 2, transition: 'box-shadow 0.2s ease', '&:hover': { boxShadow: 1 } }}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <CustomAvatar src={player.photo} size={44} color='primary' skin='light'>
                              {initials}
                            </CustomAvatar>
                            <Box>
                              <Typography variant='subtitle1' fontWeight={600} color='text.primary'>
                                {player.fullName}
                              </Typography>
                              <Typography variant='caption' color='text.secondary'>
                                {player.playerId} - #{player.jerseyNo || '-'} - {player.position}
                              </Typography>
                            </Box>
                          </Box>
                          <Chip variant='tonal' size='small' label={player.status} color={statusColor} />
                        </Box>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          {!!player.commentaryName && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <i className='ri-user-voice-line text-base text-textSecondary' />
                              <Typography variant='body2' color='text.secondary'>Commentary: {player.commentaryName}</Typography>
                            </Box>
                          )}
                          {!!player.email && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <i className='ri-mail-line text-base text-textSecondary' />
                              <Typography variant='body2' color='text.secondary'>{player.email}</Typography>
                            </Box>
                          )}
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <i className='ri-id-card-line text-base text-textSecondary' />
                            <Typography variant='body2' color='text.secondary'>NIC/Passport: {player.nicOrPassport || '-'}</Typography>
                          </Box>
                          {player.requestReason && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <i className='ri-error-warning-line text-base text-textSecondary' />
                              <Typography variant='body2' color='text.secondary'>Review: {player.requestReason}</Typography>
                            </Box>
                          )}
                        </Box>

                        {player.source === 'player' && player.status === 'approved' && (
                          <>
                            <Divider sx={{ my: 2 }} />
                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                              <Button size='small' variant='outlined' startIcon={<i className='ri-qr-code-line' />} onClick={() => { setPlayerForIdCard(player); setIdCardDialogOpen(true) }}>
                                ID Card
                              </Button>
                              <Button size='small' variant='outlined' startIcon={<i className='ri-edit-box-line' />} onClick={() => { setSelectedPlayer(player); setEditDrawerOpen(true) }}>
                                Edit
                              </Button>
                              <Button size='small' variant='outlined' color='error' startIcon={<i className='ri-delete-bin-7-line' />} onClick={() => { setPlayerToDelete(player); setDeleteDialogOpen(true) }}>
                                Delete
                              </Button>
                            </Box>
                          </>
                        )}
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
        clubId={club?.id || null}
        onRequestSent={() => {
          setRequestSent(true)
          loadData()
        }}
      />
      <EditPlayerDrawer
        open={editDrawerOpen}
        onClose={() => {
          setEditDrawerOpen(false)
          setSelectedPlayer(null)
        }}
        player={selectedPlayer}
        onSaved={() => loadData()}
      />

      <PlayerIdCardDialog
        open={idCardDialogOpen}
        onClose={() => {
          setIdCardDialogOpen(false)
          setPlayerForIdCard(null)
        }}
        player={playerForIdCard}
        clubName={club?.clubName}
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
