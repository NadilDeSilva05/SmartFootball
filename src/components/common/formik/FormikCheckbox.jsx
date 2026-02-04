// Core imports
import { ErrorMessage, Field } from 'formik'

// MUI imports
import { Box, FormControlLabel, Checkbox, Typography } from '@mui/material'

// Local imports
import TextError from './TextError'

const FormikCheckbox = ({ name, label, disabled, isErrorMessage, ...otherProps }) => {
  return (
    <Box>
      <Field name={name}>
        {({ field }) => (
          <FormControlLabel
            control={
              <Checkbox
                {...field}
                checked={field.value}
                disabled={disabled}
                sx={{
                  color: 'text.secondary',
                  '&.Mui-checked': {
                    color: 'primary.main'
                  },
                  '&.Mui-disabled': {
                    color: 'text.disabled'
                  }
                }}
                {...otherProps}
              />
            }
            label={
              <Typography
                variant='body2'
                sx={{
                  color: disabled ? 'text.disabled' : 'text.primary',
                  fontWeight: 400
                }}
              >
                {label}
              </Typography>
            }
            sx={{
              '& .MuiFormControlLabel-label': {
                color: disabled ? 'text.disabled' : 'text.primary'
              }
            }}
          />
        )}
      </Field>
      {isErrorMessage && <ErrorMessage component={TextError} name={name} />}
    </Box>
  )
}

export default FormikCheckbox
