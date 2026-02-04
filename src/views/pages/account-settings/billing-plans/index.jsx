// MUI Imports
import Grid from '@mui/material/Grid'

// Component Imports
import CurrentPlan from './CurrentPlan'
import Address from './Address'
import PaymentMethod from './PaymentMethod'
import InvoiceListTable from './InvoiceListTable'

// Data Imports
import { invoices } from '@/data/sampleData'

const BillingPlans = async () => {
  // vars
  const data = { plans: [] } // Placeholder for pricing data
  const invoiceData = invoices

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <CurrentPlan data={data} />
      </Grid>
      <Grid item xs={12}>
        <PaymentMethod />
      </Grid>
      <Grid item xs={12}>
        <Address />
      </Grid>
      <Grid item xs={12}>
        <InvoiceListTable invoiceData={invoiceData} />
      </Grid>
    </Grid>
  )
}

export default BillingPlans
