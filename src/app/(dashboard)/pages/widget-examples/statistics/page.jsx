import Grid from '@mui/material/Grid'
import BarChartWithNegativeValues from '@views/pages/widget-examples/statistics/BarChartWithNegativeValues'
import Character from '@views/pages/widget-examples/statistics/Character'
import DistributedColumnChart from '@views/pages/widget-examples/statistics/DistributedColumnChart'
import Horizontal from '@views/pages/widget-examples/statistics/Horizontal'
import LineAreaChart from '@views/pages/widget-examples/statistics/LineAreaChart'
import LineChart from '@views/pages/widget-examples/statistics/LineChart'
import LineChartWithShadow from '@views/pages/widget-examples/statistics/LineChartWithShadow'
import RadialBarChart from '@views/pages/widget-examples/statistics/RadialBarChart'
import TotalSales from '@views/pages/widget-examples/statistics/TotalSales'
import Transactions from '@views/pages/widget-examples/statistics/Transactions'
import Vertical from '@views/pages/widget-examples/statistics/Vertical'

const WidgetStatisticsPage = () => (
  <Grid container spacing={6}>
    <Grid item xs={12} md={6}>
      <BarChartWithNegativeValues />
    </Grid>
    <Grid item xs={12} md={6}>
      <Character />
    </Grid>
    <Grid item xs={12} md={6}>
      <DistributedColumnChart />
    </Grid>
    <Grid item xs={12} md={6}>
      <Horizontal />
    </Grid>
    <Grid item xs={12} md={6}>
      <LineAreaChart />
    </Grid>
    <Grid item xs={12} md={6}>
      <LineChart />
    </Grid>
    <Grid item xs={12} md={6}>
      <LineChartWithShadow />
    </Grid>
    <Grid item xs={12} md={6}>
      <RadialBarChart />
    </Grid>
    <Grid item xs={12} md={6}>
      <TotalSales />
    </Grid>
    <Grid item xs={12} md={6}>
      <Transactions />
    </Grid>
    <Grid item xs={12} md={6}>
      <Vertical />
    </Grid>
  </Grid>
)

export default WidgetStatisticsPage
