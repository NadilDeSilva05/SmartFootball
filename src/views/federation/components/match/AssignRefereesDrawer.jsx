'use client'

import { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import IconButton from '@mui/material/IconButton'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Typography from '@mui/material/Typography'
import { REFEREE_ROLES, REFEREES_OPTIONS } from '@views/federation/constants'

export default function AssignRefereesDrawer ({ open, onClose, match, assignments, onSave }) {
  const [formErrors, setFormErrors] = useState({})
  const [openSelects, setOpenSelects] = useState({})

  const currentAssignment = match ? assignments[match.id] : null
  const [formData, setFormData] = useState({
    mainReferee: '',
    assistant1: '',
    assistant2: '',
    fourthOfficial: ''
  })

  useEffect(() => {
    if (match) {
      setFormData({
        mainReferee: currentAssignment?.mainReferee || '',
        assistant1: currentAssignment?.assistant1 || '',
        assistant2: currentAssignment?.assistant2 || '',
        fourthOfficial: currentAssignment?.fourthOfficial || ''
      })
      setFormErrors({})
    }
  }, [match, currentAssignment?.mainReferee, currentAssignment?.assistant1, currentAssignment?.assistant2, currentAssignment?.fourthOfficial])

  const selectedIds = [formData.mainReferee, formData.assistant1, formData.assistant2, formData.fourthOfficial].filter(Boolean)
  const hasDuplicate = selectedIds.length !== new Set(selectedIds).size

  const validateForm = () => {
    const errors = {}
    if (!formData.mainReferee) errors.mainReferee = 'Main referee is required'
    if (!formData.assistant1) errors.assistant1 = 'Assistant referee 1 is required'
    if (!formData.assistant2) errors.assistant2 = 'Assistant referee 2 is required'
    if (!formData.fourthOfficial) errors.fourthOfficial = 'Fourth official is required'
    if (hasDuplicate) {
      errors.mainReferee = errors.mainReferee || 'All four referees must be different'
      if (!errors.assistant1) errors.assistant1 = 'All four referees must be different'
      if (!errors.assistant2) errors.assistant2 = 'All four referees must be different'
      if (!errors.fourthOfficial) errors.fourthOfficial = 'All four referees must be different'
    }
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = e => {
    e.preventDefault()
    if (!validateForm()) return
    onSave(formData)
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (formErrors[field]) setFormErrors(prev => ({ ...prev, [field]: '' }))
  }

  const toggleSelect = key => setOpenSelects(prev => ({ ...prev, [key]: !prev[key] }))

  if (!match) return null

  return (
    <Drawer open={open} anchor='right' variant='temporary' onClose={onClose} ModalProps={{ keepMounted: true }} sx={{ '& .MuiDrawer-paper': { width: { xs: 320, sm: 420 } } }}>
      <div className='flex items-center justify-between pli-5 plb-[15px]'>
        <Box>
          <Typography variant='h5'>Assign Referees</Typography>
          <Typography variant='body2' color='text.secondary'>{match.homeTeamName} vs {match.awayTeamName}</Typography>
        </Box>
        <IconButton onClick={onClose} size='small'>
          <i className='ri-close-line' />
        </IconButton>
      </div>
      <Divider />
      <div className='p-5 overflow-y-auto'>
        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
          {REFEREE_ROLES.map(({ key, label }) => (
            <FormControl key={key} fullWidth size='small' error={!!formErrors[key]}>
              <InputLabel id={`assign-${key}-label`}>{label}</InputLabel>
              <Select
                labelId={`assign-${key}-label`}
                open={!!openSelects[key]}
                onClose={() => toggleSelect(key)}
                onOpen={() => toggleSelect(key)}
                value={formData[key]}
                label={label}
                onChange={e => handleInputChange(key, e.target.value)}
              >
                <MenuItem value=''>
                  <em>Select referee</em>
                </MenuItem>
                {REFEREES_OPTIONS.map(ref => (
                  <MenuItem key={ref.id} value={ref.id}>{ref.fullName} ({ref.licenseLevelLabel})</MenuItem>
                ))}
              </Select>
              {formErrors[key] && <FormHelperText>{formErrors[key]}</FormHelperText>}
            </FormControl>
          ))}
          <div className='flex gap-2 mt-2'>
            <Button type='submit' variant='contained' size='small'>Save Assignment</Button>
            <Button type='button' variant='outlined' color='secondary' size='small' onClick={onClose}>Cancel</Button>
          </div>
        </form>
      </div>
    </Drawer>
  )
}
