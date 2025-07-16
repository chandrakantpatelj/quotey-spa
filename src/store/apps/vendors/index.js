import { createSlice } from '@reduxjs/toolkit'

export const appVendorSlice = createSlice({
  name: 'appVendor',
  initialState: {
    data: [],
    loading: false,
    error: null,
    selectedVendor: null,
    reloadVendor: true
  },
  reducers: {
    setSelectedVendor: (state, action) => {
      state.selectedVendor = action.payload
    },
    setAllVendor: (state, action) => {
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
    setAddVendor: (state, action) => {
      state.data = [...(state.data || []), action.payload]
      state.loading = false
    },
    setAddVendorsArry: (state, action) => {
      state.data = [...state.data, ...action.payload]
      state.loading = false
    },
    setUpdateVendor: (state, action) => {
      state.data = state.data.map(item => {
        if (item.vendorId === action.payload.vendorId) {
          return action.payload
        }
        return item
      })
      state.loading = false
      state.error = null
    },
    setDeleteVendor: (state, action) => {
      state.data = state.data.filter(item => item.vendorId !== action.payload)
    },
    resetVendor: state => {
      state.data = []
      state.loading = true
      state.error = null
      state.reloadVendor = !state.reloadVendor
      state.selectedVendor = {}
    }
  }
})
export const {
  setSelectedVendor,
  setAllVendor,
  setAddVendor,
  setUpdateVendor,
  setDeleteVendor,
  setAddVendorsArry,
  setLoading,
  setError,
  resetVendor
} = appVendorSlice.actions
export default appVendorSlice.reducer
