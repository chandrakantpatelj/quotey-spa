import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { VIEW_PURCHASE_PAYMENT } from 'src/common-functions/utils/Constants'
import { checkAuthorizedRoute } from 'src/common-functions/utils/UtilityFunctions'
import useCurrencies from 'src/hooks/getData/useCurrencies'
import useTaxAuthorities from 'src/hooks/getData/useTaxAuthorities'
import useVendors from 'src/hooks/getData/useVendors'
import ErrorBoundary from 'src/pages/ErrorBoundary'
import ViewPurchasePayment from 'src/views/purchase/Payment/ViewPayment'

function View() {
  const router = useRouter()
  const dispatch = useDispatch()

  const tenantId = useSelector(state => state.tenants?.selectedTenant?.tenantId) || ''
  const userProfile = useSelector(state => state.userProfile)

  const [isAuthorized, setIsAuthorized] = useState(false)
  const { currencies, loading: currencyLoading } = useCurrencies()
  const { vendors, loading: vendorsLoading } = useVendors(tenantId)
  const { taxAuthorities, taxAuthorityLoading } = useTaxAuthorities(tenantId)

  const loading = currencyLoading || vendorsLoading || taxAuthorityLoading
  const [paymentData, setPaymentData] = useState({})

  useEffect(() => {
    if (checkAuthorizedRoute(VIEW_PURCHASE_PAYMENT, router, userProfile)) {
      setIsAuthorized(true)
      setPaymentData({
        currencies,
        vendors,
        taxAuthorities
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
      <ViewPurchasePayment paymentData={paymentData} loading={loading} />
    </ErrorBoundary>
  )
}

export default View
