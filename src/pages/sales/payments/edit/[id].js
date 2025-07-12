import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { EDIT_SALES_PAYMENT } from 'src/common-functions/utils/Constants'
import { checkAuthorizedRoute } from 'src/common-functions/utils/UtilityFunctions'
import useCurrencies from 'src/hooks/getData/useCurrencies'
import useCustomers from 'src/hooks/getData/useCustomers'
import usePaymentMethods from 'src/hooks/getData/usePaymentMethods'
import ErrorBoundary from 'src/pages/ErrorBoundary'
import EditSalesPayment from 'src/views/sales/Payment/EditSalesPayment'

function Edit() {
  const router = useRouter()
  const dispatch = useDispatch()

  const tenantId = useSelector(state => state.tenants?.selectedTenant?.tenantId) || ''
  const userProfile = useSelector(state => state.userProfile)

  const { customers, fetchCustomers, customerLoading } = useCustomers(tenantId)
  const { currencies } = useCurrencies()
  const { paymentMethods } = usePaymentMethods(tenantId)

  const [paymentData, setPaymentData] = useState({})
  const loading = customerLoading
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    if (!tenantId) return
    const loadCustomers = async () => {
      await fetchCustomers()
    }

    loadCustomers()
  }, [tenantId, fetchCustomers])

  useEffect(() => {
    if (checkAuthorizedRoute(EDIT_SALES_PAYMENT, router, userProfile)) {
      setIsAuthorized(true)
      setPaymentData({
        currencies,
        paymentMethods,
        customers
      })
    } else {
      setIsAuthorized(false)
    }
  }, [tenantId, userProfile, fetchCustomers])

  if (!isAuthorized) {
    return null
  }
  return (
    <ErrorBoundary tenantId={tenantId} dispatch={dispatch}>
      <EditSalesPayment paymentData={paymentData} loading={loading} />
    </ErrorBoundary>
  )
}

export default Edit
