import Preview from '@views/apps/invoice/preview'
import { invoices } from '@/data/sampleData'

const InvoicePreviewPage = async ({ params }) => {
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
  return <Preview invoiceData={invoiceData} id={id} />
}

export default InvoicePreviewPage
