import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import useUserAccountRoles from 'src/hooks/getData/useUserAccountRoles'
import useUserAccounts from 'src/hooks/getData/useUserAccounts'
import ErrorBoundary from 'src/pages/ErrorBoundary'
import ViewUser from 'src/views/settings/user/ViewUser'

function View() {
  const dispatch = useDispatch()
  const router = useRouter()
  const tenantId = useSelector(state => state.tenants?.selectedTenant?.tenantId) || ''

  const userProfile = useSelector(state => state.userProfile)
  let { userAccounts, loading } = useUserAccounts()

  const { userAccountRoles } = useUserAccountRoles(tenantId)

  const { isRootUser } = userProfile
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    if (isRootUser) {
      setIsAuthorized(true)
    } else {
      router.push('/unauthorized')
      setIsAuthorized(false)
    }
  }, [tenantId, userProfile])

  if (!isAuthorized) {
    return null
  }

  // useEffect(() => {
  //   setUserObject({ userAccounts: userAccounts, userRoles: userAccountRoles })
  // }, [tenantId, userAccounts])

  return (
    <ErrorBoundary tenantId={tenantId} dispatch={dispatch}>
      <ViewUser userObject={{ userAccounts: userAccounts, userRoles: userAccountRoles }} loading={loading} />
    </ErrorBoundary>
  )
}

export default View
