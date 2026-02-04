// Core imports
import { Field } from 'formik'

// MUI imports
import { Box, Stack, Typography } from '@mui/material'
import Radio from '@mui/material/Radio'
import FormControlLabel from '@mui/material/FormControlLabel'

// Third-party imports
import { RadioGroup } from 'formik-mui'

const FormikRadioGroup = ({ name, direction, dataSet, controlMargin, label, required }) => {
  return (
    <Box>
      {label && (
        <Box sx={{ display: 'flex', marginBottom: 1 }}>
          <Typography
            variant='body2'
            sx={{
              fontWeight: 500,
              color: 'text.primary',
              marginBottom: 0.25
            }}
          >
            {label}
          </Typography>
          {required && (
            <Typography
              variant='body2'
              sx={{
                color: 'error.main',
                marginLeft: 0.5,
                fontWeight: 600
              }}
            >
              *
            </Typography>
          )}
        </Box>
      )}
      <Field component={RadioGroup} name={name} row={true}>
        <Stack direction={direction} spacing={2}>
          {dataSet &&
            dataSet.map((data, index) => (
              <FormControlLabel
                key={index}
                value={data.value}
                control={
                  <Radio
                    disabled={data.disabled}
                    sx={{
                      color: 'text.secondary',
                      '&.Mui-checked': {
                        color: 'primary.main'
                      },
                      '&.Mui-disabled': {
                        color: 'text.disabled'
                      }
                    }}
                  />
                }
                label={
                  <Typography
                    variant='body2'
                    sx={{
                      color: data.disabled ? 'text.disabled' : 'text.primary',
                      fontWeight: 400
                    }}
                  >
                    {data.label}
                  </Typography>
                }
                disabled={data.disabled}
                sx={{
                  margin: controlMargin,
                  '& .MuiFormControlLabel-label': {
                    color: data.disabled ? 'text.disabled' : 'text.primary'
                  }
                }}
              />
            ))}
        </Stack>
      </Field>
    </Box>
  )
}

export default FormikRadioGroup
