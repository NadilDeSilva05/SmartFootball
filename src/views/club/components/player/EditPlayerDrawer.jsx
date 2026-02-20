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
import { POSITION_OPTIONS } from '@views/club/constants'

export default function EditPlayerDrawer ({ open, onClose, player }) {
  const [formData, setFormData] = useState({
    playerId: '',
    fullName: '',
    commentaryName: '',
    jerseyNo: '',
    nicOrPassport: '',
    dateOfBirth: '',
    residentStatus: 'local',
    visaNo: '',
    position: 'Forward'
  })

  useEffect(() => {
    if (player) {
      setFormData({
        playerId: player.playerId ?? '',
        fullName: player.fullName ?? '',
        commentaryName: player.commentaryName ?? '',
        jerseyNo: player.jerseyNo ?? '',
        nicOrPassport: player.nicOrPassport ?? '',
        dateOfBirth: player.dateOfBirth ?? '',
        residentStatus: player.residentStatus ?? 'local',
        visaNo: player.visaNo ?? '',
        position: player.position ?? 'Forward'
      })
    }
  }, [player])

  const handleSubmit = e => {
    e.preventDefault()
    onClose()
  }

  return (
    <Drawer open={open} anchor='right' variant='temporary' onClose={onClose} ModalProps={{ keepMounted: true }} sx={{ '& .MuiDrawer-paper': { width: { xs: 320, sm: 420 } } }}>
      <div className='flex items-center justify-between pli-5 plb-[15px]'>
        <Typography variant='h5'>Edit Player</Typography>
        <IconButton onClick={onClose} size='small'>
          <i className='ri-close-line' />
        </IconButton>
      </div>
      <Divider />
      <div className='p-5 overflow-y-auto'>
        {player && (
          <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
            <TextField fullWidth size='small' label='Player Id' value={formData.playerId} onChange={e => setFormData({ ...formData, playerId: e.target.value })} />
            <TextField fullWidth size='small' label='Player Full Name' value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} required />
            <TextField fullWidth size='small' label='Commentary Name' value={formData.commentaryName} onChange={e => setFormData({ ...formData, commentaryName: e.target.value })} />
            <TextField fullWidth size='small' label='Jersey Number' value={formData.jerseyNo} onChange={e => setFormData({ ...formData, jerseyNo: e.target.value })} />
            <TextField fullWidth size='small' label='NIC No. or Passport Number' value={formData.nicOrPassport} onChange={e => setFormData({ ...formData, nicOrPassport: e.target.value })} />
            <TextField fullWidth size='small' label='Date of Birth' type='date' value={formData.dateOfBirth} onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })} InputLabelProps={{ shrink: true }} />
            <FormControl fullWidth size='small'>
              <InputLabel id='edit-resident-label'>Resident Status</InputLabel>
              <Select labelId='edit-resident-label' label='Resident Status' value={formData.residentStatus} onChange={e => setFormData({ ...formData, residentStatus: e.target.value })}>
                <MenuItem value='local'>Local</MenuItem>
                <MenuItem value='foreign'>Foreign</MenuItem>
              </Select>
            </FormControl>
            {formData.residentStatus === 'foreign' && (
              <TextField fullWidth size='small' label='Visa No.' value={formData.visaNo} onChange={e => setFormData({ ...formData, visaNo: e.target.value })} />
            )}
            <FormControl fullWidth size='small'>
              <InputLabel id='edit-position-label'>Player Position</InputLabel>
              <Select labelId='edit-position-label' label='Player Position' value={formData.position} onChange={e => setFormData({ ...formData, position: e.target.value })}>
                {POSITION_OPTIONS.map(pos => (
                  <MenuItem key={pos} value={pos}>{pos}</MenuItem>
                ))}
              </Select>
            </FormControl>
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
