// Core imports
import { Field } from 'formik'

// MUI imports
import { styled } from '@mui/material/styles'
import { Box, FormControlLabel, Typography } from '@mui/material'

// Third-party imports
import { Switch } from 'formik-mui'

const IOSSwitch = styled(props => <Switch focusVisibleClassName='.Mui-focusVisible' disableRipple {...props} />)(
  ({ theme }) => ({
    width: theme.spacing(5.25), // 42px
    height: theme.spacing(3.25), // 26px
    padding: 0,
    '& .MuiSwitch-switchBase': {
      padding: 0,
      margin: theme.spacing(0.25), // 2px
      transitionDuration: '300ms',
      '&.Mui-checked': {
        transform: `translateX(${theme.spacing(2)})`, // 16px
        color: theme.palette.common.white,
        '& + .MuiSwitch-track': {
          backgroundColor: theme.palette.primary.main,
          opacity: 1,
          border: 0
        },
        '&.Mui-disabled + .MuiSwitch-track': {
          opacity: 0.5
        }
      },
      '&.Mui-focusVisible .MuiSwitch-thumb': {
        color: theme.palette.primary.light,
        border: `${theme.spacing(0.75)} solid ${theme.palette.common.white}` // 6px
      },
      '&.Mui-disabled .MuiSwitch-thumb': {
        color: theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[600]
      },
      '&.Mui-disabled + .MuiSwitch-track': {
        opacity: theme.palette.mode === 'light' ? 0.7 : 0.3
      }
    },
    '& .MuiSwitch-thumb': {
      boxSizing: 'border-box',
      width: theme.spacing(2.75), // 22px
      height: theme.spacing(2.75) // 22px
    },
    '& .MuiSwitch-track': {
      borderRadius: theme.spacing(1.625), // 13px (26/2)
      backgroundColor: theme.palette.mode === 'light' ? theme.palette.grey[400] : theme.palette.grey[800],
      opacity: 1,
      transition: theme.transitions.create(['background-color'], {
        duration: 500
      })
    }
  })
)

const FormikSwitch = ({ name, label, formControlLabelSX = { marginLeft: 0 } }) => {
  return (
    <Box>
      <FormControlLabel
        control={<Field component={IOSSwitch} type='checkbox' name={name} />}
        label={
          <Typography
            variant='body2'
            sx={{
              marginLeft: 1,
              color: 'text.primary',
              fontWeight: 500
            }}
          >
            {label}
          </Typography>
        }
        sx={{
          ...formControlLabelSX,
          '& .MuiFormControlLabel-label': {
            color: 'text.primary'
          }
        }}
      />
    </Box>
  )
}

export default FormikSwitch
