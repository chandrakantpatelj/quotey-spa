import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { EDIT_PACKAGE } from 'src/common-functions/utils/Constants'
import { checkAuthorizedRoute } from 'src/common-functions/utils/UtilityFunctions'
import useCurrencies from 'src/hooks/getData/useCurrencies'
import usePurchasePackages from 'src/hooks/getData/usePurchasePackages'
import useVendors from 'src/hooks/getData/useVendors'
import useWarehouses from 'src/hooks/getData/useWarehouses'
import ErrorBoundary from 'src/pages/ErrorBoundary'
import EditPurchasePackage from 'src/views/purchase/purchase-package/EditPurchasePackage'

function EditPackage() {
  const router = useRouter()
  const dispatch = useDispatch()

  const tenantId = useSelector(state => state.tenants?.selectedTenant?.tenantId) || ''

  const userProfile = useSelector(state => state.userProfile)

  const { warehouses, loading: warehouseLoading } = useWarehouses(tenantId)
  const { currencies, loading: currencyLoading } = useCurrencies()
  const { vendors, loading: vendorsLoading } = useVendors(tenantId)
  const { purchasePackageLoading } = usePurchasePackages(tenantId)

  const [packagesObject, setPackagesObject] = useState({})

  const loading = vendorsLoading || currencyLoading || warehouseLoading || purchasePackageLoading

  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    if (checkAuthorizedRoute(EDIT_PACKAGE, router, userProfile)) {
      setIsAuthorized(true)
      setPackagesObject({
        vendors,
        currencies,
        warehouses
      })
    } else {
      setIsAuthorized(false)
    }
  }, [tenantId, userProfile])

  if (!isAuthorized) {
    return null
  }
  return (
    <ErrorBoundary tenantId={tenantId} dispatch={dispatch}>
      <EditPurchasePackage packagesObject={packagesObject} loading={loading} tenantId={tenantId} />
    </ErrorBoundary>
  )
}

export default EditPackage
