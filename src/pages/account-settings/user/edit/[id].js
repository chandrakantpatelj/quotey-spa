import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { EDIT_USER } from 'src/common-functions/utils/Constants'
import { checkAuthorizedRoute } from 'src/common-functions/utils/UtilityFunctions'
import useUserAccountRoles from 'src/hooks/getData/useUserAccountRoles'
import ErrorBoundary from 'src/pages/ErrorBoundary'
import EditUser from 'src/views/settings/user/EditUser'

function Edit() {
  const dispatch = useDispatch()
  const router = useRouter()
  const userProfile = useSelector(state => state.userProfile)
  const { isRootUser } = userProfile
  const [isAuthorized, setIsAuthorized] = useState(false)
  const tenant = useSelector(state => state.tenants?.selectedTenant)
  const { tenantId } = tenant || ''
  const { userAccountRoles: userRoles } = useUserAccountRoles(tenantId)
  const loading = useSelector(state => state.user.loading)

  const [userObject, setUserObject] = useState()

  useEffect(() => {
    setUserObject({ userRoles: userRoles })
  }, [userRoles])

  useEffect(() => {
    if (isRootUser) {
      setIsAuthorized(true)
    } else {
      router.push('/unauthorized')
      setIsAuthorized(false)
    }
  }, [userProfile])

  if (!isAuthorized) {
    return null
  }
  return (
    <ErrorBoundary tenantId={tenantId} dispatch={dispatch}>
      <EditUser loading={loading} userObject={userObject} />
    </ErrorBoundary>
  )
}

export default Edit
