import Link from 'next/link'
import { useEffect, useState } from 'react'
import PageHeader from 'src/@core/components/page-header'
import { Typography, Button, LinearProgress } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import PageWrapper from 'src/@core/layouts/PageWrapper'
import TaxPaymentsListTable from 'src/views/accounting/tax-payments/TaxPaymentsListTable'
import { checkAuthorizedRoute, hasPermission } from 'src/common-functions/utils/UtilityFunctions'
import { CREATE_TAX_PAYMENT, LIST_TAX_PAYMENT } from 'src/common-functions/utils/Constants'
import ErrorBoundary from 'src/pages/ErrorBoundary'
import { useRouter } from 'next/router'
import useTaxAuthorities from 'src/hooks/getData/useTaxAuthorities'
import useTaxPayments from 'src/hooks/getData/useTaxPayments'
import useCurrencies from 'src/hooks/getData/useCurrencies'

export default function TaxPayment() {
  const dispatch = useDispatch()
  const router = useRouter()
  const userProfile = useSelector(state => state.userProfile)

  const [isAuthorized, setIsAuthorized] = useState(false)
  const tenantId = useSelector(state => state.tenants?.selectedTenant?.tenantId) || ''

  const { currencies, loading: currencyLoading } = useCurrencies()
  const { taxPayments, loading: taxPaymentLoading } = useTaxPayments(tenantId)
  const { taxAuthorities, taxAuthorityLoading } = useTaxAuthorities(tenantId)

  const loading = currencyLoading || taxAuthorityLoading || taxPaymentLoading
  const [taxPaymentsData, setTaxPaymentsData] = useState({})

  useEffect(() => {
    if (checkAuthorizedRoute(LIST_TAX_PAYMENT, router, userProfile)) {
      setIsAuthorized(true)
      setTaxPaymentsData({
        taxPayments,
        taxAuthorities,
        currencies
      })
    } else {
      setIsAuthorized(false)
    }
  }, [tenantId, taxPayments, userProfile])

  if (!isAuthorized) {
    return null
  }
  return (
    <ErrorBoundary tenantId={tenantId} dispatch={dispatch}>
      <PageHeader
        title={
          <Typography
            sx={{
              fontSize: { xs: '16px', md: '18px' },
              fontWeight: '500'
            }}
          >
            Tax Payments
          </Typography>
        }
        button={
          hasPermission(userProfile, CREATE_TAX_PAYMENT) && (
            <Button
              variant='contained'
              color='primary'
              startIcon={<AddOutlinedIcon />}
              component={Link}
              scroll={true}
              href={`/accounting/tax-payments/add`}
            >
              Add New
            </Button>
          )
        }
      />
      <PageWrapper>
        {loading ? <LinearProgress /> : <TaxPaymentsListTable taxPaymentsData={taxPaymentsData} />}
      </PageWrapper>
    </ErrorBoundary>
  )
}
