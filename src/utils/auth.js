'use client'

import { useSelector } from 'react-redux'

/**
 * Check if user is authenticated
 * @returns {boolean} True if user is authenticated
 */
export const isAuthenticated = () => {
  if (typeof window === 'undefined') return false

  try {
    // Check Redux state first
    const authState = window.__REDUX_STATE__?.authenticationReducer
    if (authState?.loginData?.token && !authState?.isLogout) {
      return true
    }

    // Fallback to session storage
    const sessionData = sessionStorage.getItem('persist:authenticationReducer')
    if (sessionData) {
      const parsed = JSON.parse(sessionData)
      const loginData = typeof parsed.loginData === 'string' ? JSON.parse(parsed.loginData) : parsed.loginData

      return !!(loginData?.token && !parsed.isLogout)
    }

    // Fallback to HTTP cookies
    const cookieValue = document.cookie
      .split('; ')
      .find(row => row.startsWith('persist:authenticationReducer='))
      ?.split('=')[1]

    if (cookieValue) {
      const decoded = decodeURIComponent(cookieValue)
      const parsed = JSON.parse(decoded)
      const loginData = typeof parsed.loginData === 'string' ? JSON.parse(parsed.loginData) : parsed.loginData

      return !!(loginData?.token && !parsed.isLogout)
    }

    return false
  } catch (error) {
    console.error('Error checking authentication:', error)
    return false
  }
}

/**
 * Get current user data
 * @returns {object|null} User object or null if not authenticated
 */
export const getCurrentUser = () => {
  if (typeof window === 'undefined') return null

  try {
    // Check Redux state first
    const authState = window.__REDUX_STATE__?.authenticationReducer
    if (authState?.loginData?.user) {
      return authState.loginData.user
    }

    // Fallback to session storage
    const sessionData = sessionStorage.getItem('persist:authenticationReducer')
    if (sessionData) {
      const parsed = JSON.parse(sessionData)
      const loginData = typeof parsed.loginData === 'string' ? JSON.parse(parsed.loginData) : parsed.loginData

      return loginData?.user || null
    }

    // Fallback to HTTP cookies
    const cookieValue = document.cookie
      .split('; ')
      .find(row => row.startsWith('persist:authenticationReducer='))
      ?.split('=')[1]

    if (cookieValue) {
      const decoded = decodeURIComponent(cookieValue)
      const parsed = JSON.parse(decoded)
      const loginData = typeof parsed.loginData === 'string' ? JSON.parse(parsed.loginData) : parsed.loginData

      return loginData?.user || null
    }

    return null
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

/**
 * Get authentication token
 * @returns {string|null} Token string or null if not authenticated
 */
export const getAuthToken = () => {
  if (typeof window === 'undefined') return null

  try {
    // Check Redux state first
    const authState = window.__REDUX_STATE__?.authenticationReducer
    if (authState?.loginData?.token) {
      return authState.loginData.token
    }

    // Fallback to session storage
    const sessionData = sessionStorage.getItem('persist:authenticationReducer')
    if (sessionData) {
      const parsed = JSON.parse(sessionData)
      const loginData = typeof parsed.loginData === 'string' ? JSON.parse(parsed.loginData) : parsed.loginData

      return loginData?.token || null
    }

    // Fallback to HTTP cookies
    const cookieValue = document.cookie
      .split('; ')
      .find(row => row.startsWith('persist:authenticationReducer='))
      ?.split('=')[1]

    if (cookieValue) {
      const decoded = decodeURIComponent(cookieValue)
      const parsed = JSON.parse(decoded)
      const loginData = typeof parsed.loginData === 'string' ? JSON.parse(parsed.loginData) : parsed.loginData

      return loginData?.token || null
    }

    return null
  } catch (error) {
    console.error('Error getting auth token:', error)
    return null
  }
}

/**
 * Check if user has specific role
 * @param {string|string[]} requiredRole - Role or array of roles to check
 * @returns {boolean} True if user has the required role
 */
export const hasRole = requiredRole => {
  if (typeof window === 'undefined') return false

  try {
    const user = getCurrentUser()
    if (!user) return false

    const userRole = user.role || user.accountRole || user.userRole
    if (!userRole) return false

    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(userRole)
    }

    return userRole === requiredRole
  } catch (error) {
    console.error('Error checking user role:', error)
    return false
  }
}
