import { toast } from 'react-toastify'

export const getErrorMessage = (error, fallback = 'Something went wrong. Please try again.') => {
  if (typeof error === 'string' && error.trim()) return error
  if (error?.response?.data?.error) return error.response.data.error
  if (error?.data?.error) return error.data.error
  if (error?.error) return error.error
  if (error?.message) return error.message

  return fallback
}

export const notifySuccess = message => {
  toast.success(message)
}

export const notifyError = (error, fallback) => {
  toast.error(getErrorMessage(error, fallback))
}
