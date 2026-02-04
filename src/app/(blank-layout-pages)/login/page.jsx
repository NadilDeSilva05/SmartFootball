import Login from '@views/Login'
import { getServerMode } from '@core/utils/serverHelpers'

export const metadata = {
  title: 'Login - Smart Football - Football Analytics Platform',
  description: 'Login to your account'
}

const LoginPage = async () => {
  const mode = await getServerMode()
  return <Login mode={mode} />
}

export default LoginPage
