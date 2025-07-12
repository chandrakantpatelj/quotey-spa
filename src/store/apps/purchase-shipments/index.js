import { createSlice } from '@reduxjs/toolkit'

export const appPurchaseShipmentsSlice = createSlice({
  name: 'appPurchaseShipments',
  initialState: {
    data: [],
    loading: true,
    error: null,
    selectedPurchaseShipment: {},
    reloadPurchaseShipment: true,
    filters: {
      startDate: null,
      endDate: null,
      status: null,
      filterVendor: null
    }
  },
  reducers: {
    setSelectedPurchaseShipment: (state, action) => {
      state.selectedPurchaseShipment = action.payload
    },
    setAllPurchaseShipments: (state, action) => {
      state.data = action.payload
      state.loading = false
      state.error = null
    },
    setPurchaseOrderShipmentFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    resetPurchaseOrderShipmentFilters: state => {
      state.filters = {
        startDate: null,
        endDate: null,
        status: null,
        filterVendor: null
      }
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
    setAddPurchaseShipmet: (state, action) => {
      state.data = [...(state.data || []), action.payload]
      state.loading = false
    },
    setUpdatePurchaseShipment: (state, action) => {
      state.data = state.data.map(item => {
        if (item.shipmentId === action.payload.shipmentId) {
          return action.payload
        }
        return item
      })
      state.loading = false
      state.reloadPurchaseShipment = !state.reloadPurchaseShipment
      if (state?.selectedPurchaseShipment?.shipmentId === action.payload.shipmentId) {
        state.selectedPurchaseShipment = action.payload
      }
      state.error = null
    },
    setDeletePurchaseShipment: (state, action) => {
      state.data = state.data.filter(item => item.shipmentId !== action.payload)
      state.reloadPurchaseShipment = !state.reloadPurchaseShipment
    },
    resetPurchaseShipment: state => {
      state.data = []
      state.loading = true
      state.error = null
      state.selectedPurchaseShipment = {}
      state.reloadPurchaseShipment = !state.reloadPurchaseShipment
    }
  }
})
export const {
  setSelectedPurchaseShipment,
  setAllPurchaseShipments,
  setLoading,
  setError,
  setAddPurchaseShipmet,
  setUpdatePurchaseShipment,
  setDeletePurchaseShipment,
  resetPurchaseShipment,
  setPurchaseOrderShipmentFilters,
  resetPurchaseOrderShipmentFilters
} = appPurchaseShipmentsSlice.actions
export default appPurchaseShipmentsSlice.reducer
