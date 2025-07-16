import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { EDIT_TRADING } from 'src/common-functions/utils/Constants'
import { checkAuthorizedRoute } from 'src/common-functions/utils/UtilityFunctions'
import ErrorBoundary from 'src/pages/ErrorBoundary'
import EditTrading from 'src/views/settings/tradingnames/EditTrading'

function Edit() {
  const tenant = useSelector(state => state.tenants?.selectedTenant || {})
  const accounts = useSelector(state => state.accounts?.data || {})
  const [tradingsObject, setTradingObject] = useState({})
  const [loading, setLoading] = useState(true)
  const dispatch = useDispatch()
  const router = useRouter()
  const userProfile = useSelector(state => state.userProfile)
  const [isAuthorized, setIsAuthorized] = useState(false)

  async function getTradingData() {
    try {
      setLoading(true)
      const distructObject = {
        account: accounts
      }
      setTradingObject(distructObject)
    } catch (error) {
      console.error('Error fetching data for tradings:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (checkAuthorizedRoute(EDIT_TRADING, router, userProfile)) {
      setIsAuthorized(true)
      getTradingData()
    } else {
      setIsAuthorized(false)
    }
  }, [tenant, userProfile])

  if (!isAuthorized) {
    return null
  }
  return (
    <ErrorBoundary tenantId={tenant?.tenantId} dispatch={dispatch}>
      <EditTrading tradingsObject={tradingsObject} loading={loading} />
    </ErrorBoundary>
  )
}

export default Edit
