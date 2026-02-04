// Modern MUI v7 compatible theme helpers

/**
 * Get theme-aware color for MUI v7 with CSS variables
 * This replaces the old mainColorChannels approach
 */
export const getThemeColor = (theme, opacity = 1) => {
  // Validate inputs
  if (!theme) {
    console.warn('getThemeColor: theme is null or undefined')

    return `rgb(46 38 61 / ${opacity})`
  }

  // Use CSS variables if available, fallback to palette
  if (theme.vars) {
    return `rgb(${theme.vars.palette.text.primaryChannel} / ${opacity})`
  }

  // Fallback for components that still need the old approach
  const mainChannels = theme.mainColorChannels?.light || '46 38 61'

  return `rgb(${mainChannels} / ${opacity})`
}

/**
 * Get text color with opacity for charts and components
 */
export const getTextColor = (theme, opacity = 0.4) => {
  if (!theme) {
    console.warn('getTextColor: theme is null or undefined')

    return '#2e263d'
  }

  if (theme.vars) {
    return `rgb(${theme.vars.palette.text.primaryChannel} / ${opacity})`
  }

  // Fallback

  return theme.palette?.text?.primary || '#2e263d'
}

/**
 * Get background color for charts
 */
export const getBackgroundColor = (theme, variant = 'paper') => {
  if (!theme) {
    console.warn('getBackgroundColor: theme is null or undefined')

    return '#ffffff'
  }

  if (theme.vars) {
    return theme.vars.palette.background[variant] || '#ffffff'
  }

  return theme.palette?.background?.[variant] || '#ffffff'
}

/**
 * Legacy compatibility function for existing dashboard components
 * This maintains backward compatibility while we transition
 */
export const getLegacyThemeColor = (theme, mode, opacity = 0.4) => {
  // Validate inputs
  if (!theme) {
    console.warn('getLegacyThemeColor: theme is null or undefined')

    return `rgb(46 38 61 / ${opacity})`
  }

  if (!mode) {
    console.warn('getLegacyThemeColor: mode is null or undefined, defaulting to light')
    mode = 'light'
  }

  // Try modern approach first
  if (theme.vars && theme.vars.palette?.text?.primaryChannel) {
    return `rgb(${theme.vars.palette.text.primaryChannel} / ${opacity})`
  }

  // Fallback to old mainColorChannels approach
  if (theme.mainColorChannels) {
    const _mode = mode === 'system' ? 'light' : mode || 'light'
    const channels = theme.mainColorChannels[_mode] || theme.mainColorChannels.light || '46 38 61'

    // Validate channels format
    if (typeof channels === 'string' && channels.trim()) {
      return `rgb(${channels} / ${opacity})`
    }
  }

  // Final fallback - use theme palette or default
  if (theme.palette?.text?.primary) {
    return theme.palette.text.primary
  }

  // Ultimate fallback

  return `rgb(46 38 61 / ${opacity})`
}
