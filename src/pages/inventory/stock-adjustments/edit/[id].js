import Router from 'next/router'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { EDIT_STOCK } from 'src/common-functions/utils/Constants'
import { checkAuthorizedRoute } from 'src/common-functions/utils/UtilityFunctions'
import useCurrencies from 'src/hooks/getData/useCurrencies'
import useProducts from 'src/hooks/getData/useProducts'
import useStockAdjustmentSettings from 'src/hooks/getData/useStockAdjustmentSettings'
import useWarehouses from 'src/hooks/getData/useWarehouses'
import ErrorBoundary from 'src/pages/ErrorBoundary'
import EditStockAdustment from 'src/views/inventory/stockAdjutments/EditStockAdustment'

const Edit = () => {
  const dispatch = useDispatch()
  const route = Router

  const tenantId = useSelector(state => state.tenants?.selectedTenant?.tenantId)
  const { warehouses = [], loading: warehouseLoading } = useWarehouses(tenantId)
  const { products = [], fetchProducts, productsLoading } = useProducts(tenantId)
  const { currencies = [], loading: currencyLoading } = useCurrencies()

  const { generalStockAdujstmentSettings = [] } = useStockAdjustmentSettings(tenantId)
  const userProfile = useSelector(state => state.userProfile)
  const [isAuthorized, setIsAuthorized] = useState(false)

  const loading = warehouseLoading || productsLoading || currencyLoading

  useEffect(() => {
    if (checkAuthorizedRoute(EDIT_STOCK, route, userProfile)) {
      fetchProducts()
      setIsAuthorized(true)
    } else {
      setIsAuthorized(false)
    }
  }, [tenantId, userProfile, fetchProducts])

  if (!isAuthorized) {
    return null
  }

  return (
    <ErrorBoundary tenantId={tenantId} dispatch={dispatch}>
      <EditStockAdustment
        loading={loading}
        adjutmentsData={{ warehouses, products, currencies, generalStockAdujstmentSettings }}
      />
    </ErrorBoundary>
  )
}

export default Edit
