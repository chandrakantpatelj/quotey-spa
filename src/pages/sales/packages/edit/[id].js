import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { EDIT_PACKAGE, STATUS_CONFIRMED, STATUS_INVOICED } from 'src/common-functions/utils/Constants'
import { checkAuthorizedRoute } from 'src/common-functions/utils/UtilityFunctions'
import usePackages from 'src/hooks/getData/usePackages'
import useProducts from 'src/hooks/getData/useProducts'
import useSalesOrders from 'src/hooks/getData/useSalesOrders'
import useWarehouses from 'src/hooks/getData/useWarehouses'
import ErrorBoundary from 'src/pages/ErrorBoundary'
import EditPackage from 'src/views/sales/Packages/EditPackage'

function EditSalesPackage() {
  const router = useRouter()
  const dispatch = useDispatch()
  const tenantId = useSelector(state => state.tenants?.selectedTenant?.tenantId) || ''
  const userProfile = useSelector(state => state.userProfile)
  const { loading: warehouseLoading } = useWarehouses(tenantId)
  const { fetchProducts, productsLoading } = useProducts(tenantId)
  const { fetchSalesOrders, salesOrdersLoading } = useSalesOrders(tenantId)
  const { salesPackagesLoading } = usePackages(tenantId)
  const [packagesObject, setPackagesObject] = useState({})
  const loading = salesOrdersLoading || productsLoading || warehouseLoading || salesPackagesLoading
  const [isAuthorized, setIsAuthorized] = useState(false)

  async function getPackageData() {
    try {
      const salesOrders = await fetchSalesOrders()
      const products = await fetchProducts()

      const filteredSO =
        salesOrders?.filter(item => item?.status === STATUS_CONFIRMED || item?.status === STATUS_INVOICED) || []

      setPackagesObject({
        salesOrders: filteredSO,
        products
      })
    } catch (error) {
      console.error('Error fetching data to edit sales order package:', error)
    }
  }

  useEffect(() => {
    if (checkAuthorizedRoute(EDIT_PACKAGE, router, userProfile)) {
      setIsAuthorized(true)
      getPackageData()
    } else {
      setIsAuthorized(false)
    }
  }, [tenantId, userProfile])

  if (!isAuthorized) {
    return null
  }
  return (
    <ErrorBoundary tenantId={tenantId} dispatch={dispatch}>
      <EditPackage packagesObject={packagesObject} loading={loading} tenantId={tenantId} />
    </ErrorBoundary>
  )
}

export default EditSalesPackage
