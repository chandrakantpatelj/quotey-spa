import { useDispatch, useSelector } from 'react-redux'
import { dynamicSort } from 'src/common-functions/utils/UtilityFunctions'
import ViewQuotation from 'src/views/quotation/ViewQuotation'
import useCustomers from 'src/hooks/getData/useCustomers'
import useQuotations from 'src/hooks/getData/useQuotations'
import ErrorBoundary from 'src/pages/ErrorBoundary'
import useCurrencies from 'src/hooks/getData/useCurrencies'
import useWarehouses from 'src/hooks/getData/useWarehouses'

function View() {
  const dispatch = useDispatch()

  const tenant = useSelector(state => state.tenants?.selectedTenant) || ''
  const { tenantId = '' } = tenant
  const { currencies, loading: currenciesLoading } = useCurrencies()
  const { customers, customerLoading } = useCustomers(tenantId)
  const { warehouses, loading: warehousesLoading } = useWarehouses(tenantId)
  const { quotations, loading: quotationsLoading } = useQuotations(tenantId)
  const sortedQuoation = dynamicSort(quotations, 'quotationNo')

  const loading = currenciesLoading || customerLoading || warehousesLoading || quotationsLoading

  // useEffect(() => {

  //   const distructObject = {
  //     customers,
  //     warehouses,
  //     currencies,
  //     quotations: sortedQuoation
  //   }

  //   setQuotationObject(distructObject)
  // }, [tenantId])

  return (
    <ErrorBoundary tenantId={tenantId} dispatch={dispatch}>
      <ViewQuotation
        quotationObject={{
          customers,
          warehouses,
          currencies,
          quotations: sortedQuoation
        }}
        loading={loading}
      />
    </ErrorBoundary>
  )
}

export default View
