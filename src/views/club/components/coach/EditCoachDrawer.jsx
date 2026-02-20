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
import { LICENSE_OPTIONS, ROLE_OPTIONS } from '@views/club/constants'

export default function EditCoachDrawer ({ open, onClose, coach }) {
  const [formData, setFormData] = useState({ coachId: '', fullName: '', role: 'assistant_coach', license: 'C', nicOrPassport: '', dateOfBirth: '' })

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

  const handleSubmit = e => {
    e.preventDefault()
    onClose()
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
            <TextField fullWidth size='small' label='Coach Id' value={formData.coachId} onChange={e => setFormData({ ...formData, coachId: e.target.value })} />
            <TextField fullWidth size='small' label='Coach Full Name' value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} required />
            <FormControl fullWidth size='small'>
              <InputLabel id='edit-role-label'>Coach Role</InputLabel>
              <Select labelId='edit-role-label' label='Coach Role' value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                {ROLE_OPTIONS.map(opt => (
                  <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            {!isAnalyst && (
              <FormControl fullWidth size='small'>
                <InputLabel id='edit-license-label'>Coach License</InputLabel>
                <Select labelId='edit-license-label' label='Coach License' value={formData.license} onChange={e => setFormData({ ...formData, license: e.target.value })}>
                  {LICENSE_OPTIONS.map(opt => (
                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            <TextField fullWidth size='small' label='NIC or Passport No.' value={formData.nicOrPassport} onChange={e => setFormData({ ...formData, nicOrPassport: e.target.value })} />
            <TextField fullWidth size='small' label='Date of Birth' type='date' value={formData.dateOfBirth} onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })} InputLabelProps={{ shrink: true }} />
            <div className='flex gap-2 mt-2'>
              <Button type='submit' variant='contained'>Save</Button>
              <Button type='button' variant='outlined' color='secondary' onClick={onClose}>Cancel</Button>
            </div>
          </form>
        )}
      </div>
    </Drawer>
  )
}
