import Grid from '@mui/material/Grid'
import ActivityTimeline from '@views/pages/widget-examples/advanced/ActivityTimeline'
import Analytics from '@views/pages/widget-examples/advanced/Analytics'
import CafeBadilico from '@views/pages/widget-examples/advanced/CafeBadilico'
import DepositWithdraw from '@views/pages/widget-examples/advanced/DepositWithdraw'
import DeveloperMeetup from '@views/pages/widget-examples/advanced/DeveloperMeetup'
import FinanceSummary from '@views/pages/widget-examples/advanced/FinanceSummary'
import MeetingSchedule from '@views/pages/widget-examples/advanced/MeetingSchedule'
import SalesByCountries from '@views/pages/widget-examples/advanced/SalesByCountries'
import TeamMembers from '@views/pages/widget-examples/advanced/TeamMembers'
import TotalEarning from '@views/pages/widget-examples/advanced/TotalEarning'
import Transactions from '@views/pages/widget-examples/advanced/Transactions'
import UpgradePlan from '@views/pages/widget-examples/advanced/UpgradePlan'
import WebsiteStatistics from '@views/pages/widget-examples/advanced/WebsiteStatistics'

const WidgetAdvancedPage = () => (
  <Grid container spacing={6}>
    <Grid item xs={12} md={6}>
      <ActivityTimeline />
    </Grid>
    <Grid item xs={12} md={6}>
      <Analytics />
    </Grid>
    <Grid item xs={12} md={6}>
      <CafeBadilico />
    </Grid>
    <Grid item xs={12} md={6}>
      <DepositWithdraw />
    </Grid>
    <Grid item xs={12} md={6}>
      <DeveloperMeetup />
    </Grid>
    <Grid item xs={12} md={6}>
      <FinanceSummary />
    </Grid>
    <Grid item xs={12} md={6}>
      <MeetingSchedule />
    </Grid>
    <Grid item xs={12} md={6}>
      <SalesByCountries />
    </Grid>
    <Grid item xs={12} md={6}>
      <TeamMembers />
    </Grid>
    <Grid item xs={12} md={6}>
      <TotalEarning />
    </Grid>
    <Grid item xs={12} md={6}>
      <Transactions />
    </Grid>
    <Grid item xs={12} md={6}>
      <UpgradePlan />
    </Grid>
    <Grid item xs={12} md={6}>
      <WebsiteStatistics />
    </Grid>
  </Grid>
)

export default WidgetAdvancedPage
