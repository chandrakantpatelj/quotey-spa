import { createSlice } from '@reduxjs/toolkit'

export const appTaxAuthoritySlice = createSlice({
  name: 'appTaxAuthority',
  initialState: {
    data: [],
    selectedTaxAuthority: null,
    taxAuthorityLoading: true,
    taxAuthorityError: null,
    reloadTaxAuthLoader: true
  },
  reducers: {
    setSelectedTaxAuthority: (state, action) => {
      state.selectedTaxAuthority = action.payload
      state.taxAuthorityLoading = false
    },
    setAllTaxAuthorities: (state, action) => {
      state.data = action.payload
      state.taxAuthorityLoading = false
      state.taxAuthorityError = null
    },
    addTaxAuthority: (state, action) => {
      state.data.push(action.payload)
    },
    updateTaxAuthority: (state, action) => {
      state.data = state.data.map(tax => {
        if (tax.taxAuthorityId === action.payload.taxAuthorityId) {
          return action.payload
        } else {
          return tax
        }
      })
    },
    setTaxAuthorityLoading: (state, action) => {
      state.taxAuthorityLoading = action.payload
      state.taxAuthorityError = null
    },
    setTaxAuthError: (state, action) => {
      state.data = []
      state.taxAuthorityLoading = false
      state.taxAuthorityError = action.payload
    },
    deleleTaxAuthority: (state, action) => {
      state.data = state.data.filter(tax => tax.taxAuthorityId !== action.payload)
      state.taxAuthorityLoading = false
    },
    resetTaxAuthorities: state => {
      state.data = []
      state.taxAuthorityLoading = true
      state.taxAuthorityError = null
      state.selectedTaxAuthority = {}
      state.reloadTaxAuthLoader = !state.reloadTaxAuthLoader
    }
  }
})

export const {
  addTaxAuthority,
  setSelectedTaxAuthority,
  setAllTaxAuthorities,
  setTaxAuthorityLoading,
  setTaxAuthError,
  resetTaxAuthorities,
  updateTaxAuthority,
  deleleTaxAuthority
} = appTaxAuthoritySlice.actions
export default appTaxAuthoritySlice.reducer
