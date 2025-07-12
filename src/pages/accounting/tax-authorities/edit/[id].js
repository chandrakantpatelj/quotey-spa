import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { EDIT_TAX_AUTHORITIES } from 'src/common-functions/utils/Constants'
import { checkAuthorizedRoute } from 'src/common-functions/utils/UtilityFunctions'
import ErrorBoundary from 'src/pages/ErrorBoundary'
import EditTaxAuthority from 'src/views/accounting/tax-authorities/EditTaxAuthority'

function Edit() {
  const dispatch = useDispatch()
  const router = useRouter()
  const userProfile = useSelector(state => state.userProfile)

  const [isAuthorized, setIsAuthorized] = useState(false)
  const tenantId = useSelector(state => state.tenants?.selectedTenant?.tenantId)

  useEffect(() => {
    if (checkAuthorizedRoute(EDIT_TAX_AUTHORITIES, router, userProfile)) {
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
      <EditTaxAuthority />
    </ErrorBoundary>
  )
}

export default Edit
