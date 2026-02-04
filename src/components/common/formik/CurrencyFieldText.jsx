import React from 'react'
import { useField, useFormikContext } from 'formik'
import { NumericFormat } from 'react-number-format'
import TextField from '@mui/material/TextField'
import Box from '@mui/material/Box'

const FormikCurrencyField = ({ name, label, currencySymbol = 'LKR.', ...props }) => {
  const [field, meta] = useField(name)
  const { setFieldValue, setFieldTouched } = useFormikContext()

  return (
    <Box sx={{ marginTop: 1, width: '100%' }}>
      <NumericFormat
        customInput={TextField}
        label={label}
        variant='outlined'
        size='small'
        thousandSeparator
        decimalScale={2}
        value={typeof field.value === 'number' || typeof field.value === 'string' ? field.value : ''}
        onValueChange={vals => {
          setFieldValue(name, vals.floatValue)
          setFieldTouched(name, true)
        }}
        error={Boolean(meta.touched && meta.error)}
        helperText={meta.touched && meta.error ? meta.error : ''}
        InputProps={{
          startAdornment: <span>{currencySymbol}</span>
        }}
        fullWidth
        {...props}
      />
    </Box>
  )
}

export default FormikCurrencyField
