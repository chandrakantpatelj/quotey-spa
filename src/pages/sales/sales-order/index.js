import Link from 'next/link'

import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import { Typography } from '@mui/material'
import Button from '@mui/material/Button'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import PageHeader from 'src/@core/components/page-header'
import PageWrapper from 'src/@core/layouts/PageWrapper'
import { CREATE_SALES_ORDER, LIST_SALES_ORDER } from 'src/common-functions/utils/Constants'
import {
  checkAuthorizedRoute,
  hasPermission,
  sortByDateFirstThenOrderNo
} from 'src/common-functions/utils/UtilityFunctions'
import useCurrencies from 'src/hooks/getData/useCurrencies'
import useCustomers from 'src/hooks/getData/useCustomers'
import useSalesOrders from 'src/hooks/getData/useSalesOrders'
import ErrorBoundary from 'src/pages/ErrorBoundary'
import { setSelectedQuotation } from 'src/store/apps/quotations'
import SalesOrderListTable from 'src/views/sales/SalesOrder/SalesOrderListTable'

function SalesOrder() {
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
          salesOrders: sortByDateFirstThenOrderNo(salesOrders)
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
            Sales Orders
          </Typography>
        }
        button={
          hasPermission(userProfile, CREATE_SALES_ORDER) && (
            <Button
              variant='contained'
              color='primary'
              startIcon={<AddOutlinedIcon />}
              component={Link}
              scroll={true}
              href={`/sales/sales-order/add-salesorder`}
            >
              Add New
            </Button>
          )
        }
      />
      <PageWrapper>
        {/* {loading ? (
          <LinearProgress />
        ) : ( */}
        <ErrorBoundary tenantId={tenantId} dispatch={dispatch}>
          <SalesOrderListTable tenantId={tenantId} salesOrdersObject={salesOrdersObject} loading={loading} />
        </ErrorBoundary>
        {/* )}{' '} */}
      </PageWrapper>
    </>
  )
}

export default SalesOrder
