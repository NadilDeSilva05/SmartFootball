import ComingSoon from '@views/pages/misc/ComingSoon'
import { getServerMode } from '@core/utils/serverHelpers'

const ComingSoonPage = async () => {
  const mode = await getServerMode()
  return <ComingSoon mode={mode} />
}

export default ComingSoonPage
