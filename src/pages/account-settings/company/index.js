import Link from 'next/link'
import PageHeader from 'src/@core/components/page-header'
import PageWrapper from 'src/@core/layouts/PageWrapper'
import { useDispatch, useSelector } from 'react-redux'
import { Typography, Button, LinearProgress } from '@mui/material'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import CompanyListTable from 'src/views/settings/company/CompanyListTable'
import useCompanies from 'src/hooks/getData/useCompanies'
import ErrorBoundary from 'src/pages/ErrorBoundary'
import { useState } from 'react'
import { useRouter } from 'next/router'

function Company() {
  const dispatch = useDispatch()
  const router = useRouter()
  const userProfile = useSelector(state => state.userProfile)

  const [isAuthorized, setIsAuthorized] = useState(false)
  const tenant = useSelector(state => state.tenants?.selectedTenant)
  const { tenantId } = tenant || ''
  let { companies, loading } = useCompanies()

  // useEffect(() => {
  //   if (checkAuthorizedRoute(LIST_TENANT, router, userProfile)) {
  //     setIsAuthorized(true)
  //   } else {
  //     setIsAuthorized(false)
  //   }
  // }, [userProfile])

  // if (!isAuthorized) {
  //   return null
  // }

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
            Company
          </Typography>
        }
        button={
          // hasPermission(userProfile, CREATE_TENANT) && (
          <Button
            variant='contained'
            color='primary'
            startIcon={<AddOutlinedIcon />}
            component={Link}
            scroll={true}
            href={`/account-settings/company/add-company`}
          >
            Add New
          </Button>
          // )
        }
      />
      <PageWrapper>
        {loading ? (
          <LinearProgress />
        ) : (
          <>
            <CompanyListTable
              tenantsObject={{
                tenants: companies
              }}
            />
          </>
        )}
        {/* )} */}
      </PageWrapper>
    </ErrorBoundary>
  )
}

export default Company
