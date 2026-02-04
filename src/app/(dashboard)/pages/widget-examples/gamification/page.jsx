import Grid from '@mui/material/Grid'
import Award from '@views/pages/widget-examples/gamification/Award'
import Congratulations from '@views/pages/widget-examples/gamification/Congratulations'
import UpgradeAccount from '@views/pages/widget-examples/gamification/UpgradeAccount'
import WelcomeBack from '@views/pages/widget-examples/gamification/WelcomeBack'

const WidgetGamificationPage = () => (
  <Grid container spacing={6}>
    <Grid item xs={12} md={6}>
      <Award />
    </Grid>
    <Grid item xs={12} md={6}>
      <Congratulations />
    </Grid>
    <Grid item xs={12} md={6}>
      <UpgradeAccount />
    </Grid>
    <Grid item xs={12} md={6}>
      <WelcomeBack />
    </Grid>
  </Grid>
)

export default WidgetGamificationPage
