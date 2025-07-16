import Link from 'next/link'
import { useEffect, useState } from 'react'
import PageHeader from 'src/@core/components/page-header'
import { Typography, Button, LinearProgress } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import PageWrapper from 'src/@core/layouts/PageWrapper'
import TaxAuthoritiesListTable from 'src/views/accounting/tax-authorities/TaxAuthoritiesListTable'
import { CREATE_TAX_AUTHORITIES, LIST_TAX_AUTHORITIES } from 'src/common-functions/utils/Constants'
import { checkAuthorizedRoute, hasPermission } from 'src/common-functions/utils/UtilityFunctions'
import ErrorBoundary from 'src/pages/ErrorBoundary'
import { useRouter } from 'next/router'
import useTaxAuthorities from 'src/hooks/getData/useTaxAuthorities'

export default function TaxAuthorities() {
  const router = useRouter()
  const dispatch = useDispatch()
  const tenantId = useSelector(state => state.tenants?.selectedTenant?.tenantId || null)
  const { taxAuthorities, taxAuthorityLoading } = useTaxAuthorities(tenantId)
  const userProfile = useSelector(state => state.userProfile)

  const [isAuthorized, setIsAuthorized] = useState(false)
  const [taxesData, setTaxesData] = useState({})

  useEffect(() => {
    if (checkAuthorizedRoute(LIST_TAX_AUTHORITIES, router, userProfile)) {
      setIsAuthorized(true)

      setTaxesData({
        taxAuthorities
      })
    } else {
      setIsAuthorized(false)
    }
  }, [userProfile, taxAuthorities, tenantId])

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
            Tax Authorities
          </Typography>
        }
        button={
          hasPermission(userProfile, CREATE_TAX_AUTHORITIES) && (
            <Button
              variant='contained'
              color='primary'
              startIcon={<AddOutlinedIcon />}
              component={Link}
              scroll={true}
              href={`/accounting/tax-authorities/add`}
            >
              Add New
            </Button>
          )
        }
      />
      <PageWrapper>
        {taxAuthorityLoading ? (
          <LinearProgress />
        ) : (
          <ErrorBoundary tenantId={tenantId} dispatch={dispatch}>
            <TaxAuthoritiesListTable tenantId={tenantId} taxesData={taxesData} />
          </ErrorBoundary>
        )}
      </PageWrapper>
    </>
  )
}
