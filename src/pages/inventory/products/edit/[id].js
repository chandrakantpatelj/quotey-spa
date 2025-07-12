// ** Third Party Imports
import axios from 'axios'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { editProductQuery } from 'src/@core/components/graphql/item-queries'
import { fetchData } from 'src/common-functions/GraphqlOperations'
import { EDIT_ITEM } from 'src/common-functions/utils/Constants'
import { checkAuthorizedRoute } from 'src/common-functions/utils/UtilityFunctions'
import ErrorBoundary from 'src/pages/ErrorBoundary'
import { setAllProduct } from 'src/store/apps/products'
import EditItem from 'src/views/inventory/actions/EditItem'

const Edit = () => {
  const router = useRouter()
  const userProfile = useSelector(state => state.userProfile)

  const [isAuthorized, setIsAuthorized] = useState(false)
  const dispatch = useDispatch()
  const tenantId = useSelector(state => state.tenants?.selectedTenant?.tenantId) || ''
  const [productsData, setProductsData] = useState({})
  const [loading, setLoading] = useState(true)
  async function getProducts() {
    try {
      setLoading(true)
      const productsData = await fetchData(editProductQuery(tenantId))
      const { getOtherSetting } = productsData
      const distructObject = {
        settings: getOtherSetting
      }
      setProductsData(distructObject)
    } catch (error) {
      console.error('Error fetching  data for edit item:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (checkAuthorizedRoute(EDIT_ITEM, router, userProfile)) {
      setIsAuthorized(true)
      getProducts()
    } else {
      setIsAuthorized(false)
    }
  }, [tenantId, userProfile])

  if (!isAuthorized) {
    return null
  }
  return (
    <ErrorBoundary tenantId={tenantId} dispatch={dispatch}>
      <EditItem productsData={productsData} loading={loading} />
    </ErrorBoundary>
  )
}

export default Edit
