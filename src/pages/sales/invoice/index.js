import Link from 'next/link'
import PageHeader from 'src/@core/components/page-header'
import { Typography, Button, Box, LinearProgress } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import PageWrapper from 'src/@core/layouts/PageWrapper'
import useCustomers from 'src/hooks/getData/useCustomers'
import { useEffect, useState } from 'react'
import SalesInvoiceListTable from 'src/views/sales/SalesInvoice/SalesInvoiceListTable'
import ErrorBoundary from 'src/pages/ErrorBoundary'
import useSalesInvoices from 'src/hooks/getData/useSaleInvoices'
import useCurrencies from 'src/hooks/getData/useCurrencies'
import { checkAuthorizedRoute } from 'src/common-functions/utils/UtilityFunctions'
import { LIST_SALES_INVOICE } from 'src/common-functions/utils/Constants'
import { useRouter } from 'next/router'

function SalesInvoice() {
  const dispatch = useDispatch()
  const router = useRouter()

  const tenantId = useSelector(state => state.tenants?.selectedTenant?.tenantId) || ''
  const { currencies, loading: currencyLoading } = useCurrencies(tenantId)
  const { salesInvoiceLoading, error, fetchSalesInvoices } = useSalesInvoices(tenantId)

  const { fetchCustomers, customerLoading } = useCustomers(tenantId)

  const loading = customerLoading || salesInvoiceLoading || currencyLoading

  const [invoiceObject, setInvoiceObject] = useState({})
  const [isAuthorized, setIsAuthorized] = useState(false)
  const reloadInvoiceLoader = useSelector(state => state.salesInvoices?.reloadInvoiceLoader)
  const headerLoader = useSelector(state => state?.otherSettings.headerLoader)

  const userProfile = useSelector(state => state.userProfile)

  useEffect(() => {
    const checkAuthorizationAndFetch = async () => {
      if (checkAuthorizedRoute(LIST_SALES_INVOICE, router, userProfile) && process.env.NEXT_PUBLIC_APP_ENV === 'dev') {
        setIsAuthorized(true)

        const salesInvoicesData = await fetchSalesInvoices()
        const customers = await fetchCustomers()

        setInvoiceObject({
          currencies,
          salesInvoices: salesInvoicesData,
          customers
        })
      } else {
        setIsAuthorized(false)
        router.push('/unauthorized')
      }
    }

    checkAuthorizationAndFetch()
  }, [tenantId, userProfile, fetchSalesInvoices, reloadInvoiceLoader, headerLoader])

  if (!isAuthorized) {
    return null
  }

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
            Invoice
          </Typography>
        }
        button={
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {/* {hasPermission(userProfile, CREATE_CUSTOMER) && ( */}
            <Button
              variant='contained'
              color='primary'
              startIcon={<AddOutlinedIcon />}
              component={Link}
              scroll={true}
              href={`/sales/invoice/add-invoice`}
            >
              Add New
            </Button>
            {/* )} */}
          </Box>
        }
      />
      <PageWrapper>
        <ErrorBoundary tenantId={tenantId} dispatch={dispatch}>
          <SalesInvoiceListTable
            tenantId={tenantId}
            invoiceObject={invoiceObject}
            setInvoiceObject={setInvoiceObject}
            loading={loading}
          />
        </ErrorBoundary>
      </PageWrapper>
    </>
  )
}

export default SalesInvoice
