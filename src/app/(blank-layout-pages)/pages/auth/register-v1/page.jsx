import RegisterV1 from '@views/pages/auth/RegisterV1'
import { getServerMode } from '@core/utils/serverHelpers'

const RegisterV1Page = async () => {
  const mode = await getServerMode()
  return <RegisterV1 mode={mode} />
}

export default RegisterV1Page
