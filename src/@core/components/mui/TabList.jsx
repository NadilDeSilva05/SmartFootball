// MUI Imports
import MuiTabList from '@mui/lab/TabList'
import { styled } from '@mui/material/styles'

const TabList = styled(MuiTabList)(({ theme, pill, orientation }) => ({
  ...(pill === 'true' && {
    minHeight: 38,
    ...(orientation === 'vertical'
      ? {
          borderInlineEnd: 0
        }
      : {
          borderBlockEnd: 0
        }),
    '&, & .MuiTabs-scroller': {
      ...(orientation === 'vertical' && {
        boxSizing: 'content-box'
      }),
      margin: `${theme.spacing(-1, -1, -1.5, -1)} !important`,
      padding: theme.spacing(1, 1, 1.5, 1)
    },
    '& .MuiTabs-indicator': {
      display: 'none'
    },
    '& .MuiTabs-flexContainer': {
      gap: theme.spacing(1),
      display: 'flex',
      width: '100%',
      // Mobile responsive: stack vertically on small screens
      [theme.breakpoints.down('sm')]: {
        flexDirection: 'column',
        gap: theme.spacing(0.5)
      }
    },
    '& .Mui-selected': {
      backgroundColor: 'var(--mui-palette-primary-main) !important',
      color: 'var(--mui-palette-primary-contrastText) !important',
      boxShadow: 'var(--mui-customShadows-xs)'
    },
    '& .MuiTab-root': {
      minHeight: 38,
      padding: theme.spacing(2, 5.5),
      borderRadius: 'var(--mui-shape-borderRadius)',
      // Desktop: Each tab takes 1/4 of the width
      [theme.breakpoints.up('sm')]: {
        flex: '1 1 25%',
        maxWidth: '25%'
      },
      // Mobile: Full width tabs
      [theme.breakpoints.down('sm')]: {
        flex: '1 1 100%',
        maxWidth: '100%',
        minHeight: 44, // Slightly taller for better touch targets
        padding: theme.spacing(2, 3)
      },
      '&:hover': {
        border: 0,
        backgroundColor: 'var(--mui-palette-primary-lightOpacity)',
        ...(orientation === 'vertical'
          ? {
              paddingInlineEnd: theme.spacing(5.5)
            }
          : {
              paddingBlockEnd: theme.spacing(2)
            })
      }
    }
  })
}))

const CustomTabList = props => <TabList {...props} />

export default CustomTabList
