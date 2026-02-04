// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'

// Component Imports
import AddEditAddress from '@components/dialogs/add-edit-address'
import OpenDialogOnElementClick from '@components/dialogs/OpenDialogOnElementClick'

const BillingAddress = () => {
  // Vars
  const buttonProps = {
    variant: 'contained',
    children: 'Edit Address'
  }

  return (
    <Card>
      <CardHeader
        title='Billing Address'
        action={<OpenDialogOnElementClick element={Button} elementProps={buttonProps} dialog={AddEditAddress} />}
      />
      <CardContent>
        <Grid container spacing={6}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField fullWidth label='Company Name' placeholder='Enter company name' defaultValue='PixInvent' />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label='Billing Email'
              placeholder='Enter billing email'
              defaultValue='john.doe@gmail.com'
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField fullWidth label='Tax ID' placeholder='Enter tax ID' defaultValue='Tax-8894' />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField fullWidth label='VAT Number' placeholder='Enter VAT number' defaultValue='FDXK-2432' />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField fullWidth label='Contact' placeholder='Enter contact number' defaultValue='+1 (234) 567-8901' />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField fullWidth label='Website' placeholder='Enter website' defaultValue='https://pixinvent.com' />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label='Address Line 1'
              placeholder='Enter address line 1'
              defaultValue='100 Water Plant Avenue'
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label='Address Line 2'
              placeholder='Enter address line 2'
              defaultValue='Building 1303 Wake Island'
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField fullWidth label='City' placeholder='Enter city' defaultValue='New York' />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField fullWidth label='State' placeholder='Enter state' defaultValue='New York' />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField fullWidth label='Zip Code' placeholder='Enter zip code' defaultValue='10001' />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField fullWidth label='Country' placeholder='Enter country' defaultValue='United States' />
          </Grid>
          <Grid size={12}>
            <FormControlLabel control={<Checkbox defaultChecked />} label='Make this default billing address?' />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default BillingAddress
