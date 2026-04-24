'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Chip from '@mui/material/Chip'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import useMediaQuery from '@mui/material/useMediaQuery'
import HorizontalWithSubtitle from '@components/card-statistics/HorizontalWithSubtitle'
import { LICENSE_OPTIONS, ROLE_OPTIONS } from '@views/club/constants'
import { notifyError, notifySuccess } from '@/utils/toast'

const dateText = value => (value ? value.slice(0, 10) : '-')

const CoachRequests = () => {
  const [requests, setRequests] = useState([])
  const [clubs, setClubs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [reviewSubmitting, setReviewSubmitting] = useState(false)

  const [detailsOpen, setDetailsOpen] = useState(false)
  const [selectedDetails, setSelectedDetails] = useState(null)
  const isMobile = useMediaQuery(theme => theme.breakpoints.down('md'))

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError('')

      const [requestsRes, clubsRes] = await Promise.all([
        fetch('/api/coach-requests', { cache: 'no-store' }),
        fetch('/api/clubs', { cache: 'no-store' })
      ])

      if (!requestsRes.ok || !clubsRes.ok) {
        throw new Error('Failed to load coach requests')
      }

      const [requestsPayload, clubsPayload] = await Promise.all([
        requestsRes.json().catch(() => []),
        clubsRes.json().catch(() => [])
      ])

      setRequests(Array.isArray(requestsPayload) ? requestsPayload : [])
      setClubs(Array.isArray(clubsPayload) ? clubsPayload : [])
    } catch (e) {
      setError(e?.message || 'Failed to load coach requests')
      setRequests([])
      setClubs([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const clubMap = useMemo(() => {
    const map = {}
    clubs.forEach(club => {
      map[club.id] = club.clubName || club.name || '-'
    })
    return map
  }, [clubs])

  const pending = useMemo(() => requests.filter(r => r.status === 'pending'), [requests])
  const approved = useMemo(() => requests.filter(r => r.status === 'approved'), [requests])
  const rejected = useMemo(() => requests.filter(r => r.status === 'rejected'), [requests])

  const cards = useMemo(() => [
    { title: 'Pending', value: String(pending.length), avatarIcon: 'ri-time-line', avatarColor: 'warning', change: 'neutral', changeNumber: '0', subTitle: 'Waiting for review' },
    { title: 'Approved', value: String(approved.length), avatarIcon: 'ri-checkbox-circle-line', avatarColor: 'success', change: 'neutral', changeNumber: '0', subTitle: 'Accepted requests' },
    { title: 'Rejected', value: String(rejected.length), avatarIcon: 'ri-close-circle-line', avatarColor: 'error', change: 'neutral', changeNumber: '0', subTitle: 'Rejected requests' }
  ], [pending.length, approved.length, rejected.length])

  const handleApprove = async requestId => {
    try {
      setReviewSubmitting(true)
      const res = await fetch(`/api/coach-requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' })
      })
      const payload = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(payload?.error || 'Failed to approve request')
      notifySuccess('Coach request approved successfully.')
      loadData()
    } catch (e) {
      setError(e?.message || 'Failed to approve request')
      notifyError(e, 'Failed to approve coach request')
    } finally {
      setReviewSubmitting(false)
    }
  }

  const handleReject = async () => {
    if (!selectedRequest?.id || !rejectReason.trim()) return

    try {
      setReviewSubmitting(true)
      const res = await fetch(`/api/coach-requests/${selectedRequest.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected', reason: rejectReason.trim() })
      })
      const payload = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(payload?.error || 'Failed to reject request')

      notifySuccess('Coach request rejected successfully.')
      setRejectDialogOpen(false)
      setSelectedRequest(null)
      setRejectReason('')
      loadData()
    } catch (e) {
      setError(e?.message || 'Failed to reject request')
      notifyError(e, 'Failed to reject coach request')
    } finally {
      setReviewSubmitting(false)
    }
  }

  const openRejectDialog = request => {
    setSelectedRequest(request)
    setRejectReason('')
    setRejectDialogOpen(true)
  }

  const openDetails = request => {
    setSelectedDetails(request)
    setDetailsOpen(true)
  }

  return (
    <div className='space-y-6'>
      <div>
        <Typography variant='h4' className='font-semibold mb-1'>
          Coach Requests
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          Review club coach and analyst registration requests, inspect details, and approve or reject.
        </Typography>
      </div>

      {error && <Alert severity='error'>{error}</Alert>}

      <div className='grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'>
        {cards.map((item, i) => (
          <HorizontalWithSubtitle key={i} {...item} />
        ))}
      </div>

      <Card>
        <CardHeader title='Pending Requests' />
        <CardContent>
          {loading ? (
            <Box sx={{ py: 3, display: 'flex', justifyContent: 'center' }}>
              <CircularProgress size={22} />
            </Box>
          ) : isMobile ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {pending.length === 0 ? (
                <Typography align='center' color='text.secondary'>No pending requests</Typography>
              ) : (
                pending.map(request => (
                  <Card key={request.id} elevation={0} variant='outlined'>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap', mb: 1.5 }}>
                        <Box>
                          <Typography className='font-medium'>{request.fullName}</Typography>
                          <Typography variant='caption' color='text.secondary'>{request.coachId}</Typography>
                        </Box>
                        <Chip size='small' variant='tonal' label={ROLE_OPTIONS.find(o => o.value === request.role)?.label ?? request.role} />
                      </Box>
                      <Box sx={{ display: 'grid', gap: 0.75 }}>
                        <Typography variant='body2' color='text.secondary'>Club: {clubMap[request.clubId] || '-'}</Typography>
                        <Typography variant='body2' color='text.secondary'>
                          License: {request.role === 'analyst' ? '-' : (LICENSE_OPTIONS.find(o => o.value === request.license)?.label ?? request.license ?? '-')}
                        </Typography>
                        <Typography variant='body2' color='text.secondary'>Requested: {dateText(request.createdAt)}</Typography>
                      </Box>
                      <Divider sx={{ my: 2 }} />
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Button size='small' variant='outlined' onClick={() => openDetails(request)}>Details</Button>
                        <Button size='small' color='success' variant='outlined' disabled={reviewSubmitting} onClick={() => handleApprove(request.id)}>Approve</Button>
                        <Button size='small' color='error' variant='outlined' disabled={reviewSubmitting} onClick={() => openRejectDialog(request)}>Reject</Button>
                      </Box>
                    </CardContent>
                  </Card>
                ))
              )}
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Coach</TableCell>
                  <TableCell>Club</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>License</TableCell>
                  <TableCell>Requested</TableCell>
                  <TableCell align='right'>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pending.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align='center'>No pending requests</TableCell>
                  </TableRow>
                ) : (
                  pending.map(request => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <Typography className='font-medium'>{request.fullName}</Typography>
                        <Typography variant='caption' color='text.secondary'>{request.coachId}</Typography>
                      </TableCell>
                      <TableCell>{clubMap[request.clubId] || '-'}</TableCell>
                      <TableCell>{ROLE_OPTIONS.find(o => o.value === request.role)?.label ?? request.role}</TableCell>
                      <TableCell>{request.role === 'analyst' ? '-' : (LICENSE_OPTIONS.find(o => o.value === request.license)?.label ?? request.license ?? '-')}</TableCell>
                      <TableCell>{dateText(request.createdAt)}</TableCell>
                      <TableCell align='right'>
                        <Button size='small' variant='outlined' sx={{ mr: 1 }} onClick={() => openDetails(request)}>
                          Details
                        </Button>
                        <Button size='small' color='success' variant='outlined' sx={{ mr: 1 }} disabled={reviewSubmitting} onClick={() => handleApprove(request.id)}>
                          Approve
                        </Button>
                        <Button size='small' color='error' variant='outlined' disabled={reviewSubmitting} onClick={() => openRejectDialog(request)}>
                          Reject
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader title='Reviewed Requests' />
        <CardContent>
          {isMobile ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[...approved, ...rejected].length === 0 ? (
                <Typography align='center' color='text.secondary'>No reviewed requests</Typography>
              ) : (
                [...approved, ...rejected].map(request => (
                  <Card key={request.id} elevation={0} variant='outlined'>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap', mb: 1.5 }}>
                        <Box>
                          <Typography className='font-medium'>{request.fullName}</Typography>
                          <Typography variant='caption' color='text.secondary'>{request.coachId}</Typography>
                        </Box>
                        <Chip size='small' variant='tonal' label={request.status} color={request.status === 'approved' ? 'success' : 'error'} />
                      </Box>
                      <Box sx={{ display: 'grid', gap: 0.75 }}>
                        <Typography variant='body2' color='text.secondary'>Club: {clubMap[request.clubId] || '-'}</Typography>
                        <Typography variant='body2' color='text.secondary'>Reviewed: {dateText(request.reviewedAt || request.updatedAt)}</Typography>
                        <Typography variant='body2' color='text.secondary'>Notes: {request.reviewReason || '-'}</Typography>
                      </Box>
                      <Divider sx={{ my: 2 }} />
                      <Button size='small' variant='outlined' fullWidth onClick={() => openDetails(request)}>View details</Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Coach</TableCell>
                  <TableCell>Club</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Reviewed At</TableCell>
                  <TableCell>Notes</TableCell>
                  <TableCell align='right'>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {[...approved, ...rejected].length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align='center'>No reviewed requests</TableCell>
                  </TableRow>
                ) : (
                  [...approved, ...rejected].map(request => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <Typography className='font-medium'>{request.fullName}</Typography>
                        <Typography variant='caption' color='text.secondary'>{request.coachId}</Typography>
                      </TableCell>
                      <TableCell>{clubMap[request.clubId] || '-'}</TableCell>
                      <TableCell>
                        <Chip
                          size='small'
                          variant='tonal'
                          label={request.status}
                          color={request.status === 'approved' ? 'success' : 'error'}
                        />
                      </TableCell>
                      <TableCell>{dateText(request.reviewedAt || request.updatedAt)}</TableCell>
                      <TableCell>{request.reviewReason || '-'}</TableCell>
                      <TableCell align='right'>
                        <Button size='small' variant='outlined' onClick={() => openDetails(request)}>View</Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={rejectDialogOpen} onClose={() => { setRejectDialogOpen(false); setSelectedRequest(null) }} maxWidth='sm' fullWidth>
        <DialogTitle>Reject Coach Request</DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <>
              <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                Rejecting request for <strong>{selectedRequest.fullName}</strong> ({clubMap[selectedRequest.clubId] || '-'})
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                label='Rejection reason'
                placeholder='Explain why this request is rejected'
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                required
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setRejectDialogOpen(false); setSelectedRequest(null) }}>Cancel</Button>
          <Button variant='contained' color='error' onClick={handleReject} disabled={!rejectReason.trim() || reviewSubmitting}>
            Reject Request
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={detailsOpen} onClose={() => { setDetailsOpen(false); setSelectedDetails(null) }} maxWidth='md' fullWidth>
        <DialogTitle className='flex items-center justify-between'>
          <span>Coach Request Details</span>
          <IconButton size='small' onClick={() => { setDetailsOpen(false); setSelectedDetails(null) }}><i className='ri-close-line' /></IconButton>
        </DialogTitle>
        <DialogContent>
          {!selectedDetails ? null : (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '180px 1fr' }, rowGap: 1.2, columnGap: 2 }}>
              <Typography color='text.secondary'>Coach Name</Typography><Typography>{selectedDetails.fullName || '-'}</Typography>
              <Typography color='text.secondary'>Coach ID</Typography><Typography>{selectedDetails.coachId || '-'}</Typography>
              <Typography color='text.secondary'>Club</Typography><Typography>{clubMap[selectedDetails.clubId] || '-'}</Typography>
              <Typography color='text.secondary'>Email</Typography><Typography>{selectedDetails.email || '-'}</Typography>
              <Typography color='text.secondary'>Role</Typography><Typography>{ROLE_OPTIONS.find(o => o.value === selectedDetails.role)?.label ?? selectedDetails.role ?? '-'}</Typography>
              <Typography color='text.secondary'>License</Typography><Typography>{selectedDetails.role === 'analyst' ? '-' : (LICENSE_OPTIONS.find(o => o.value === selectedDetails.license)?.label ?? selectedDetails.license ?? '-')}</Typography>
              <Typography color='text.secondary'>NIC/Passport</Typography><Typography>{selectedDetails.nicOrPassport || '-'}</Typography>
              <Typography color='text.secondary'>Date of Birth</Typography><Typography>{selectedDetails.dateOfBirth || '-'}</Typography>
              <Typography color='text.secondary'>Status</Typography><Typography>{selectedDetails.status || '-'}</Typography>
              <Typography color='text.secondary'>Submitted At</Typography><Typography>{selectedDetails.createdAt || '-'}</Typography>
              <Typography color='text.secondary'>Review Notes</Typography><Typography>{selectedDetails.reviewReason || '-'}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button variant='outlined' onClick={() => { setDetailsOpen(false); setSelectedDetails(null) }}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default CoachRequests
