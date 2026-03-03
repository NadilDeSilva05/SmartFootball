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
import { POSITION_OPTIONS } from '@views/club/constants'

export default function EditPlayerDrawer ({ open, onClose, player, onSaved }) {
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
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!player) return
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
    setError('')
  }, [player])

  const handleSubmit = async e => {
    e.preventDefault()
    if (!player?.id) return

    try {
      setSaving(true)
      setError('')

      const res = await fetch(`/api/club-players/${player.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          commentaryName: formData.commentaryName,
          jerseyNo: formData.jerseyNo,
          nicOrPassport: formData.nicOrPassport,
          dateOfBirth: formData.dateOfBirth,
          residentStatus: formData.residentStatus,
          visaNo: formData.visaNo,
          position: formData.position
        })
      })

      const payload = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(payload?.error || 'Failed to update player')
      }

      onSaved?.()
      onClose?.()
    } catch (err) {
      setError(err?.message || 'Failed to update player')
    } finally {
      setSaving(false)
    }
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
        {error && <Alert severity='error' sx={{ mb: 2 }}>{error}</Alert>}
        {player && (
          <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
            <TextField fullWidth size='small' label='Player Id' value={formData.playerId} disabled />
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
              <Button type='submit' variant='contained' disabled={saving} startIcon={saving ? <CircularProgress size={16} color='inherit' /> : null}>Save</Button>
              <Button type='button' variant='outlined' color='secondary' onClick={onClose} disabled={saving}>Cancel</Button>
            </div>
          </form>
        )}
      </div>
    </Drawer>
  )
}
