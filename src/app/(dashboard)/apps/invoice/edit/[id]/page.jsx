import Grid from '@mui/material/Grid'
import EditCard from '@views/apps/invoice/edit/EditCard'
import EditActions from '@views/apps/invoice/edit/EditActions'
import { invoices } from '@/data/sampleData'

const InvoiceEditPage = async ({ params }) => {
  const { id } = await params
  const data = invoices || []
  const invoiceData =
    data.find(inv => inv.id === id || inv.id === `#${id}`) || data[0] || {
      issuedDate: new Date().toISOString().slice(0, 10),
      dueDate: new Date().toISOString().slice(0, 10),
      name: '',
      company: '',
      address: '',
      contact: '',
      companyEmail: ''
    }
  return (
    <Grid container spacing={6}>
      <Grid item xs={12} md={9}>
        <EditCard invoiceData={invoiceData} id={id} data={data} />
      </Grid>
      <Grid item xs={12} md={3}>
        <EditActions id={id} />
      </Grid>
    </Grid>
  )
}

export default InvoiceEditPage
