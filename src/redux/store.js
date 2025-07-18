import { configureStore } from '@reduxjs/toolkit'
import leadReducer from './slices/leadSlice'

export const store = configureStore({
  reducer: {
    leads: leadReducer
  }
})
