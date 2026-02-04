// Core imports
import { Field } from 'formik'

// MUI imports
import MuiTextField from '@mui/material/TextField'
import Box from '@mui/material/Box'
import { createFilterOptions } from '@mui/material/Autocomplete'

// Third-party imports
import { Autocomplete } from 'formik-mui'

const filter = createFilterOptions()

const FormikAutocomplete = ({
  label,
  name,
  formik,
  options,
  title,
  multiple,
  id = 'id',
  isOptionCreatable,
  disabled,
  InputProps,
  ...props
}) => {
  const dynamicAutoComProps = {}
  const dynamicTextFieldProps = {}

  if (multiple) {
    dynamicAutoComProps.ChipProps = {
      color: 'primary',
      size: 'small',
      variant: 'outlined',
      sx: {
        marginLeft: 0.5,
        backgroundColor: 'primary.light',
        color: 'primary.contrastText',
        '& .MuiChip-deleteIcon': {
          color: 'primary.contrastText',
          '&:hover': {
            color: 'primary.dark'
          }
        }
      }
    }
    dynamicTextFieldProps.onKeyDown = e => {
      if (e.key === 'Enter') {
        e.stopPropagation()
      }
    }
  }

  return (
    <Box display='flex' flex alignItems='flex-end' sx={{ width: '100%' }}>
      <Field
        name={name}
        multiple={multiple}
        component={Autocomplete}
        options={options ? options : []}
        getOptionLabel={option => option[title] || ''}
        isOptionEqualToValue={(option, value) => option?.[id] === value?.[id]}
        filterOptions={(options, params) => {
          const filtered = filter(options || [], params)
          const { inputValue } = params

          // Suggest creation of new option on creatable Autocomplete
          if (isOptionCreatable) {
            const isExistingOption = options?.some && options.some(option => inputValue === option?.[title])

            if (inputValue !== '' && options?.some && !isExistingOption) {
              filtered.push({
                inputValue,
                value: inputValue,
                id: inputValue,
                [title]: `${inputValue}`
              })
            }
          }

          return filtered
        }}
        {...(dynamicAutoComProps || {})}
        selectOnFocus
        clearOnBlur
        handleHomeEndKeys
        freeSolo={!!isOptionCreatable || !formik?.values?.[name]}
        groupedOptions={[]}
        sx={{
          width: '100%',
          '& .MuiAutocomplete-paper': {
            backgroundColor: 'background.paper',
            color: 'text.primary'
          },
          '& .MuiAutocomplete-option': {
            color: 'text.primary',
            '&:hover': {
              backgroundColor: 'action.hover'
            },
            '&.Mui-focused': {
              backgroundColor: 'action.selected'
            }
          }
        }}
        size='small'
        margin='dense'
        disabled={disabled}
        renderInput={params => (
          <MuiTextField
            {...params}
            label={label}
            name={name}
            error={formik.touched[name] && !!formik.errors[name]}
            helperText={formik.touched[name] && formik.errors[name]}
            disabled={disabled}
            variant='outlined'
            size='small'
            margin='dense'
            fullWidth
            sx={{
              width: '100%',
              '& .MuiInputBase-root': {
                padding: theme => theme.spacing(0.15),
                color: 'text.primary'
              },
              '& .MuiFormLabel-root': {
                lineHeight: 2,
                color: 'text.secondary'
              },
              '& .MuiFormLabel-root.Mui-focused': {
                color: 'primary.main'
              },
              '& .MuiInputLabel-shrink': {
                lineHeight: 1.75
              },
              '& .MuiInputBase-input': {
                paddingBlock: theme => theme.spacing(1.25),
                color: 'text.primary'
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
            InputProps={{
              ...(params?.InputProps || {}),
              ...(InputProps || {})
            }}
            {...(dynamicTextFieldProps || {})}
          />
        )}
        {...props}
      />
    </Box>
  )
}

export default FormikAutocomplete
