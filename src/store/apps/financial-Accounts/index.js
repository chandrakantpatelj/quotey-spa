import { createSlice } from '@reduxjs/toolkit'

export const appFinancialAccountSlice = createSlice({
  name: 'appFinancialAccount',
  initialState: {
    data: [],
    financialAccountloading: true,
    selectedAccounts: null,
    reloadFinancialAccountLoader: true,
    filters: {
      category: null,
      type: null
    }
  },
  reducers: {
    setSelectedFinancialAccounts: (state, action) => {
      state.selectedAccounts = action.payload
    },
    setFinancialAccounting: (state, action) => {
      state.data = action.payload
      state.financialAccountloading = false
    },
    setFinancialAccountFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    resetFinancialAccountFilters: state => {
      state.filters = {
        category: null,
        type: null
      }
    },
    setDeleteFinancialAccount: (state, action) => {
      state.data = state.data.filter(item => item.accountId !== action.payload)
      state.financialAccountloading = false
    },
    addFinancialAccounts: (state, action) => {
      state.data = [...(state.data || []), action.payload]
      state.financialAccountloading = false
    },
    addFinancialAccountsArray: (state, action) => {
      state.data = [...state.data, ...action.payload]
      state.financialAccountloading = false
    },
    editFinancialAccounts: (state, action) => {
      state.data = state.data.map(account => {
        if (account.accountId === action.payload.accountId) {
          return action.payload
        }
        return account
      })
      state.financialAccountloading = false
    },
    setFinancialAccountLoading: (state, action) => {
      state.financialAccountloading = action.payload
    },
    resetFinancialAccounts: state => {
      state.data = []
      state.financialAccountloading = true
      state.selectedAccounts = {}
      state.reloadFinancialAccountLoader = !state.reloadFinancialAccountLoader
      state.error = null
    }
  }
})

export const {
  setSelectedFinancialAccounts,
  setFinancialAccounting,
  resetFinancialAccounts,
  setFinancialAccountLoading,
  setDeleteFinancialAccount,
  addFinancialAccountsArray,
  addFinancialAccounts,
  editFinancialAccounts,
  resetFinancialAccountFilters,
  setFinancialAccountFilters
} = appFinancialAccountSlice.actions
export default appFinancialAccountSlice.reducer
