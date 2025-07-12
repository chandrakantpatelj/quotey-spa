import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { VIEW_PURCHASE_SHIPMENT } from 'src/common-functions/utils/Constants'
import { checkAuthorizedRoute } from 'src/common-functions/utils/UtilityFunctions'
import useCurrencies from 'src/hooks/getData/useCurrencies'
import useVendors from 'src/hooks/getData/useVendors'
import ErrorBoundary from 'src/pages/ErrorBoundary'
import ViewShipment from 'src/views/purchase/Shipment/ViewShipment'

function View() {
  const router = useRouter()
  const dispatch = useDispatch()

  const tenant = useSelector(state => state.tenants?.selectedTenant) || {}
  const { tenantId = '' } = tenant

  const userProfile = useSelector(state => state.userProfile)

  const [isAuthorized, setIsAuthorized] = useState(false)

  const { currencies, loading: currencyLoading } = useCurrencies()
  const { vendors, loading: vendorLoading } = useVendors(tenantId)

  const loading = currencyLoading && vendorLoading

  const [shipmentData, setShipmentData] = useState({})

  useEffect(() => {
    if (checkAuthorizedRoute(VIEW_PURCHASE_SHIPMENT, router, userProfile)) {
      setIsAuthorized(true)

      setShipmentData({
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
      <ViewShipment tenantId={tenantId} loading={loading} shipmentData={shipmentData} />
    </ErrorBoundary>
  )
}

export default View
