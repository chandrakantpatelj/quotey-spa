import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { EDIT_PURCHASE_SHIPMENT } from 'src/common-functions/utils/Constants'
import { checkAuthorizedRoute } from 'src/common-functions/utils/UtilityFunctions'
import useCountries from 'src/hooks/getData/useCountries'
import useCurrencies from 'src/hooks/getData/useCurrencies'
import usePurchaseSettings from 'src/hooks/getData/usePurchaseSettings'
import useTradings from 'src/hooks/getData/useTradings'
import useVendors from 'src/hooks/getData/useVendors'
import useWarehouses from 'src/hooks/getData/useWarehouses'
import ErrorBoundary from 'src/pages/ErrorBoundary'
import EditShipment from 'src/views/purchase/Shipment/EditShipment'

function Edit() {
  const router = useRouter()
  const dispatch = useDispatch()

  const tenant = useSelector(state => state.tenants?.selectedTenant) || {}
  const { tenantId = '' } = tenant

  const userProfile = useSelector(state => state.userProfile)

  const [isAuthorized, setIsAuthorized] = useState(false)
  const { currencies, loading: currencyLoading } = useCurrencies()
  const { countries, loading: countriesLoading } = useCountries()
  const { vendors, loading: vendorLoading } = useVendors(tenantId)
  const { tradings, fetchTradings, tradingLoading } = useTradings(tenantId)
  const { warehouses, loading: warehouseLoading } = useWarehouses(tenantId)
  const { purchaseModuleSetting: purchaseSettingData, loading: purchaseModuleSettingLoading } =
    usePurchaseSettings(tenantId)

  const loading =
    vendorLoading &&
    warehouseLoading &&
    currencyLoading &&
    countriesLoading &&
    tradingLoading &&
    purchaseModuleSettingLoading

  const [shipmentData, setShipmentData] = useState({})

  useEffect(() => {
    if (!tenantId) return
    fetchTradings()
  }, [tenantId, fetchTradings])

  useEffect(() => {
    if (checkAuthorizedRoute(EDIT_PURCHASE_SHIPMENT, router, userProfile)) {
      setIsAuthorized(true)

      setShipmentData({
        currencies,
        countries,
        vendors,
        tradings,
        warehouses,
        purchaseSettingData
      })
    } else {
      setIsAuthorized(false)
    }
  }, [tenantId, userProfile, tradings])

  if (!isAuthorized) {
    return null
  }

  return (
    <ErrorBoundary tenantId={tenantId} dispatch={dispatch}>
      <EditShipment loading={loading} shipmentData={shipmentData} />
    </ErrorBoundary>
  )
}

export default Edit
