import { createSlice } from '@reduxjs/toolkit'

export const appAccountTransactionsSlice = createSlice({
  name: 'appAccountTransactions',
  initialState: {
    data: [],
    error: null,
    loading: true,
    selectedAccountTransaction: null,
    reloadAccountTransactionLoader: true,
    filters: {
      startDate: null,
      endDate: null
    }
  },
  reducers: {
    setSelectedAccountTransaction: (state, action) => {
      state.selectedAccountTransaction = action.payload
    },
    setAllAccountTransactions: (state, action) => {
      state.data = action.payload
      state.loading = false
    },
    setAccountTransactionLoading: (state, action) => {
      state.loading = action.payload
      state.error = null
    },
    setAccountTransactionFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    resetAccountTransactionFilters: state => {
      state.filters = {
        startDate: null,
        endDate: null
      }
    },
    setError: (state, action) => {
      state.data = []
      state.loading = false
      state.error = action.payload
    },
    setAddAccountTransaction: (state, action) => {
      state.data = [...(state.data || []), action.payload]
      state.loading = false
    },
    setDeleteAccountTransaction: (state, action) => {
      state.data = state.data.filter(item => item.bankTransactionId !== action.payload)
    },
    resetAccountTransaction: state => {
      state.data = []
      state.loading = true
      state.error = null
      state.selectedAccountTransaction = {}
      state.reloadAccountTransactionLoader = !state.reloadAccountTransactionLoader
    }
  }
})

export const {
  setSelectedAccountTransaction,
  setAccountTransactionLoading,
  setError,
  setAddAccountTransaction,
  setDeleteAccountTransaction,
  setAllAccountTransactions,
  resetAccountTransaction,
  setAccountTransactionFilters,
  resetAccountTransactionFilters
} = appAccountTransactionsSlice.actions
export default appAccountTransactionsSlice.reducer
