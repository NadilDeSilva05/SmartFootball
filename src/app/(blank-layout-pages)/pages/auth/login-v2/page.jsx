import LoginV2 from '@views/pages/auth/LoginV2'
import { getServerMode } from '@core/utils/serverHelpers'

const LoginV2Page = async () => {
  const mode = await getServerMode()
  return <LoginV2 mode={mode} />
}

export default LoginV2Page
