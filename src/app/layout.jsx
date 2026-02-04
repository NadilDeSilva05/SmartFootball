// Third-party Imports
import 'react-perfect-scrollbar/dist/css/styles.css'

// Style Imports
import '@/app/globals.css'

//Generated Icon CSS Imports namo buddhaya
import '@assets/iconify-icons/generated-icons.css'

// Redux Provider
import ReduxProvider from '@/redux/provider'

export const metadata = {
  title: 'Smart Football',
  description:
    'Smart Football. A comprehensive football analytics platform. Manage your football analytics with ease, clarity, and control.'
}

const RootLayout = ({ children }) => {
  return (
    <html id='__next' lang='en' dir='ltr'>
      <body className='flex is-full min-bs-full flex-auto flex-col' suppressHydrationWarning={true}>
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  )
}

export default RootLayout
