import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import useVendors from 'src/hooks/getData/useVendors'
import { EDIT_PURCHASE_ORDER } from 'src/common-functions/utils/Constants'
import { checkAuthorizedRoute } from 'src/common-functions/utils/UtilityFunctions'
import ErrorBoundary from 'src/pages/ErrorBoundary'
import EditPurchaseOrder from 'src/views/purchase/purchase-order/EditPurchaseOrder'
import usePaymentTerms from 'src/hooks/getData/usePaymnetTerms'
import useWarehouses from 'src/hooks/getData/useWarehouses'
import useCurrencies from 'src/hooks/getData/useCurrencies'
import useCountries from 'src/hooks/getData/useCountries'
import usePurchaseSettings from 'src/hooks/getData/usePurchaseSettings'
import useTradings from 'src/hooks/getData/useTradings'

function Edit() {
  const router = useRouter()
  const dispatch = useDispatch()

  const userProfile = useSelector(state => state.userProfile)

  const [isAuthorized, setIsAuthorized] = useState(false)
  const tenant = useSelector(state => state.tenants?.selectedTenant) || {}
  const { tenantId = '' } = tenant

  const { paymentTerms } = usePaymentTerms()
  const { tradings, fetchTradings, tradingLoading } = useTradings(tenantId)
  const { currencies, loading: currencyLoading } = useCurrencies()
  const { countries, loading: countriesLoading } = useCountries()
  const { vendors, loading: vendorLoading } = useVendors(tenantId)
  const { warehouses, loading: warehouseLoading } = useWarehouses(tenantId)
  const { purchaseModuleSetting, loading: purchaseSettingLoading } = usePurchaseSettings(tenantId)

  const loading =
    vendorLoading || warehouseLoading || currencyLoading || countriesLoading || purchaseSettingLoading || tradingLoading

  useEffect(() => {
    if (checkAuthorizedRoute(EDIT_PURCHASE_ORDER, router, userProfile)) {
      fetchTradings()
      setIsAuthorized(true)
    } else {
      setIsAuthorized(false)
    }
  }, [tenantId, userProfile])

  if (!isAuthorized) {
    return null
  }
  return (
    <ErrorBoundary tenantId={tenantId} dispatch={dispatch}>
      <EditPurchaseOrder
        purchaseOrderData={{
          tradings,
          countries,
          currencies,
          vendors,
          warehouses,
          paymentTerms,
          purchaseModuleSetting
        }}
        loading={loading}
      />
    </ErrorBoundary>
  )
}

export default Edit
