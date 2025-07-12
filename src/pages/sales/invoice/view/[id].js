import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import useCurrencies from 'src/hooks/getData/useCurrencies'
import useCustomers from 'src/hooks/getData/useCustomers'
import ErrorBoundary from 'src/pages/ErrorBoundary'
import ViewSalesInvoice from 'src/views/sales/SalesInvoice/ViewSalesInvoice'

function View() {
  const dispatch = useDispatch()

  const tenant = useSelector(state => state.tenants?.selectedTenant) || ''
  const { tenantId = '' } = tenant

  const { currencies, loading: currencyLoading } = useCurrencies()
  const { customers, customerLoading } = useCustomers(tenantId)

  const loading = currencyLoading || customerLoading
  const [salesOrdersObject, setSalesOrdersObject] = useState({})

  useEffect(() => {
    const fetchSalesInvoiceData = async () => {
      setSalesOrdersObject({
        customers,
        currencies
      })
    }

    fetchSalesInvoiceData()
  }, [tenantId])

  return (
    <ErrorBoundary tenantId={tenantId} dispatch={dispatch}>
      <ViewSalesInvoice
        salesOrdersObject={salesOrdersObject}
        setSalesOrdersObject={setSalesOrdersObject}
        loading={loading}
      />
    </ErrorBoundary>
  )
}

export default View
