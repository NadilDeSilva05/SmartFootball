import Grid from '@mui/material/Grid'
import Award from '@views/dashboards/analytics/Award'
import Transactions from '@views/dashboards/analytics/Transactions'
import WeeklyOverview from '@views/dashboards/analytics/WeeklyOverview'
import TotalEarning from '@views/dashboards/analytics/TotalEarning'
import LineChart from '@views/dashboards/analytics/LineChart'
import DistributedColumnChart from '@views/dashboards/analytics/DistributedColumnChart'
import Performance from '@views/dashboards/analytics/Performance'
import DepositWithdraw from '@views/dashboards/analytics/DepositWithdraw'
import SalesByCountries from '@views/dashboards/analytics/SalesByCountries'
import Table from '@views/dashboards/analytics/Table'

const AnalyticsPage = () => (
  <Grid container spacing={6}>
    <Grid item xs={12} md={4}>
      <Award />
    </Grid>
    <Grid item xs={12} md={8}>
      <Transactions />
    </Grid>
    <Grid item xs={12} md={4}>
      <WeeklyOverview />
    </Grid>
    <Grid item xs={12} md={8}>
      <TotalEarning />
    </Grid>
    <Grid item xs={12}>
      <LineChart />
    </Grid>
    <Grid item xs={12} md={6}>
      <DistributedColumnChart />
    </Grid>
    <Grid item xs={12} md={6}>
      <Performance />
    </Grid>
    <Grid item xs={12} md={6}>
      <DepositWithdraw />
    </Grid>
    <Grid item xs={12} md={6}>
      <SalesByCountries />
    </Grid>
    <Grid item xs={12}>
      <Table />
    </Grid>
  </Grid>
)

export default AnalyticsPage
