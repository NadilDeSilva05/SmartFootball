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
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import { LICENSE_OPTIONS, ROLE_OPTIONS } from '@views/club/constants'

export default function AddCoachDrawer ({ open, onClose, clubId, onRequestSent }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    role: 'assistant_coach',
    license: 'C',
    nicOrPassport: '',
    dateOfBirth: ''
  })
  const [formErrors, setFormErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const resetForm = () => {
    setFormData({ fullName: '', email: '', role: 'assistant_coach', license: 'C', nicOrPassport: '', dateOfBirth: '' })
    setFormErrors({})
    setSubmitError('')
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const errors = {}
    if (!clubId) errors.club = 'Club is not resolved for this login. Please re-login.'
    if (!formData.fullName?.trim()) errors.fullName = 'Coach name is required'
    if (!formData.email?.trim()) errors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Enter a valid email'
    if (!formData.nicOrPassport?.trim()) errors.nicOrPassport = 'NIC/Passport is required'
    if (!formData.dateOfBirth) errors.dateOfBirth = 'Date of birth is required'
    if (formData.role !== 'analyst' && !formData.license) errors.license = 'License is required'

    setFormErrors(errors)
    if (Object.keys(errors).length > 0) return

    try {
      setSubmitting(true)
      setSubmitError('')

      const res = await fetch('/api/coach-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clubId,
          fullName: formData.fullName.trim(),
          email: formData.email.trim(),
          role: formData.role,
          license: formData.role === 'analyst' ? '' : formData.license,
          nicOrPassport: formData.nicOrPassport.trim(),
          dateOfBirth: formData.dateOfBirth
        })
      })

      const payload = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(payload?.error || 'Failed to submit coach request')
      }

      onRequestSent?.()
      resetForm()
      onClose?.()
    } catch (error) {
      setSubmitError(error?.message || 'Failed to submit coach request')
    } finally {
      setSubmitting(false)
    }
  }

  const isAnalyst = formData.role === 'analyst'

  return (
    <Drawer open={open} anchor='right' variant='temporary' onClose={onClose} ModalProps={{ keepMounted: true }} sx={{ '& .MuiDrawer-paper': { width: { xs: 320, sm: 420 } } }}>
      <div className='flex items-center justify-between pli-5 plb-[15px]'>
        <Typography variant='h5'>Add Coach (Request to Federation)</Typography>
        <IconButton onClick={onClose} size='small'><i className='ri-close-line' /></IconButton>
      </div>
      <Divider />
      <div className='p-5 overflow-y-auto'>
        <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
          This will send a registration request to the federation admin for approval. Analyst does not require a license.
        </Typography>
        {submitError && <Alert severity='error' sx={{ mb: 2 }}>{submitError}</Alert>}
        {formErrors.club && <Alert severity='warning' sx={{ mb: 2 }}>{formErrors.club}</Alert>}
        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
          <Alert severity='info'>
            Coach ID will be generated automatically when you submit.
          </Alert>
          <TextField fullWidth size='small' label='Coach Full Name' value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} error={!!formErrors.fullName} helperText={formErrors.fullName} required />
          <TextField fullWidth size='small' label='Email' type='email' value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} error={!!formErrors.email} helperText={formErrors.email} required />
          <FormControl fullWidth size='small'>
            <InputLabel id='add-role-label'>Coach Role</InputLabel>
            <Select labelId='add-role-label' label='Coach Role' value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
              {ROLE_OPTIONS.map(opt => (
                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          {!isAnalyst && (
            <FormControl fullWidth size='small' error={!!formErrors.license}>
              <InputLabel id='add-license-label'>Coach License</InputLabel>
              <Select labelId='add-license-label' label='Coach License' value={formData.license} onChange={e => setFormData({ ...formData, license: e.target.value })}>
                {LICENSE_OPTIONS.map(opt => (
                  <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          <TextField fullWidth size='small' label='NIC or Passport No.' value={formData.nicOrPassport} onChange={e => setFormData({ ...formData, nicOrPassport: e.target.value })} error={!!formErrors.nicOrPassport} helperText={formErrors.nicOrPassport} required />
          <TextField fullWidth size='small' label='Date of Birth' type='date' value={formData.dateOfBirth} onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })} InputLabelProps={{ shrink: true }} error={!!formErrors.dateOfBirth} helperText={formErrors.dateOfBirth} required />
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
