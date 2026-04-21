'use client'

import { Provider } from 'react-redux'
import { store } from './store'
import AuthSessionSync from '@/components/AuthSessionSync'

export default function ReduxProvider({ children }) {
  return (
    <Provider store={store}>
      <AuthSessionSync />
      {children}
    </Provider>
  )
}
