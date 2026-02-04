// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'

const Teams = ({ data }) => {
  return (
    <Grid container spacing={6}>
      {data &&
        data.map((item, index) => (
          <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={index}>
            <Card>
              <CardHeader
                title={`${item.title} (${item.members})`}
                action={<i className='ri-more-2-line' />}
                avatar={
                  <CustomAvatar skin='light' color={item.avatarColor} size={38}>
                    <i className={item.avatarIcon} />
                  </CustomAvatar>
                }
              />
              <CardContent>
                <Typography className='mbe-5'>{item.description}</Typography>
                <div className='flex justify-between items-center'>
                  <Chip label={item.extraMembers} variant='tonal' size='small' color='secondary' />
                  <div className='flex -space-x-2'>
                    {item.avatarGroup.map((person, index) => (
                      <CustomAvatar key={index} src={person.avatar} size={32} />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Grid>
        ))}
    </Grid>
  )
}

export default Teams
