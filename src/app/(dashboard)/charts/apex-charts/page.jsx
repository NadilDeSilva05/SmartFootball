import Grid from '@mui/material/Grid'
import ApexBarChart from '@views/charts/apex/ApexBarChart'
import ApexAreaChart from '@views/charts/apex/ApexAreaChart'
import ApexLineChart from '@views/charts/apex/ApexLineChart'
import ApexColumnChart from '@views/charts/apex/ApexColumnChart'
import ApexDonutChart from '@views/charts/apex/ApexDonutChart'
import ApexRadarChart from '@views/charts/apex/ApexRadarChart'
import ApexRadialBarChart from '@views/charts/apex/ApexRadialBarChart'
import ApexScatterChart from '@views/charts/apex/ApexScatterChart'
import ApexCandlestickChart from '@views/charts/apex/ApexCandlestickChart'
import ApexHeatmapChart from '@views/charts/apex/ApexHeatmapChart'

const ApexChartsPage = () => (
  <Grid container spacing={6}>
    <Grid item xs={12}>
      <ApexBarChart />
    </Grid>
    <Grid item xs={12} md={6}>
      <ApexAreaChart />
    </Grid>
    <Grid item xs={12} md={6}>
      <ApexLineChart />
    </Grid>
    <Grid item xs={12}>
      <ApexColumnChart />
    </Grid>
    <Grid item xs={12} md={6}>
      <ApexDonutChart />
    </Grid>
    <Grid item xs={12} md={6}>
      <ApexRadarChart />
    </Grid>
    <Grid item xs={12} md={6}>
      <ApexRadialBarChart />
    </Grid>
    <Grid item xs={12} md={6}>
      <ApexScatterChart />
    </Grid>
    <Grid item xs={12}>
      <ApexCandlestickChart />
    </Grid>
    <Grid item xs={12}>
      <ApexHeatmapChart />
    </Grid>
  </Grid>
)

export default ApexChartsPage
