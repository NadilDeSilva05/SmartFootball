import Register from '@views/Register'
import { getServerMode } from '@core/utils/serverHelpers'

export const metadata = {
  title: 'Register - Smart Football - Football Analytics Platform',
  description: 'Register to your account'
}

const RegisterPage = async () => {
  const mode = await getServerMode()
  return <Register mode={mode} />
}

export default RegisterPage
