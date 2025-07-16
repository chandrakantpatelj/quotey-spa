import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { LIST_PACKAGE } from 'src/common-functions/utils/Constants'
import { checkAuthorizedRoute } from 'src/common-functions/utils/UtilityFunctions'
import ErrorBoundary from 'src/pages/ErrorBoundary'
import useWarehouses from 'src/hooks/getData/useWarehouses'
import useProducts from 'src/hooks/getData/useProducts'
import ViewPurchasePackage from 'src/views/purchase/purchase-package/ViewPurchasePackage'
import useVendors from 'src/hooks/getData/useVendors'
import useCurrencies from 'src/hooks/getData/useCurrencies'

function View() {
  const dispatch = useDispatch()
  const router = useRouter()
  const tenant = useSelector(state => state.tenants?.selectedTenant) || ''
  const { tenantId = '' } = tenant

  const { currencies } = useCurrencies()
  const { fetchProducts, productsLoading } = useProducts(tenantId)
  const { vendors, loading: vendorsLoading } = useVendors(tenantId)
  const { warehouses, loading: warehouseLoading } = useWarehouses(tenantId)
  const [packagesObject, setPackagesObject] = useState({})
  const loading = productsLoading || vendorsLoading || warehouseLoading
  const userProfile = useSelector(state => state.userProfile)
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    const callAPIs = async () => {
      if (checkAuthorizedRoute(LIST_PACKAGE, router, userProfile)) {
        setIsAuthorized(true)
        const products = await fetchProducts()

        setPackagesObject({
          products,
          vendors,
          warehouses,
          currencies
        })
      } else {
        setIsAuthorized(false)
      }
    }

    callAPIs()
  }, [tenantId, userProfile, fetchProducts])

  if (!isAuthorized) {
    return null
  }
  return (
    <ErrorBoundary tenantId={tenantId} dispatch={dispatch}>
      <ViewPurchasePackage packagesObject={packagesObject} loading={loading} />
    </ErrorBoundary>
  )
}

export default View
