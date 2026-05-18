import { configureStore } from '@reduxjs/toolkit'
import authenticationReducer from './slices/authenticationSlice'

export const store = configureStore({
  reducer: {
    authenticationReducer
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      immutableCheck: false,
      serializableCheck: false
    })
})

export default store
