import { createSlice } from '@reduxjs/toolkit'

export const appStockAdustmentsSlice = createSlice({
  name: 'appStockAdustments',
  initialState: {
    data: [],
    loading: false,
    error: null,
    selectedStock: {},
    reloadStock: true,
    filters: {
      startDate: null,
      endDate: null,
      filterStatus: null
    }
  },
  reducers: {
    setSelectedStock: (state, action) => {
      state.selectedStock = action.payload
    },
    setAllStockAdjustments: (state, action) => {
      state.data = action.payload
      state.loading = false
      state.error = null
    },
    setLoading: (state, action) => {
      state.loading = action.payload
      state.error = null
    },
    setError: (state, action) => {
      state.data = []
      state.loading = false
      state.error = action.payload
    },
    setAddStock: (state, action) => {
      state.data = [...(state.data || []), action.payload]
      state.loading = false
    },
    setAddStocksArry: (state, action) => {
      state.data = [...state.data, ...action.payload]
      state.loading = false
    },
    setUpdateStock: (state, action) => {
      state.data = state.data.map(item => {
        if (item.stockAdjustmentId === action.payload.stockAdjustmentId) {
          return action.payload
        }
        return item
      })
      state.loading = false
      state.error = null
    },
    setDeleteStock: (state, action) => {
      state.data = state.data.filter(item => item.stockAdjustmentId !== action.payload)
    },
    setStockFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    resetStockFilters: state => {
      state.filters = {
        startDate: null,
        endDate: null,
        filterStatus: null
      }
    },
    resetStock: state => {
      state.data = []
      state.loading = true
      state.error = null
      state.selectedStock = {}
      state.reloadStock = !state.reloadStock
    }
  }
})
export const {
  setSelectedStock,
  setAllStockAdjustments,
  setAddStock,
  setUpdateStock,
  setDeleteStock,
  setAddStocksArry,
  setLoading,
  setError,
  resetStock,
  setStockFilters,
  resetStockFilters
} = appStockAdustmentsSlice.actions
export default appStockAdustmentsSlice.reducer
