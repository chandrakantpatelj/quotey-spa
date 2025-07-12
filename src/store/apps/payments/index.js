import { createSlice } from '@reduxjs/toolkit'

export const appPaymentSlice = createSlice({
  name: 'appSalesPayment',
  initialState: {
    data: [],
    salesPaymentLoading: true,
    error: null,
    selectedPayment: {},
    reloadSalesPaymentLoader: true,
    filters: {
      filterStartDate: null,
      filterEndDate: null,
      filterStatus: null,
      filterPaymentMethod: null,
      filterCustomer: null
    }
  },
  reducers: {
    setActionPayment: (state, action) => {
      state.selectedPayment = action.payload
    },
    setLoading: (state, action) => {
      state.salesPaymentLoading = action.payload
      state.error = null
    },
    setError: (state, action) => {
      state.data = []
      state.salesPaymentLoading = false
      state.error = action.payload
    },
    setAllSalesPayments: (state, action) => {
      state.data = action.payload
      state.salesPaymentLoading = false
      state.error = null
    },
    setAddSalesPayment: (state, action) => {
      state.data = [...(state.data || []), action.payload]
      state.salesPaymentLoading = false
    },

    setDeleteSalesPayment: (state, action) => {
      state.data = state.data.filter(item => item.paymentId !== action.payload)
      state.salesPaymentLoading = false
      state.reloadSalesPaymentLoader = !state.reloadSalesPaymentLoader
    },
    setUpdateSalesPayment: (state, action) => {
      state.data = state.data.map(item => {
        if (item.paymentId === action.payload.paymentId) {
          return action.payload
        }
        return item
      })
      state.salesPaymentLoading = false
      state.reloadSalesPaymentLoader = !state.reloadSalesPaymentLoader
      state.error = null
    },
    setSalesPaymentFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    resetSalesPaymentFilters: state => {
      state.filters = {
        filterStartDate: null,
        filterEndDate: null,
        filterStatus: null,
        filterPaymentMethod: null,
        filterCustomer: null
      }
    },
    resetSalesPayment: state => {
      state.data = []
      state.selectedPayment = null
      state.salesPaymentLoading = true
      state.reloadSalesPaymentLoader = !state.reloadSalesPaymentLoader
    }
  }
})
export const {
  setActionPayment,
  setAllSalesPayments,
  setLoading,
  setError,
  setAddSalesPayment,
  setDeleteSalesPayment,
  setUpdateSalesPayment,
  resetSalesPayment,
  setSalesPaymentFilters,
  resetSalesPaymentFilters
} = appPaymentSlice.actions
export default appPaymentSlice.reducer
