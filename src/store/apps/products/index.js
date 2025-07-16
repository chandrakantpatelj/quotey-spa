import { createSlice } from '@reduxjs/toolkit'

export const appProductSlice = createSlice({
  name: 'appProduct',
  initialState: {
    data: [],
    loading: false,
    error: null,
    imgLoader: true,
    reloadProduct: true,
    selectedProduct: {},
    filters: {
      selectedTag: null,
      selectedManufacturer: null,
      selectedClass: null,
      selectedCategory: null,
      selectedBrand: null,
      inStockItem: false,
      outOfStockItem: false,
      stockFrom: 0,
      stockTo: 0
    }
  },
  reducers: {
    setSelectedProduct: (state, action) => {
      state.selectedProduct = action.payload
    },
    setProductLoading: (state, action) => {
      state.loading = action.payload
      state.error = null
    },
    setError: (state, action) => {
      state.data = []
      state.loading = false
      state.error = action.payload
    },
    setImgLoader: (state, action) => {
      state.imgLoader = action.payload
    },
    setAllProduct: (state, action) => {
      state.data = action.payload
      state.loading = false
      state.error = null
    },
    setAddProduct: (state, action) => {
      state.data = [...(state.data || []), action.payload]
      state.loading = false
    },
    setAddProductsArry: (state, action) => {
      state.data = [...state.data, ...action.payload]
      state.loading = false
    },
    setUpdateProduct: (state, action) => {
      const { itemCode } = action.payload

      state.data = state.data.map(item => {
        if (item.itemCode === itemCode) {
          return { ...item, ...action.payload }
        } else {
          return item
        }
      })
      if (state.selectedProduct.itemCode === action.payload.itemCode) {
        state.selectedProduct = action.payload
      }
    },
    setProductFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    resetProductFilters: state => {
      state.filters = {
        selectedTag: null,
        selectedManufacturer: null,
        selectedClass: null,
        selectedCategory: null,
        selectedBrand: null,
        inStockItem: false,
        outOfStockItem: false,
        stockFrom: 0,
        stockTo: 0
      }
    },
    setDeleteProduct: (state, action) => {
      state.data = state.data?.filter(item => item.itemId !== action.payload)
    },
    resetProducts: state => {
      state.data = []
      state.loading = false
      state.error = null
      state.reloadProduct = !state.reloadProduct
      state.selectedProduct = {}
    }
  }
})
export const {
  setSelectedProduct,
  setImgLoader,
  setProductLoading,
  setAllProduct,
  setAddProduct,
  setAddProductsArry,
  setUpdateProduct,
  setDeleteProduct,
  resetProducts,
  setProductFilters,
  resetProductFilters
} = appProductSlice.actions
export default appProductSlice.reducer
