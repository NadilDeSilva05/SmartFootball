// Next Imports
import { redirect } from 'next/navigation'

// Data Imports
import { invoices } from '@/data/sampleData'

// Make this page dynamic to avoid prerender issues
export const dynamic = 'force-dynamic'

const DefaultPreviewPage = async () => {
  try {
    // Vars
    const data = invoices || []

    console.log('Data received:', data)
    console.log('Data length:', data?.length)
    console.log('First invoice:', data?.[0])

    // Redirect to the first invoice if available
    if (data && data.length > 0) {
      const firstInvoiceId = data[0].id.replace('#', '')

      console.log('Redirecting to:', `/apps/invoice/preview/${firstInvoiceId}`)

      redirect(`/apps/invoice/preview/${firstInvoiceId}`)
    } else {
      console.log('No invoices found, redirecting to not-found')
      redirect('/not-found')
    }
  } catch (error) {
    console.error('Error in DefaultPreviewPage:', error)
    redirect('/not-found')
  }
}

export default DefaultPreviewPage
