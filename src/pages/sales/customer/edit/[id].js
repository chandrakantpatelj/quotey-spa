import { useDispatch, useSelector } from 'react-redux'
import ErrorBoundary from 'src/pages/ErrorBoundary'
import EditCustomer from 'src/views/sales/customer/EditCustomer'

function Edit() {
  const dispatch = useDispatch()
  const tenant = useSelector(state => state.tenants?.selectedTenant)
  const { tenantId } = tenant || ''
  return (
    <ErrorBoundary tenantId={tenantId} dispatch={dispatch}>
      <EditCustomer />
    </ErrorBoundary>
  )
}

export default Edit
