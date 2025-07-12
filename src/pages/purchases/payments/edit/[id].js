import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { EDIT_PURCHASE_PAYMENT } from 'src/common-functions/utils/Constants'
import { checkAuthorizedRoute } from 'src/common-functions/utils/UtilityFunctions'
import useCurrencies from 'src/hooks/getData/useCurrencies'
import useVendors from 'src/hooks/getData/useVendors'
import ErrorBoundary from 'src/pages/ErrorBoundary'
import EditPurchasePayment from 'src/views/purchase/Payment/EditPurchasePayment'

function Edit() {
  const router = useRouter()
  const dispatch = useDispatch()

  const tenantId = useSelector(state => state.tenants?.selectedTenant?.tenantId) || ''
  const userProfile = useSelector(state => state.userProfile)

  const [isAuthorized, setIsAuthorized] = useState(false)
  const { currencies, loading: currencyLoading } = useCurrencies()
  const { vendors, loading: vendorsLoading } = useVendors(tenantId)

  const loading = currencyLoading || vendorsLoading
  const [paymentData, setPaymentData] = useState({})

  useEffect(() => {
    if (checkAuthorizedRoute(EDIT_PURCHASE_PAYMENT, router, userProfile)) {
      setIsAuthorized(true)
      setPaymentData({
        currencies,
        vendors
      })
    } else {
      setIsAuthorized(false)
    }
  }, [tenantId, userProfile])

  if (!isAuthorized) {
    return null
  }
  return (
    <ErrorBoundary tenantId={tenantId} dispatch={dispatch}>
      <EditPurchasePayment paymentData={paymentData} loading={loading} />
    </ErrorBoundary>
  )
}

export default Edit
