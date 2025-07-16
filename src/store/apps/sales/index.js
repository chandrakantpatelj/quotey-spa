import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { getAllSalesOrdersQuery } from 'src/@core/components/graphql/sales-order-queries'
import { fetchData, writeData } from 'src/common-functions/GraphqlOperations'

import { sendSalesOrderMutation } from 'src/@core/components/graphql/sales-order-pdf-queries'
import { createAlert } from 'src/store/apps/alerts'

export const fetchGetSalesOrder = createAsyncThunk('/fetchGetSalesOrder', async params => {
  return await fetchData(getAllSalesOrdersQuery(params))
})

export const sendSalesOrder = async (tenantId, orderId, sendCopyTO, sendCopyCC, dispatch) => {
  const response = await writeData(sendSalesOrderMutation(), { tenantId, orderId, sendCopyTO, sendCopyCC })
  if (response.generateAndEmailPDFSalesOrder) {
    dispatch(createAlert({ message: response.generateAndEmailPDFSalesOrder, type: 'success' }))
  } else {
    dispatch(createAlert({ message: 'Failed to send email', type: 'error' }))
  }

  return response
}

export const appsalesOrderSlice = createSlice({
  name: 'appsalesOrder',
  initialState: {
    data: [],
    salesOrdersLoading: true,
    error: null,
    selectedSalesOrder: null,
    reloadSalesLoader: true,
    filters: {
      filterStartDate: null,
      filterEndDate: null,
      filterStatus: null,
      filterPaymentStatus: null,
      filterDeliveryStatus: null,
      filterCustomer: null
    }
  },
  reducers: {
    setActionSalesOrder: (state, action) => {
      state.selectedSalesOrder = action.payload
    },
    setSalesOrderFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    resetSalesOrderFilters: state => {
      state.filters = {
        filterStartDate: null,
        filterEndDate: null,
        filterStatus: null,
        filterPaymentStatus: null,
        filterDeliveryStatus: null,
        filterCustomer: null
      }
    },
    setAllSalesOrder: (state, action) => {
      state.data = action.payload
      state.salesOrdersLoading = false
      state.error = null
    },
    setLoading: (state, action) => {
      state.salesOrdersLoading = action.payload
      state.error = null
    },
    setError: (state, action) => {
      state.data = []
      state.salesOrdersLoading = false
      state.error = action.payload
    },
    addSalesOrder: (state, action) => {
      state.data = [...(state.data || []), action.payload]
      state.salesOrdersLoading = false
    },
    setUpdateSalesOrder: (state, action) => {
      state.data = state.data.map(item => {
        if (item.orderId === action.payload.orderId) {
          return action.payload
        }
        return item
      })
      if (state?.selectedSalesOrder?.orderId === action.payload.orderId) {
        state.selectedSalesOrder = action.payload
      }
      state.salesOrdersLoading = false
      state.reloadSalesLoader = !state.reloadSalesLoader
      state.error = null
    },
    setDeleteSalesOrder: (state, action) => {
      state.data = state.data.filter(item => item.orderId !== action.payload)
      state.salesOrdersLoading = false
      state.reloadSalesLoader = !state.reloadSalesLoader
    },
    resetSalesOrder: state => {
      state.data = []
      state.salesOrdersLoading = true
      state.error = null
      state.selectedSalesOrder = null
      state.reloadSalesLoader = !state.reloadSalesLoader
    }
  },
  extraReducers: builder => {
    builder
      //get sales order
      .addCase(fetchGetSalesOrder.fulfilled, (state, action) => {
        state.data = action.payload.getAllSalesOrders
        state.salesOrdersLoading = false
      })
      .addCase(fetchGetSalesOrder.pending, state => {
        state.salesOrdersLoading = true
      })
      .addCase(fetchGetSalesOrder.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
        state.salesOrdersLoading = false
      })
  }
})
export const {
  setActionSalesOrder,
  setAllSalesOrder,
  setLoading,
  setError,
  addSalesOrder,
  setUpdateSalesOrder,
  setDeleteSalesOrder,
  resetSalesOrder,
  setSalesOrderFilters,
  resetSalesOrderFilters
} = appsalesOrderSlice.actions
export default appsalesOrderSlice.reducer
