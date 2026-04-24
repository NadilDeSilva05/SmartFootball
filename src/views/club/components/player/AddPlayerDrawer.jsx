'use client'

import { useEffect, useState } from 'react'
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
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import { POSITION_OPTIONS } from '@views/club/constants'
import { notifyError, notifySuccess } from '@/utils/toast'

export default function AddPlayerDrawer ({ open, onClose, clubId, onRequestSent }) {
  const [formData, setFormData] = useState({
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
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview)
    }
  }, [photoPreview])

  const resetForm = () => {
    setFormData({
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
    if (photoPreview) URL.revokeObjectURL(photoPreview)
    setPhotoPreview(null)
    setSubmitError('')
  }

  const handlePhotoChange = e => {
    const file = e.target.files?.[0]
    if (!file) return

    setFormData(prev => ({ ...prev, photo: file }))
    if (photoPreview) URL.revokeObjectURL(photoPreview)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const handleRemovePhoto = () => {
    setFormData(prev => ({ ...prev, photo: null }))
    if (photoPreview) URL.revokeObjectURL(photoPreview)
    setPhotoPreview(null)
  }

  const fileToBase64 = file =>
    new Promise((resolve, reject) => {
      if (!file) return resolve(null)
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

  const handleSubmit = async e => {
    e.preventDefault()
    const errors = {}

    if (!clubId) errors.club = 'Club is not resolved for this login. Please re-login.'
    if (!formData.fullName?.trim()) errors.fullName = 'Player name is required'
    if (!formData.email?.trim()) errors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Enter a valid email'
    if (!formData.password) errors.password = 'Password is required for player login'
    else if (formData.password.length < 6) errors.password = 'Password must be at least 6 characters'
    if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Passwords do not match'
    if (!formData.nicOrPassport?.trim()) errors.nicOrPassport = 'NIC/Passport is required'
    if (!formData.dateOfBirth) errors.dateOfBirth = 'Date of birth is required'
    if (formData.residentStatus === 'foreign' && !formData.visaNo?.trim()) errors.visaNo = 'Visa number is required for foreign players'

    setFormErrors(errors)
    if (Object.keys(errors).length > 0) return

    try {
      setSubmitting(true)
      setSubmitError('')

      const photoValue = await fileToBase64(formData.photo)
      const res = await fetch('/api/player-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clubId,
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          commentaryName: formData.commentaryName,
          jerseyNo: formData.jerseyNo,
          nicOrPassport: formData.nicOrPassport,
          dateOfBirth: formData.dateOfBirth,
          residentStatus: formData.residentStatus,
          visaNo: formData.visaNo,
          position: formData.position,
          photo: photoValue
        })
      })

      const payload = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(payload?.error || 'Failed to submit player request')
      }

      notifySuccess('Player request sent to federation successfully.')
      onRequestSent?.()
      resetForm()
      onClose?.()
    } catch (error) {
      setSubmitError(error?.message || 'Failed to submit player request')
      notifyError(error, 'Failed to submit player request')
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
          This sends a registration request to federation admin for review and approval.
        </Typography>

        {submitError && <Alert severity='error' sx={{ mb: 2 }}>{submitError}</Alert>}
        {formErrors.club && <Alert severity='warning' sx={{ mb: 2 }}>{formErrors.club}</Alert>}

        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
          <Alert severity='info'>
            Player ID will be generated automatically when you submit.
          </Alert>
          <TextField fullWidth size='small' label='Player Full Name' value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} error={!!formErrors.fullName} helperText={formErrors.fullName} required />
          <TextField fullWidth size='small' label='Email' type='email' value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} error={!!formErrors.email} helperText={formErrors.email} required />
          <TextField fullWidth size='small' label='Password' type='password' value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} error={!!formErrors.password} helperText={formErrors.password} placeholder='For player login (min 6 characters)' required />
          <TextField fullWidth size='small' label='Confirm Password' type='password' value={formData.confirmPassword} onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })} error={!!formErrors.confirmPassword} helperText={formErrors.confirmPassword} required />
          <TextField fullWidth size='small' label='Commentary Name' value={formData.commentaryName} onChange={e => setFormData({ ...formData, commentaryName: e.target.value })} placeholder='Name used in commentary' />
          <TextField fullWidth size='small' label='Jersey Number' value={formData.jerseyNo} onChange={e => setFormData({ ...formData, jerseyNo: e.target.value })} placeholder='e.g. 10' />
          <TextField fullWidth size='small' label='NIC No. or Passport Number' value={formData.nicOrPassport} onChange={e => setFormData({ ...formData, nicOrPassport: e.target.value })} error={!!formErrors.nicOrPassport} helperText={formErrors.nicOrPassport} required />
          <TextField fullWidth size='small' label='Date of Birth' type='date' value={formData.dateOfBirth} onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })} InputLabelProps={{ shrink: true }} error={!!formErrors.dateOfBirth} helperText={formErrors.dateOfBirth} required />

          <FormControl fullWidth size='small'>
            <InputLabel id='resident-status-label'>Resident Status</InputLabel>
            <Select labelId='resident-status-label' label='Resident Status' value={formData.residentStatus} onChange={e => setFormData({ ...formData, residentStatus: e.target.value })}>
              <MenuItem value='local'>Local</MenuItem>
              <MenuItem value='foreign'>Foreign</MenuItem>
            </Select>
          </FormControl>

          {formData.residentStatus === 'foreign' && (
            <TextField fullWidth size='small' label='Visa No.' value={formData.visaNo} onChange={e => setFormData({ ...formData, visaNo: e.target.value })} error={!!formErrors.visaNo} helperText={formErrors.visaNo} required />
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
            <Button type='submit' variant='contained' disabled={submitting || !clubId} startIcon={submitting ? <CircularProgress size={16} color='inherit' /> : null}>
              Send Request to Federation
            </Button>
            <Button type='button' variant='outlined' color='secondary' onClick={onClose} disabled={submitting}>Cancel</Button>
          </div>
        </form>
      </div>
    </Drawer>
  )
}
