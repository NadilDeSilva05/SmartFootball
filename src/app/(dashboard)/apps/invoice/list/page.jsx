import InvoiceList from '@views/apps/invoice/list'
import { invoices } from '@/data/sampleData'

const InvoiceListPage = () => <InvoiceList invoiceData={invoices || []} />

export default InvoiceListPage
