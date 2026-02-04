'use client'

// React Imports
import { useMemo } from 'react'

// MUI Imports
import { deepmerge } from '@mui/utils'
import { ThemeProvider as MuiThemeProvider, createTheme, lighten, darken } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'

// Third-party Imports
import { useMedia } from 'react-use'
import stylisRTLPlugin from 'stylis-plugin-rtl'

// Component Imports
import ModeChanger from './ModeChanger'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'

// Core Theme Imports
import defaultCoreTheme from '@core/theme'

const ThemeProvider = props => {
  // Props
  const { children, direction, systemMode } = props

  // Hooks
  const { settings } = useSettings()

  // Merge the primary color scheme override with the core theme
  const theme = useMemo(() => {
    const newColorScheme = {
      colorSchemes: {
        light: {
          palette: {
            primary: {
              main: settings.primaryColor,
              light: lighten(settings.primaryColor, 0.2),
              dark: darken(settings.primaryColor, 0.1)
            }
          }
        },
        dark: {
          palette: {
            primary: {
              main: settings.primaryColor,
              light: lighten(settings.primaryColor, 0.2),
              dark: darken(settings.primaryColor, 0.1)
            }
          }
        }
      }
    }

    // Get core theme without mode dependency (pass 'light' as default)
    const coreTheme = defaultCoreTheme(settings, 'light', direction)

    // Merge the color schemes
    const mergedTheme = deepmerge(coreTheme, newColorScheme)

    // Create the final theme with proper v7 structure
    const finalTheme = createTheme({
      ...mergedTheme,
      cssVariables: {
        colorSchemeSelector: 'data-mui-color-scheme',
        disableCssColorScheme: false
      },
      defaultColorScheme: 'light'
    })

    // Ensure core theme properties are available at theme root level
    finalTheme.mainColorChannels = mergedTheme.mainColorChannels
    finalTheme.customShadows = mergedTheme.customShadows

    return finalTheme
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.primaryColor, settings.skin, direction])

  return (
    <MuiThemeProvider theme={theme}>
      <>
        <ModeChanger />
        <CssBaseline />
        {children}
      </>
    </MuiThemeProvider>
  )
}

export default ThemeProvider
