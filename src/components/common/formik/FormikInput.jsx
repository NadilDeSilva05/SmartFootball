// Formik Imports
import { ErrorMessage, FastField } from 'formik'

// MUI Imports
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'

// Component Imports
import TextError from './TextError'

const FormikInput = props => {
  const {
    label,
    type,
    name,
    error,
    shrink,
    helperText,
    disabled,
    maxDate,
    minDate,
    multiline,
    rows,
    language,
    direction,
    required,
    maxlength,
    maxValue,
    variant,
    placeholder,
    backColor,
    hasLabel,
    hasError,
    onChange: customOnChange,
    ...rest
  } = props

  return (
    <FastField name={name}>
      {({ field, form }) => (
        <Box sx={{ position: 'relative', width: '100%' }}>
          <TextField
            error={error}
            margin='dense'
            variant={variant || 'outlined'}
            size='small'
            id={name}
            {...rest}
            {...field}
            label={label}
            placeholder={placeholder || 'Please Enter'}
            type={type}
            multiline={multiline}
            rows={rows}
            fullWidth
            disabled={disabled}
            onChange={event => {
              field.onChange(event)
              if (typeof customOnChange === 'function') {
                customOnChange(event, { field, form })
              }
            }}
            inputProps={{
              max: maxDate,
              min: minDate,
              lang: language,
              dir: direction,
              maxLength: maxlength
            }}
            InputLabelProps={{
              shrink: shrink,
              required: required
            }}
            helperText={helperText}
            sx={{
              backgroundColor: backColor || 'transparent',
              '& .MuiInputLabel-root': {
                color: 'text.secondary'
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: 'primary.main'
              },
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'divider'
                },
                '&:hover fieldset': {
                  borderColor: 'text.primary'
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'primary.main'
                }
              }
            }}
          />

          {!hasError && <ErrorMessage component={TextError} name={name} />}
        </Box>
      )}
    </FastField>
  )
}

export default FormikInput
