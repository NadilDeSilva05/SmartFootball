'use client'

// Next Imports
import dynamic from 'next/dynamic'

//MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import Box from '@mui/material/Box'

// Styled Component Imports
const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'))

// Vars - Updated with the actual data from the image
const incomeSeries = [
  {
    name: 'Annual Household Income per Capita USD, Sri Lanka',
    data: [125.248, 171.939, 214.72, 323.718, 393.997, 577.073, 721.9, 955.554, 1162.995, 1385.427]
  }
]

const expensesSeries = [
  {
    name: 'Annual Household Income per Capita USD, Sri Lanka',
    data: [125.248, 171.939, 214.72, 323.718, 393.997, 577.073, 721.9, 955.554, 1162.995, 1385.427]
  }
]

const LineAreaChart = ({ type = 'income' }) => {
  // Hooks
  const theme = useTheme()

  // Vars
  const primaryColor = theme.palette.primary.main
  const series = type === 'income' ? incomeSeries : expensesSeries
  const title = type === 'income' ? 'Income' : 'Expences'
  const categories = [1982, 1986, 1990, 1994, 1998, 2002, 2006, 2010, 2014, 2018]

  const options = {
    chart: {
      type: 'area',
      height: 400,
      width: '100%',
      toolbar: { show: false }
    },
    stroke: {
      width: 3,
      curve: 'smooth'
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.1,
        stops: [0, 100]
      }
    },
    colors: [primaryColor],
    xaxis: {
      categories: categories
    },
    yaxis: {
      labels: {
        formatter: function (value) {
          return value.toFixed(0)
        }
      }
    }
  }

  return (
    <Card sx={{ width: '100%', minWidth: '500px' }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant='h5' sx={{ mb: 3, fontWeight: 'bold' }}>
          {title}
        </Typography>
        <Box sx={{ width: '100%', height: '400px' }}>
          <AppReactApexCharts type='area' height={400} width='100%' options={options} series={series} />
        </Box>
        <Typography
          variant='caption'
          sx={{
            mt: 2,
            display: 'block',
            textAlign: 'right',
            color: theme.palette.text.secondary
          }}
        >
          SOURCE: Smart Football
        </Typography>
      </CardContent>
    </Card>
  )
}

export default LineAreaChart
