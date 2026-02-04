import PrintPage from '@views/apps/invoice/print'
import { invoices } from '@/data/sampleData'

const InvoicePrintPage = async ({ params }) => {
  const { id } = await params
  const invoiceData =
    invoices?.find(inv => inv.id === id || inv.id === `#${id}`) || invoices?.[0] || {
      issuedDate: '',
      dueDate: '',
      name: '',
      company: '',
      address: '',
      contact: '',
      companyEmail: ''
    }
  return <PrintPage invoiceData={invoiceData} id={id} />
}

export default InvoicePrintPage
