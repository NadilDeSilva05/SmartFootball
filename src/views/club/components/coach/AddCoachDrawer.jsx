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
import { LICENSE_OPTIONS, ROLE_OPTIONS } from '@views/club/constants'

export default function AddCoachDrawer ({ open, onClose, onRequestSent }) {
  const [formData, setFormData] = useState({
    coachId: '',
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'assistant_coach',
    license: 'C',
    nicOrPassport: '',
    dateOfBirth: ''
  })
  const [formErrors, setFormErrors] = useState({})

  const resetForm = () => {
    setFormData({ coachId: '', fullName: '', email: '', password: '', confirmPassword: '', role: 'assistant_coach', license: 'C', nicOrPassport: '', dateOfBirth: '' })
    setFormErrors({})
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
        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
          <TextField fullWidth size='small' label='Coach Id' value={formData.coachId} onChange={e => setFormData({ ...formData, coachId: e.target.value })} required />
          <TextField fullWidth size='small' label='Coach Full Name' value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} required />
          <TextField fullWidth size='small' label='Email' type='email' value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} error={!!formErrors.email} helperText={formErrors.email} required />
          <TextField fullWidth size='small' label='Password' type='password' value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} error={!!formErrors.password} helperText={formErrors.password} required />
          <TextField fullWidth size='small' label='Confirm Password' type='password' value={formData.confirmPassword} onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })} error={!!formErrors.confirmPassword} helperText={formErrors.confirmPassword} required />
          <FormControl fullWidth size='small'>
            <InputLabel id='add-role-label'>Coach Role</InputLabel>
            <Select labelId='add-role-label' label='Coach Role' value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
              {ROLE_OPTIONS.map(opt => (
                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          {!isAnalyst && (
            <FormControl fullWidth size='small'>
              <InputLabel id='add-license-label'>Coach License</InputLabel>
              <Select labelId='add-license-label' label='Coach License' value={formData.license} onChange={e => setFormData({ ...formData, license: e.target.value })}>
                {LICENSE_OPTIONS.map(opt => (
                  <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          <TextField fullWidth size='small' label='NIC or Passport No.' value={formData.nicOrPassport} onChange={e => setFormData({ ...formData, nicOrPassport: e.target.value })} required />
          <TextField fullWidth size='small' label='Date of Birth' type='date' value={formData.dateOfBirth} onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })} InputLabelProps={{ shrink: true }} required />
          <div className='flex gap-2 mt-2'>
            <Button type='submit' variant='contained'>Send Request to Federation</Button>
            <Button type='button' variant='outlined' color='secondary' onClick={onClose}>Cancel</Button>
          </div>
        </form>
      </div>
    </Drawer>
  )
}
