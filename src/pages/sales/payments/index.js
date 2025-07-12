import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useDispatch, useSelector } from 'react-redux'

import { Typography, Button } from '@mui/material'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'

import PageHeader from 'src/@core/components/page-header'
import PageWrapper from 'src/@core/layouts/PageWrapper'
import SalesPaymentListTable from 'src/views/sales/Payment/SalesPaymentListTable'
import ErrorBoundary from 'src/pages/ErrorBoundary'

import { setActionSalesOrder } from 'src/store/apps/sales'
import { setSelectedCustomer } from 'src/store/apps/customers'

import useSalesPayments from 'src/hooks/getData/useSalesPayment'
import useCurrencies from 'src/hooks/getData/useCurrencies'
import usePaymentMethods from 'src/hooks/getData/usePaymentMethods'
import useCustomers from 'src/hooks/getData/useCustomers'

import { checkAuthorizedRoute, hasPermission } from 'src/common-functions/utils/UtilityFunctions'
import { CREATE_SALES_PAYMENT, LIST_SALES_PAYMENT } from 'src/common-functions/utils/Constants'

export const MOBILE_COLUMNS = {
  customerId: false,
  notes: false
}
export const ALL_COLUMNS = {}

const SalesPayments = () => {
  const dispatch = useDispatch()
  const router = useRouter()

  const userProfile = useSelector(state => state.userProfile)
  const tenantId = useSelector(state => state.tenants?.selectedTenant?.tenantId)
  const reloadSalesPaymentLoader = useSelector(state => state.salesPayments?.reloadSalesPaymentLoader)
  const headerLoader = useSelector(state => state?.otherSettings.headerLoader)

  const { currencies, loading: currenciesLoading } = useCurrencies()
  const { paymentMethods, loading: paymentMethodLoading } = usePaymentMethods(tenantId)
  const { loading: customerLoading, fetchCustomers } = useCustomers(tenantId)
  const { fetchSalesPayments, salesPaymentLoading } = useSalesPayments(tenantId)

  const [paymentData, setPaymentData] = useState(null)
  const [isAuthorized, setIsAuthorized] = useState(false)

  const loading = currenciesLoading || paymentMethodLoading || customerLoading || salesPaymentLoading

  useEffect(() => {
    const fetchData = async () => {
      if (!tenantId || !checkAuthorizedRoute(LIST_SALES_PAYMENT, router, userProfile)) {
        setIsAuthorized(false)
        return
      }

      const [salesPayments, customers] = await Promise.all([fetchSalesPayments(), fetchCustomers()])

      setPaymentData({
        salesPayments,
        currencies,
        paymentMethods,
        customers
      })

      setIsAuthorized(true)
    }

    fetchData()
  }, [tenantId, fetchSalesPayments, fetchCustomers, userProfile, router, headerLoader, reloadSalesPaymentLoader])

  if (!isAuthorized) return null

  return (
    <>
      <PageHeader
        title={<Typography sx={{ fontSize: { xs: '16px', md: '18px' }, fontWeight: '500' }}>Payments</Typography>}
        button={
          hasPermission(userProfile, CREATE_SALES_PAYMENT) && (
            <Button
              variant='contained'
              color='primary'
              startIcon={<AddOutlinedIcon />}
              component={Link}
              scroll
              href='/sales/payments/new-payment'
              onClick={() => {
                dispatch(setActionSalesOrder(null))
                dispatch(setSelectedCustomer(null))
              }}
            >
              New
            </Button>
          )
        }
      />
      <PageWrapper>
        <ErrorBoundary tenantId={tenantId} dispatch={dispatch}>
          <SalesPaymentListTable tenantId={tenantId} paymentData={paymentData} loading={loading} />
        </ErrorBoundary>
      </PageWrapper>
    </>
  )
}

export default SalesPayments
