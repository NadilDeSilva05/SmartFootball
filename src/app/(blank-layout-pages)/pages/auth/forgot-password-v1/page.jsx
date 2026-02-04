import ForgotPasswordV1 from '@views/pages/auth/ForgotPasswordV1'
import { getServerMode } from '@core/utils/serverHelpers'

const ForgotPasswordV1Page = async () => {
  const mode = await getServerMode()
  return <ForgotPasswordV1 mode={mode} />
}

export default ForgotPasswordV1Page
