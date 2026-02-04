// Config Imports
import { i18n } from '@configs/i18n'

// Util Imports
import { ensurePrefix } from '@/utils/string'

// Check if the url is missing the locale
export const isUrlMissingLocale = url => {
  // Always return false since we don't use locales anymore
  return false
}

// Get the localized url
export const getLocalizedUrl = (url, languageCode) => {
  // Simply return the URL as-is since we removed localization
  return url
}
