'use server'

// Next Imports
import { cookies, headers } from 'next/headers'

// Config Imports
import themeConfig from '@configs/themeConfig'
import demoConfigs from '@configs/demoConfigs'

export const getDemoName = async () => {
  const headersList = await headers()

  return headersList.get('X-server-header')
}

export const getSettingsFromCookie = async () => {
  const cookieStore = await cookies()
  const demoName = await getDemoName()

  const cookieName = demoName
    ? themeConfig.settingsCookieName.replace('demo-1', demoName)
    : themeConfig.settingsCookieName

  return JSON.parse(cookieStore.get(cookieName)?.value || '{}')
}

export const getMode = async () => {
  const settingsCookie = await getSettingsFromCookie()
  const demoName = await getDemoName()

  // Get mode from cookie or fallback to theme config (default light)
  const _mode = settingsCookie.mode ?? (demoName && demoConfigs[demoName]?.mode) ?? themeConfig.mode ?? 'light'

  return _mode
}

export const getSystemMode = async () => {
  const cookieStore = await cookies()
  const mode = await getMode()
  const colorPrefCookie = cookieStore.get('colorPref')?.value || 'light'

  return (mode === 'system' ? colorPrefCookie : mode) || 'light'
}

export const getServerMode = async () => {
  const mode = await getMode()
  const systemMode = await getSystemMode()

  return mode === 'system' ? systemMode : mode
}

export const getSkin = async () => {
  const settingsCookie = await getSettingsFromCookie()

  return settingsCookie.skin || 'default'
}
