// Formik Imports
import { ErrorMessage, FastField } from 'formik'

// MUI Imports
import { FormControl, InputLabel, Select, MenuItem, Typography, Box } from '@mui/material'

// Component Imports
import TextError from './TextError'

const FormikSelect = props => {
  const {
    label,
    name,
    options = [],
    error,
    disabled,
    required,
    placeholder,
    hasError,
    variant = 'outlined',
    size = 'small',
    fullWidth = true,
    helperText,
    // New props for standalone usage
    standalone = false,
    value,
    onValueChange,
    ...rest
  } = props

  // Standalone mode for use outside Formik forms
  if (standalone) {
    return (
      <Box sx={{ position: 'relative', width: '100%' }}>
        <FormControl
          fullWidth={fullWidth}
          variant={variant}
          size={size}
          disabled={disabled}
          error={hasError}
          sx={{
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
        >
          <InputLabel id={`${name}-label`} required={required}>
            {label}
          </InputLabel>
          <Select
            {...rest}
            labelId={`${name}-label`}
            label={label}
            value={value || ''}
            onChange={e => onValueChange?.(e.target.value)}
            displayEmpty
            renderValue={selected => {
              if (!selected || selected === '') {
                // Find the option with empty value to show its label
                const defaultOption = options.find(option => option.value === '')
                return defaultOption?.label || placeholder
              }
              // Find the selected option to show its label
              const selectedOption = options.find(option => option.value === selected)
              return selectedOption?.label || selected
            }}
          >
            {options.map((option, index) => (
              <MenuItem key={index} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {helperText && (
          <Typography
            variant='caption'
            sx={{
              color: 'text.secondary',
              mt: 0.5,
              ml: 1.75
            }}
          >
            {helperText}
          </Typography>
        )}
      </Box>
    )
  }

  // Original Formik mode
  return (
    <FastField name={name}>
      {({ field, form }) => (
        <Box sx={{ position: 'relative', width: '100%' }}>
          <FormControl
            fullWidth={fullWidth}
            variant={variant}
            size={size}
            disabled={disabled}
            error={error}
            sx={{
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
          >
            <InputLabel id={`${name}-label`} required={required}>
              {label}
            </InputLabel>
            <Select
              {...field}
              {...rest}
              labelId={`${name}-label`}
              label={label}
              value={field.value || ''}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={form.touched[name] && Boolean(form.errors[name])}
              displayEmpty
              renderValue={selected => {
                if (!selected || selected === '') {
                  // Find the option with empty value to show its label
                  const defaultOption = options.find(option => option.value === '')
                  return defaultOption?.label || placeholder
                }
                // Find the selected option to show its label
                const selectedOption = options.find(option => option.value === selected)
                return selectedOption?.label || selected
              }}
            >
              {options.map((option, index) => (
                <MenuItem key={index} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {helperText && (
            <Typography
              variant='caption'
              sx={{
                color: 'text.secondary',
                mt: 0.5,
                ml: 1.75
              }}
            >
              {helperText}
            </Typography>
          )}

          {!hasError && <ErrorMessage component={TextError} name={name} />}
        </Box>
      )}
    </FastField>
  )
}

export default FormikSelect
