// Core imports
import { Field } from 'formik'

// MUI imports
import { MenuItem } from '@mui/material'
import FormControl from '@mui/material/FormControl'

// Third-party imports
import { Select } from 'formik-mui'

const FormikSelectNew = ({ label, name, options, disabled, required, placeholder, value, selectLabel, ...rest }) => {
  return (
    <FormControl sx={{ width: '100%', marginTop: 1 }}>
      <Field component={Select} id={name} name={name} label={label} disabled={disabled} required={required} {...rest}>
        {options &&
          options.map((item, index) => (
            <MenuItem key={index} value={item[value]} disabled={!!item?.isDisabled}>
              {item[selectLabel]}
            </MenuItem>
          ))}
      </Field>
    </FormControl>
  )
}

export default FormikSelectNew
