import ForgotPassword from '@views/ForgotPassword'
import { getServerMode } from '@core/utils/serverHelpers'

export const metadata = {
  title: 'Forgot Password - Smart Football - Football Analytics Platform',
  description: 'Forgotten Password to your account'
}

const ForgotPasswordPage = async () => {
  const mode = await getServerMode()
  return <ForgotPassword mode={mode} />
}

export default ForgotPasswordPage
