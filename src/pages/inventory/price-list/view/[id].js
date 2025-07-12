import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { viewPriceListQuery } from 'src/@core/components/graphql/priceList-queries'
import { fetchData } from 'src/common-functions/GraphqlOperations'
import { LIST_PRICE_LIST } from 'src/common-functions/utils/Constants'
import { checkAuthorizedRoute } from 'src/common-functions/utils/UtilityFunctions'
import useCurrencies from 'src/hooks/getData/useCurrencies'
import useCustomers from 'src/hooks/getData/useCustomers'
import usePriceLists from 'src/hooks/getData/usePriceLists'
import useProducts from 'src/hooks/getData/useProducts'
import ErrorBoundary from 'src/pages/ErrorBoundary'
import ViewPriceList from 'src/views/inventory/priceLists/ViewPriceList'

const View = () => {
  const router = useRouter()
  const userProfile = useSelector(state => state.userProfile)

  const [isAuthorized, setIsAuthorized] = useState(false)
  const dispatch = useDispatch()
  const tenantId = useSelector(state => state.tenants?.selectedTenant?.tenantId) || ''
  const { currencies } = useCurrencies()
  const [priceListData, setPriceListData] = useState({})
  const { customers, fetchCustomers, customerLoading } = useCustomers(tenantId)
  const { products, fetchProducts, productsLoading } = useProducts(tenantId)

  const { fetchPriceLists, priceLists, priceListLoading } = usePriceLists(tenantId)
  const loading = customerLoading || productsLoading || priceListLoading

  useEffect(() => {
    if (!tenantId) return
    fetchCustomers()
    fetchProducts()
    fetchPriceLists()
  }, [tenantId, fetchCustomers, fetchProducts, fetchPriceLists])

  async function EditPriceLists() {
    const PLFilterByDate =
      [...(priceLists || [])]?.sort((a, b) => {
        // Parse dates
        const dateA = new Date(a.validFrom)
        const dateB = new Date(b.validFrom)

        // If dates are not equal, sort by date
        if (dateA.getTime() !== dateB.getTime()) {
          return dateB - dateA // Sort by date descending
        } else {
          // If dates are equal, parse order numbers and sort
          const orderNoA = parseInt(a.priceListNo.split('-')[1]) // Parse numerical part
          const orderNoB = parseInt(b.priceListNo.split('-')[1]) // Parse numerical part

          return orderNoB - orderNoA // Sort by order number ascending
        }
      }) || []

    setPriceListData({
      products,
      customers,
      currencies,
      priceLists: PLFilterByDate
    })
  }

  useEffect(() => {
    if (checkAuthorizedRoute(LIST_PRICE_LIST, router, userProfile)) {
      setIsAuthorized(true)
      EditPriceLists()
    } else {
      setIsAuthorized(false)
    }
  }, [tenantId, userProfile, fetchCustomers, fetchPriceLists])

  if (!isAuthorized) {
    return null
  }
  return (
    <ErrorBoundary tenantId={tenantId} dispatch={dispatch}>
      <ViewPriceList priceListData={priceListData} loading={loading} />
    </ErrorBoundary>
  )
}
export default View
