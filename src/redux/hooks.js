import { useDispatch, useSelector } from 'react-redux'

// Custom hooks for easy Redux access
export const useAppDispatch = () => useDispatch()
export const useAppSelector = useSelector

// Notification hooks
export const useNotification = () => {
  const notification = useAppSelector(state => state.notificationReducer)
  const dispatch = useAppDispatch()

  return {
    ...notification,
    dispatch
  }
}

// Modal hooks
export const useModal = () => {
  const modal = useAppSelector(state => state.modalReducer)
  const dispatch = useAppDispatch()

  return {
    ...modal,
    dispatch
  }
}

// Layout hooks
export const useLayout = () => {
  const layout = useAppSelector(state => state.customization)
  const dispatch = useAppDispatch()

  return {
    ...layout,
    dispatch
  }
}
