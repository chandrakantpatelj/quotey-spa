import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { LIST_WAREHOUSE } from 'src/common-functions/utils/Constants'
import { checkAuthorizedRoute, dynamicSort } from 'src/common-functions/utils/UtilityFunctions'
import useWarehouses from 'src/hooks/getData/useWarehouses'
import ErrorBoundary from 'src/pages/ErrorBoundary'
import ViewWarehouse from 'src/views/settings/warehouses/ViewWarehouse'

function View() {
  const tenant = useSelector(state => state.tenants?.selectedTenant) || {}
  const { tenantId } = tenant || {}
  const { loading, warehouses } = useWarehouses(tenantId)
  const dispatch = useDispatch()
  const router = useRouter()
  const userProfile = useSelector(state => state.userProfile)

  const [isAuthorized, setIsAuthorized] = useState(false)
  const [warehousesObject, setWarehousesObject] = useState({})

  useEffect(() => {
    setWarehousesObject({
      warehouses: dynamicSort(warehouses, 'warehouseNo')
    })
  }, [warehouses, tenantId])

  useEffect(() => {
    if (checkAuthorizedRoute(LIST_WAREHOUSE, router, userProfile)) {
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
      <ViewWarehouse warehousesObject={warehousesObject} loading={loading} />
    </ErrorBoundary>
  )
}

export default View
