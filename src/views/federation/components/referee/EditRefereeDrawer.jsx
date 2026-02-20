'use client'

import { useState, useEffect } from 'react'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import FormControl from '@mui/material/FormControl'
import IconButton from '@mui/material/IconButton'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { LICENSE_LEVEL_OPTIONS } from '@views/federation/constants'

export default function EditRefereeDrawer ({ open, onClose, referee }) {
  const [formData, setFormData] = useState({
    refereeId: '',
    fullName: '',
    age: '',
    licenseLevel: 'district-regional',
    homeTown: '',
    status: 'active'
  })

  useEffect(() => {
    if (referee) {
      setFormData({
        refereeId: referee.refereeId || '',
        fullName: referee.fullName || '',
        age: referee.age?.toString() || '',
        licenseLevel: referee.licenseLevel || 'district-regional',
        homeTown: referee.homeTown || '',
        status: referee.status || 'active'
      })
    }
  }, [referee])

  const handleSubmit = e => {
    e.preventDefault()
    onClose()
  }

  return (
    <Drawer open={open} anchor='right' variant='temporary' onClose={onClose} ModalProps={{ keepMounted: true }} sx={{ '& .MuiDrawer-paper': { width: { xs: 320, sm: 420 } } }}>
      <div className='flex items-center justify-between pli-5 plb-[15px]'>
        <Typography variant='h5'>Edit Referee</Typography>
        <IconButton onClick={onClose} size='small'>
          <i className='ri-close-line' />
        </IconButton>
      </div>
      <Divider />
      <div className='p-5 overflow-y-auto'>
        {referee && (
          <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
            <TextField
              fullWidth
              size='small'
              label='Referee ID'
              value={formData.refereeId}
              onChange={e => setFormData({ ...formData, refereeId: e.target.value })}
            />
            <TextField
              fullWidth
              size='small'
              label='Full Name'
              value={formData.fullName}
              onChange={e => setFormData({ ...formData, fullName: e.target.value })}
            />
            <TextField
              fullWidth
              size='small'
              label='Age'
              type='number'
              inputProps={{ min: 18, max: 100 }}
              value={formData.age}
              onChange={e => setFormData({ ...formData, age: e.target.value })}
            />
            <FormControl fullWidth size='small'>
              <InputLabel id='edit-referee-license-label'>License Level</InputLabel>
              <Select
                labelId='edit-referee-license-label'
                value={formData.licenseLevel}
                label='License Level'
                onChange={e => setFormData({ ...formData, licenseLevel: e.target.value })}
              >
                {LICENSE_LEVEL_OPTIONS.map(opt => (
                  <MenuItem key={opt.id} value={opt.id}>{opt.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              size='small'
              label='Home Town'
              value={formData.homeTown}
              onChange={e => setFormData({ ...formData, homeTown: e.target.value })}
            />
            <FormControl fullWidth size='small'>
              <InputLabel id='edit-referee-status-label'>Status</InputLabel>
              <Select
                labelId='edit-referee-status-label'
                value={formData.status}
                label='Status'
                onChange={e => setFormData({ ...formData, status: e.target.value })}
              >
                <MenuItem value='active'>Active</MenuItem>
                <MenuItem value='pending'>Pending</MenuItem>
                <MenuItem value='inactive'>Inactive</MenuItem>
              </Select>
            </FormControl>
            <div className='flex gap-2 mt-2'>
              <Button type='submit' variant='contained' size='small'>Save</Button>
              <Button type='button' variant='outlined' color='secondary' size='small' onClick={onClose}>Cancel</Button>
            </div>
          </form>
        )}
      </div>
    </Drawer>
  )
}
