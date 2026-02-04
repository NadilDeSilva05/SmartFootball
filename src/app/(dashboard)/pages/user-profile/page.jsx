'use client'

import UserProfile from '@views/pages/user-profile'
import ProfileTab from '@views/pages/user-profile/profile'
import Teams from '@views/pages/user-profile/teams'
import Projects from '@views/pages/user-profile/projects'
import Connections from '@views/pages/user-profile/connections'

const defaultData = {
  profileHeader: {},
  connections: [],
  teamsTech: [],
  projectTable: [],
  teams: []
}

const tabContentList = {
  profile: <ProfileTab data={defaultData} />,
  teams: <Teams data={defaultData.teams} />,
  projects: <Projects data={defaultData.projectTable} />,
  connections: <Connections data={defaultData.connections} />
}

const UserProfilePage = () => <UserProfile tabContentList={tabContentList} data={defaultData} />

export default UserProfilePage
