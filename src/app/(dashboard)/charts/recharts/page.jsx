import Grid from '@mui/material/Grid'
import RechartsBarChart from '@views/charts/recharts/RechartsBarChart'
import RechartsPieChart from '@views/charts/recharts/RechartsPieChart'
import RechartsLineChart from '@views/charts/recharts/RechartsLineChart'
import RechartsAreaChart from '@views/charts/recharts/RechartsAreaChart'
import RechartsRadarChart from '@views/charts/recharts/RechartsRadarChart'
import RechartsScatterChart from '@views/charts/recharts/RechartsScatterChart'

const RechartsPage = () => (
  <Grid container spacing={6}>
    <Grid item xs={12}>
      <RechartsBarChart />
    </Grid>
    <Grid item xs={12} md={6}>
      <RechartsPieChart />
    </Grid>
    <Grid item xs={12} md={6}>
      <RechartsLineChart />
    </Grid>
    <Grid item xs={12}>
      <RechartsAreaChart />
    </Grid>
    <Grid item xs={12} md={6}>
      <RechartsRadarChart />
    </Grid>
    <Grid item xs={12} md={6}>
      <RechartsScatterChart />
    </Grid>
  </Grid>
)

export default RechartsPage
