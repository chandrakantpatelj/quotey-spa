import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { fetchData, writeData } from 'src/common-functions/GraphqlOperations'
// ** Axios Imports

import {
  createUserPreferenceMutation,
  getUserPreferenceQuery,
  updateUserPreferenceMutation
} from 'src/@core/components/graphql/user-preference-queries'
import { createAlert } from 'src/store/apps/alerts'

// ** Fetch Products
export const fetchUserPreference = createAsyncThunk('appUserPreference/fetchUserPreference', async () => {
  console.log('fetchUserPreference')
  try {
    const response = await fetchData(getUserPreferenceQuery())
    console.error('response', response)
    return response
  } catch (error) {
    console.error('error', error)
  }
})

// ** Add Product
export const addUserPreference = createAsyncThunk(
  'appUserPreference/addUserPreference',
  async (payload, { getState, dispatch }) => {
    const { userPreference } = payload
    try {
      const response = await writeData(createUserPreferenceMutation(), { userPreference })
      dispatch(fetchUserPreference())
      dispatch(createAlert({ message: 'User Preference Added successfully !', type: 'success' }))
      return response
    } catch (error) {
      // Handle any errors and optionally dispatch an error action
      throw error
    }
  }
)

// ** Update Product
export const updateUserPreference = createAsyncThunk(
  'appUserPreference/updateUserPreference',
  async (userPreference, dispatch) => {
    try {
      const response = await writeData(updateUserPreferenceMutation(), { userPreference })
      console.log('response', response)
      // dispatch(createAlert({ message: 'Settings Updated successfully !', type: 'success' }))
      return response
    } catch (error) {
      // Handle any errors and optionally dispatch an error action
      throw error
    }
  }
)

export const appUserPreferenceSlice = createSlice({
  name: 'appUserPreference',
  initialState: {
    data: {},
    loading: true
  },
  reducers: {
    setTenantPreference: (state, action) => {
      state.data = action?.payload?.getUserPreference
    },
    resetPreference: (state, action) => {
      state.data = []
    }
  },
  extraReducers: builder => {
    builder
      .addCase(fetchUserPreference.fulfilled, (state, action) => {
        state.data = action.payload.getUserPreference
        state.loading = false
      })
      .addCase(fetchUserPreference.pending, state => {
        state.loading = true
      })
      .addCase(fetchUserPreference.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
        state.loading = false
      })
      .addCase(addUserPreference.pending, state => {
        state.loading = true
      })
      .addCase(addUserPreference.fulfilled, (state, action) => {
        state.loading = false
        // Handle additional state changes if needed
      })
      .addCase(addUserPreference.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
        state.loading = false
      })
      .addCase(updateUserPreference.pending, state => {
        state.loading = true
      })
      .addCase(updateUserPreference.fulfilled, (state, action) => {
        state.loading = false
        // Handle additional state changes if needed
      })
      .addCase(updateUserPreference.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
        state.loading = false
      })
  }
})

export const { setTenantPreference, resetPreference } = appUserPreferenceSlice.actions

export default appUserPreferenceSlice.reducer
