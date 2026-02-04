import Grid from '@mui/material/Grid'
import LineAreaChart from '@views/dashboards/crm/LineAreaChart'
import ActivityTimeline from '@views/dashboards/crm/ActivityTimeline'
import DeveloperMeetup from '@views/dashboards/crm/DeveloperMeetup'
import MeetingSchedule from '@views/dashboards/crm/MeetingSchedule'
import RevenueReport from '@views/dashboards/crm/RevenueReport'
import SalesOverview from '@views/dashboards/crm/SalesOverview'
import TotalSales from '@views/dashboards/crm/TotalSales'
import Transactions from '@views/dashboards/crm/Transactions'
import UpgradePlan from '@views/dashboards/crm/UpgradePlan'
import WeeklySales from '@views/dashboards/crm/WeeklySales'

const CrmPage = () => (
  <Grid container spacing={6}>
    <Grid item xs={12}>
      <LineAreaChart />
    </Grid>
    <Grid item xs={12} md={6}>
      <ActivityTimeline />
    </Grid>
    <Grid item xs={12} md={6}>
      <DeveloperMeetup />
    </Grid>
    <Grid item xs={12} md={6}>
      <MeetingSchedule />
    </Grid>
    <Grid item xs={12} md={6}>
      <RevenueReport />
    </Grid>
    <Grid item xs={12} md={6}>
      <SalesOverview />
    </Grid>
    <Grid item xs={12} md={6}>
      <TotalSales />
    </Grid>
    <Grid item xs={12} md={6}>
      <Transactions />
    </Grid>
    <Grid item xs={12} md={6}>
      <UpgradePlan />
    </Grid>
    <Grid item xs={12} md={6}>
      <WeeklySales />
    </Grid>
  </Grid>
)

export default CrmPage
