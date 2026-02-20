'use client'

import { useState } from 'react'
import Drawer from '@mui/material/Drawer'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Box from '@mui/material/Box'
import { POSITION_OPTIONS } from '@views/club/constants'

export default function AddPlayerDrawer ({ open, onClose, onRequestSent }) {
  const [formData, setFormData] = useState({
    playerId: '',
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    commentaryName: '',
    jerseyNo: '',
    nicOrPassport: '',
    dateOfBirth: '',
    residentStatus: 'local',
    visaNo: '',
    position: 'Forward',
    photo: null
  })
  const [formErrors, setFormErrors] = useState({})
  const [photoPreview, setPhotoPreview] = useState(null)

  const resetForm = () => {
    setFormData({
      playerId: '',
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      commentaryName: '',
      jerseyNo: '',
      nicOrPassport: '',
      dateOfBirth: '',
      residentStatus: 'local',
      visaNo: '',
      position: 'Forward',
      photo: null
    })
    setFormErrors({})
    setPhotoPreview(null)
  }

  const handlePhotoChange = e => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData(prev => ({ ...prev, photo: file }))
      setPhotoPreview(URL.createObjectURL(file))
    }
  }

  const handleRemovePhoto = () => {
    setFormData(prev => ({ ...prev, photo: null }))
    if (photoPreview) URL.revokeObjectURL(photoPreview)
    setPhotoPreview(null)
  }

  const handleSubmit = e => {
    e.preventDefault()
    const errors = {}
    if (!formData.email?.trim()) errors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Enter a valid email'
    if (!formData.password) errors.password = 'Password is required'
    else if (formData.password.length < 6) errors.password = 'Password must be at least 6 characters'
    if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Passwords do not match'
    setFormErrors(errors)
    if (Object.keys(errors).length > 0) return
    onRequestSent()
    resetForm()
  }

  return (
    <Drawer
      open={open}
      anchor='right'
      variant='temporary'
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: 320, sm: 420 } } }}
    >
      <div className='flex items-center justify-between pli-5 plb-[15px]'>
        <Typography variant='h5'>Add Player (Request to Federation)</Typography>
        <IconButton onClick={onClose} size='small'>
          <i className='ri-close-line' />
        </IconButton>
      </div>
      <Divider />
      <div className='p-5 overflow-y-auto'>
        <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
          This will send a registration request to the federation admin for approval.
        </Typography>
        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
          <TextField fullWidth size='small' label='Player Id' value={formData.playerId} onChange={e => setFormData({ ...formData, playerId: e.target.value })} required />
          <TextField fullWidth size='small' label='Player Full Name' value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} required />
          <TextField fullWidth size='small' label='Email' type='email' value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} error={!!formErrors.email} helperText={formErrors.email} required />
          <TextField fullWidth size='small' label='Password' type='password' value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} error={!!formErrors.password} helperText={formErrors.password} required />
          <TextField fullWidth size='small' label='Confirm Password' type='password' value={formData.confirmPassword} onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })} error={!!formErrors.confirmPassword} helperText={formErrors.confirmPassword} required />
          <TextField fullWidth size='small' label='Commentary Name' value={formData.commentaryName} onChange={e => setFormData({ ...formData, commentaryName: e.target.value })} placeholder='Name used in commentary' />
          <TextField fullWidth size='small' label='Jersey Number' value={formData.jerseyNo} onChange={e => setFormData({ ...formData, jerseyNo: e.target.value })} placeholder='e.g. 10' />
          <TextField fullWidth size='small' label='NIC No. or Passport Number' value={formData.nicOrPassport} onChange={e => setFormData({ ...formData, nicOrPassport: e.target.value })} required />
          <TextField fullWidth size='small' label='Date of Birth' type='date' value={formData.dateOfBirth} onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })} InputLabelProps={{ shrink: true }} required />
          <FormControl fullWidth size='small'>
            <InputLabel id='resident-status-label'>Resident Status</InputLabel>
            <Select labelId='resident-status-label' label='Resident Status' value={formData.residentStatus} onChange={e => setFormData({ ...formData, residentStatus: e.target.value })}>
              <MenuItem value='local'>Local</MenuItem>
              <MenuItem value='foreign'>Foreign</MenuItem>
            </Select>
          </FormControl>
          {formData.residentStatus === 'foreign' && (
            <TextField fullWidth size='small' label='Visa No.' value={formData.visaNo} onChange={e => setFormData({ ...formData, visaNo: e.target.value })} required />
          )}
          <FormControl fullWidth size='small'>
            <InputLabel id='position-label'>Player Position</InputLabel>
            <Select labelId='position-label' label='Player Position' value={formData.position} onChange={e => setFormData({ ...formData, position: e.target.value })}>
              {POSITION_OPTIONS.map(pos => (
                <MenuItem key={pos} value={pos}>{pos}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>Player Photo</Typography>
            {photoPreview ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Box component='img' src={photoPreview} alt='Preview' sx={{ width: 80, height: 80, borderRadius: 2, objectFit: 'cover', border: '1px solid', borderColor: 'divider' }} />
                <Button type='button' size='small' variant='outlined' color='error' onClick={handleRemovePhoto}>Remove</Button>
              </Box>
            ) : (
              <Button type='button' variant='outlined' size='small' component='label' startIcon={<i className='ri-upload-2-line' />}>
                Upload Photo
                <input type='file' accept='image/*' onChange={handlePhotoChange} hidden />
              </Button>
            )}
          </Box>
          <div className='flex gap-2 mt-2'>
            <Button type='submit' variant='contained'>Send Request to Federation</Button>
            <Button type='button' variant='outlined' color='secondary' onClick={onClose}>Cancel</Button>
          </div>
        </form>
      </div>
    </Drawer>
  )
}
