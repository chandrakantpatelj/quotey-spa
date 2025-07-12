import { createSlice } from '@reduxjs/toolkit'

export const appCustomerSlice = createSlice({
  name: 'appCustomer',
  initialState: {
    data: [],
    customerLoading: false,
    error: null,
    selectedCustomer: null,
    reloadCustomerLoader: true
  },
  reducers: {
    setSelectedCustomer: (state, action) => {
      state.selectedCustomer = action.payload
    },
    setAllCustomer: (state, action) => {
      state.data = action.payload
      state.customerLoading = false
      state.error = null
    },
    setCustomerLoading: (state, action) => {
      state.customerLoading = action.payload
      state.error = null
    },
    setError: (state, action) => {
      state.data = []
      state.customerLoading = false
      state.error = action.payload
    },
    setAddCustomer: (state, action) => {
      state.data = [...(state.data || []), action.payload]
      state.customerLoading = false
    },
    setAddCustomersArry: (state, action) => {
      state.data = [...state.data, ...action.payload]
      state.customerLoading = false
    },
    setUpdateCustomer: (state, action) => {
      console.log('setUpdateCustomer', action.payload)
      state.data = state.data.map(item => {
        if (item.customerId === action.payload.customerId) {
          return action.payload
        }
        return item
      })
      if (state.selectedCustomer?.customerId === action.payload?.customerId) {
        state.selectedCustomer = action.payload
      }
      state.customerLoading = false
      state.error = null
    },
    setDeleteCustomer: (state, action) => {
      state.data = state.data.filter(customer => customer.customerId !== action.payload)
      state.customerLoading = false
    },
    resetCustomer: state => {
      state.data = []
      state.customerLoading = true
      state.error = null
      state.selectedCustomer = {}

      state.reloadCustomerLoader = !state.reloadCustomerLoader
    }
  }
})
export const {
  setSelectedCustomer,
  setAllCustomer,
  setAddCustomer,
  setAddCustomersArry,
  setUpdateCustomer,
  setDeleteCustomer,
  setCustomerLoading,
  setError,
  resetCustomer
} = appCustomerSlice.actions

export default appCustomerSlice.reducer
