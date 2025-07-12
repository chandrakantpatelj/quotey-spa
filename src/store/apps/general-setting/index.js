import { createSlice } from '@reduxjs/toolkit'

export const appGeneralSettingSlice = createSlice({
  name: 'appGeneralSetting',
  initialState: {
    generalPaymentMethods: [],
    generalExpenseTypes: [],
    generalExpenseTypeLoading: true,
    stockAdjustmentSettings: [],
    userAccountRoles: []
  },
  reducers: {
    setGeneralPaymentMethods: (state, action) => {
      state.generalPaymentMethods = action.payload
    },
    setGeneralExpenseTypes: (state, action) => {
      state.generalExpenseTypes = action.payload
      state.generalExpenseTypeLoading = false
    },
    setGeneralExpenseTypeLoading: (state, action) => {
      state.generalExpenseTypeLoading = action.payload
    },
    setStockAdjustmentSettings: (state, action) => {
      state.stockAdjustmentSettings = action.payload
    },
    setUserAccountRoles: (state, action) => {
      state.userAccountRoles = action.payload
    },
    resetGeneralSetting: state => {
      state.generalPaymentMethods = []
      state.generalExpenseTypes = []
      state.stockAdjustmentSettings = []
      state.userAccountRoles = []
      state.generalExpenseTypeLoading = false
    }
  }
})

export const {
  setGeneralPaymentMethods,
  setGeneralExpenseTypes,
  setGeneralExpenseTypeLoading,
  setStockAdjustmentSettings,
  setUserAccountRoles,
  resetGeneralSetting
} = appGeneralSettingSlice.actions
export default appGeneralSettingSlice.reducer
