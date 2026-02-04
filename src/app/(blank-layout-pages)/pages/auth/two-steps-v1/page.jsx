import TwoStepsV1 from '@views/pages/auth/TwoStepsV1'
import { getServerMode } from '@core/utils/serverHelpers'

const TwoStepsV1Page = async () => {
  const mode = await getServerMode()
  return <TwoStepsV1 mode={mode} />
}

export default TwoStepsV1Page
