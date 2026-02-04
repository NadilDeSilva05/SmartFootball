// Component Imports
import Providers from '@components/Providers'

// Util Imports
import { getSettingsFromCookie } from '@core/utils/serverHelpers'

const Layout = async ({ children }) => {
  const settingsCookie = await getSettingsFromCookie()

  return <Providers direction='ltr'>{children}</Providers>
}

export default Layout
