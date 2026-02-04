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

// Hardcoded pending player requests
const PENDING_REQUESTS = [
  { id: '1', playerName: 'John Silva', club: 'City FC', jerseyNo: '10', position: 'Forward', requestedAt: '2025-02-01' },
  { id: '2', playerName: 'David Fernando', club: 'Rovers FC', jerseyNo: '1', position: 'Goalkeeper', requestedAt: '2025-02-02' }
]

// Approved players (can generate ID card)
const APPROVED_PLAYERS = [
  { id: 'a1', playerName: 'Maria Perera', club: 'City FC', jerseyNo: '7', position: 'Midfielder', playerId: 'PLR-2024-001' }
]

const PlayerRequests = () => {
  const [pending] = useState(PENDING_REQUESTS)
  const [approved] = useState(APPROVED_PLAYERS)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [idCardDialogOpen, setIdCardDialogOpen] = useState(false)
  const [selectedPlayer, setSelectedPlayer] = useState(null)

  const handleApprove = id => {
    // Hardcoded: would move from pending to approved
  }

  const handleReject = () => {
    if (selectedRequest) {
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
          Player Requests
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          Review, approve or reject player registration requests from clubs. After approval, generate player ID card PDF.
        </Typography>
      </div>

      <Card>
        <CardHeader title='Pending Requests' />
        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Player</TableCell>
                <TableCell>Club</TableCell>
                <TableCell>Jersey No</TableCell>
                <TableCell>Position</TableCell>
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
                      <Typography className='font-medium'>{req.playerName}</Typography>
                    </TableCell>
                    <TableCell>{req.club}</TableCell>
                    <TableCell>{req.jerseyNo}</TableCell>
                    <TableCell>{req.position}</TableCell>
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

      <Card>
        <CardHeader title='Approved Players (Generate ID Card)' />
        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Player</TableCell>
                <TableCell>Club</TableCell>
                <TableCell>Player ID</TableCell>
                <TableCell>Position</TableCell>
                <TableCell align='right'>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {approved.map(p => (
                <TableRow key={p.id}>
                  <TableCell>
                    <Typography className='font-medium'>{p.playerName}</Typography>
                  </TableCell>
                  <TableCell>{p.club}</TableCell>
                  <TableCell>
                    <Chip size='small' label={p.playerId} variant='tonal' color='primary' />
                  </TableCell>
                  <TableCell>{p.position}</TableCell>
                  <TableCell align='right'>
                    <Button size='small' variant='contained' startIcon={<i className='ri-file-pdf-line' />} onClick={() => { setSelectedPlayer(p); setIdCardDialogOpen(true) }}>
                      Generate ID Card PDF
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={rejectDialogOpen} onClose={() => { setRejectDialogOpen(false); setSelectedRequest(null) }} maxWidth='sm' fullWidth>
        <DialogTitle>Reject Player Request</DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <>
              <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                Rejecting request for <strong>{selectedRequest.playerName}</strong> ({selectedRequest.club}). Please provide a reason (required):
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                label='Rejection reason'
                placeholder='e.g. Incomplete documentation'
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

      <PlayerIdCardDialog open={idCardDialogOpen} onClose={() => { setIdCardDialogOpen(false); setSelectedPlayer(null) }} player={selectedPlayer} />
    </div>
  )
}

const PlayerIdCardDialog = ({ open, onClose, player }) => {
  if (!player) return null
  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
      <DialogTitle className='flex items-center justify-between'>
        <span>Player ID Card Preview</span>
        <IconButton size='small' onClick={onClose}><i className='ri-close-line' /></IconButton>
      </DialogTitle>
      <DialogContent>
        <Box
          sx={{
            border: '2px solid',
            borderColor: 'divider',
            borderRadius: 2,
            p: 3,
            bgcolor: 'background.paper',
            textAlign: 'center'
          }}
        >
          <Typography variant='overline' color='primary'>Federation Official Player ID</Typography>
          <Typography variant='h5' sx={{ mt: 1, fontWeight: 'bold' }}>{player.playerName}</Typography>
          <Typography variant='body2' color='text.secondary'>{player.club} • {player.position} • #{player.jerseyNo}</Typography>
          <Chip label={player.playerId} size='small' sx={{ mt: 1 }} color='primary' variant='tonal' />
          <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1, display: 'inline-block' }}>
            <Typography variant='caption' color='text.secondary'>QR Code</Typography>
            <Box sx={{ width: 80, height: 80, bgcolor: 'grey.300', borderRadius: 1, mx: 'auto', mt: 0.5 }} />
          </Box>
          <Typography variant='caption' display='block' sx={{ mt: 2 }}>Valid for current season. Generated by Federation Admin.</Typography>
        </Box>
        <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'center' }}>
          <Button variant='contained' startIcon={<i className='ri-download-line' />}>
            Download PDF
          </Button>
          <Button variant='outlined' onClick={onClose}>Close</Button>
        </Box>
      </DialogContent>
    </Dialog>
  )
}

export default PlayerRequests
