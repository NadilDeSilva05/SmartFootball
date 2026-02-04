// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'

// Components Imports
import CustomAvatar from '@core/components/mui/Avatar'

const CardStatWithImage = props => {
  // Props
  const { title, stats, trendNumber, trend, chipText, chipColor } = props

  return (
    <Card className='relative overflow-visible w-full' sx={{ width: '100%', minWidth: '250px', minHeight: '80px' }}>
      <CardContent className='text-center'>
        <div className='flex justify-center mt-2 mb-2'>
          <Chip label={title} color={chipColor} variant='tonal' size='large' sx={{ fontSize: '1rem' }} />
        </div>
        <div className='flex justify-center items-center flex-wrap'>
          <Typography variant='h3' className='text-center'>
            {stats}
          </Typography>
          {/* <Typography color={trend === 'negative' ? 'error.main' : 'success.main'}>
            {`${trend === 'negative' ? '-' : '+'}${trendNumber}`}
          </Typography> */}
        </div>
      </CardContent>
    </Card>
  )
}

export default CardStatWithImage
