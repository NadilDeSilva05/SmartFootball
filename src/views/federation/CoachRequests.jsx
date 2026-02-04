'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'

const PENDING_COACH_REQUESTS = [
  { id: '1', name: 'Michael Brown', club: 'City FC', role: 'Assistant Coach', email: 'michael@club.com', requestedAt: '2025-02-02' },
  { id: '2', name: 'Sarah Gomes', club: 'Rovers FC', role: 'Analyst', email: 'sarah@club.com', requestedAt: '2025-02-03' }
]

const CoachRequests = () => {
  const [pending, setPending] = useState(PENDING_COACH_REQUESTS)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [rejectReason, setRejectReason] = useState('')

  const handleApprove = id => {
    setPending(prev => prev.filter(r => r.id !== id))
  }

  const handleReject = () => {
    if (selectedRequest) {
      setPending(prev => prev.filter(r => r.id !== selectedRequest.id))
      setRejectDialogOpen(false)
      setSelectedRequest(null)
      setRejectReason('')
    }
  }

  const openRejectDialog = request => {
    setSelectedRequest(request)
    setRejectReason('')
    setRejectDialogOpen(true)
  }

  return (
    <div className='space-y-6'>
      <div>
        <Typography variant='h4' className='font-semibold mb-1'>
          Coach Requests
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          Review, approve or reject coach/analyst registration requests from clubs. If rejecting, provide a reason.
        </Typography>
      </div>

      <Card>
        <CardHeader title='Pending Coach / Analyst Requests' />
        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Club</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Requested</TableCell>
                <TableCell align='right'>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pending.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align='center'>
                    No pending requests
                  </TableCell>
                </TableRow>
              ) : (
                pending.map(req => (
                  <TableRow key={req.id}>
                    <TableCell>
                      <Typography className='font-medium'>{req.name}</Typography>
                    </TableCell>
                    <TableCell>{req.club}</TableCell>
                    <TableCell>{req.role}</TableCell>
                    <TableCell>{req.email}</TableCell>
                    <TableCell>{req.requestedAt}</TableCell>
                    <TableCell align='right'>
                      <Button size='small' color='success' variant='outlined' sx={{ mr: 1 }} onClick={() => handleApprove(req.id)}>
                        Approve
                      </Button>
                      <Button size='small' color='error' variant='outlined' onClick={() => openRejectDialog(req)}>
                        Reject
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={rejectDialogOpen} onClose={() => { setRejectDialogOpen(false); setSelectedRequest(null) }} maxWidth='sm' fullWidth>
        <DialogTitle>Reject Coach Request</DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <>
              <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                Rejecting request for <strong>{selectedRequest.name}</strong> ({selectedRequest.club}). Please provide a reason (required):
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                label='Rejection reason'
                placeholder='e.g. Certification not verified'
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                required
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setRejectDialogOpen(false); setSelectedRequest(null) }}>Cancel</Button>
          <Button variant='contained' color='error' onClick={handleReject} disabled={!rejectReason?.trim()}>
            Reject Request
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default CoachRequests
