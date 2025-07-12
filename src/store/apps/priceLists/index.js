import { createSlice } from '@reduxjs/toolkit'

export const appPriceListSlice = createSlice({
  name: 'apppricelist',
  initialState: {
    data: [],
    priceListLoading: true,
    selectedPriceList: {},
    reloadPriceListsLoader: true,
    filters: {
      startDate: null,
      endDate: null,
      filterStatus: null
    }
  },
  reducers: {
    setActionPriceList: (state, action) => {
      state.selectedPriceList = action.payload
    },
    setPriceLists: (state, action) => {
      state.data = action.payload
      state.priceListLoading = false
    },
    setPriceListLoading: (state, action) => {
      state.priceListLoading = action.payload
    },

    setError: (state, action) => {
      state.data = []
      state.priceListLoading = false
      state.error = action.payload
    },
    setPriceListFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    resetPriceListFilters: state => {
      state.filters = {
        startDate: null,
        endDate: null,
        filterStatus: null
      }
    },
    resetPriceList: state => {
      state.data = []
      state.priceListLoading = false
      state.selectedPriceList = {}
      state.error = null
      state.reloadPriceListsLoader = !state.reloadPriceListsLoader
    }
  }
})

export const {
  setActionPriceList,
  resetPriceList,
  setPriceLists,
  setPriceListLoading,
  setError,
  setPriceListFilters,
  resetPriceListFilters
} = appPriceListSlice.actions
export default appPriceListSlice.reducer
