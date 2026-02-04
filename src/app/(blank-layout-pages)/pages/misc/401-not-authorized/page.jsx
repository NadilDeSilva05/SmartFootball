import NotAuthorized from '@views/NotAuthorized'
import { getServerMode } from '@core/utils/serverHelpers'

const NotAuthorized401Page = async () => {
  const mode = await getServerMode()
  return <NotAuthorized mode={mode} />
}

export default NotAuthorized401Page
