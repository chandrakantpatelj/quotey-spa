import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import useCurrencies from 'src/hooks/getData/useCurrencies'
import useCustomers from 'src/hooks/getData/useCustomers'
import useWarehouses from 'src/hooks/getData/useWarehouses'
import ErrorBoundary from 'src/pages/ErrorBoundary'
import ViewSalesOrder from 'src/views/sales/SalesOrder/ViewSalesOrder'

function View() {
  const dispatch = useDispatch()

  const tenant = useSelector(state => state.tenants?.selectedTenant) || {}
  const { tenantId = '' } = tenant

  const { currencies, loading: currencyLoading } = useCurrencies()
  const { customers, fetchCustomers, customerLoading } = useCustomers(tenantId)
  const { warehouses, loading: warehousesLoading } = useWarehouses(tenantId)

  const loading = currencyLoading || customerLoading || warehousesLoading
  const [salesOrdersObject, setSalesOrdersObject] = useState({})

  useEffect(() => {
    const loadObjects = async () => {
      await fetchCustomers()
      setSalesOrdersObject({
        customers,
        warehouses,
        currencies
      })
    }
    loadObjects()
  }, [tenantId, fetchCustomers])

  return (
    <ErrorBoundary tenantId={tenantId} dispatch={dispatch}>
      <ViewSalesOrder
        salesOrdersObject={salesOrdersObject}
        setSalesOrdersObject={setSalesOrdersObject}
        loading={loading}
      />
    </ErrorBoundary>
  )
}

export default View
