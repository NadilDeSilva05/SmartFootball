import UnderMaintenance from '@views/pages/misc/UnderMaintenance'
import { getServerMode } from '@core/utils/serverHelpers'

const UnderMaintenancePage = async () => {
  const mode = await getServerMode()
  return <UnderMaintenance mode={mode} />
}

export default UnderMaintenancePage
