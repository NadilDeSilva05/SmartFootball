'use client'

import { useState, useEffect } from 'react'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

export default function EditLeagueDrawer ({ open, onClose, league }) {
  const [formData, setFormData] = useState({ name: '', region: 'National', season: '', status: 'active' })

  useEffect(() => {
    if (league) {
      setFormData({
        name: league.name,
        region: league.region,
        season: league.season,
        status: league.status
      })
    }
  }, [league])

  const handleSubmit = e => {
    e.preventDefault()
    onClose()
  }

  return (
    <Drawer
      open={open}
      anchor='right'
      variant='temporary'
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}
    >
      <div className='flex items-center justify-between pli-5 plb-[15px]'>
        <Typography variant='h5'>Edit League</Typography>
        <IconButton onClick={onClose} size='small'>
          <i className='ri-close-line' />
        </IconButton>
      </div>
      <Divider />
      <div className='p-5'>
        {league && (
          <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
            <TextField
              fullWidth
              label='League Name'
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
            <TextField
              fullWidth
              select
              SelectProps={{ native: true }}
              label='Region'
              value={formData.region}
              onChange={e => setFormData({ ...formData, region: e.target.value })}
            >
              <option value='National'>National</option>
              <option value='Regional'>Regional</option>
              <option value='District'>District</option>
            </TextField>
            <TextField
              fullWidth
              label='Season'
              value={formData.season}
              onChange={e => setFormData({ ...formData, season: e.target.value })}
            />
            <TextField
              fullWidth
              select
              SelectProps={{ native: true }}
              label='Status'
              value={formData.status}
              onChange={e => setFormData({ ...formData, status: e.target.value })}
            >
              <option value='active'>Active</option>
              <option value='upcoming'>Upcoming</option>
              <option value='completed'>Completed</option>
            </TextField>
            <div className='flex gap-2'>
              <Button type='submit' variant='contained'>Save</Button>
              <Button type='button' variant='outlined' color='secondary' onClick={onClose}>Cancel</Button>
            </div>
          </form>
        )}
      </div>
    </Drawer>
  )
}
