import { createSlice } from '@reduxjs/toolkit'

export const appQuotationSlice = createSlice({
  name: 'appsQuotation',
  initialState: {
    data: [],
    loading: false,
    error: null,
    selectedQuotation: null,
    reloadQuotation: true
  },
  reducers: {
    setSelectedQuotation: (state, action) => {
      state.selectedQuotation = action.payload
    },
    setAllQuotations: (state, action) => {
      state.data = action.payload
      state.loading = false
      state.error = null
    },
    setLoading: (state, action) => {
      // state.data = []
      state.loading = action.payload
      state.error = null
    },
    setError: (state, action) => {
      state.data = []
      state.loading = false
      state.error = action.payload
    },
    setAddQuotation: (state, action) => {
      state.data = [...(state.data || []), action.payload]
    },
    setUpdateQuotation: (state, action) => {
      state.data = state.data.map(item => {
        if (item.quotationId === action.payload.quotationId) {
          return action.payload
        }
        return item
      })
      state.loading = false
      state.error = null
    },
    setDeleteQuotation: (state, action) => {
      state.data = state.data.filter(item => item.quotationId !== action.payload)
    },
    resetQuotation: state => {
      state.data = []
      state.selectedQuotation = {}
      state.loading = true
      state.reloadQuotation = !state.reloadQuotation
    }
  }
})
export const {
  setAllQuotations,
  setAddQuotation,
  setLoading,
  setError,
  setUpdateQuotation,
  setDeleteQuotation,
  setSelectedQuotation,
  resetQuotation
} = appQuotationSlice.actions
export default appQuotationSlice.reducer
