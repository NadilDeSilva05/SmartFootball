import Roles from '@views/apps/roles'
import { users } from '@/data/sampleData'

const RolesPage = () => <Roles userData={users || []} />

export default RolesPage
