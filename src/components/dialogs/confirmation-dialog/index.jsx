'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
  TextField,
  Alert
} from '@mui/material'

const ConfirmationDialog = ({
  open,
  title,
  content,
  onConfirm,
  onCancel,
  onClose,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmColor = 'error',
  requireDeleteConfirmation = false
}) => {
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [isDeleteConfirmed, setIsDeleteConfirmed] = useState(false)

  // Reset confirmation when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setDeleteConfirmation('')
      setIsDeleteConfirmed(false)
    }
  }, [open])

  // Check if delete confirmation is valid
  useEffect(() => {
    setIsDeleteConfirmed(deleteConfirmation.toLowerCase() === 'delete')
  }, [deleteConfirmation])

  const handleConfirm = () => {
    if (!requireDeleteConfirmation || isDeleteConfirmed) {
      onConfirm()
    }
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else if (onClose) {
      onClose()
    }
  }

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth='sm'
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2
        }
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', pb: 2 }}>
        <Box display='flex' flexDirection='column' alignItems='center' gap={2}>
          <i className='ri-error-warning-line text-warning text-[88px]' />
          <Typography variant='h5' component='h2'>
            {title}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ textAlign: 'center', px: 3 }}>
        <Typography variant='body1' color='text.secondary' sx={{ mb: 3 }}>
          {content}
        </Typography>

        {requireDeleteConfirmation && (
          <Box sx={{ mt: 3 }}>
            <Alert severity='warning' sx={{ mb: 2 }}>
              <Typography variant='body2'>
                This action cannot be undone. To confirm deletion, please type <strong>"delete"</strong> in the field
                below.
              </Typography>
            </Alert>
            <TextField
              fullWidth
              placeholder='Type "delete" to confirm'
              value={deleteConfirmation}
              onChange={e => setDeleteConfirmation(e.target.value)}
              variant='outlined'
              size='medium'
              error={deleteConfirmation !== '' && !isDeleteConfirmed}
              helperText={
                deleteConfirmation !== '' && !isDeleteConfirmed ? 'Please type "delete" exactly to confirm' : ''
              }
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            />
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'center', gap: 2, p: 3 }}>
        <Button onClick={handleCancel} variant='outlined' color='inherit' size='large'>
          {cancelText}
        </Button>
        <Button
          onClick={handleConfirm}
          variant='contained'
          color={confirmColor}
          size='large'
          disabled={requireDeleteConfirmation && !isDeleteConfirmed}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ConfirmationDialog
