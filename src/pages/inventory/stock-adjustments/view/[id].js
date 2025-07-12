import Router from 'next/router'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { VIEW_STOCK } from 'src/common-functions/utils/Constants'
import { checkAuthorizedRoute, dynamicSort } from 'src/common-functions/utils/UtilityFunctions'
import useAdjustments from 'src/hooks/getData/useAdjustments'
import useCurrencies from 'src/hooks/getData/useCurrencies'
import useStockAdjustmentSettings from 'src/hooks/getData/useStockAdjustmentSettings'
import useWarehouses from 'src/hooks/getData/useWarehouses'
import ErrorBoundary from 'src/pages/ErrorBoundary'
import ViewStockAdjustment from 'src/views/inventory/stockAdjutments/ViewStockAdjustment'

function View() {
  const dispatch = useDispatch()
  const route = Router

  const tenantId = useSelector(state => state.tenants?.selectedTenant?.tenantId)
  const { stockAdjustments = [], loading: stockLoading } = useAdjustments(tenantId)
  const { warehouses = [], loading: warehouseLoading } = useWarehouses(tenantId)
  const { currencies = [], loading: currencyLoading } = useCurrencies()

  const { generalStockAdujstmentSettings = [] } = useStockAdjustmentSettings(tenantId)

  const loading = stockLoading && warehouseLoading && currencyLoading
  const sortedStocks = dynamicSort(stockAdjustments, 'adjustmentNo')
  const [isAuthorized, setIsAuthorized] = useState(false)
  const userProfile = useSelector(state => state.userProfile)

  const [adjutmentsData, setAdjutmentsData] = useState({})

  useEffect(() => {
    if (checkAuthorizedRoute(VIEW_STOCK, route, userProfile)) {
      setIsAuthorized(true)
    } else {
      setIsAuthorized(false)
    }
  }, [tenantId, userProfile])

  useEffect(() => {
    if (checkAuthorizedRoute(VIEW_STOCK, route, userProfile)) {
      setIsAuthorized(true)
    } else {
      setIsAuthorized(false)
    }
  }, [tenantId, userProfile])

  useEffect(() => {
    setAdjutmentsData({ stockAdjustments: sortedStocks, warehouses, currencies, generalStockAdujstmentSettings })
  }, [tenantId, stockAdjustments, warehouses])

  if (!isAuthorized) {
    return null
  }
  return (
    <ErrorBoundary tenantId={tenantId} dispatch={dispatch}>
      <ViewStockAdjustment loading={loading} adjustData={adjutmentsData} />
    </ErrorBoundary>
  )
}

export default View
