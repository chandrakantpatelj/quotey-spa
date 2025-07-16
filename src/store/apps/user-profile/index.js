import { createSlice } from '@reduxjs/toolkit'
import { setCookie } from 'nookies'

const filterPermissionByTenant = (permissions, tenantId) => {
  return permissions?.find(item => item.tenantId === tenantId) || {}
}
const setCookieForMiddleware = (userPermissionByTenant, isAdmin, isRoootUser) => {
  // Set cookie for 'isRootUser'
  setCookie(null, 'isRootUser', isRoootUser, {
    path: '/'
  })
  setCookie(null, 'isAdmin', isAdmin, {
    path: '/'
  })
  // Set cookie for 'permission' (assuming this is an array or string of permissions)
  setCookie(null, 'permissions', JSON.stringify(userPermissionByTenant ? userPermissionByTenant : []), {
    path: '/'
  })
}

export const userProfileSlice = createSlice({
  name: 'userProfile',
  initialState: {
    data: {},
    tanantSpecificPermissions: [],
    isAdmin: null,
    isRootUser: null,
    userProfileLoading: true
  },
  reducers: {
    setUserProfile: (state, action) => {
      const {
        userProfile: { permissions },
        tenantId
      } = action.payload

      state.data = action.payload.userProfile
      const isRoootUser = action.payload.userProfile.rootUser
      state.isRootUser = isRoootUser
      const userPermissionByTenant = filterPermissionByTenant(permissions, tenantId)
      state.tanantSpecificPermissions = userPermissionByTenant.permissions
      const isAdmin = userPermissionByTenant.isAdmin
      state.isAdmin = isAdmin
      state.userProfileLoading = false
      // setCookieForMiddleware(userPermissionByTenant.permissions, isAdmin, isRoootUser)
    },
    setUserProfileLoading: (state, action) => {
      state.userProfileLoading = action.payload
    },
    setPermissionByTenantId: (state, action) => {
      const filtredData = filterPermissionByTenant(state.data.permissions, action.payload)
      state.tanantSpecificPermissions = filtredData?.permissions || []
      const isAdmin = filtredData?.isAdmin ?? false
      state.isAdmin = isAdmin
      state.userProfileLoading = false
      // setCookieForMiddleware(filtredData?.permissions || [], isAdmin, state.isRootUser)
    },
    resetUserProfile: state => {
      state.data = {}
      state.isAdmin = false
      state.isRootUser = false
      state.tanantSpecificPermissions = []
    }
  }
})

export const { setUserProfile, resetUserProfile, setUserProfileLoading, setPermissionByTenantId } =
  userProfileSlice.actions

export default userProfileSlice.reducer
