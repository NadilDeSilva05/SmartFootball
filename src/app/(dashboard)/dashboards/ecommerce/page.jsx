import Grid from '@mui/material/Grid'
import Congratulations from '@views/dashboards/ecommerce/Congratulations'
import TotalProfitStackedBar from '@views/dashboards/ecommerce/TotalProfitStackedBar'
import TotalSales from '@views/dashboards/ecommerce/TotalSales'
import LineChartWithShadow from '@views/dashboards/ecommerce/LineChartWithShadow'
import RadialBarChart from '@views/dashboards/ecommerce/RadialBarChart'
import Transactions from '@views/dashboards/ecommerce/Transactions'
import NewVisitors from '@views/dashboards/ecommerce/NewVisitors'
import WebsiteStatistics from '@views/dashboards/ecommerce/WebsiteStatistics'
import DashboardTables from '@views/dashboards/ecommerce/Table'
import MeetingSchedule from '@views/dashboards/ecommerce/MeetingSchedule'
import { invoices } from '@/data/sampleData'

const EcommercePage = () => (
  <Grid container spacing={6}>
    <Grid item xs={12} md={4}>
      <Congratulations />
    </Grid>
    <Grid item xs={12} md={8}>
      <TotalProfitStackedBar />
    </Grid>
    <Grid item xs={12} md={4}>
      <TotalSales />
    </Grid>
    <Grid item xs={12} md={8}>
      <LineChartWithShadow />
    </Grid>
    <Grid item xs={12} md={4}>
      <RadialBarChart />
    </Grid>
    <Grid item xs={12} md={8}>
      <Transactions />
    </Grid>
    <Grid item xs={12} md={6}>
      <NewVisitors />
    </Grid>
    <Grid item xs={12} md={6}>
      <WebsiteStatistics />
    </Grid>
    <Grid item xs={12} md={6}>
      <DashboardTables invoiceData={invoices || []} />
    </Grid>
    <Grid item xs={12} md={6}>
      <MeetingSchedule />
    </Grid>
  </Grid>
)

export default EcommercePage
