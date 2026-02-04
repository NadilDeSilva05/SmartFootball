// React Imports
import { useEffect } from 'react'

// MUI Imports
import { useColorScheme } from '@mui/material/styles'

// Third-party Imports
import { useMedia } from 'react-use'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'

const ModeChanger = () => {
  // Hooks
  const { setMode, mode, systemMode } = useColorScheme()
  const { settings } = useSettings()
  const isDark = useMedia('(prefers-color-scheme: dark)', false)

  useEffect(() => {
    if (settings.mode) {
      let targetMode

      if (settings.mode === 'system') {
        targetMode = isDark ? 'dark' : 'light'
      } else {
        targetMode = settings.mode
      }

      // Only set mode if it's different from current mode
      if (mode !== targetMode) {
        setMode(targetMode)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.mode, isDark])

  // Set initial mode on mount if not already set
  useEffect(() => {
    if (mode === undefined && settings.mode) {
      let targetMode

      if (settings.mode === 'system') {
        targetMode = isDark ? 'dark' : 'light'
      } else {
        targetMode = settings.mode
      }

      setMode(targetMode)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}

export default ModeChanger
