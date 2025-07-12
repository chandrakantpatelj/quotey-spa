import { createSlice } from '@reduxjs/toolkit'

export const appCurrencySlice = createSlice({
  name: 'appCurrency',
  initialState: {
    data: [],
    loading: false,
    error: null,
    selectedCurrency: {}
  },
  reducers: {
    setSelectedCurrency: (state, action) => {
      state.selectedCurrency = action.payload
    },
    setAllCurrency: (state, action) => {
      state.data = action?.payload?.filter(
        (currency, index, self) =>
          index ===
          self.findIndex(
            c =>
              c.currencyId === currency.currencyId &&
              c.name === currency.name &&
              c.symbol === currency.symbol &&
              c.displayAlignment === currency.displayAlignment
          )
      )
      state.loading = false
      state.error = null
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
export const { setSelectedCurrency, setLoading, setError, setAllCurrency } = appCurrencySlice.actions
export default appCurrencySlice.reducer
