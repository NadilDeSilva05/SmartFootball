// MUI Imports
import Grid from '@mui/material/Grid'

// Component Imports
import UserDetails from './UserDetails'
import UserPlan from './UserPlan'

const UserLeftOverview = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={12}>
        <UserDetails />
      </Grid>
      <Grid size={12}>
        <UserPlan />
      </Grid>
    </Grid>
  )
}

export default UserLeftOverview
