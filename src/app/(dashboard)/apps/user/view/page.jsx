'use client'

import Grid from '@mui/material/Grid'
import UserLeftOverview from '@views/apps/user/view/user-left-overview'
import UserRight from '@views/apps/user/view/user-right'
import OverViewTab from '@views/apps/user/view/user-right/overview'
import SecurityTab from '@views/apps/user/view/user-right/security'
import BillingPlans from '@views/apps/user/view/user-right/billing-plans'
import NotificationsTab from '@views/apps/user/view/user-right/notifications'
import ConnectionsTab from '@views/apps/user/view/user-right/connections'

const tabContentList = {
  overview: <OverViewTab />,
  security: <SecurityTab />,
  'billing-plans': <BillingPlans />,
  notifications: <NotificationsTab />,
  connections: <ConnectionsTab />
}

const UserViewPage = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12} lg={4}>
        <UserLeftOverview />
      </Grid>
      <Grid item xs={12} lg={8}>
        <UserRight tabContentList={tabContentList} />
      </Grid>
    </Grid>
  )
}

export default UserViewPage
