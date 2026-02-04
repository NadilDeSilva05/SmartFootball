import Grid from '@mui/material/Grid'
import StepperLinearWithValidation from '@views/forms/form-wizard/StepperLinearWithValidation'
import StepperCustomDot from '@views/forms/form-wizard/StepperCustomDot'
import StepperAlternativeLabel from '@views/forms/form-wizard/StepperAlternativeLabel'
import StepperVerticalWithNumbers from '@views/forms/form-wizard/StepperVerticalWithNumbers'
import StepperVerticalWithoutNumbers from '@views/forms/form-wizard/StepperVerticalWithoutNumbers'

const FormWizardPage = () => (
  <Grid container spacing={6}>
    <Grid item xs={12}>
      <StepperLinearWithValidation />
    </Grid>
    <Grid item xs={12}>
      <StepperCustomDot />
    </Grid>
    <Grid item xs={12}>
      <StepperAlternativeLabel />
    </Grid>
    <Grid item xs={12}>
      <StepperVerticalWithNumbers />
    </Grid>
    <Grid item xs={12}>
      <StepperVerticalWithoutNumbers />
    </Grid>
  </Grid>
)

export default FormWizardPage
