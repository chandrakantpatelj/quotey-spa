import { createSlice } from '@reduxjs/toolkit'

export const appTenantSlice = createSlice({
  name: 'appTenant',
  initialState: {
    data: [],
    loading: false,
    error: null,
    selectedTenant: null,
    actionSelectedTenant: null,
    searchBoxData: [],
    reloadCompanyLoader: true
  },
  reducers: {
    setSelectedTenant: (state, action) => {
      state.selectedTenant = action.payload
    },
    setActionSelectedTenant: (state, action) => {
      state.actionSelectedTenant = action.payload
    },
    setAllTenants: (state, action) => {
      state.data = action.payload
      state.loading = false
      state.error = null
    },
    setTenantLoading: (state, action) => {
      state.loading = action.payload
      state.error = null
    },
    setError: (state, action) => {
      state.data = []
      state.loading = false
      state.error = action.payload
    },
    setUpdateTenant: (state, action) => {
      state.data = state.data.map(item => {
        if (item.tenantId === action.payload.tenantId) {
          return action.payload
        }
        return item
      })
      if (state?.selectedTenant?.tenantId === action.payload.tenantId) {
        state.selectedTenant = action.payload
      }
      state.loading = false
      state.error = null
    },

    resetCompany: (state, action) => {
      state.data = []
      state.loading = true
      state.error = null
      state.selectedTenant = {}
      state.actionSelectedTenant = {}
      state.reloadCompanyLoader = !state.reloadCompanyLoader
    },
    refreshCompany: (state, action) => {
      state.data = []
      state.loading = true
      state.error = null
      state.reloadCompanyLoader = !state.reloadCompanyLoader
    }
  }
})

export const {
  setSelectedTenant,
  setActionSelectedTenant,
  setTenantLoading,
  setError,
  resetCompany,
  refreshCompany,
  setAllTenants,
  setUpdateTenant
} = appTenantSlice.actions
export default appTenantSlice.reducer
