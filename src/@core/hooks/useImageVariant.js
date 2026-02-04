// React Imports
import { useMemo, useState, useEffect } from 'react'

// Third-party imports
import { useColorScheme } from '@mui/material'

// Hook Imports
import { useSettings } from './useSettings'

export const useImageVariant = (mode, imgLight, imgDark, imgLightBordered, imgDarkBordered) => {
  // States
  const [isMounted, setIsMounted] = useState(false)

  // Hooks
  const { settings } = useSettings()
  const { mode: muiMode, systemMode: muiSystemMode } = useColorScheme()

  // Effects
  useEffect(() => {
    setIsMounted(true)
  }, [])

  return useMemo(() => {
    // During SSR and before mounting, use the default light image to prevent hydration mismatch
    if (!isMounted) {
      return imgLight
    }

    const currentMode = muiMode === 'system' ? muiSystemMode : muiMode
    const isBordered = settings?.skin === 'bordered'
    const isDarkMode = currentMode === 'dark'

    if (isBordered && imgLightBordered && imgDarkBordered) {
      return isDarkMode ? imgDarkBordered : imgLightBordered
    }

    return isDarkMode ? imgDark : imgLight
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMounted, mode, muiMode, muiSystemMode, settings?.skin])
}
