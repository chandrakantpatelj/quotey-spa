import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { LIST_PURCHASE_ORDER } from 'src/common-functions/utils/Constants'
import { checkAuthorizedRoute } from 'src/common-functions/utils/UtilityFunctions'
import useCurrencies from 'src/hooks/getData/useCurrencies'
import useTaxAuthorities from 'src/hooks/getData/useTaxAuthorities'
import useVendors from 'src/hooks/getData/useVendors'
import ErrorBoundary from 'src/pages/ErrorBoundary'
import ViewPurchaseOrder from 'src/views/purchase/purchase-order/ViewPurchaseOrder'

function View() {
  const router = useRouter()
  const dispatch = useDispatch()

  const tenant = useSelector(state => state.tenants?.selectedTenant) || {}
  const { tenantId = '' } = tenant

  const userProfile = useSelector(state => state.userProfile)

  const [isAuthorized, setIsAuthorized] = useState(false)

  const { currencies, loading: currencyLoading } = useCurrencies()
  const { vendors, loading: vendorLoading } = useVendors(tenantId)
  const { taxAuthorities, taxAuthorityLoading } = useTaxAuthorities(tenantId)

  // const { purchaseModuleSetting, loading: purchaseSettingLoading } = usePurchaseSettings(tenantId)

  const [purchaseOrderData, setPurchaseOrderData] = useState({})

  const loading = vendorLoading || currencyLoading || taxAuthorityLoading

  useEffect(() => {
    if (checkAuthorizedRoute(LIST_PURCHASE_ORDER, router, userProfile)) {
      setIsAuthorized(true)

      setPurchaseOrderData({
        // purchaseModuleSetting,
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
      <ViewPurchaseOrder
        loading={loading}
        // setLoading={setLoading}
        purchaseOrderData={purchaseOrderData}
        // setPurchaseOrderData={setPurchaseOrderData}
      />
    </ErrorBoundary>
  )
}

export default View
