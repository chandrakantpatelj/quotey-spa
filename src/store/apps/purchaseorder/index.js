import { createSlice } from '@reduxjs/toolkit'

export const appPurchaseOrderSlice = createSlice({
  name: 'appPurchaseOrder',
  initialState: {
    data: [],
    loading: false,
    error: null,
    selectedPurchaseOrder: null,
    reloadPurchaseOrder: true,
    filters: {
      startDate: null,
      endDate: null,
      status: null,
      selectedVendor: null
    }
  },
  reducers: {
    setActionPurchaseOrder: (state, action) => {
      state.selectedPurchaseOrder = action.payload
    },
    setAllPurchaseOrder: (state, action) => {
      state.data = action.payload
      state.loading = false
      state.error = null
    },
    setLoading: (state, action) => {
      state.loading = action.payload
      state.error = null
    },
    setPurchaseOrderFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    resetPurchaseOrderFilters: state => {
      state.filters = {
        startDate: null,
        endDate: null,
        status: null,
        selectedVendor: null
      }
    },
    setError: (state, action) => {
      state.data = []
      state.loading = false
      state.error = action.payload
    },
    setAddPurchaseOrder: (state, action) => {
      state.data = [...(state.data || []), action.payload]
      state.loading = false
    },
    setUpdatePurchaseOrder: (state, action) => {
      state.data = state.data.map(item => {
        if (item.orderId === action.payload.orderId) {
          return action.payload
        }
        return item
      })
      if (state.selectedPurchaseOrder.orderId === action.payload.orderId) {
        state.selectedPurchaseOrder = action.payload
      }
      state.loading = false
      state.reloadPurchaseOrder = !state.reloadPurchaseOrder
      state.error = null
    },
    setDeletePurchaseOrder: (state, action) => {
      state.data = state.data.filter(item => item.orderId !== action.payload)
      state.reloadPurchaseOrder = !state.reloadPurchaseOrder
    },
    resetPurchaseOrder: state => {
      state.data = []
      state.loading = true
      state.error = null
      state.selectedPurchaseOrder = {}
      state.reloadPurchaseOrder = !state.reloadPurchaseOrder
    }
  }
})

export const {
  setActionPurchaseOrder,
  setAllPurchaseOrder,
  setLoading,
  setError,
  setAddPurchaseOrder,
  setUpdatePurchaseOrder,
  setDeletePurchaseOrder,
  resetPurchaseOrder,
  setPurchaseOrderFilters,
  resetPurchaseOrderFilters
} = appPurchaseOrderSlice.actions
export default appPurchaseOrderSlice.reducer
