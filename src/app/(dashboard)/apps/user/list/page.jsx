import UserList from '@views/apps/user/list'
import { users } from '@/data/sampleData'

const UserListPage = () => <UserList userData={users || []} />

export default UserListPage
