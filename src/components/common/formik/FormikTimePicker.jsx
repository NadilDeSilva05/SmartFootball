// MUI imports
import { Box, TextField } from '@mui/material'
import { LocalizationProvider, TimePicker } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'

// Third-party imports
import { isDate, isValid } from 'date-fns'

const FormikTimePicker = ({ name, label, views = ['hours', 'minutes'], value, setFieldValue, error, ...restProps }) => {
  const handleTimeChange = val => {
    if (val && isValid(val) && isDate(val)) {
      // const formattedTime = format(val, 'HH:mm');
      setFieldValue(name, val) // Store the formatted time in Formik
    } else {
      setFieldValue(name, null) // Clear the field if invalid time
    }
  }

  return (
    <Box sx={{ width: '100%', marginTop: 1 }}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <TimePicker
          inputFormat='HH:mm'
          {...restProps}
          name={name}
          value={value ?? null} // Convert string to Date for preview
          onChange={handleTimeChange}
          views={views}
          renderInput={params => (
            <TextField {...params} label={label} error={error} helperText={error} size='small' fullWidth />
          )}
        />
      </LocalizationProvider>
    </Box>
  )
}

export default FormikTimePicker
