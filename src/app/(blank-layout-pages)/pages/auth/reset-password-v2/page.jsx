import ResetPasswordV2 from '@views/pages/auth/ResetPasswordV2'
import { getServerMode } from '@core/utils/serverHelpers'

const ResetPasswordV2Page = async () => {
  const mode = await getServerMode()
  return <ResetPasswordV2 mode={mode} />
}

export default ResetPasswordV2Page
