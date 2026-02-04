'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'

const ChangePassword = () => {
  // States
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  return (
    <Card>
      <CardHeader title='Change Password' />
      <CardContent>
        <Grid container spacing={6}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              type={showCurrentPassword ? 'text' : 'password'}
              label='Current Password'
              placeholder='Enter current password'
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton
                      edge='end'
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      onMouseDown={e => e.preventDefault()}
                    >
                      <i className={showCurrentPassword ? 'ri-eye-off-line' : 'ri-eye-line'} />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              type={showNewPassword ? 'text' : 'password'}
              label='New Password'
              placeholder='Enter new password'
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton
                      edge='end'
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      onMouseDown={e => e.preventDefault()}
                    >
                      <i className={showNewPassword ? 'ri-eye-off-line' : 'ri-eye-line'} />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid size={12} className='flex gap-4'>
            <Button variant='contained'>Change Password</Button>
            <Button variant='outlined'>Cancel</Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default ChangePassword
