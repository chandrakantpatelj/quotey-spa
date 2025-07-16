import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import PageHeader from 'src/@core/components/page-header'
import PageWrapper from 'src/@core/layouts/PageWrapper'
import { Typography, Button } from '@mui/material'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import PackagesListTable from 'src/views/sales/Packages/PackagesListTable'
import { setActionSalesOrder } from 'src/store/apps/sales'
import { checkAuthorizedRoute, hasPermission } from 'src/common-functions/utils/UtilityFunctions'
import { CREATE_PACKAGE, LIST_PACKAGE } from 'src/common-functions/utils/Constants'
import ErrorBoundary from 'src/pages/ErrorBoundary'
import { useRouter } from 'next/router'
import useCustomers from 'src/hooks/getData/useCustomers'
import usePackages from 'src/hooks/getData/usePackages'
import useUserAccounts from 'src/hooks/getData/useUserAccounts'

function Packages() {
  const router = useRouter()
  const dispatch = useDispatch()
  const userProfile = useSelector(state => state.userProfile)
  const reloadPackageLoader = useSelector(state => state.packages?.reloadPackageLoader)
  const headerLoader = useSelector(state => state?.otherSettings.headerLoader)
  const tenantId = useSelector(state => state.tenants?.selectedTenant?.tenantId) || ''
  const { fetchCustomers, customerLoading } = useCustomers(tenantId)
  const { fetchPackages, salesPackagesLoading } = usePackages(tenantId)
  const { userAccounts } = useUserAccounts()

  const loading = customerLoading || salesPackagesLoading
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [packagesObject, setPackagesObject] = useState({})

  useEffect(() => {
    const handleAuthorization = async () => {
      const isAuthorized = checkAuthorizedRoute(LIST_PACKAGE, router, userProfile)

      setIsAuthorized(isAuthorized)

      if (isAuthorized) {
        const packages = await fetchPackages()
        const customers = await fetchCustomers()
        setPackagesObject({
          packages,
          customers,
          userAccounts
        })
      }
    }

    handleAuthorization()
  }, [tenantId, fetchPackages, fetchCustomers, userProfile, reloadPackageLoader, headerLoader])

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
            Packages
          </Typography>
        }
        button={
          hasPermission(userProfile, CREATE_PACKAGE) && (
            <Button
              variant='contained'
              color='primary'
              startIcon={<AddOutlinedIcon />}
              component={Link}
              scroll={true}
              onClick={() => dispatch(setActionSalesOrder(null))}
              href={`/sales/packages/add-package`}
            >
              Add New
            </Button>
          )
        }
      />
      <PageWrapper>
        <PackagesListTable tenantId={tenantId} packagesObject={packagesObject} loading={loading} />
      </PageWrapper>
    </ErrorBoundary>
  )
}

export default Packages
