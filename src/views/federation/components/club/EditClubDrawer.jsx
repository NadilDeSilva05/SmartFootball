'use client'

import { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import FormHelperText from '@mui/material/FormHelperText'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import { notifyError, notifySuccess } from '@/utils/toast'

const fileToBase64 = file =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

export default function EditClubDrawer ({ open, onClose, club, onSuccess }) {
  const [formData, setFormData] = useState({ clubName: '', city: '', adminEmail: '', status: 'active', logo: null })
  const [logoPreview, setLogoPreview] = useState(null)
  const [logoRemoved, setLogoRemoved] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  useEffect(() => {
    if (club) {
      setFormData({
        clubName: club.clubName || club.name || '',
        city: club.city || '',
        adminEmail: club.adminEmail || club.contactEmail || '',
        status: club.status || 'active',
        logo: null
      })
      setLogoPreview(null)
      setLogoRemoved(false)
      setSubmitError(null)
    }
  }, [club])

  const handleLogoChange = e => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData(prev => ({ ...prev, logo: file }))
      setLogoPreview(URL.createObjectURL(file))
      setLogoRemoved(false)
    }
  }

  const handleRemoveLogo = () => {
    setFormData(prev => ({ ...prev, logo: null }))
    if (logoPreview) URL.revokeObjectURL(logoPreview)
    setLogoPreview(null)
    setLogoRemoved(true)
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!club?.id) return

    setSubmitting(true)
    setSubmitError(null)

    try {
      let logoValue = undefined
      if (formData.logo) {
        logoValue = await fileToBase64(formData.logo)
      } else if (logoRemoved) {
        logoValue = null
      } else if (club.logo && !logoRemoved) {
        logoValue = club.logo
      }

      const body = {
        clubName: formData.clubName,
        city: formData.city,
        adminEmail: formData.adminEmail,
        status: formData.status
      }
      if (logoValue !== undefined) body.logo = logoValue

      const res = await fetch(`/api/clubs/${club.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setSubmitError(data?.error || 'Failed to update club')
        notifyError(data?.error || 'Failed to update club')
        return
      }

      notifySuccess('Club updated successfully.')
      onClose()
      onSuccess?.()
    } catch (err) {
      setSubmitError(err?.message || 'Failed to update club')
      notifyError(err, 'Failed to update club')
    } finally {
      setSubmitting(false)
    }
  }

  const displayLogoUrl = !logoRemoved && (logoPreview || (club?.logo && typeof club.logo === 'string' ? club.logo : null))

  return (
    <Drawer open={open} anchor='right' variant='temporary' onClose={onClose} ModalProps={{ keepMounted: true }} sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}>
      <div className='flex items-center justify-between pli-5 plb-[15px]'>
        <Typography variant='h5'>Edit Club</Typography>
        <IconButton onClick={onClose} size='small'>
          <i className='ri-close-line' />
        </IconButton>
      </div>
      <Divider />
      <div className='p-5'>
        {club && (
          <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
            <TextField
              fullWidth
              size='small'
              label='Club Name'
              value={formData.clubName}
              onChange={e => setFormData(prev => ({ ...prev, clubName: e.target.value }))}
              required
            />
            <TextField
              fullWidth
              size='small'
              label='City'
              value={formData.city}
              onChange={e => setFormData(prev => ({ ...prev, city: e.target.value }))}
            />
            <Box>
              <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>Club Logo</Typography>
              {displayLogoUrl ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                  <Box
                    component='img'
                    src={displayLogoUrl}
                    alt='Club logo'
                    sx={{ width: 80, height: 80, borderRadius: 2, objectFit: 'contain', border: '1px solid', borderColor: 'divider', bgcolor: 'action.hover' }}
                  />
                  <Button type='button' size='small' variant='outlined' color='error' onClick={handleRemoveLogo}>
                    Remove
                  </Button>
                  {!logoPreview && (
                    <Button type='button' variant='outlined' size='small' component='label' startIcon={<i className='ri-upload-2-line' />}>
                      Replace
                      <input type='file' accept='image/*' onChange={handleLogoChange} hidden />
                    </Button>
                  )}
                </Box>
              ) : (
                <Button type='button' variant='outlined' size='small' component='label' startIcon={<i className='ri-upload-2-line' />}>
                  Upload Logo
                  <input type='file' accept='image/*' onChange={handleLogoChange} hidden />
                </Button>
              )}
              <FormHelperText sx={{ mt: 0.5 }}>Keep under 500 KB to stay within limits</FormHelperText>
            </Box>
            <TextField
              fullWidth
              size='small'
              label='Admin Email'
              type='email'
              value={formData.adminEmail}
              onChange={e => setFormData(prev => ({ ...prev, adminEmail: e.target.value }))}
            />
            <TextField
              fullWidth
              size='small'
              select
              SelectProps={{ native: true }}
              label='Status'
              value={formData.status}
              onChange={e => setFormData(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value='active'>Active</option>
              <option value='pending'>Pending</option>
              <option value='inactive'>Inactive</option>
            </TextField>
            {submitError && (
              <Alert severity='error' onClose={() => setSubmitError(null)}>{submitError}</Alert>
            )}
            <div className='flex gap-2'>
              <Button type='submit' variant='contained' disabled={submitting} startIcon={submitting ? <CircularProgress size={18} /> : null}>
                {submitting ? 'Saving...' : 'Save'}
              </Button>
              <Button type='button' variant='outlined' color='secondary' onClick={onClose} disabled={submitting}>
                Cancel
              </Button>
            </div>
          </form>
        )}
      </div>
    </Drawer>
  )
}
