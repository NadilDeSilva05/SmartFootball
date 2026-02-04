import VerifyEmailV2 from '@views/pages/auth/VerifyEmailV2'
import { getServerMode } from '@core/utils/serverHelpers'

const VerifyEmailV2Page = async () => {
  const mode = await getServerMode()
  return <VerifyEmailV2 mode={mode} />
}

export default VerifyEmailV2Page
