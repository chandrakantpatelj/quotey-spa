import { createSlice } from '@reduxjs/toolkit'

export const appPaymentSlice = createSlice({
  name: 'appPayment',
  initialState: {
    data: [],
    loading: false,
    error: null,
    selectedPayment: {},
    reloadPurchasePayment: true,
    filters: {
      startDate: null,
      endDate: null,
      status: null,
      filterPaymentMethod: null
    }
  },
  reducers: {
    setActionPayment: (state, action) => {
      state.selectedPayment = action.payload
    },
    setAllPoPayments: (state, action) => {
      state.data = action.payload
      state.loading = false
      state.error = null
    },
    setPOPaymentLoading: (state, action) => {
      state.loading = action.payload
      state.error = null
    },
    setPurchaseOrderPaymentFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    resetPurchaseOrderPaymentFilters: state => {
      state.filters = {
        startDate: null,
        endDate: null,
        status: null,
        filterPaymentMethod: null
      }
    },
    setError: (state, action) => {
      state.data = []
      state.loading = false
      state.error = action.payload
    },
    setUpdatePurchasePayment: (state, action) => {
      const filtereData = state.data.map(payment => {
        if (payment.paymentId === action.payload.paymentId) {
          return action.payload
        }
        return payment
      })
      state.data = filtereData
      state.loading = false
    },

    setAddPurchasePayment: (state, action) => {
      state.data = [...(state.data || []), action.payload]
      state.loading = false
    },

    setDeletePurchasePayment: (state, action) => {
      state.data = state.data.filter(item => item.paymentId !== action.payload)
      state.loading = false
    },
    resetPurchasePayment: state => {
      state.data = []
      state.loading = true
      state.error = null
      state.selectedPayment = {}
      state.reloadPurchasePayment = !state.reloadPurchasePayment

      // state.selectedVendor = null
    }
  }
})
export const {
  setActionPayment,
  setAllPoPayments,
  setPOPaymentLoading,
  setError,
  setAddPurchasePayment,
  setDeletePurchasePayment,
  resetPurchasePayment,
  setUpdatePurchasePayment,
  setPurchaseOrderPaymentFilters,
  resetPurchaseOrderPaymentFilters
} = appPaymentSlice.actions
export default appPaymentSlice.reducer
