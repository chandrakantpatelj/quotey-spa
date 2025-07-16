import { createSlice } from '@reduxjs/toolkit'

export const appTaxStatementsSlice = createSlice({
  name: 'appTaxStatements',
  initialState: {
    data: [],
    loading: false,
    error: null,
    selectedTaxStatement: null,
    reloadTaxStatementLoader: true
  },
  reducers: {
    setSelectedTaxStatement: (state, action) => {
      state.selectedTaxStatement = action.payload
    },
    setAllTaxStatements: (state, action) => {
      state.data = action.payload
      state.loading = false
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
    setAddtaxStatement: (state, action) => {
      state.data = [...(state.data || []), action.payload]
      state.loading = false
    },
    setUpdatetaxStatement: (state, action) => {
      state.data = state.data.map(item => {
        if (item.statementId === action.payload.statementId) {
          return action.payload
        }
        return item
      })
      state.loading = false
      state.error = null
    },
    setDeletetaxStatement: (state, action) => {
      state.data = state.data.filter(item => item.statementId !== action.payload)
    },
    resettaxStatement: state => {
      state.data = []
      state.loading = true
      state.error = null
      state.selectedTaxStatement = {}
      state.reloadTaxStatementLoader = !state.reloadTaxStatementLoader
    }
  }
})

export const {
  setSelectedTaxStatement,
  setLoading,
  setError,
  setAddtaxStatement,
  setUpdatetaxStatement,
  setDeletetaxStatement,
  setAllTaxStatements,
  resettaxStatement
} = appTaxStatementsSlice.actions
export default appTaxStatementsSlice.reducer
