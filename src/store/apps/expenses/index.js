import { createSlice } from '@reduxjs/toolkit'

export const appExpenseSlice = createSlice({
  name: 'appExpense',
  initialState: {
    data: [],
    expenseLoading: true,
    expenseError: null,
    reloadExpenseLoader: true,
    selectedExpense: {},
    filters: {
      startDate: null,
      endDate: null
    }
  },
  reducers: {
    setSelectedExpense: (state, action) => {
      state.selectedExpense = action.payload
    },
    setAllExpenses: (state, action) => {
      state.data = action.payload
      state.expenseLoading = false
      state.expenseError = null
    },
    setAddExpense: (state, action) => {
      state.data = [...(state.data || []), action.payload]
    },
    setExpenseFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    resetExpenseFilters: state => {
      state.filters = {
        startDate: null,
        endDate: null
      }
    },
    setUpdateExpense: (state, action) => {
      state.data = state.data.map(item => {
        if (item.expenseId === action.payload.expenseId) {
          return action.payload
        }
        return item
      })
      if (state.selectedExpense.expenseId === action.payload.expenseId) {
        state.selectedExpense = action.payload
      }
      state.expenseLoading = false
      state.expenseError = null
    },
    setDeleteExpense: (state, action) => {
      const expenseId = action.payload
      state.data = state.data.filter(item => item.expenseId !== expenseId)
      state.expenseLoading = false
    },
    setExpenseLoading: (state, action) => {
      state.expenseLoading = action.payload
      state.expenseError = null
    },
    setExpenseError: (state, action) => {
      state.data = []
      state.expenseLoading = false
      state.expenseError = action.payload
    },
    resetExpenses: state => {
      state.data = []
      state.expenseLoading = true
      state.expenseError = null
      state.reloadExpenseLoader = !state.reloadExpenseLoader
      state.selectedExpense = {}
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    }
  }
})

export const {
  setSelectedExpense,
  setAllExpenses,
  setAddExpense,
  setDeleteExpense,
  resetExpenses,
  setExpenseLoading,
  setUpdateExpense,
  setExpenseError,
  setExpenseFilters,
  resetExpenseFilters
} = appExpenseSlice.actions
export default appExpenseSlice.reducer
