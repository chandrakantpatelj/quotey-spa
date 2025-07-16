import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { LIST_TENANT } from 'src/common-functions/utils/Constants'
import { checkAuthorizedRoute, dynamicSort } from 'src/common-functions/utils/UtilityFunctions'
import useTradings from 'src/hooks/getData/useTradings'
import ErrorBoundary from 'src/pages/ErrorBoundary'
import ViewCompany from 'src/views/settings/company/ViewCompany'

function View() {
  const tenant = useSelector(state => state.tenants) || {}
  const { tenantId = '' } = tenant

  const { fetchTradings } = useTradings(tenantId)

  const { selectedTenant, data: tenants } = tenant || {}
  const [loading, setLoading] = useState(true)
  const [tenantsObject, setTenantsObject] = useState({})
  const dispatch = useDispatch()
  const router = useRouter()
  const userProfile = useSelector(state => state.userProfile)
  const [isAuthorized, setIsAuthorized] = useState(false)

  async function getTenants() {
    try {
      setLoading(true)
      const tradings = await fetchTradings()
      const CompanyFilterByNo = dynamicSort(tenants, 'tenantNo')
      setTenantsObject({
        tradings,
        tenants: CompanyFilterByNo
      })
    } catch (error) {
      console.error('Error fetching tenants:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (checkAuthorizedRoute(LIST_TENANT, router, userProfile)) {
      setIsAuthorized(true)
      getTenants()
    } else {
      setIsAuthorized(false)
    }
  }, [selectedTenant, fetchTradings, userProfile, tenants])

  if (!isAuthorized) {
    return null
  }
  return (
    <ErrorBoundary tenantId={selectedTenant?.tenantId} dispatch={dispatch}>
      <ViewCompany tenantsObject={tenantsObject} loading={loading} />
    </ErrorBoundary>
  )
}

export default View
