import Grid from '@mui/material/Grid'
import ActivityTimeline from '@views/pages/widget-examples/charts/ActivityTimeline'
import Analytics from '@views/pages/widget-examples/charts/Analytics'
import Performance from '@views/pages/widget-examples/charts/Performance'
import RevenueReport from '@views/pages/widget-examples/charts/RevenueReport'
import SalesOverview from '@views/pages/widget-examples/charts/SalesOverview'
import TotalProfitRadialBar from '@views/pages/widget-examples/charts/TotalProfitRadialBar'
import TotalProfitStackedBar from '@views/pages/widget-examples/charts/TotalProfitStackedBar'
import TotalRevenue from '@views/pages/widget-examples/charts/TotalRevenue'
import TotalSales from '@views/pages/widget-examples/charts/TotalSales'
import TotalVisitors from '@views/pages/widget-examples/charts/TotalVisitors'
import WeeklyOverview from '@views/pages/widget-examples/charts/WeeklyOverview'
import WeeklySales from '@views/pages/widget-examples/charts/WeeklySales'

const WidgetChartsPage = () => (
  <Grid container spacing={6}>
    <Grid item xs={12} md={6}>
      <ActivityTimeline />
    </Grid>
    <Grid item xs={12} md={6}>
      <Analytics />
    </Grid>
    <Grid item xs={12} md={6}>
      <Performance />
    </Grid>
    <Grid item xs={12} md={6}>
      <RevenueReport />
    </Grid>
    <Grid item xs={12} md={6}>
      <SalesOverview />
    </Grid>
    <Grid item xs={12} md={6}>
      <TotalProfitRadialBar />
    </Grid>
    <Grid item xs={12} md={6}>
      <TotalProfitStackedBar />
    </Grid>
    <Grid item xs={12} md={6}>
      <TotalRevenue />
    </Grid>
    <Grid item xs={12} md={6}>
      <TotalSales />
    </Grid>
    <Grid item xs={12} md={6}>
      <TotalVisitors />
    </Grid>
    <Grid item xs={12} md={6}>
      <WeeklyOverview />
    </Grid>
    <Grid item xs={12} md={6}>
      <WeeklySales />
    </Grid>
  </Grid>
)

export default WidgetChartsPage
