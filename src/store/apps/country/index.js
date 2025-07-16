import { createSlice } from '@reduxjs/toolkit'

export const appCountrySlice = createSlice({
  name: 'appCountry',
  initialState: {
    data: [],
    loading: false,
    error: null
  },
  reducers: {
    setCountries: (state, action) => {
      state.data = action.payload
      state.loading = false
    },
    setLoading: (state, action) => {
      // state.data = []
      state.loading = action.payload
      state.error = null
    },
    setError: (state, action) => {
      state.data = []
      state.loading = false
      state.error = action.payload
    }
  }
})
export const { setCountries, setLoading, setError } = appCountrySlice.actions

export default appCountrySlice.reducer
