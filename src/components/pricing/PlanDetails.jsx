// MUI Imports
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import CardContent from '@mui/material/CardContent'

// Third-party Imports
import classnames from 'classnames'

const PlanDetails = ({ data, pricingPlan }) => {
  return (
    <CardContent
      className={classnames('relative pli-5 !pbe-5 flex flex-col gap-5 border rounded pbs-[3.75rem]', {
        'border-primary': data?.popular
      })}
    >
      {data?.popular ? (
        <Chip
          color='primary'
          label='Popular'
          size='small'
          className='absolute block-start-4 inline-end-5'
          variant='tonal'
        />
      ) : null}
      <div className='flex justify-center'>
        <img
          src={data?.imgSrc || '/images/illustrations/objects/pricing-basic.png'}
          height={data?.imgHeight || 100}
          width={data?.imgWidth || 100}
          alt={`${data?.name?.toLowerCase()?.replace(/\s+/g, '-') || 'plan'}-img`}
        />
      </div>
      <div className='text-center flex flex-col gap-1'>
        <Typography variant='h4'>{data?.name}</Typography>
        <Typography>{data?.subtitle || `${data?.name} Plan`}</Typography>
      </div>
      <div className='relative mlb-3'>
        <div className='flex justify-center'>
          <Typography component='sup' className='self-start font-medium'>
            $
          </Typography>
          <Typography variant='h1' component='span' color='primary'>
            {pricingPlan === 'monthly' ? data?.price : Math.round(data?.price * 0.9)}
          </Typography>
          <Typography component='sub' className='self-end font-medium'>
            /month
          </Typography>
        </div>
        {pricingPlan !== 'monthly' && data?.price ? (
          <Typography variant='caption' className='absolute inline-end-1/2 translate-x-[50%]'>
            {`USD ${Math.round(data?.price * 0.9 * 12)}/year`}
          </Typography>
        ) : null}
      </div>
      <div className='flex flex-col gap-4'>
        {data?.features?.map((item, index) => (
          <div key={index} className='flex items-center gap-2'>
            <span className='inline-flex'>
              <i className='ri-checkbox-blank-circle-line text-sm text-textSecondary' />
            </span>
            <Typography>{item}</Typography>
          </div>
        ))}
      </div>
      <Button
        fullWidth
        color={data?.currentPlan ? 'success' : 'primary'}
        variant={data?.popular ? 'contained' : 'outlined'}
      >
        {data?.currentPlan ? 'Your Current Plan' : 'Upgrade'}
      </Button>
    </CardContent>
  )
}

export default PlanDetails
