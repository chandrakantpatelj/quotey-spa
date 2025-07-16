import { createSlice } from '@reduxjs/toolkit'

export const appPackageSlice = createSlice({
  name: 'appPackage',
  initialState: {
    data: [],
    salesPackagesLoading: false,
    error: null,
    selectedPackages: {},
    reloadPackageLoader: true,
    filters: {
      startDate: null,
      endDate: null,
      isAssignToMe: null,
      filterUser: null,
      filterExpPackDate: null,
      filterExpDeliveryDate: null,
      filterCustomer: null
    }
  },
  reducers: {
    setSelectedPackages: (state, action) => {
      state.selectedPackages = action.payload
    },
    setAllPackages: (state, action) => {
      state.data = action.payload
      state.salesPackagesLoading = false
      state.error = null
    },
    setLoading: (state, action) => {
      state.salesPackagesLoading = action.payload
      state.error = null
    },
    setError: (state, action) => {
      state.data = []
      state.salesPackagesLoading = false
      state.error = action.payload
    },
    setAddPackage: (state, action) => {
      state.data = [...(state.data || []), action.payload]
      state.salesPackagesLoading = false
    },

    setUpdatePackage: (state, action) => {
      state.data = state.data.map(item => {
        if (item.packageId === action.payload.packageId) {
          return action.payload
        }
        return item
      })
      if (state.selectedPackages.packageId === action.payload.packageId) {
        state.selectedPackages = action.payload
      }
      state.salesPackagesLoading = false
      state.reloadPackageLoader = !state.reloadPackageLoader
      state.error = null
    },
    setDeletePackage: (state, action) => {
      state.data = state.data.filter(item => item.packageId !== action.payload)
      state.reloadPackageLoader = !state.reloadPackageLoader
      state.salesPackagesLoading = false
    },
    setSalesPackageFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    resetSalesPackageFilters: state => {
      state.filters = {
        startDate: null,
        endDate: null,
        isAssignToMe: null,
        filterUser: null,
        filterExpPackDate: null,
        filterExpDeliveryDate: null,
        filterCustomer: null
      }
    },
    resetPackage: state => {
      state.data = []
      state.salesPackagesLoading = false
      state.error = null
      state.selectedPackages = {}
      state.reloadPackageLoader = !state.reloadPackageLoader
    }
  }
})
export const {
  setSelectedPackages,
  setAllPackages,
  setLoading,
  setError,
  setAddPackage,
  setUpdatePackage,
  setDeletePackage,
  resetPackage,
  resetSalesPackageFilters,
  setSalesPackageFilters
} = appPackageSlice.actions
export default appPackageSlice.reducer
