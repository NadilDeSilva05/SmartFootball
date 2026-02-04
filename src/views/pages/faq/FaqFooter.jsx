// MUI Imports
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'

const FaqFooter = () => {
  return (
    <Card>
      <CardContent className='text-center'>
        <CustomAvatar skin='light' color='primary' className='mli-auto mbe-6' size={88}>
          <i className='ri-questionnaire-line text-[3rem]' />
        </CustomAvatar>
        <Typography variant='h4' className='mbe-2'>
          You still have a question?
        </Typography>
        <Typography className='mbe-6'>
          If you cannot find a question in our FAQ, you can always contact us. We will answer to you shortly!
        </Typography>
        <Grid container spacing={6} className='mbs-6'>
          <Grid size={{ xs: 12, sm: 6 }}>
            <div className='flex items-center justify-center flex-col gap-2'>
              <CustomAvatar skin='light' color='primary' size={52}>
                <i className='ri-phone-line text-[1.375rem]' />
              </CustomAvatar>
              <Typography variant='h6'>+ (810) 2548 2568</Typography>
              <Typography>We are always happy to help.</Typography>
            </div>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <div className='flex items-center justify-center flex-col gap-2'>
              <CustomAvatar skin='light' color='primary' size={52}>
                <i className='ri-mail-line text-[1.375rem]' />
              </CustomAvatar>
              <Typography variant='h6'>hello@help.com</Typography>
              <Typography>Best way to get answer faster!</Typography>
            </div>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default FaqFooter
