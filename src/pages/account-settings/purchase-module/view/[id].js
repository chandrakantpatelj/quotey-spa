import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { LIST_PURCHASE_SETTING } from 'src/common-functions/utils/Constants'
import { checkAuthorizedRoute } from 'src/common-functions/utils/UtilityFunctions'
import useTaxAuthorities from 'src/hooks/getData/useTaxAuthorities'
import useVendors from 'src/hooks/getData/useVendors'
import ErrorBoundary from 'src/pages/ErrorBoundary'
import ViewPurchaseSetting from 'src/views/settings/purchasemodule/ViewPurchaseSetting'

export default function View() {
  const dispatch = useDispatch()
  const router = useRouter()
  const tenantId = useSelector(state => state?.tenants?.selectedTenant?.tenantId || null)
  const { vendors, loading: vendorLoading } = useVendors(tenantId)
  const { taxAuthorities, taxAuthorityLoading } = useTaxAuthorities(tenantId)

  // const [loading, setLoading] = useState(true)

  const loading = taxAuthorityLoading || vendorLoading
  const [purchaseSettingData, setPurchaseSettingData] = useState([])

  const userProfile = useSelector(state => state.userProfile)
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    if (checkAuthorizedRoute(LIST_PURCHASE_SETTING, router, userProfile)) {
      setIsAuthorized(true)
      setPurchaseSettingData({
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
      <ViewPurchaseSetting purchaseSettingData={purchaseSettingData} loading={loading} />
    </ErrorBoundary>
  )
}
