import ViewCustomer from 'src/views/sales/customer/ViewCustomer'
import { useDispatch, useSelector } from 'react-redux'
import ErrorBoundary from 'src/pages/ErrorBoundary'
import useCustomers from 'src/hooks/getData/useCustomers'
import { dynamicSort } from 'src/common-functions/utils/UtilityFunctions'
import { useEffect } from 'react'

function View() {
  const dispatch = useDispatch()
  const tenant = useSelector(state => state.tenants?.selectedTenant)
  const { tenantId } = tenant || {}
  const { customers, fetchCustomers, customerLoading } = useCustomers(tenantId)
  const sortedCustomers = dynamicSort(customers, 'customerNo')

  useEffect(() => {
    if (!tenantId) return
    const loadCustomers = async () => {
      await fetchCustomers()
    }

    loadCustomers()
  }, [tenantId, fetchCustomers])

  return (
    <ErrorBoundary tenantId={tenantId} dispatch={dispatch}>
      <ViewCustomer
        loading={customerLoading}
        customerObject={{
          customers: sortedCustomers
        }}
      />
    </ErrorBoundary>
  )
}

export default View
