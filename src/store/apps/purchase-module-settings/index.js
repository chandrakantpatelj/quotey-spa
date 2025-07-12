import { createSlice } from '@reduxjs/toolkit'

export const appSettingsSlice = createSlice({
  name: 'purchaseModule',
  initialState: {
    data: [],
    selectedpurchaseModuleSetting: null,
    loading: true,
    success: false,
    error: null,
    reloadPurchaseModuleLoader: true
  },
  reducers: {
    setSelectedpurchaseModuleSetting: (state, action) => {
      state.selectedpurchaseModuleSetting = action.payload
    },
    setAllPurchaseSettingData: (state, action) => {
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
    resetPurchaseSetting: state => {
      state.data = []
      state.loading = true
      state.error = null
      state.selectedpurchaseModuleSetting = {}
      state.reloadPurchaseModuleLoader = !state.reloadPurchaseModuleLoader
    }
  }
})
export const {
  setSelectedpurchaseModuleSetting,
  setAllPurchaseSettingData,
  setLoading,
  resetPurchaseSetting,
  setError
} = appSettingsSlice.actions
export default appSettingsSlice.reducer
