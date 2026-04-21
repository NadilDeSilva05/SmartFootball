'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
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
import TextField from '@mui/material/TextField'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import useMediaQuery from '@mui/material/useMediaQuery'
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
import OptionMenu from '@core/components/option-menu'
import HorizontalWithSubtitle from '@components/card-statistics/HorizontalWithSubtitle'
import ConfirmationDialog from '@components/dialogs/confirmation-dialog'
import AddCoachDrawer from '@views/club/components/coach/AddCoachDrawer'
import EditCoachDrawer from '@views/club/components/coach/EditCoachDrawer'
import tableStyles from '@core/styles/table.module.css'
import { LICENSE_OPTIONS, ROLE_OPTIONS } from '@views/club/constants'

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

const ClubCoachList = () => {
  const user = useSelector(state => state?.authenticationReducer?.loginData?.user)
  const token = useSelector(state => state?.authenticationReducer?.loginData?.token)

  const [club, setClub] = useState(null)
  const [coaches, setCoaches] = useState([])
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [globalFilter, setGlobalFilter] = useState('')
  const [addDrawerOpen, setAddDrawerOpen] = useState(false)
  const [editDrawerOpen, setEditDrawerOpen] = useState(false)
  const [selectedCoach, setSelectedCoach] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [coachToDelete, setCoachToDelete] = useState(null)
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
        setCoaches([])
        setRequests([])
        setError('Could not resolve your club. Please login with a club admin account.')
        return
      }

      setClub(currentClub)

      const [coachesRes, requestsRes] = await Promise.all([
        fetch(`/api/club-coaches?clubId=${encodeURIComponent(currentClub.id)}`, { cache: 'no-store' }),
        fetch(`/api/coach-requests?clubId=${encodeURIComponent(currentClub.id)}`, { cache: 'no-store' })
      ])

      if (!coachesRes.ok || !requestsRes.ok) {
        throw new Error('Failed to load coach management data')
      }

      const [coachesPayload, requestsPayload] = await Promise.all([
        coachesRes.json().catch(() => []),
        requestsRes.json().catch(() => [])
      ])

      setCoaches(Array.isArray(coachesPayload) ? coachesPayload : [])
      setRequests(Array.isArray(requestsPayload) ? requestsPayload : [])
    } catch (e) {
      setError(e?.message || 'Failed to load coaches')
      setCoaches([])
      setRequests([])
    } finally {
      setLoading(false)
    }
  }, [user, token])

  useEffect(() => {
    loadData()
  }, [loadData])

  const mergedRows = useMemo(() => {
    const approvedCoaches = coaches.map(coach => ({
      ...coach,
      source: 'coach',
      status: coach.status || 'approved',
      requestReason: ''
    }))

    const pendingOrRejected = requests
      .filter(request => request.status === 'pending' || request.status === 'rejected')
      .map(request => ({
        id: request.id,
        coachId: request.coachId,
        fullName: request.fullName,
        email: request.email || '',
        role: request.role || 'assistant_coach',
        license: request.license || '',
        nicOrPassport: request.nicOrPassport || '',
        dateOfBirth: request.dateOfBirth || '',
        status: request.status,
        requestReason: request.reviewReason || '',
        createdAt: request.createdAt || '',
        source: 'request'
      }))

    return [...approvedCoaches, ...pendingOrRejected]
  }, [coaches, requests])

  const coachCardsData = useMemo(() => {
    const approved = mergedRows.filter(row => row.status === 'approved').length
    const pending = mergedRows.filter(row => row.status === 'pending').length
    const rejected = mergedRows.filter(row => row.status === 'rejected').length

    return [
      { title: 'Total Coaches', value: String(mergedRows.length), avatarIcon: 'ri-user-star-line', avatarColor: 'primary', change: 'neutral', changeNumber: '0', subTitle: 'Approved + requests' },
      { title: 'Approved', value: String(approved), avatarIcon: 'ri-checkbox-circle-line', avatarColor: 'success', change: 'neutral', changeNumber: '0', subTitle: 'Federation approved' },
      { title: 'Pending', value: String(pending), avatarIcon: 'ri-time-line', avatarColor: 'warning', change: 'neutral', changeNumber: '0', subTitle: 'Awaiting review' },
      { title: 'Rejected', value: String(rejected), avatarIcon: 'ri-close-circle-line', avatarColor: 'error', change: 'neutral', changeNumber: '0', subTitle: 'Needs correction' }
    ]
  }, [mergedRows])

  const columns = useMemo(
    () => [
      columnHelper.accessor('coachId', { header: 'Coach Id', cell: ({ row }) => <Typography variant='body2'>{row.original.coachId}</Typography> }),
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
      columnHelper.accessor('role', {
        header: 'Role',
        cell: ({ row }) => <Typography variant='body2'>{ROLE_OPTIONS.find(o => o.value === row.original.role)?.label ?? row.original.role}</Typography>
      }),
      columnHelper.accessor('license', {
        header: 'License',
        cell: ({ row }) => {
          const item = row.original
          if (item.role === 'analyst') return <Typography variant='body2' color='text.secondary'>-</Typography>
          return <Chip variant='tonal' size='small' label={LICENSE_OPTIONS.find(o => o.value === item.license)?.label ?? item.license ?? '-'} color='primary' />
        }
      }),
      columnHelper.accessor('nicOrPassport', { header: 'NIC / Passport', cell: ({ row }) => <Typography variant='body2'>{row.original.nicOrPassport || '-'}</Typography> }),
      columnHelper.accessor('dateOfBirth', { header: 'DOB', cell: ({ row }) => <Typography variant='body2'>{row.original.dateOfBirth || '-'}</Typography> }),
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
          const isApprovedRecord = item.source === 'coach' && item.status === 'approved'
          if (!isApprovedRecord) return <Typography variant='caption' color='text.secondary'>No actions</Typography>

          return (
            <div className='flex items-center gap-1'>
              <IconButton size='small' onClick={() => { setSelectedCoach(item); setEditDrawerOpen(true) }}>
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
                        setSelectedCoach(item)
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
                        setCoachToDelete(item)
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
    if (!coachToDelete?.id) return
    try {
      const res = await fetch(`/api/club-coaches/${coachToDelete.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}))
        throw new Error(payload?.error || 'Failed to delete coach')
      }
      setDeleteDialogOpen(false)
      setCoachToDelete(null)
      loadData()
    } catch (e) {
      setDeleteDialogOpen(false)
      setCoachToDelete(null)
      setError(e?.message || 'Failed to delete coach')
    }
  }

  return (
    <>
      <div className='space-y-6'>
        <div>
          <Typography variant='h4' className='font-semibold mb-1'>
            Coach Management
          </Typography>
          <Typography variant='body1' color='text.secondary'>
            Create coach and analyst requests to federation, monitor approvals, and manage approved staff.
          </Typography>
        </div>

        {requestSent && (
          <Alert severity='success' onClose={() => setRequestSent(false)}>
            Coach registration request sent to federation admin.
          </Alert>
        )}

        {error && <Alert severity='error'>{error}</Alert>}

        <div className='grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'>
          {coachCardsData.map((item, i) => (
            <HorizontalWithSubtitle key={i} {...item} />
          ))}
        </div>

        <Card>
          <CardHeader
            title={`Coaches${club?.clubName ? ` - ${club.clubName}` : ''}`}
            action={
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { xs: 'stretch', sm: 'center' },
                  gap: 2,
                  width: { xs: '100%', sm: 'auto' },
                  minWidth: { xs: 0, sm: 220 }
                }}
              >
                <TextField
                  size='small'
                  placeholder='Search coaches...'
                  value={globalFilter ?? ''}
                  onChange={e => setGlobalFilter(e.target.value)}
                  sx={{ minWidth: { xs: 0, sm: 220 }, flex: { xs: '1 1 auto', sm: '0 0 auto' } }}
                />
                <Button variant='contained' startIcon={<i className='ri-add-line' />} onClick={() => setAddDrawerOpen(true)} sx={{ flexShrink: 0 }} disabled={!club?.id}>
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

          {loading ? (
            <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
              <CircularProgress size={24} />
            </Box>
          ) : isMobile ? (
            <div className='p-4 flex flex-col gap-4'>
              {table.getFilteredRowModel().rows.length === 0 ? (
                <Typography color='text.secondary' className='text-center py-8'>No coaches found</Typography>
              ) : (
                table.getRowModel().rows.map(row => {
                  const item = row.original
                  const licenseLabel = LICENSE_OPTIONS.find(o => o.value === item.license)?.label ?? item.license
                  const statusColor = item.status === 'approved' ? 'success' : item.status === 'pending' ? 'warning' : 'error'
                  return (
                    <Card key={`${item.source}-${item.id}`} elevation={0} variant='outlined' sx={{ borderRadius: 2, transition: 'box-shadow 0.2s ease', '&:hover': { boxShadow: 1 } }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, mb: 2 }}>
                          <Box>
                            <Typography variant='subtitle1' fontWeight={600} color='text.primary'>
                              {item.fullName}
                            </Typography>
                            <Typography variant='caption' color='text.secondary'>
                              {item.coachId} - {ROLE_OPTIONS.find(o => o.value === item.role)?.label ?? item.role}
                              {item.role !== 'analyst' && ` - License: ${licenseLabel || '-'}`}
                            </Typography>
                          </Box>
                          <Chip variant='tonal' size='small' label={item.status} color={statusColor} />
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          {!!item.email && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <i className='ri-mail-line text-base text-textSecondary' />
                              <Typography variant='body2' color='text.secondary'>{item.email}</Typography>
                            </Box>
                          )}
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <i className='ri-id-card-line text-base text-textSecondary' />
                            <Typography variant='body2' color='text.secondary'>NIC/Passport: {item.nicOrPassport || '-'}</Typography>
                          </Box>
                          {item.requestReason && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <i className='ri-error-warning-line text-base text-textSecondary' />
                              <Typography variant='body2' color='text.secondary'>Review: {item.requestReason}</Typography>
                            </Box>
                          )}
                        </Box>

                        {item.source === 'coach' && item.status === 'approved' && (
                          <>
                            <Divider sx={{ my: 2 }} />
                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                              <Button size='small' variant='outlined' startIcon={<i className='ri-edit-box-line' />} onClick={() => { setSelectedCoach(item); setEditDrawerOpen(true) }}>
                                Edit
                              </Button>
                              <Button size='small' variant='outlined' color='error' startIcon={<i className='ri-delete-bin-7-line' />} onClick={() => { setCoachToDelete(item); setDeleteDialogOpen(true) }}>
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
                        No coaches found
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

      <AddCoachDrawer
        open={addDrawerOpen}
        onClose={() => setAddDrawerOpen(false)}
        clubId={club?.id || null}
        onRequestSent={() => {
          setAddDrawerOpen(false)
          setRequestSent(true)
          loadData()
        }}
      />
      <EditCoachDrawer
        open={editDrawerOpen}
        onClose={() => {
          setEditDrawerOpen(false)
          setSelectedCoach(null)
        }}
        coach={selectedCoach}
        onSaved={() => loadData()}
      />
      <ConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false)
          setCoachToDelete(null)
        }}
        onConfirm={handleDeleteConfirm}
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
