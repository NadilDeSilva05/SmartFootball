'use client'

import AccountSettings from '@views/pages/account-settings'
import Account from '@views/pages/account-settings/account'
import Security from '@views/pages/account-settings/security'
import BillingPlans from '@views/pages/account-settings/billing-plans'
import Notifications from '@views/pages/account-settings/notifications'
import Connections from '@views/pages/account-settings/connections'

const tabContentList = {
  account: <Account />,
  security: <Security />,
  'billing-plans': <BillingPlans />,
  notifications: <Notifications />,
  connections: <Connections />
}

const AccountSettingsPage = () => <AccountSettings tabContentList={tabContentList} />

export default AccountSettingsPage
