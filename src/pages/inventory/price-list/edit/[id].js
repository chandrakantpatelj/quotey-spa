import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { EDIT_PRICE_LIST } from 'src/common-functions/utils/Constants'
import { checkAuthorizedRoute } from 'src/common-functions/utils/UtilityFunctions'
import useCustomers from 'src/hooks/getData/useCustomers'
import useProducts from 'src/hooks/getData/useProducts'
import ErrorBoundary from 'src/pages/ErrorBoundary'
import EditPriceList from 'src/views/inventory/priceLists/EditPriceList'

const Edit = () => {
  const router = useRouter()
  const dispatch = useDispatch()

  const { userProfile } = useSelector(state => state)
  const tenantId = useSelector(state => state.tenants?.selectedTenant?.tenantId || '')

  const { customers, fetchCustomers, customerLoading } = useCustomers(tenantId)
  const { products, fetchProducts, productsLoading } = useProducts(tenantId)

  const [isAuthorized, setIsAuthorized] = useState(false)
  const [priceListData, setPriceListData] = useState({})

  const loading = customerLoading || productsLoading

  useEffect(() => {
    if (!tenantId) return
    fetchCustomers()
    fetchProducts()
  }, [tenantId, fetchCustomers, fetchProducts])

  useEffect(() => {
    const authorizeAndLoadData = async () => {
      const authorized = checkAuthorizedRoute(EDIT_PRICE_LIST, router, userProfile)
      setIsAuthorized(authorized)

      if (authorized) {
        setPriceListData({ products, customers })
      }
    }

    authorizeAndLoadData()
  }, [tenantId, userProfile, router, products, customers])

  if (!isAuthorized) return null

  return (
    <ErrorBoundary tenantId={tenantId} dispatch={dispatch}>
      <EditPriceList priceListData={priceListData} loading={loading} />
    </ErrorBoundary>
  )
}

export default Edit
