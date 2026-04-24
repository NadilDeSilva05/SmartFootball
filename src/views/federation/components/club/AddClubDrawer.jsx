'use client'

import { useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
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

export default function AddClubDrawer ({ open, onClose, onSuccess, leagues = [] }) {
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [isConfirmPasswordShown, setIsConfirmPasswordShown] = useState(false)
  const [formErrors, setFormErrors] = useState({})
  const [submitError, setSubmitError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [leagueOpen, setLeagueOpen] = useState(false)
  const [statusOpen, setStatusOpen] = useState(false)
  const [logoPreview, setLogoPreview] = useState(null)

  const [formData, setFormData] = useState({
    clubName: '',
    city: '',
    league: '',
    logo: null,
    adminFullName: '',
    adminEmail: '',
    adminPassword: '',
    adminConfirmPassword: '',
    status: 'active'
  })

  const handleClickShowPassword = () => setIsPasswordShown(show => !show)
  const handleClickShowConfirmPassword = () => setIsConfirmPasswordShown(show => !show)

  const validateForm = () => {
    const errors = {}
    if (!formData.clubName?.trim()) errors.clubName = 'Club name is required'
    if (!formData.adminFullName?.trim()) errors.adminFullName = 'Admin full name is required'
    if (!formData.adminEmail?.trim()) errors.adminEmail = 'Admin email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.adminEmail)) errors.adminEmail = 'Enter a valid email'
    if (!formData.adminPassword) errors.adminPassword = 'Password is required'
    else if (formData.adminPassword.length < 6) errors.adminPassword = 'Password must be at least 6 characters'
    if (formData.adminPassword !== formData.adminConfirmPassword) errors.adminConfirmPassword = 'Passwords do not match'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleLogoChange = e => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData(prev => ({ ...prev, logo: file }))
      setLogoPreview(URL.createObjectURL(file))
    }
  }

  const handleRemoveLogo = () => {
    setFormData(prev => ({ ...prev, logo: null }))
    if (logoPreview) URL.revokeObjectURL(logoPreview)
    setLogoPreview(null)
  }

  const resetForm = () => {
    setFormData({
      clubName: '',
      city: '',
      league: '',
      logo: null,
      adminFullName: '',
      adminEmail: '',
      adminPassword: '',
      adminConfirmPassword: '',
      status: 'active'
    })
    if (logoPreview) URL.revokeObjectURL(logoPreview)
    setLogoPreview(null)
    setFormErrors({})
    setSubmitError(null)
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setSubmitError(null)
    if (!validateForm()) return

    setSubmitting(true)
    try {
      let logoValue = null
      if (formData.logo) {
        logoValue = await fileToBase64(formData.logo)
      }

      const res = await fetch('/api/clubs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clubName: formData.clubName.trim(),
          city: formData.city?.trim() || '',
          league: formData.league || '',
          logo: logoValue,
          adminFullName: formData.adminFullName?.trim() || '',
          adminEmail: formData.adminEmail.trim(),
          adminPassword: formData.adminPassword,
          status: formData.status
        })
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setSubmitError(data?.error || 'Failed to create club')
        notifyError(data?.error || 'Failed to create club')
        return
      }

      notifySuccess('Club created successfully.')
      resetForm()
      onClose()
      onSuccess?.()
    } catch (err) {
      setSubmitError(err?.message || 'Failed to create club')
      notifyError(err, 'Failed to create club')
    } finally {
      setSubmitting(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (formErrors[field]) setFormErrors(prev => ({ ...prev, [field]: '' }))
    if (submitError) setSubmitError(null)
  }

  const handleLeagueClose = () => setLeagueOpen(false)
  const handleLeagueOpen = () => setLeagueOpen(true)
  const handleStatusClose = () => setStatusOpen(false)
  const handleStatusOpen = () => setStatusOpen(true)

  return (
    <Drawer open={open} anchor='right' variant='temporary' onClose={onClose} ModalProps={{ keepMounted: true }} sx={{ '& .MuiDrawer-paper': { width: { xs: 320, sm: 420 } } }}>
      <div className='flex items-center justify-between pli-5 plb-[15px]'>
        <Typography variant='h5'>Add New Club</Typography>
        <IconButton onClick={onClose} size='small'>
          <i className='ri-close-line' />
        </IconButton>
      </div>
      <Divider />
      <div className='p-5 overflow-y-auto'>
        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
          <TextField
            fullWidth
            size='small'
            label='Club Name'
            value={formData.clubName}
            onChange={e => handleInputChange('clubName', e.target.value)}
            error={!!formErrors.clubName}
            helperText={formErrors.clubName}
          />
          <TextField
            fullWidth
            size='small'
            label='City'
            value={formData.city}
            onChange={e => handleInputChange('city', e.target.value)}
            error={!!formErrors.city}
            helperText={formErrors.city}
          />
          <Box>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>Club Logo</Typography>
            {logoPreview ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Box
                  component='img'
                  src={logoPreview}
                  alt='Logo preview'
                  sx={{ width: 80, height: 80, borderRadius: 2, objectFit: 'contain', border: '1px solid', borderColor: 'divider', bgcolor: 'action.hover' }}
                />
                <Button type='button' size='small' variant='outlined' color='error' onClick={handleRemoveLogo}>
                  Remove
                </Button>
              </Box>
            ) : (
              <Button type='button' variant='outlined' size='small' component='label' startIcon={<i className='ri-upload-2-line' />}>
                Upload Logo
                <input type='file' accept='image/*' onChange={handleLogoChange} hidden />
              </Button>
            )}
            <FormHelperText sx={{ mt: 0.5 }}>Keep under 500 KB to stay within limits</FormHelperText>
          </Box>
          <FormControl fullWidth size='small' error={!!formErrors.league}>
            <InputLabel id='add-club-league-label'>League</InputLabel>
            <Select
              labelId='add-club-league-label'
              id='add-club-league-select'
              open={leagueOpen}
              onClose={handleLeagueClose}
              onOpen={handleLeagueOpen}
              value={formData.league}
              label='League'
              onChange={e => handleInputChange('league', e.target.value)}
            >
              <MenuItem value=''>
                <em>Select league</em>
              </MenuItem>
              {leagues.map(league => (
                <MenuItem key={league.id} value={league.id}>{league.name}</MenuItem>
              ))}
            </Select>
            {formErrors.league && <FormHelperText>{formErrors.league}</FormHelperText>}
          </FormControl>
          <Divider sx={{ my: 1 }} />
          <Typography variant='subtitle2' color='text.secondary'>Club Admin</Typography>
          <TextField
            fullWidth
            size='small'
            label='Admin Full Name'
            value={formData.adminFullName}
            onChange={e => handleInputChange('adminFullName', e.target.value)}
            error={!!formErrors.adminFullName}
            helperText={formErrors.adminFullName}
          />
          <TextField
            fullWidth
            size='small'
            label='Admin Email'
            type='email'
            value={formData.adminEmail}
            onChange={e => handleInputChange('adminEmail', e.target.value)}
            error={!!formErrors.adminEmail}
            helperText={formErrors.adminEmail}
          />
          <TextField
            fullWidth
            size='small'
            label='Admin Password'
            type={isPasswordShown ? 'text' : 'password'}
            value={formData.adminPassword}
            onChange={e => handleInputChange('adminPassword', e.target.value)}
            error={!!formErrors.adminPassword}
            helperText={formErrors.adminPassword}
            InputProps={{
              endAdornment: (
                <InputAdornment position='end'>
                  <IconButton onClick={handleClickShowPassword} onMouseDown={e => e.preventDefault()} edge='end' size='small' aria-label='toggle password visibility'>
                    <i className={isPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          <TextField
            fullWidth
            size='small'
            label='Admin Confirm Password'
            type={isConfirmPasswordShown ? 'text' : 'password'}
            value={formData.adminConfirmPassword}
            onChange={e => handleInputChange('adminConfirmPassword', e.target.value)}
            error={!!formErrors.adminConfirmPassword}
            helperText={formErrors.adminConfirmPassword}
            InputProps={{
              endAdornment: (
                <InputAdornment position='end'>
                  <IconButton onClick={handleClickShowConfirmPassword} onMouseDown={e => e.preventDefault()} edge='end' size='small' aria-label='toggle confirm password visibility'>
                    <i className={isConfirmPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          <Divider sx={{ my: 1 }} />
          <FormControl fullWidth size='small' sx={{ m: 1, minWidth: 120 }}>
            <InputLabel id='add-club-status-label'>Status</InputLabel>
            <Select
              labelId='add-club-status-label'
              id='add-club-status-select'
              open={statusOpen}
              onClose={handleStatusClose}
              onOpen={handleStatusOpen}
              value={formData.status}
              label='Status'
              onChange={e => handleInputChange('status', e.target.value)}
            >
              <MenuItem value='active'>Active</MenuItem>
              <MenuItem value='pending'>Pending</MenuItem>
              <MenuItem value='inactive'>Inactive</MenuItem>
            </Select>
          </FormControl>
          {submitError && (
            <Alert severity='error' onClose={() => setSubmitError(null)}>{submitError}</Alert>
          )}
          <div className='flex gap-2 mt-2'>
            <Button type='submit' variant='contained' size='small' disabled={submitting} startIcon={submitting ? <CircularProgress size={18} /> : null}>
              {submitting ? 'Submitting...' : 'Submit'}
            </Button>
            <Button type='button' variant='outlined' color='secondary' size='small' onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </Drawer>
  )
}
