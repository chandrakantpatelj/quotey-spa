import { createSlice } from '@reduxjs/toolkit'

export const appTaxPaymentsSlice = createSlice({
  name: 'appTaxPayments',
  initialState: {
    data: [],
    loading: false,
    error: null,
    selectedTaxPayment: null,
    reloadTaxPaymentLoader: true
  },
  reducers: {
    setSelectedTaxPayment: (state, action) => {
      state.selectedTaxPayment = action.payload
    },
    setAllTaxPayment: (state, action) => {
      state.data = action.payload
      state.loading = false
      state.error = null
    },
    setLoading: (state, action) => {
      state.loading = action.payload
      state.error = null
    },
    setUpdateTaxPayment: (state, action) => {
      state.data = state.data.map(item => {
        if (item.bankTransactionId && item.bankTransactionId === action.payload.bankTransactionId) {
          return action.payload
        }
        return item
      })
      if (state?.selectedTaxPayment?.bankTransactionId === action.payload.bankTransactionId) {
        state.selectedTaxPayment = action.payload
      }
      state.loading = false
      state.error = null
    },
    setError: (state, action) => {
      state.data = []
      state.loading = false
      state.error = action.payload
    },
    setAddtaxPayment: (state, action) => {
      state.data = [...(state.data || []), action.payload]
      state.loading = false
    },

    resettaxPayments: state => {
      state.data = []
      state.loading = true
      state.error = null
      state.selectedTaxPayment = {}
      state.reloadTaxPaymentLoader = !state.reloadTaxPaymentLoader
    }
  }
})

export const {
  setSelectedTaxPayment,
  setLoading,
  setError,
  setAllTaxPayment,
  setUpdateTaxPayment,
  setAddtaxPayment,
  resettaxPayments
} = appTaxPaymentsSlice.actions
export default appTaxPaymentsSlice.reducer
