import { createSlice } from '@reduxjs/toolkit'

export const appPurchasePackageSlice = createSlice({
  name: 'appPurchasePackages',
  initialState: {
    data: [],
    loading: false,
    error: null,
    selectedPurchasePackage: null,
    reloadPurchasePackage: true,
    filters: {
      startDate: null,
      endDate: null,
      status: null,
      filterVendor: null
    }
  },
  reducers: {
    setSelectedPurchasePackage: (state, action) => {
      state.selectedPurchasePackage = action.payload
    },
    setAllPurchasePackage: (state, action) => {
      state.data = action.payload
      state.loading = false
      state.error = null
    },
    setPurchaseOrderPackageFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    resetPurchaseOrderPackageFilters: state => {
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
    setAddPurchasePackage: (state, action) => {
      state.data = [...(state.data || []), action.payload]
      state.loading = false
    },
    setUpdatePurchasePackage: (state, action) => {
      state.data = state.data.map(item => {
        if (item.packageId === action.payload.packageId) {
          return action.payload
        }
        return item
      })
      state.reloadPurchasePackage = !state.reloadPurchasePackage
      if (state.selectedPurchasePackage.packageId == action.payload.packageId) {
        state.selectedPurchasePackage = action.payload
      }
      state.loading = false
      state.error = null
    },
    setDeletePurchasePackage: (state, action) => {
      state.data = state.data.filter(item => item.packageId !== action.payload)
      state.reloadPurchasePackage = !state.reloadPurchasePackage
    },
    resetPurchasePackage: state => {
      state.data = []
      state.loading = true
      state.error = null
      state.reloadPurchasePackage = !state.reloadPurchasePackage
      state.selectedPurchasePackage = {}
    }
  }
})
export const {
  setSelectedPurchasePackage,
  setAllPurchasePackage,
  setAddPurchasePackage,
  setUpdatePurchasePackage,
  setDeletePurchasePackage,
  setLoading,
  setError,
  resetPurchasePackage,
  resetPurchaseOrderPackageFilters,
  setPurchaseOrderPackageFilters
} = appPurchasePackageSlice.actions
export default appPurchasePackageSlice.reducer
