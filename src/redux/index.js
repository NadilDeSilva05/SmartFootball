// Store
export { default as store } from './store'

// Provider
export { default as ReduxProvider } from './provider'

// Hooks
export * from './hooks'

// No-op stubs (slices removed) for backwards compatibility with imports
export const handleNotification = () => () => {}
export const setNotification = () => {}
export const clearNotification = () => {}
export const handleModals = () => () => {}
export const setModal = () => {}
export const handleLayout = () => () => {}
export const setMenu = () => {}
export const menuToggle = () => {}
export const menuOpen = () => {}
export const setFontFamily = () => {}
export const setBorderRadius = () => {}
