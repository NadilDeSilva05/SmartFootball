'use client'

import { useState, useEffect } from 'react'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import { notifyError, notifySuccess } from '@/utils/toast'

export default function EditLeagueDrawer ({ open, onClose, league, onSuccess }) {
  const [formData, setFormData] = useState({ name: '', season: '', status: 'active' })
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  useEffect(() => {
    if (league) {
      setFormData({
        name: league.name || '',
        season: league.season || '',
        status: league.status || 'active'
      })
      setSubmitError(null)
    }
  }, [league])

  const handleSubmit = async e => {
    e.preventDefault()
    if (!league?.id || !formData.name?.trim()) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      const res = await fetch(`/api/leagues/${league.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          season: formData.season || '',
          status: formData.status
        })
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setSubmitError(data?.error || 'Failed to update league')
        notifyError(data?.error || 'Failed to update league')
        return
      }
      notifySuccess('League updated successfully.')
      onClose()
      onSuccess?.()
    } catch (err) {
      setSubmitError(err?.message || 'Failed to update league')
      notifyError(err, 'Failed to update league')
    } finally {
      setSubmitting(false)
    }
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
            {submitError && <Alert severity='error' onClose={() => setSubmitError(null)}>{submitError}</Alert>}
            <div className='flex gap-2'>
              <Button type='submit' variant='contained' disabled={submitting} startIcon={submitting ? <CircularProgress size={18} /> : null}>
                {submitting ? 'Saving...' : 'Save'}
              </Button>
              <Button type='button' variant='outlined' color='secondary' onClick={onClose} disabled={submitting}>Cancel</Button>
            </div>
          </form>
        )}
      </div>
    </Drawer>
  )
}
