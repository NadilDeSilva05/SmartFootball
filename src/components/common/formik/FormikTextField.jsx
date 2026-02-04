// Core imports
import { Field } from 'formik'

// Third-party imports
import { TextField } from 'formik-mui'

const FormikTextField = ({
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
  ...rest
}) => {
  return (
    <Field
      component={TextField}
      label={label}
      name={name}
      id={name}
      variant={variant || 'outlined'}
      fullWidth
      margin='dense'
      placeholder={placeholder || 'Please Enter'}
      type={type}
      multiline={multiline}
      rows={rows}
      disabled={disabled}
      InputLabelProps={{
        shrink: shrink
      }}
      {...rest}
    />
  )
}

export default FormikTextField
