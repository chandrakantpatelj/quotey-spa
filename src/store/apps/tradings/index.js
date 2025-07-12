import { createSlice } from '@reduxjs/toolkit'

export const appTradingSlice = createSlice({
  name: 'apptrading',
  initialState: {
    data: [],
    tradingLoading: true,
    error: null,
    selectedTrading: {},
    reloadTradingLoader: true,
    initiallyLoaded: false,
    filters: {
      startDate: null,
      endDate: null
    }
  },
  reducers: {
    setActionTrading: (state, action) => {
      state.selectedTrading = action.payload
    },
    setAllTrading: (state, action) => {
      state.data = action.payload
      state.tradingLoading = false
      state.error = null
      state.initiallyLoaded = true
    },
    setTradingLoading: (state, action) => {
      state.tradingLoading = action.payload
      state.error = null
    },
    setError: (state, action) => {
      state.data = []
      state.tradingLoading = false
      state.error = action.payload
      state.initiallyLoaded = false
    },
    setAddTrading: (state, action) => {
      state.data = [...(state.data || []), action.payload]
    },
    setUpdateTrading: (state, action) => {
      state.data = state.data.map(item => {
        if (item.tradingId === action.payload.tradingId) {
          return action.payload
        }
        return item
      })
      state.tradingLoading = false
      state.error = null
    },
    setDeleteTrading: (state, action) => {
      state.data = state.data.filter(item => item.tradingId !== action.payload)
      state.tradingLoading = false
    },
    setTradingsFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    resetTradingsFilters: state => {
      state.filters = {
        startDate: null,
        endDate: null
      }
    },
    resetTrading: state => {
      state.data = []
      state.tradingLoading = true
      state.error = null
      state.selectedTrading = {}
      state.reloadTradingLoader = !state.reloadTradingLoader
      state.initiallyLoaded = false
    }
  }
})

export const {
  setActionTrading,
  setAllTrading,
  setAddTrading,
  resetTrading,
  setDeleteTrading,
  setUpdateTrading,
  setError,
  setTradingLoading,
  setTradingsFilters,
  resetTradingsFilters
} = appTradingSlice.actions
export default appTradingSlice.reducer
