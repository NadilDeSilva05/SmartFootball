// React imports
import React from 'react'

// MUI imports
import { TextField, Box, Typography } from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'

// Third-party imports
import { format, isValid, parseISO } from 'date-fns'
import { FastField } from 'formik'

const FormikDatePicker = ({
  name,
  label,
  views = ['year', 'month', 'day'],
  required,
  hasLabel = true,
  disabled = false,
  minDate,
  maxDate,
  onBlur,
  // Filter out ALL potentially problematic props that might cause console warnings
  sectionListRef,
  InputProps,
  onChange,
  helperText,
  placeholder,
  variant,
  margin,
  fullWidth,
  shrink,
  backColor,
  hasError,
  type,
  multiline,
  rows,
  language,
  direction,
  maxlength,
  maxValue,
  // New props for standalone usage
  standalone = false,
  value,
  onValueChange,
  ...restProps // Should only contain safe DatePicker props
}) => {
  // Standalone mode for use outside Formik forms
  if (standalone) {
    // Convert string value to Date object if needed
    const dateValue = (() => {
      if (!value) return null
      if (typeof value === 'string') {
        const parsed = parseISO(value)
        return isValid(parsed) ? parsed : null
      }
      return isValid(value) ? value : null
    })()

    // Handle date change with proper formatting
    const handleChange = newValue => {
      if (newValue && isValid(newValue)) {
        const formattedDate = format(newValue, 'yyyy-MM-dd')
        onValueChange?.(formattedDate)
      } else {
        onValueChange?.(null)
      }
      // Handle onBlur if provided
      if (onBlur) onBlur()
    }

    // Safe DatePicker props (only MUI X DatePicker supported props)
    const datePickerProps = {
      value: dateValue,
      onChange: handleChange,
      views,
      disabled,
      minDate,
      maxDate,
      format: 'dd/MM/yyyy',
      name,
      slotProps: {
        textField: {
          label: label || null,
          error: hasError,
          helperText: helperText || '',
          fullWidth: true,
          variant: 'outlined',
          margin: 'dense',
          disabled: disabled,
          size: 'small',
          sx: {
            '& .MuiInputLabel-root': {
              color: 'var(--mui-palette-text-secondary)',
              '&.Mui-focused': {
                color: 'var(--mui-palette-primary-main)'
              },
              '&.Mui-error': {
                color: 'var(--mui-palette-error-main)'
              }
            },
            '& .MuiInputBase-input': {
              color: 'var(--mui-palette-text-primary)'
            },
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: 'var(--mui-palette-customColors-inputBorder)'
              },
              '&:hover fieldset': {
                borderColor: 'var(--mui-palette-action-active)'
              },
              '&.Mui-focused fieldset': {
                borderColor: 'var(--mui-palette-primary-main)'
              },
              '&.Mui-error fieldset': {
                borderColor: 'var(--mui-palette-error-main)'
              }
            },
            '& .MuiIconButton-root': {
              color: 'var(--mui-palette-text-secondary)',
              '&:hover': {
                color: 'var(--mui-palette-primary-main)'
              }
            }
          }
        }
      },
      sx: {
        width: '100%',
        '& .MuiPickersDay-root': {
          color: 'var(--mui-palette-text-primary)',
          '&:hover': {
            backgroundColor: 'var(--mui-palette-action-hover)'
          },
          '&.Mui-selected': {
            backgroundColor: 'var(--mui-palette-primary-main)',
            color: 'var(--mui-palette-primary-contrastText)',
            '&:hover': {
              backgroundColor: 'var(--mui-palette-primary-dark)'
            }
          }
        },
        '& .MuiPickersCalendarHeader-root': {
          color: 'var(--mui-palette-text-primary)'
        },
        '& .MuiPickersArrowSwitcher-button': {
          color: 'var(--mui-palette-text-secondary)',
          '&:hover': {
            color: 'var(--mui-palette-primary-main)'
          }
        },
        '& .MuiYearCalendar-root, & .MuiMonthCalendar-root': {
          '& .MuiPickersYear-yearButton, & .MuiPickersMonth-monthButton': {
            color: 'var(--mui-palette-text-primary)',
            '&:hover': {
              backgroundColor: 'var(--mui-palette-action-hover)'
            },
            '&.Mui-selected': {
              backgroundColor: 'var(--mui-palette-primary-main)',
              color: 'var(--mui-palette-primary-contrastText)'
            }
          }
        }
      }
    }

    return (
      <Box sx={{ width: '100%', paddingTop: 0, marginTop: 0 }}>
        {/* Label Section - consistent with other Formik components */}

        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker {...datePickerProps} sx={{ marginBottom: 0 }} />
        </LocalizationProvider>
      </Box>
    )
  }

  // Original Formik mode
  return (
    <FastField name={name}>
      {({ field, form }) => {
        // Convert string value to Date object if needed
        const dateValue = (() => {
          if (!field.value) return null
          if (typeof field.value === 'string') {
            const parsed = parseISO(field.value)
            return isValid(parsed) ? parsed : null
          }
          return isValid(field.value) ? field.value : null
        })()

        // Handle date change with proper formatting
        const handleChange = newValue => {
          if (newValue && isValid(newValue)) {
            const formattedDate = format(newValue, 'yyyy-MM-dd')
            form.setFieldValue(name, formattedDate)
          } else {
            form.setFieldValue(name, null)
          }
          // Handle onBlur if provided
          if (onBlur) onBlur()
        }

        // Safe DatePicker props (only MUI X DatePicker supported props)
        const datePickerProps = {
          value: dateValue,
          onChange: handleChange,
          views,
          disabled,
          minDate,
          maxDate,
          format: 'dd/MM/yyyy',
          name,
          slotProps: {
            textField: {
              label: label || null,
              error: !!form.errors[name] && form.touched[name],
              helperText: form.errors[name] || '',
              fullWidth: true,
              variant: 'outlined',
              margin: 'dense',
              disabled: disabled,
              size: 'small',
              onBlur: field.onBlur,
              sx: {
                '& .MuiInputLabel-root': {
                  color: 'var(--mui-palette-text-secondary)',
                  '&.Mui-focused': {
                    color: 'var(--mui-palette-primary-main)'
                  },
                  '&.Mui-error': {
                    color: 'var(--mui-palette-error-main)'
                  }
                },
                '& .MuiInputBase-input': {
                  color: 'var(--mui-palette-text-primary)'
                },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'var(--mui-palette-customColors-inputBorder)'
                  },
                  '&:hover fieldset': {
                    borderColor: 'var(--mui-palette-action-active)'
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'var(--mui-palette-primary-main)'
                  },
                  '&.Mui-error fieldset': {
                    borderColor: 'var(--mui-palette-error-main)'
                  }
                },
                '& .MuiIconButton-root': {
                  color: 'var(--mui-palette-text-secondary)',
                  '&:hover': {
                    color: 'var(--mui-palette-primary-main)'
                  }
                }
              }
            }
          },
          sx: {
            width: '100%',
            '& .MuiPickersDay-root': {
              color: 'var(--mui-palette-text-primary)',
              '&:hover': {
                backgroundColor: 'var(--mui-palette-action-hover)'
              },
              '&.Mui-selected': {
                backgroundColor: 'var(--mui-palette-primary-main)',
                color: 'var(--mui-palette-primary-contrastText)',
                '&:hover': {
                  backgroundColor: 'var(--mui-palette-primary-dark)'
                }
              }
            },
            '& .MuiPickersCalendarHeader-root': {
              color: 'var(--mui-palette-text-primary)'
            },
            '& .MuiPickersArrowSwitcher-button': {
              color: 'var(--mui-palette-text-secondary)',
              '&:hover': {
                color: 'var(--mui-palette-primary-main)'
              }
            },
            '& .MuiYearCalendar-root, & .MuiMonthCalendar-root': {
              '& .MuiPickersYear-yearButton, & .MuiPickersMonth-monthButton': {
                color: 'var(--mui-palette-text-primary)',
                '&:hover': {
                  backgroundColor: 'var(--mui-palette-action-hover)'
                },
                '&.Mui-selected': {
                  backgroundColor: 'var(--mui-palette-primary-main)',
                  color: 'var(--mui-palette-primary-contrastText)'
                }
              }
            }
          }
        }

        return (
          <Box sx={{ width: '100%', paddingTop: 0, marginTop: 0 }}>
            {/* Label Section - consistent with other Formik components */}

            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker {...datePickerProps} sx={{ marginBottom: 3 }} />
            </LocalizationProvider>
          </Box>
        )
      }}
    </FastField>
  )
}

export default FormikDatePicker
