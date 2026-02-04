'use client'

// React Imports
import { useEffect } from 'react'

// MUI Imports
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'

// Third-party Imports
import stylisRTLPlugin from 'stylis-plugin-rtl'

// Core Theme Imports
import defaultCoreTheme from '@core/theme'

const ThemeProvider = props => {
  // Props
  const { children, direction } = props

  const settings = {
    skin: 'default'
  }

  const theme = createTheme({
    ...defaultCoreTheme(settings, 'light', direction),
    cssVariables: true,
    colorSchemes: { dark: true }
  })

  useEffect(() => {
    document.body.setAttribute('data-mui-color-scheme', 'light')
  }, [])

  return (
    <MuiThemeProvider theme={theme}>
      <>
        <CssBaseline />
        {children}
      </>
    </MuiThemeProvider>
  )
}

export default ThemeProvider
