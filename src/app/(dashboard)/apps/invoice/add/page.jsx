import Grid from '@mui/material/Grid'
import AddAction from '@views/apps/invoice/add/AddCard'
import AddActions from '@views/apps/invoice/add/AddActions'
import { invoices } from '@/data/sampleData'

const InvoiceAddPage = () => (
  <Grid container spacing={6}>
    <Grid item xs={12} md={9}>
      <AddAction invoiceData={invoices || []} />
    </Grid>
    <Grid item xs={12} md={3}>
      <AddActions />
    </Grid>
  </Grid>
)

export default InvoiceAddPage
