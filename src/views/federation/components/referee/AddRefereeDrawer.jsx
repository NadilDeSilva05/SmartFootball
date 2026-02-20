'use client'

import { useState } from 'react'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import IconButton from '@mui/material/IconButton'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { LICENSE_LEVEL_OPTIONS } from '@views/federation/constants'

export default function AddRefereeDrawer ({ open, onClose }) {
  const [formErrors, setFormErrors] = useState({})
  const [licenseLevelOpen, setLicenseLevelOpen] = useState(false)
  const [statusOpen, setStatusOpen] = useState(false)

  const [formData, setFormData] = useState({
    refereeId: '',
    fullName: '',
    age: '',
    licenseLevel: 'district-regional',
    homeTown: '',
    status: 'active'
  })

  const validateForm = () => {
    const errors = {}
    if (!formData.refereeId?.trim()) errors.refereeId = 'Referee ID is required'
    if (!formData.fullName?.trim()) errors.fullName = 'Full name is required'
    if (!formData.age?.trim()) errors.age = 'Age is required'
    else {
      const ageNum = parseInt(formData.age, 10)
      if (isNaN(ageNum) || ageNum < 18 || ageNum > 100) errors.age = 'Age must be between 18 and 100'
    }
    if (!formData.licenseLevel) errors.licenseLevel = 'License level is required'
    if (!formData.homeTown?.trim()) errors.homeTown = 'Home town is required'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = e => {
    e.preventDefault()
    if (!validateForm()) return
    onClose()
    setFormData({ refereeId: '', fullName: '', age: '', licenseLevel: 'district-regional', homeTown: '', status: 'active' })
    setFormErrors({})
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (formErrors[field]) setFormErrors(prev => ({ ...prev, [field]: '' }))
  }

  const handleLicenseLevelClose = () => setLicenseLevelOpen(false)
  const handleLicenseLevelOpen = () => setLicenseLevelOpen(true)
  const handleStatusClose = () => setStatusOpen(false)
  const handleStatusOpen = () => setStatusOpen(true)

  return (
    <Drawer open={open} anchor='right' variant='temporary' onClose={onClose} ModalProps={{ keepMounted: true }} sx={{ '& .MuiDrawer-paper': { width: { xs: 320, sm: 420 } } }}>
      <div className='flex items-center justify-between pli-5 plb-[15px]'>
        <Typography variant='h5'>Add New Referee</Typography>
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
            label='Referee ID'
            value={formData.refereeId}
            onChange={e => handleInputChange('refereeId', e.target.value)}
            error={!!formErrors.refereeId}
            helperText={formErrors.refereeId}
          />
          <TextField
            fullWidth
            size='small'
            label='Full Name'
            value={formData.fullName}
            onChange={e => handleInputChange('fullName', e.target.value)}
            error={!!formErrors.fullName}
            helperText={formErrors.fullName}
          />
          <TextField
            fullWidth
            size='small'
            label='Age'
            type='number'
            inputProps={{ min: 18, max: 100 }}
            value={formData.age}
            onChange={e => handleInputChange('age', e.target.value)}
            error={!!formErrors.age}
            helperText={formErrors.age}
          />
          <FormControl fullWidth size='small' error={!!formErrors.licenseLevel}>
            <InputLabel id='add-referee-license-label'>License Level</InputLabel>
            <Select
              labelId='add-referee-license-label'
              id='add-referee-license-select'
              open={licenseLevelOpen}
              onClose={handleLicenseLevelClose}
              onOpen={handleLicenseLevelOpen}
              value={formData.licenseLevel}
              label='License Level'
              onChange={e => handleInputChange('licenseLevel', e.target.value)}
            >
              <MenuItem value=''>
                <em>Select license level</em>
              </MenuItem>
              {LICENSE_LEVEL_OPTIONS.map(opt => (
                <MenuItem key={opt.id} value={opt.id}>{opt.label}</MenuItem>
              ))}
            </Select>
            {formErrors.licenseLevel && <FormHelperText>{formErrors.licenseLevel}</FormHelperText>}
          </FormControl>
          <TextField
            fullWidth
            size='small'
            label='Home Town'
            value={formData.homeTown}
            onChange={e => handleInputChange('homeTown', e.target.value)}
            error={!!formErrors.homeTown}
            helperText={formErrors.homeTown}
          />
          <FormControl fullWidth size='small'>
            <InputLabel id='add-referee-status-label'>Status</InputLabel>
            <Select
              labelId='add-referee-status-label'
              id='add-referee-status-select'
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
          <div className='flex gap-2 mt-2'>
            <Button type='submit' variant='contained' size='small'>Submit</Button>
            <Button type='button' variant='outlined' color='secondary' size='small' onClick={onClose}>Cancel</Button>
          </div>
        </form>
      </div>
    </Drawer>
  )
}
