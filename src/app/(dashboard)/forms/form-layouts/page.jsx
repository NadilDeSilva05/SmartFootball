import Grid from '@mui/material/Grid'
import FormLayoutsBasic from '@views/forms/form-layouts/FormLayoutsBasic'
import FormLayoutsIcons from '@views/forms/form-layouts/FormLayoutsIcons'
import FormLayoutsAlignment from '@views/forms/form-layouts/FormLayoutsAlignment'
import FormLayoutsSeparator from '@views/forms/form-layouts/FormLayoutsSeparator'
import FormLayoutsCollapsible from '@views/forms/form-layouts/FormLayoutsCollapsible'
import FormLayoutsTabs from '@views/forms/form-layouts/FormLayoutsTabs'

const FormLayoutsPage = () => (
  <Grid container spacing={6}>
    <Grid item xs={12}>
      <FormLayoutsBasic />
    </Grid>
    <Grid item xs={12}>
      <FormLayoutsIcons />
    </Grid>
    <Grid item xs={12}>
      <FormLayoutsAlignment />
    </Grid>
    <Grid item xs={12}>
      <FormLayoutsSeparator />
    </Grid>
    <Grid item xs={12}>
      <FormLayoutsCollapsible />
    </Grid>
    <Grid item xs={12}>
      <FormLayoutsTabs />
    </Grid>
  </Grid>
)

export default FormLayoutsPage
