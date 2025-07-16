import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { LIST_ITEM } from 'src/common-functions/utils/Constants'
import { checkAuthorizedRoute, dynamicSort } from 'src/common-functions/utils/UtilityFunctions'
import useCurrencies from 'src/hooks/getData/useCurrencies'
import useCustomers from 'src/hooks/getData/useCustomers'
import useProducts from 'src/hooks/getData/useProducts'
import usePurchaseOrders from 'src/hooks/getData/usePurchaseOrders'
import useSalesOrders from 'src/hooks/getData/useSalesOrders'
import useVendors from 'src/hooks/getData/useVendors'
import ErrorBoundary from 'src/pages/ErrorBoundary'
import ViewItem from 'src/views/inventory/actions/ViewItem'

const View = () => {
  const router = useRouter()
  const dispatch = useDispatch()

  const userProfile = useSelector(state => state.userProfile)

  const [isAuthorized, setIsAuthorized] = useState(false)

  const tenantId = useSelector(state => state.tenants?.selectedTenant?.tenantId) || ''
  const { productsLoading, fetchProducts } = useProducts(tenantId)
  const { vendors } = useVendors(tenantId)
  const { currencies } = useCurrencies(tenantId)
  const { fetchCustomers } = useCustomers(tenantId)
  const { fetchSalesOrders, salesOrdersLoading } = useSalesOrders(tenantId)
  const { fetchPurchaseOrders, purchaseOrdersLoading } = usePurchaseOrders(tenantId)

  const [productsData, setProductsData] = useState({})
  const loading = purchaseOrdersLoading || salesOrdersLoading || productsLoading

  async function getProducts() {
    try {
      const salesOrders = await fetchSalesOrders()
      const purchaseOrders = await fetchPurchaseOrders()
      const customers = await fetchCustomers()
      const products = await fetchProducts()

      setProductsData({
        products,
        vendors,
        currencies,
        customers,
        salesOrders,
        purchaseOrders
      })
    } catch (error) {
      console.error('Error fetching data for view product:', error)
    }
  }

  useEffect(() => {
    if (checkAuthorizedRoute(LIST_ITEM, router, userProfile)) {
      setIsAuthorized(true)
      getProducts()
    } else {
      setIsAuthorized(false)
    }
  }, [tenantId, userProfile, fetchSalesOrders, fetchPurchaseOrders])

  if (!isAuthorized) {
    return null
  }
  return (
    <ErrorBoundary tenantId={tenantId} dispatch={dispatch}>
      <ViewItem productsData={productsData} loading={loading} tenantId={tenantId} />
    </ErrorBoundary>
  )
}

export default View
