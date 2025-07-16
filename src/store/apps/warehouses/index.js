import { createSlice } from '@reduxjs/toolkit'

export const appWareHouseSlice = createSlice({
  name: 'appwarehouse',
  initialState: {
    data: [],
    loading: false,
    error: null,
    selectedWarehouse: null,
    reloadWarehouseLoader: true
  },
  reducers: {
    setActionWareHouse: (state, action) => {
      state.selectedWarehouse = action.payload
    },
    setAllWareHouse: (state, action) => {
      state.data = action.payload
      state.loading = false
      state.error = null
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
    setAddWarehouse: (state, action) => {
      state.data = [...(state.data || []), action.payload]
      state.loading = false
    },
    setUpdateWarehouse: (state, action) => {
      state.data = state.data.map(item => {
        if (item.warehouseId === action.payload.warehouseId) {
          return action.payload
        }
        return item
      })
      state.loading = false
      state.error = null
    },
    resetWarehouse: (state, action) => {
      state.data = []
      state.selectedWarehouse = {}
      state.loading = true
      state.reloadWarehouseLoader = !state.reloadWarehouseLoader
    }
  }
})
export const {
  setActionWareHouse,
  setAllWareHouse,
  setLoading,
  setError,
  setAddWarehouse,
  setUpdateWarehouse,
  resetWarehouse
} = appWareHouseSlice.actions
export default appWareHouseSlice.reducer
