import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { LIST_VENDOR } from 'src/common-functions/utils/Constants'
import { checkAuthorizedRoute, dynamicSort } from 'src/common-functions/utils/UtilityFunctions'
import useVendors from 'src/hooks/getData/useVendors'
import ErrorBoundary from 'src/pages/ErrorBoundary'
import ViewVendor from 'src/views/purchase/vendor/ViewVendor'

const View = () => {
  const router = useRouter()
  const userProfile = useSelector(state => state.userProfile)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const dispatch = useDispatch()
  const tenant = useSelector(state => state.tenants?.selectedTenant)
  const { tenantId } = tenant || ''
  const { vendors, loading } = useVendors(tenantId)
  const sortedVendors = dynamicSort(vendors, 'vendorNo')

  useEffect(() => {
    if (checkAuthorizedRoute(LIST_VENDOR, router, userProfile)) {
      setIsAuthorized(true)
    } else {
      setIsAuthorized(false)
    }
  }, [userProfile])

  if (!isAuthorized) {
    return null
  }
  return (
    <ErrorBoundary tenantId={tenantId} dispatch={dispatch}>
      <ViewVendor
        loading={loading}
        vendorObject={{
          vendors: sortedVendors
        }}
      />
    </ErrorBoundary>
  )
}

export default View
