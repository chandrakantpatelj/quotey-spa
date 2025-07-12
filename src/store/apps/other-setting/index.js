import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { writeData } from 'src/common-functions/GraphqlOperations'
import { createOtherSettingMutation } from 'src/@core/components/graphql/other-setting-queries'

// ** Fetch Products

// ** Add Product
export const addOtherSetting = createAsyncThunk('appOtherSetting/addOtherSetting', async payload => {
  const { tenantId, otherSetting } = payload
  try {
    const response = await writeData(createOtherSettingMutation(), { tenantId, otherSetting })
    // dispatch(createAlert({ message: 'Settings created successfully !', type: 'success' }))
    return response
  } catch (error) {
    throw error
  }
})

export const appOtherSettingSlice = createSlice({
  name: 'appOtherSetting',
  initialState: {
    data: {},
    paymentTerms: [],
    paymentMethods: [],
    loadingOtherSetting: false,
    headerLoader: true,
    reloadOtherSetting: true
  },
  reducers: {
    setHeaderLoader: (state, action) => {
      state.headerLoader = action.payload
    },
    setAllPaymentTerms: (state, action) => {
      state.paymentTerms = action.payload
    },
    setOtherSettings: (state, action) => {
      state.data = action.payload
      state.loadingOtherSetting = false
      state.reloadOtherSetting = !state.reloadOtherSetting
    },
    setOtherSettingLoading: (state, action) => {
      state.loadingOtherSetting = action.payload
    },
    resetOtherSettings: state => {
      state.data = {}
      state.paymentTerms = []
      state.paymentMethods = []
      state.loadingOtherSetting = false
      state.reloadOtherSetting = !state.reloadOtherSetting
    }
  },
  extraReducers: builder => {
    builder

      .addCase(addOtherSetting.pending, state => {
        state.loadingOtherSetting = true
      })
      .addCase(addOtherSetting.fulfilled, (state, action) => {
        state.loadingOtherSetting = false
      })
      .addCase(addOtherSetting.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
        state.loadingOtherSetting = false
      })
  }
})
export const { setHeaderLoader, setAllPaymentTerms, setOtherSettings, resetOtherSettings, setOtherSettingLoading } =
  appOtherSettingSlice.actions
export default appOtherSettingSlice.reducer
