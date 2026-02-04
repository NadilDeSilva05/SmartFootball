import Grid from '@mui/material/Grid'
import FormValidationBasic from '@views/forms/form-validation/FormValidationBasic'
import FormValidationAsyncSubmit from '@views/forms/form-validation/FormValidationAsyncSubmit'
import FormValidationSchema from '@views/forms/form-validation/FormValidationSchema'

const FormValidationPage = () => (
  <Grid container spacing={6}>
    <Grid item xs={12}>
      <FormValidationBasic />
    </Grid>
    <Grid item xs={12}>
      <FormValidationAsyncSubmit />
    </Grid>
    <Grid item xs={12}>
      <FormValidationSchema />
    </Grid>
  </Grid>
)

export default FormValidationPage
