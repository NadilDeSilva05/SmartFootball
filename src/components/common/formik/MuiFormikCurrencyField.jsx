import React, { useState } from 'react'
import { useField, useFormikContext } from 'formik'
import TextField from '@mui/material/TextField'
import Box from '@mui/material/Box'
import InputAdornment from '@mui/material/InputAdornment'

function formatCurrency(value) {
  if (value === '' || value === null || value === undefined) return ''
  const number = Number(value)
  if (isNaN(number)) return ''
  return number.toLocaleString('en-US', { maximumFractionDigits: 2 })
}

const MuiFormikCurrencyField = ({ name, label, currencySymbol = 'LKR.', ...props }) => {
  const [field, meta] = useField(name)
  const { setFieldValue, setFieldTouched } = useFormikContext()
  const [isFocused, setIsFocused] = useState(false)
  const [localValue, setLocalValue] = useState(field.value || '')

  // Keep localValue in sync with Formik value
  React.useEffect(() => {
    if (!isFocused) {
      setLocalValue(field.value || '')
    }
  }, [field.value, isFocused])

  const handleFocus = () => {
    setIsFocused(true)
    setLocalValue(field.value || '')
  }

  const handleBlur = e => {
    setIsFocused(false)
    setFieldTouched(name, true)
    // Remove commas and format as number
    const raw = e.target.value.replace(/,/g, '')
    setFieldValue(name, raw === '' ? '' : Number(raw))
    setLocalValue(raw === '' ? '' : formatCurrency(raw))
  }

  const handleChange = e => {
    // Only allow numbers and decimal
    const val = e.target.value.replace(/[^\d.]/g, '')
    setLocalValue(val)
    setFieldValue(name, val)
  }

  return (
    <Box sx={{ marginTop: 1, width: '100%' }}>
      <TextField
        {...field}
        label={label}
        variant='outlined'
        size='small'
        value={isFocused ? localValue : formatCurrency(localValue)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={handleChange}
        error={Boolean(meta.touched && meta.error)}
        helperText={meta.touched && meta.error ? meta.error : ''}
        InputProps={{
          startAdornment: <InputAdornment position='start'>{currencySymbol}</InputAdornment>
        }}
        fullWidth
        {...props}
      />
    </Box>
  )
}

export default MuiFormikCurrencyField
