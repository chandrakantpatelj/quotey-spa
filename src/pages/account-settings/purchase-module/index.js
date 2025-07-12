import Link from 'next/link'
import PageHeader from 'src/@core/components/page-header'
import PageWrapper from 'src/@core/layouts/PageWrapper'
import { Typography, Button, LinearProgress } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import PurchaseModuleListTable from 'src/views/settings/purchasemodule/PurchaseModuleListTable'
import { AddOutlined } from '@mui/icons-material'
import { LIST_PURCHASE_SETTING, EDIT_PURCHASE_SETTING } from 'src/common-functions/utils/Constants'
import { checkAuthorizedRoute, hasPermission } from 'src/common-functions/utils/UtilityFunctions'
import usePurchaseSettings from 'src/hooks/getData/usePurchaseSettings'
import { useEffect, useState } from 'react'
import ErrorBoundary from 'src/pages/ErrorBoundary'
import { useRouter } from 'next/router'

function Purchasemodule() {
  const dispatch = useDispatch()
  const router = useRouter()
  const userProfile = useSelector(state => state.userProfile)
  const [isAuthorized, setIsAuthorized] = useState(false)

  const tenantId = useSelector(state => state?.tenants?.selectedTenant?.tenantId || null)
  const { purchaseModuleSetting, loading } = usePurchaseSettings(tenantId)

  useEffect(() => {
    if (checkAuthorizedRoute(LIST_PURCHASE_SETTING, router, userProfile)) {
      setIsAuthorized(true)
    } else {
      setIsAuthorized(false)
    }
  }, [userProfile])

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
            Purchase Module
          </Typography>
        }
        button={
          hasPermission(userProfile, EDIT_PURCHASE_SETTING) && (
            <Button
              variant='contained'
              color='primary'
              startIcon={<AddOutlined />}
              component={Link}
              scroll={true}
              href={`/account-settings/purchase-module/add`}
            >
              New
            </Button>
          )
        }
      />
      <PageWrapper>
        {loading ? (
          <LinearProgress />
        ) : (
          <ErrorBoundary tenantId={tenantId} dispatch={dispatch}>
            <PurchaseModuleListTable purchaseSettings={{ allPurchaseSettings: purchaseModuleSetting }} />
          </ErrorBoundary>
        )}
      </PageWrapper>
    </>
  )
}

export default Purchasemodule
