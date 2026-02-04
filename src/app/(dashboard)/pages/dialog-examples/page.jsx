import Grid from '@mui/material/Grid'
import DialogAddCard from '@views/pages/dialog-examples/DialogAddCard'
import DialogEditUserInfo from '@views/pages/dialog-examples/DialogEditUserInfo'
import DialogAuthentication from '@views/pages/dialog-examples/DialogAuthentication'
import DialogAddNewAddress from '@views/pages/dialog-examples/DialogAddNewAddress'
import DialogShareProject from '@views/pages/dialog-examples/DialogShareProject'
import DialogReferEarn from '@views/pages/dialog-examples/DialogReferEarn'
import DialogPaymentMethod from '@views/pages/dialog-examples/DialogPaymentMethod'
import DialogPaymentProviders from '@views/pages/dialog-examples/DialogPaymentProviders'
import DialogCreateApp from '@views/pages/dialog-examples/DialogCreateApp'
import DialogPricing from '@views/pages/dialog-examples/DialogPricing'

const DialogExamplesPage = () => (
  <Grid container spacing={6}>
    <Grid item xs={12} sm={6} lg={4}>
      <DialogAddCard />
    </Grid>
    <Grid item xs={12} sm={6} lg={4}>
      <DialogEditUserInfo />
    </Grid>
    <Grid item xs={12} sm={6} lg={4}>
      <DialogAuthentication />
    </Grid>
    <Grid item xs={12} sm={6} lg={4}>
      <DialogAddNewAddress />
    </Grid>
    <Grid item xs={12} sm={6} lg={4}>
      <DialogShareProject />
    </Grid>
    <Grid item xs={12} sm={6} lg={4}>
      <DialogReferEarn />
    </Grid>
    <Grid item xs={12} sm={6} lg={4}>
      <DialogPaymentMethod />
    </Grid>
    <Grid item xs={12} sm={6} lg={4}>
      <DialogPaymentProviders />
    </Grid>
    <Grid item xs={12} sm={6} lg={4}>
      <DialogCreateApp />
    </Grid>
    <Grid item xs={12} sm={6} lg={4}>
      <DialogPricing />
    </Grid>
  </Grid>
)

export default DialogExamplesPage
