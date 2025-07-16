import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { LIST_SALES_PAYMENT } from 'src/common-functions/utils/Constants'
import { checkAuthorizedRoute, dynamicSort } from 'src/common-functions/utils/UtilityFunctions'
import useCustomers from 'src/hooks/getData/useCustomers'
import useSalesPayments from 'src/hooks/getData/useSalesPayment'
import ErrorBoundary from 'src/pages/ErrorBoundary'
import ViewPayment from 'src/views/sales/Payment/ViewPayment'

function View() {
  const tenantId = useSelector(state => state.tenants?.selectedTenant?.tenantId) || ''

  const router = useRouter()
  const dispatch = useDispatch()
  const userProfile = useSelector(state => state.userProfile)
  const { customerLoading } = useCustomers(tenantId)
  const { fetchSalesPayments, salesPaymentLoading } = useSalesPayments(tenantId)

  const [paymentData, setPaymentData] = useState({})
  const loading = customerLoading || salesPaymentLoading
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      if (checkAuthorizedRoute(LIST_SALES_PAYMENT, router, userProfile)) {
        const salesPayments = await fetchSalesPayments()
        const sortedSalesPayments = dynamicSort(salesPayments, 'paymentNo')

        setIsAuthorized(true)
        setPaymentData({
          payments: sortedSalesPayments
        })
      } else {
        setIsAuthorized(false)
      }
    }
    checkAuth()
  }, [tenantId, userProfile, fetchSalesPayments])

  if (!isAuthorized) {
    return null
  }
  return (
    <ErrorBoundary tenantId={tenantId} dispatch={dispatch}>
      <ViewPayment paymentData={paymentData} loading={loading} />
    </ErrorBoundary>
  )
}

export default View
