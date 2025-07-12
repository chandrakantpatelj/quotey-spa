import Link from 'next/link'
import { useEffect, useState } from 'react'
import PageHeader from 'src/@core/components/page-header'
import { Typography, Button, LinearProgress } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import PageWrapper from 'src/@core/layouts/PageWrapper'
import TaxStatementsListTable from 'src/views/accounting/tax-statements/TaxStatementsListTable'
import { CREATE_STATEMENT, LIST_STATEMENT } from 'src/common-functions/utils/Constants'
import { checkAuthorizedRoute, hasPermission } from 'src/common-functions/utils/UtilityFunctions'
import ErrorBoundary from 'src/pages/ErrorBoundary'
import { useRouter } from 'next/router'
import useTaxAuthorities from 'src/hooks/getData/useTaxAuthorities'
import useTaxStatements from 'src/hooks/getData/useTaxStatements'
// import TaxStatementsListTable from 'src/views/accounting/taxes/TaxStatementsListTable'

export default function TaxStatement() {
  const router = useRouter()
  const dispatch = useDispatch()

  const tenantId = useSelector(state => state.tenants?.selectedTenant?.tenantId) || ''
  const [taxesData, setTaxesData] = useState({})
  const userProfile = useSelector(state => state.userProfile)

  const { taxAuthorities, taxAuthorityLoading } = useTaxAuthorities(tenantId)
  const { taxStatements, loading: taxStatementsLoading } = useTaxStatements(tenantId)

  const loading = taxAuthorityLoading || taxStatementsLoading

  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    if (checkAuthorizedRoute(LIST_STATEMENT, router, userProfile)) {
      setIsAuthorized(true)
      setTaxesData({
        taxStatements: taxStatements,
        taxAuthorities: taxAuthorities
      })
    } else {
      setIsAuthorized(false)
    }
  }, [tenantId, taxStatements, userProfile])

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
            Tax Statements
          </Typography>
        }
        button={
          hasPermission(userProfile, CREATE_STATEMENT) && (
            <Button
              variant='contained'
              color='primary'
              startIcon={<AddOutlinedIcon />}
              component={Link}
              scroll={true}
              href={`/accounting/tax-statements/add`}
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
          <ErrorBoundary tenantId={tenantId} dispatch={dispatch}>
            <TaxStatementsListTable tenantId={tenantId} taxesData={taxesData} setTaxesData={setTaxesData} />
          </ErrorBoundary>
        )}
      </PageWrapper>
    </>
  )
}
