import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchData } from 'src/common-functions/GraphqlOperations'
import { LIST_TRADING } from 'src/common-functions/utils/Constants'
import { checkAuthorizedRoute, dynamicSort } from 'src/common-functions/utils/UtilityFunctions'
import useTradings from 'src/hooks/getData/useTradings'
import ErrorBoundary from 'src/pages/ErrorBoundary'
import ViewTrading from 'src/views/settings/tradingnames/ViewTrading'

function View() {
  const tenantId = useSelector(state => state.tenants?.selectedTenant?.tenantId) || ''
  const { tradings, fetchTradings, tradingLoading } = useTradings(tenantId)
  const [tradingsObject, setTradingObject] = useState({})
  const dispatch = useDispatch()
  const router = useRouter()
  const userProfile = useSelector(state => state.userProfile)
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    if (!tenantId) return
    fetchTradings()
  }, [tenantId, fetchTradings])

  useEffect(() => {
    setTradingObject({
      tradings: dynamicSort(tradings, 'tradingNo')
    })
  }, [tenantId, tradings])

  useEffect(() => {
    if (checkAuthorizedRoute(LIST_TRADING, router, userProfile)) {
      setIsAuthorized(true)
    } else {
      setIsAuthorized(false)
    }
  }, [userProfile])

  if (!isAuthorized) {
    return null
  }

  return (
    <ErrorBoundary tenantId={tenantId} dispatch={dispatch}>
      <ViewTrading tradingsObject={tradingsObject} loading={tradingLoading} />
    </ErrorBoundary>
  )
}

export default View
