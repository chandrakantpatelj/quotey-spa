import Router from 'next/router'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { EDIT_SALES_ORDER } from 'src/common-functions/utils/Constants'
import { checkAuthorizedRoute } from 'src/common-functions/utils/UtilityFunctions'
import useCountries from 'src/hooks/getData/useCountries'
import useCurrencies from 'src/hooks/getData/useCurrencies'
import useOtherSettings from 'src/hooks/getData/useOtherSettings'
import usePaymentTerms from 'src/hooks/getData/usePaymnetTerms'
import usePriceLists from 'src/hooks/getData/usePriceLists'
import useProducts from 'src/hooks/getData/useProducts'
import { useSalesModule } from 'src/hooks/getData/useSalesModule'
import useTradings from 'src/hooks/getData/useTradings'
import useWarehouses from 'src/hooks/getData/useWarehouses'
import ErrorBoundary from 'src/pages/ErrorBoundary'
import EditSalesOrder from 'src/views/sales/SalesOrder/EditSalesOrder'

function Edit() {
  const router = Router
  const dispatch = useDispatch()
  const [salesOrdersObject, setSalesOrdersObject] = useState({})
  const [isAuthorized, setIsAuthorized] = useState(false)
  const tenantId = useSelector(state => state.tenants?.selectedTenant?.tenantId)
  const { countries } = useCountries()
  const { currencies } = useCurrencies()
  const { paymentTerms } = usePaymentTerms()
  const { tradings, fetchTradings } = useTradings(tenantId)
  const { warehouses } = useWarehouses(tenantId)
  const { salesModules } = useSalesModule(tenantId)
  const { products, fetchProducts } = useProducts(tenantId)
  const { priceLists, fetchPriceLists } = usePriceLists(tenantId)
  const { fetchOtherSettings, otherSettings } = useOtherSettings(tenantId)

  const selectedSO = useSelector(state => state.sales?.selectedSalesOrder) || {}
  const [loading, setLoading] = useState(true)

  const userProfile = useSelector(state => state.userProfile)

  useEffect(() => {
    if (!tenantId) return
    if (Object.keys(selectedSO).length === 0) return
    fetchProducts()
    fetchPriceLists()
    fetchOtherSettings()
    fetchTradings()
  }, [tenantId, fetchProducts, fetchPriceLists, fetchOtherSettings, fetchTradings])

  // Function to fetch sales order details
  function editSalesOrder() {
    try {
      setLoading(true)
      setSalesOrdersObject({
        countries,
        currencies,
        tradings,
        products,
        warehouses,
        salesModules,
        settings: otherSettings,
        paymentTerms,
        priceLists
      })
      setLoading(false)
    } catch (error) {
      setLoading(false)
      console.error('Error fetching data for edit sales order:', error)
    }
  }

  useEffect(() => {
    if (checkAuthorizedRoute(EDIT_SALES_ORDER, router, userProfile)) {
      console.log('selectedSO', selectedSO)

      if (Object.keys(selectedSO).length === 0) {
        setLoading(true)
        router.push('/sales/sales-order/')
        // route.reload('/sales/sales-order/')
        setIsAuthorized(false)

        // return null
      }
      setIsAuthorized(true)
      editSalesOrder()
    } else {
      setIsAuthorized(false)
    }
  }, [tenantId, userProfile, products, otherSettings, priceLists, selectedSO])

  if (!isAuthorized) {
    return null
  }

  return (
    <ErrorBoundary tenantId={tenantId} dispatch={dispatch}>
      <EditSalesOrder salesOrdersObject={salesOrdersObject} loading={loading} tenantId={tenantId} />
    </ErrorBoundary>
  )
}

export default Edit
