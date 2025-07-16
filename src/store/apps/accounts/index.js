import { createSlice } from '@reduxjs/toolkit'

export const appAccountsSlice = createSlice({
  name: 'appAccounts',
  initialState: {
    data: [],
    loading: true,
    filters: {
      startDate: null,
      endDate: null,
      filterVendor: null,
      filterPurchaseOrder: null,
      filterCustomer: null,
      filterSalesOrder: null
    }
  },
  reducers: {
    setAcounts: (state, action) => {
      state.data = action.payload
      state.loading = false
    },
    resetAccounts: state => {
      state.data = []
      state.loading = false
    },
    setAccountsFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    resetAccountsFilters: state => {
      state.filters = {
        startDate: null,
        endDate: null,
        status: null,
        selectedVendor: null,
        filterPurchaseOrder: null,
        filterCustomer: null,
        filterSalesOrder: null
      }
    }
  }
})
export const { setAcounts, resetAccounts, setAccountsFilters, resetAccountsFilters } = appAccountsSlice.actions
export default appAccountsSlice.reducer
