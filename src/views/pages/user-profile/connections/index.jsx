// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'

const Connections = ({ data }) => {
  return (
    <Grid container spacing={6}>
      {data &&
        data.map((item, index) => (
          <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={index}>
            <Card>
              <CardContent className='flex flex-col items-center gap-4'>
                <div className='flex items-center gap-2'>
                  <CustomAvatar src={item.avatar} size={38} />
                  <div className='flex flex-col'>
                    <Typography variant='h6'>{item.name}</Typography>
                    <Typography variant='body2' color='text.secondary'>
                      {item.designation}
                    </Typography>
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                  <Chip variant='tonal' size='small' label={`${item.connections} Connections`} color='secondary' />
                  <Button variant='outlined' size='small' color='secondary' className='rounded-full'>
                    Connected
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Grid>
        ))}
    </Grid>
  )
}

export default Connections
