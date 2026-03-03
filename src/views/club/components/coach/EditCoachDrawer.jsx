'use client'

import { useState, useEffect } from 'react'
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

export default function EditCoachDrawer ({ open, onClose, coach, onSaved }) {
  const [formData, setFormData] = useState({ coachId: '', fullName: '', role: 'assistant_coach', license: 'C', nicOrPassport: '', dateOfBirth: '' })
  const [formErrors, setFormErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (coach) {
      setFormData({
        coachId: coach.coachId ?? '',
        fullName: coach.fullName ?? '',
        role: coach.role ?? 'assistant_coach',
        license: coach.license ?? 'C',
        nicOrPassport: coach.nicOrPassport ?? '',
        dateOfBirth: coach.dateOfBirth ?? ''
      })
    }
  }, [coach])

  const handleSubmit = async e => {
    e.preventDefault()
    const errors = {}
    if (!formData.fullName?.trim()) errors.fullName = 'Coach name is required'
    if (!formData.nicOrPassport?.trim()) errors.nicOrPassport = 'NIC/Passport is required'
    if (!formData.dateOfBirth) errors.dateOfBirth = 'Date of birth is required'
    if (formData.role !== 'analyst' && !formData.license) errors.license = 'License is required'
    setFormErrors(errors)
    if (Object.keys(errors).length > 0) return

    try {
      setSubmitting(true)
      setSubmitError('')
      const res = await fetch(`/api/club-coaches/${coach.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName.trim(),
          role: formData.role,
          license: formData.role === 'analyst' ? '' : formData.license,
          nicOrPassport: formData.nicOrPassport.trim(),
          dateOfBirth: formData.dateOfBirth
        })
      })

      const payload = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(payload?.error || 'Failed to update coach')
      }

      onSaved?.()
      onClose?.()
    } catch (error) {
      setSubmitError(error?.message || 'Failed to update coach')
    } finally {
      setSubmitting(false)
    }
  }

  const isAnalyst = formData.role === 'analyst'

  return (
    <Drawer open={open} anchor='right' variant='temporary' onClose={onClose} ModalProps={{ keepMounted: true }} sx={{ '& .MuiDrawer-paper': { width: { xs: 320, sm: 420 } } }}>
      <div className='flex items-center justify-between pli-5 plb-[15px]'>
        <Typography variant='h5'>Edit Coach</Typography>
        <IconButton onClick={onClose} size='small'><i className='ri-close-line' /></IconButton>
      </div>
      <Divider />
      <div className='p-5 overflow-y-auto'>
        {coach && (
          <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
            {submitError && <Alert severity='error'>{submitError}</Alert>}
            <TextField fullWidth size='small' label='Coach Id' value={formData.coachId} disabled />
            <TextField fullWidth size='small' label='Coach Full Name' value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} error={!!formErrors.fullName} helperText={formErrors.fullName} required />
            <FormControl fullWidth size='small'>
              <InputLabel id='edit-role-label'>Coach Role</InputLabel>
              <Select labelId='edit-role-label' label='Coach Role' value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                {ROLE_OPTIONS.map(opt => (
                  <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            {!isAnalyst && (
              <FormControl fullWidth size='small' error={!!formErrors.license}>
                <InputLabel id='edit-license-label'>Coach License</InputLabel>
                <Select labelId='edit-license-label' label='Coach License' value={formData.license} onChange={e => setFormData({ ...formData, license: e.target.value })}>
                  {LICENSE_OPTIONS.map(opt => (
                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            <TextField fullWidth size='small' label='NIC or Passport No.' value={formData.nicOrPassport} onChange={e => setFormData({ ...formData, nicOrPassport: e.target.value })} error={!!formErrors.nicOrPassport} helperText={formErrors.nicOrPassport} />
            <TextField fullWidth size='small' label='Date of Birth' type='date' value={formData.dateOfBirth} onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })} InputLabelProps={{ shrink: true }} error={!!formErrors.dateOfBirth} helperText={formErrors.dateOfBirth} />
            <div className='flex gap-2 mt-2'>
              <Button type='submit' variant='contained' disabled={submitting} startIcon={submitting ? <CircularProgress size={16} color='inherit' /> : null}>Save</Button>
              <Button type='button' variant='outlined' color='secondary' onClick={onClose} disabled={submitting}>Cancel</Button>
            </div>
          </form>
        )}
      </div>
    </Drawer>
  )
}
