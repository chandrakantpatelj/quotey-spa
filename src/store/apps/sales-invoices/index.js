import { createSlice } from '@reduxjs/toolkit'

export const appInvoiceSlice = createSlice({
  name: 'appInvoice',
  initialState: {
    data: [],
    salesInvoiceLoading: false,
    error: null,
    selectedInvoice: null,
    reloadInvoiceLoader: true,
    filters: {
      filterStartDate: null,
      filterEndDate: null,
      filterStatus: null,
      filterPaymentStatus: null,
      filterCustomer: null
    }
  },
  reducers: {
    setSelectedInvoice: (state, action) => {
      state.selectedInvoice = action.payload
    },
    setAllInvoices: (state, action) => {
      state.data = action.payload
      state.salesInvoiceLoading = false
      state.error = null
    },
    setInvoiceLoading: (state, action) => {
      state.salesInvoiceLoading = action.payload
      state.error = null
    },
    setSalesInvoiceFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    resetSalesInvoiceFilters: state => {
      state.filters = {
        filterStartDate: null,
        filterEndDate: null,
        filterStatus: null,
        filterPaymentStatus: null,
        deliveryStatus: null,
        filterCustomer: null
      }
    },
    setError: (state, action) => {
      state.data = []
      state.salesInvoiceLoading = false
      state.error = action.payload
    },
    setAddInvoice: (state, action) => {
      state.data = [...(state.data || []), action.payload]
      state.salesInvoiceLoading = false
      state.reloadInvoiceLoader = !state.reloadInvoiceLoader
    },

    setUpdateInvoice: (state, action) => {
      state.data = state.data.map(item => {
        if (item.invoiceId === action.payload?.invoiceId) {
          return action.payload
        }
        return item
      })
      if (state.selectedInvoice?.invoiceId === action.payload.invoiceId) {
        state.selectedInvoice = action.payload
      }
      state.salesInvoiceLoading = false
      state.reloadInvoiceLoader = !state.reloadInvoiceLoader
      state.error = null
    },

    setDeleteInvoice: (state, action) => {
      state.data = state.data.filter(invoice => invoice.invoiceId !== action.payload)
      state.salesInvoiceLoading = false
      state.reloadInvoiceLoader = !state.reloadInvoiceLoader
    },
    resetInvoice: state => {
      state.data = []
      state.salesInvoiceLoading = true
      state.error = null
      state.selectedInvoice = {}
      state.reloadInvoiceLoader = !state.reloadInvoiceLoader
    }
  }
})
export const {
  setSelectedInvoice,
  setAllInvoices,
  setAddInvoice,
  setUpdateInvoice,
  setDeleteInvoice,
  setInvoiceLoading,
  setError,
  resetInvoice,
  resetSalesInvoiceFilters,
  setSalesInvoiceFilters
} = appInvoiceSlice.actions

export default appInvoiceSlice.reducer
