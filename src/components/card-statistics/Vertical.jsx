// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

// Components Imports
import CustomAvatar from '@core/components/mui/Avatar'
import OptionMenu from '@core/components/option-menu'

const CardStatVertical = props => {
  // Props
  const { title, stats, avatarIcon, avatarColor, trendNumber, trend, subtitle, avatarSkin, avatarSize, moreOptions } =
    props

  return (
    <Card className='bs-full' sx={{ width: '100%', minWidth: '250px' }}>
      <CardContent>
        <div className='flex justify-between items-center is-full mbe-2'>
          <div className='flex items-center gap-5'>
            <CustomAvatar color={avatarColor} skin={avatarSkin} size='2rem' className='shadow-xs'>
              <i className={avatarIcon} style={{ fontSize: '1.5rem' }} />
            </CustomAvatar>
            <Typography color='text.primary' className='font-medium' variant='h6'>
              {title}
            </Typography>
          </div>
        </div>
        <div className='flex flex-col gap-1'>
          <div className='flex gap-x-2 gap-y-0.5 items-center flex-wrap'>
            <Typography variant='h4'>{stats}</Typography>
            {/* <Typography color={trend === 'negative' ? 'error.main' : 'success.main'}>
              {`${trend === 'negative' ? '-' : '+'}${trendNumber}`}
            </Typography> */}
          </div>
          <Typography variant='body2'>{subtitle}</Typography>
        </div>
      </CardContent>
    </Card>
  )
}

export default CardStatVertical
