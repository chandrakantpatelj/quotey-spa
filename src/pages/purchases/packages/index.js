// ** Next Import
import Link from 'next/link'
import { useEffect, useState } from 'react'
import PageHeader from 'src/@core/components/page-header'
import PageWrapper from 'src/@core/layouts/PageWrapper'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import { Typography, Button } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import { CREATE_PURCHASE_ORDER, LIST_PURCHASE_PACKAGE } from 'src/common-functions/utils/Constants'
import { checkAuthorizedRoute, hasPermission } from 'src/common-functions/utils/UtilityFunctions'
import useVendors from 'src/hooks/getData/useVendors'
import ErrorBoundary from 'src/pages/ErrorBoundary'
import PurchasePackagesListTable from 'src/views/purchase/purchase-package/PurchasePackagesListTable'
import usePurchasePackages from 'src/hooks/getData/usePurchasePackages'
import useCurrencies from 'src/hooks/getData/useCurrencies'
import { useRouter } from 'next/router'

function PurchasePackages() {
  const dispatch = useDispatch()
  const router = useRouter()

  const tenantId = useSelector(state => state.tenants?.selectedTenant?.tenantId) || ''

  const { currencies } = useCurrencies()
  const { vendors, loading: vendorsLoading } = useVendors(tenantId)
  const { fetchPurchasePackages, purchasePackageLoading } = usePurchasePackages(tenantId)
  const reloadPurchasePackage = useSelector(state => state.purchasePackage?.reloadPurchasePackage)
  const headerLoader = useSelector(state => state?.otherSettings?.headerLoader)
  const loading = vendorsLoading || purchasePackageLoading
  const userProfile = useSelector(state => state.userProfile)

  const [purchaseData, setPurchaseData] = useState({})
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    const getPurchasePackage = async () => {
      if (checkAuthorizedRoute(LIST_PURCHASE_PACKAGE, router, userProfile)) {
        setIsAuthorized(true)
        const purchasePackages = await fetchPurchasePackages()
        setPurchaseData({
          currencies,
          vendors,
          purchasePackages
        })
      } else {
        setIsAuthorized(false)
      }
    }
    getPurchasePackage()
  }, [vendors, fetchPurchasePackages, reloadPurchasePackage, headerLoader, tenantId, dispatch])

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
            Packages
          </Typography>
        }
        button={
          hasPermission(userProfile, CREATE_PURCHASE_ORDER) && (
            <Button
              variant='contained'
              color='primary'
              startIcon={<AddOutlinedIcon />}
              component={Link}
              scroll={true}
              href={`/purchases/packages/add-package`}
            >
              Add New
            </Button>
          )
        }
      />
      <PageWrapper>
        <ErrorBoundary tenantId={tenantId} dispatch={dispatch}>
          <PurchasePackagesListTable tenantId={tenantId} purchaseData={purchaseData} loading={loading} />
        </ErrorBoundary>
      </PageWrapper>
    </>
  )
}

export default PurchasePackages
