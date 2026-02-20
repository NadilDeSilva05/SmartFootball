'use client'

import { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

export default function EditClubDrawer ({ open, onClose, club }) {
  const [formData, setFormData] = useState({ name: '', city: '', adminEmail: '', status: 'active', logo: null })
  const [logoPreview, setLogoPreview] = useState(null)
  const [logoRemoved, setLogoRemoved] = useState(false)

  useEffect(() => {
    if (club) {
      setFormData({
        name: club.name,
        city: club.city,
        adminEmail: club.adminEmail || club.contactEmail || '',
        status: club.status,
        logo: null
      })
      setLogoPreview(null)
      setLogoRemoved(false)
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

  const handleSubmit = e => {
    e.preventDefault()
    onClose()
  }

  const displayLogoUrl = !logoRemoved && (logoPreview || club?.logo)

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
            <TextField fullWidth size='small' label='Club Name' value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
            <TextField fullWidth size='small' label='City' value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} />
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
            </Box>
            <TextField fullWidth size='small' label='Admin Email' type='email' value={formData.adminEmail} onChange={e => setFormData({ ...formData, adminEmail: e.target.value })} />
            <TextField fullWidth size='small' select SelectProps={{ native: true }} label='Status' value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
              <option value='active'>Active</option>
              <option value='pending'>Pending</option>
              <option value='inactive'>Inactive</option>
            </TextField>
            <div className='flex gap-2'>
              <Button type='submit' variant='contained'>Save</Button>
              <Button type='button' variant='outlined' color='secondary' onClick={onClose}>Cancel</Button>
            </div>
          </form>
        )}
      </div>
    </Drawer>
  )
}
