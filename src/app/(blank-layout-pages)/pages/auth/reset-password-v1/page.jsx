import ResetPasswordV1 from '@views/pages/auth/ResetPasswordV1'
import { getServerMode } from '@core/utils/serverHelpers'

const ResetPasswordV1Page = async () => {
  const mode = await getServerMode()
  return <ResetPasswordV1 mode={mode} />
}

export default ResetPasswordV1Page
