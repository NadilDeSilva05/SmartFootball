import TwoStepsV2 from '@views/pages/auth/TwoStepsV2'
import { getServerMode } from '@core/utils/serverHelpers'

const TwoStepsV2Page = async () => {
  const mode = await getServerMode()
  return <TwoStepsV2 mode={mode} />
}

export default TwoStepsV2Page
