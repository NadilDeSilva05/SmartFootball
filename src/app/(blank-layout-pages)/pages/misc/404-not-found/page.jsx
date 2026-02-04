import NotFound from '@views/NotFound'
import { getServerMode } from '@core/utils/serverHelpers'

const NotFound404Page = async () => {
  const mode = await getServerMode()
  return <NotFound mode={mode} />
}

export default NotFound404Page
