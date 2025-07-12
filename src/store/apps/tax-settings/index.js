import { createSlice } from '@reduxjs/toolkit'

export const taxModuleSlice = createSlice({
  name: 'taxModule',
  initialState: {
    data: [],
    selectedTaxSetting: null,
    error: null,
    taxSettingLoader: true,
    reloadTaxSettingLoader: true
  },
  reducers: {
    setSelectedTaxSetting: (state, action) => {
      state.selectedTaxSetting = action.payload
    },
    setAllTaxSettings: (state, action) => {
      state.data = action.payload
      state.taxSettingLoader = false
    },
    setTaxSettingError: (state, action) => {
      state.error = action.payload
    },
    setTaxSettingLoader: (state, action) => {
      state.taxSettingLoader = action.payload
    },
    resetTaxSettings: (state, action) => {
      state.data = []
      state.taxSettingLoader = true
      state.selectedTaxSetting = {}
      state.reloadTaxSettingLoader = !state.reloadTaxSettingLoader
    }
  }
})

export const { setSelectedTaxSetting, setAllTaxSettings, setTaxSettingLoader, setTaxSettingError, resetTaxSettings } =
  taxModuleSlice.actions

export default taxModuleSlice.reducer
