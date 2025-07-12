import Link from 'next/link'

import PageHeader from 'src/@core/components/page-header'
import Button from '@mui/material/Button'
import { Typography, LinearProgress } from '@mui/material'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import PageWrapper from 'src/@core/layouts/PageWrapper'
import QuotationListTable from 'src/views/quotation/QuotationListTable'
import { useDispatch, useSelector } from 'react-redux'
import { checkAuthorizedRoute, hasPermission } from 'src/common-functions/utils/UtilityFunctions'
import { CREATE_QUOTATION, LIST_QUOTATION } from 'src/common-functions/utils/Constants'
import useQuotations from 'src/hooks/getData/useQuotations'
import useCustomers from 'src/hooks/getData/useCustomers'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import ErrorBoundary from 'src/pages/ErrorBoundary'

function Quotation() {
  const router = useRouter()
  const dispatch = useDispatch()

  const tenant = useSelector(state => state.tenants?.selectedTenant) || ''
  const { tenantId = '' } = tenant
  const userProfile = useSelector(state => state.userProfile)

  const [isAuthorized, setIsAuthorized] = useState(false)
  const { customers, customerLoading } = useCustomers(tenantId)
  const { quotations, loading: quotationsLoading } = useQuotations(tenantId)

  const loading = customerLoading || quotationsLoading

  const [quotationObject, setQuotationObject] = useState({})

  useEffect(() => {
    if (checkAuthorizedRoute(LIST_QUOTATION, router, userProfile)) {
      setIsAuthorized(true)
      setQuotationObject({
        customers: customers,
        quotations: quotations
      })
    } else {
      setIsAuthorized(false)
    }
  }, [tenantId, customers, quotations, userProfile])

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
            Quotations
          </Typography>
        }
        button={
          hasPermission(userProfile, CREATE_QUOTATION) && (
            <Button
              variant='contained'
              color='primary'
              startIcon={<AddOutlinedIcon />}
              component={Link}
              scroll={true}
              href={`/sales/quotation/add`}
            >
              Add New
            </Button>
          )
        }
      />
      <PageWrapper>
        {loading ? (
          <LinearProgress />
        ) : (
          <QuotationListTable
            tenantId={tenantId}
            quotationObject={quotationObject}
            setQuotationObject={setQuotationObject}
            // setLoading={setLoading}
          />
        )}
      </PageWrapper>
    </ErrorBoundary>
  )
}

export default Quotation
