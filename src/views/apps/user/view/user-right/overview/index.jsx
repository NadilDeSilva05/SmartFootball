// MUI Imports
import Grid from '@mui/material/Grid'

// Component Imports
import ProjectListTable from './ProjectListTable'
import UserActivityTimeline from './UserActivityTimeline'
import InvoiceListTable from './InvoiceListTable'

// Data Imports
import { invoices } from '@/data/sampleData'

const OverViewTab = () => {
  // Vars
  const invoiceData = invoices

  return (
    <Grid container spacing={6}>
      <Grid size={12}>
        <ProjectListTable />
      </Grid>
      <Grid size={12}>
        <UserActivityTimeline />
      </Grid>
      <Grid size={12}>
        <InvoiceListTable invoiceData={invoiceData} />
      </Grid>
    </Grid>
  )
}

export default OverViewTab
