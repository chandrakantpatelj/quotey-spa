import { useState, useEffect } from 'react'
import PageHeader from 'src/@core/components/page-header'
import { Typography } from '@mui/material'
import PageWrapper from 'src/@core/layouts/PageWrapper'
import { useDispatch, useSelector } from 'react-redux'
import { setSelectedQuotation } from 'src/store/apps/quotations'
import { checkAuthorizedRoute } from 'src/common-functions/utils/UtilityFunctions'
import { LIST_SALES_ORDER } from 'src/common-functions/utils/Constants'
import { useRouter } from 'next/router'
import ErrorBoundary from 'src/pages/ErrorBoundary'
import useCustomers from 'src/hooks/getData/useCustomers'
import useSalesOrders from 'src/hooks/getData/useSalesOrders'
import useCurrencies from 'src/hooks/getData/useCurrencies'
import UnifiedSalesdataList from 'src/views/sales/UnifiedSalesData/UnifiedSalesdataList'

function UnifiedSalesData() {
  const router = useRouter()
  const dispatch = useDispatch()
  const tenant = useSelector(state => state.tenants?.selectedTenant) || ''
  const { tenantId = '' } = tenant
  const userProfile = useSelector(state => state.userProfile)
  const reloadSalesLoader = useSelector(state => state.sales?.reloadSalesLoader)
  const headerLoader = useSelector(state => state?.otherSettings.headerLoader)
  const { currencies, loading: currencyLoading } = useCurrencies()
  const { customers, fetchCustomers, customerLoading } = useCustomers(tenantId)
  const { salesOrders, fetchSalesOrders, salesOrdersLoading } = useSalesOrders(tenantId)

  const loading = userProfile.userProfileLoading || currencyLoading || customerLoading || salesOrdersLoading

  const [salesOrdersObject, setSalesOrdersObject] = useState({})
  useEffect(() => {
    if (!tenantId) return

    const loadCustomers = async () => {
      await Promise.all([fetchCustomers(), fetchSalesOrders()])
    }

    loadCustomers()
  }, [tenantId, fetchCustomers, fetchSalesOrders])

  useEffect(() => {
    const checkAuthAndFetchSalesOrder = async () => {
      if (checkAuthorizedRoute(LIST_SALES_ORDER, router, userProfile)) {
        setSalesOrdersObject({
          currencies,
          customers,
          salesOrders
        })
        dispatch(setSelectedQuotation({}))
      }
    }
    checkAuthAndFetchSalesOrder()
  }, [tenantId, customers, salesOrders, reloadSalesLoader, headerLoader])
  return (
    <>
      <PageHeader
        title={
          <Typography
            sx={{
              fontSize: { xs: '16px', md: '18px' },
              fontWeight: '500'
            }}
          >
            Unified Sales
          </Typography>
        }
      />
      <PageWrapper>
        {/* {loading ? (
          <LinearProgress />
        ) : ( */}
        <ErrorBoundary tenantId={tenantId} dispatch={dispatch}>
          <UnifiedSalesdataList tenantId={tenantId} salesOrdersObject={salesOrdersObject} loading={loading} />
        </ErrorBoundary>
        {/* )}{' '} */}
      </PageWrapper>
    </>
  )
}

export default UnifiedSalesData
