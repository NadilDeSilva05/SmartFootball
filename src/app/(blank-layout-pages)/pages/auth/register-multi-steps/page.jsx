import RegisterMultiSteps from '@views/pages/auth/register-multi-steps'
import { getServerMode } from '@core/utils/serverHelpers'

const RegisterMultiStepsPage = async () => {
  const mode = await getServerMode()
  return <RegisterMultiSteps mode={mode} />
}

export default RegisterMultiStepsPage
