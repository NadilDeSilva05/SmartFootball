import { store } from '@/redux/store'

/**
 * Navigate after successful authentication with proper timing
 * @param {string} url - URL to navigate to
 * @param {function} routerPush - Next.js router push function
 * @param {number} maxWaitTime - Maximum time to wait for auth state (ms)
 */
export const navigateAfterAuth = (url, routerPush, maxWaitTime = 3000) => {
  const checkAuthAndNavigate = () => {
    const state = store.getState()
    const authData = state?.authenticationReducer?.loginData

    if (authData?.token) {
      // Auth state is available, navigate now
      console.log('✅ Auth state confirmed, navigating to:', url)
      routerPush(url)
      return true
    }
    return false
  }

  // First try immediate navigation
  if (checkAuthAndNavigate()) {
    return
  }

  // If not available, poll for auth state
  const startTime = Date.now()
  const pollInterval = 100 // Check every 100ms

  const poll = () => {
    if (checkAuthAndNavigate()) {
      return // Successfully navigated
    }

    if (Date.now() - startTime >= maxWaitTime) {
      // Timeout reached, force navigation anyway
      console.warn('⚠️ Auth state polling timeout, forcing navigation')
      routerPush(url)
      return
    }

    // Continue polling
    setTimeout(poll, pollInterval)
  }

  setTimeout(poll, pollInterval)
}

/**
 * Check if authentication is persisted (useful for immediate checks)
 */
export const checkPersistedAuth = () => {
  try {
    const state = store.getState()
    const authData = state?.authenticationReducer?.loginData
    return Boolean(authData?.token)
  } catch (error) {
    console.error('Error checking persisted auth:', error)
    return false
  }
}

/**
 * Wait for auth state to be persisted before proceeding
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<boolean>} - Resolves to true if auth is found, false if timeout
 */
export const waitForAuthPersistence = (timeout = 3000) => {
  return new Promise(resolve => {
    const startTime = Date.now()

    const check = () => {
      if (checkPersistedAuth()) {
        resolve(true)
        return
      }

      if (Date.now() - startTime >= timeout) {
        resolve(false)
        return
      }

      setTimeout(check, 100)
    }

    check()
  })
}
