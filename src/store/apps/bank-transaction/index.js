import { createSlice } from '@reduxjs/toolkit'

export const appBankTransactionsSlice = createSlice({
  name: 'appBankTransactions',
  initialState: {
    data: [],
    error: null,
    bankTransactionLoading: false,
    selectedBankTransaction: null,
    reloadBankTransactionLoader: true,
    filters: {
      startDate: null,
      endDate: null,
      debitFrom: 0,
      debitTo: 0,
      creditFrom: 0,
      creditTo: 0,
      filterStatus: null
    }
  },
  reducers: {
    setSelectedAccountTransaction: (state, action) => {
      state.selectedBankTransaction = action.payload
    },
    setBankTransactionFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    resetBankTransactionFilters: state => {
      state.filters = {
        startDate: null,
        endDate: null,
        debitFrom: 0,
        debitTo: 0,
        creditFrom: 0,
        creditTo: 0,
        filterStatus: null
      }
    },

    resetAccountTransaction: state => {
      state.data = []
      state.loading = true
      state.error = null
      state.selectedBankTransaction = {}
    }
  }
})

export const {
  resetAccountTransaction,
  resetBankTransactionFilters,
  setSelectedAccountTransaction,
  setBankTransactionFilters
} = appBankTransactionsSlice.actions
export default appBankTransactionsSlice.reducer
