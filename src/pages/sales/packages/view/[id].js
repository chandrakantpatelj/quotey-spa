import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { LIST_PACKAGE, STATUS_CONFIRMED, STATUS_INVOICED } from 'src/common-functions/utils/Constants'
import { checkAuthorizedRoute } from 'src/common-functions/utils/UtilityFunctions'
import useCustomers from 'src/hooks/getData/useCustomers'
import useProducts from 'src/hooks/getData/useProducts'
import useSalesOrders from 'src/hooks/getData/useSalesOrders'
import useWarehouses from 'src/hooks/getData/useWarehouses'
import ErrorBoundary from 'src/pages/ErrorBoundary'
import ViewPackage from 'src/views/sales/Packages/ViewPackage'

function ViewSalesPackage() {
  const dispatch = useDispatch()
  const router = useRouter()
  const tenant = useSelector(state => state.tenants?.selectedTenant) || ''
  const { tenantId = '' } = tenant

  const { products, fetchProducts, productsLoading } = useProducts(tenantId)
  const { customers, fetchCustomers, customerLoading } = useCustomers(tenantId)
  const { salesOrders, fetchSalesOrders } = useSalesOrders(tenantId)
  const { warehouses, loading: warehouseLoading } = useWarehouses(tenantId)
  const [packagesObject, setPackagesObject] = useState({})
  const userProfile = useSelector(state => state.userProfile)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const loading = productsLoading || customerLoading || warehouseLoading

  useEffect(() => {
    if (!tenantId) return
    fetchSalesOrders()
    fetchCustomers()
    fetchProducts()
  }, [tenantId, fetchCustomers, fetchProducts, fetchSalesOrders])

  useEffect(() => {
    // const getPackage = async () => {
    if (checkAuthorizedRoute(LIST_PACKAGE, router, userProfile)) {
      setIsAuthorized(true)

      setPackagesObject({
        products,
        salesOrders:
          salesOrders?.filter(item => item?.status === STATUS_CONFIRMED || item?.status === STATUS_INVOICED) || [],
        customers,
        warehouses
      })
    } else {
      setIsAuthorized(false)
    }
    // }
    // getPackage()
  }, [tenantId, products, customers, salesOrders, warehouses, userProfile])

  if (!isAuthorized) {
    return null
  }
  return (
    <ErrorBoundary tenantId={tenantId} dispatch={dispatch}>
      <ViewPackage packagesObject={packagesObject} loading={loading} />
    </ErrorBoundary>
  )
}

export default ViewSalesPackage
