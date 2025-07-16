import { createSlice } from '@reduxjs/toolkit'

export const appUsersSlice = createSlice({
  name: 'appUsers',
  initialState: {
    data: [],
    loading: false,
    error: null,
    selectedUser: null,
    reloadUserAccount: true
  },
  reducers: {
    setSelectedUserObject: (state, action) => {
      state.selectedUser = action.payload
      state.loading = false
    },
    setAllUserAccounts: (state, action) => {
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
    setAddUserAccount: (state, action) => {
      state.data = [...(state.data || []), action.payload]
      state.loading = false
    },

    setUpdateUserAccount: (state, action) => {
      console.log('state456', state)

      state.data = state.data.map(item => {
        if (item.username === action.payload.username) {
          return action.payload
        }
        return item
      })
    },
    setDeleteUserAccount: (state, action) => {
      state.data = state.data.filter(item => item.username !== action.payload)
    },
    resetUserAccounts: state => {
      state.data = []
      state.loading = true
      state.error = null
      state.reloadUserAccount = !state.reloadUserAccount
      state.selectedUser = {}
    }
  }
})

export const {
  setSelectedUserObject,
  setAllUserAccounts,
  setLoading,
  setError,
  setAddUserAccount,
  setUpdateUserAccount,
  setDeleteUserAccount,
  resetUserAccounts
} = appUsersSlice.actions

export default appUsersSlice.reducer
