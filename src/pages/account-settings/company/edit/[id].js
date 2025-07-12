import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { EDIT_TENANT } from 'src/common-functions/utils/Constants'
import { checkAuthorizedRoute } from 'src/common-functions/utils/UtilityFunctions'
import useTradings from 'src/hooks/getData/useTradings'
import ErrorBoundary from 'src/pages/ErrorBoundary'
import EditCompany from 'src/views/settings/company/EditCompany'

function Edit() {
  const tenant = useSelector(state => state.tenants?.selectedTenant) || {}
  const { tenantId = '' } = tenant

  const { tradings, fetchTradings } = useTradings(tenantId)
  const accounts = useSelector(state => state?.accounts?.data || {})
  const [tenantsObject, setTenantsObject] = useState()
  const [loading, setLoading] = useState(true)
  const dispatch = useDispatch()
  const router = useRouter()
  const userProfile = useSelector(state => state.userProfile)
  const [isAuthorized, setIsAuthorized] = useState(false)

  async function getTenantsData() {
    try {
      setLoading(true)
      const tradings = await fetchTradings()
      setTenantsObject({
        tradings,
        account: accounts
      })
    } catch (error) {
      console.error('Error fetching tenants data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (checkAuthorizedRoute(EDIT_TENANT, router, userProfile)) {
      setIsAuthorized(true)
      getTenantsData()
    } else {
      setIsAuthorized(false)
    }
  }, [tenant, userProfile, accounts, fetchTradings])

  if (!isAuthorized) {
    return null
  }

  return (
    <ErrorBoundary tenantId={tenant?.tenantId} dispatch={dispatch}>
      <EditCompany tenantsObject={tenantsObject} loading={loading} />
    </ErrorBoundary>
  )
}

export default Edit
