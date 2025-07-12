import { createSlice } from '@reduxjs/toolkit'

export const appSettingsSlice = createSlice({
  name: 'salesModule',
  initialState: {
    data: {},
    salesModuleLoading: true,
    success: false,
    error: null,
    reloadSalesModuleLoader: true
  },
  reducers: {
    setSalesModuleSetting: (state, action) => {
      state.data = action.payload
      state.salesModuleLoading = false
      state.error = null
    },
    setLoading: (state, action) => {
      state.salesModuleLoading = action.payload
      state.error = null
    },
    addSalesModule: (state, action) => {
      state.data = action.payload
    },
    resetSalesModule: state => {
      state.data = []
      state.salesModuleLoading = true
      state.reloadSalesModuleLoader = !state.reloadSalesModuleLoader
    }
  }
})
export const { setSalesModuleSetting, setLoading, addSalesModule, resetSalesModule } = appSettingsSlice.actions
export default appSettingsSlice.reducer
