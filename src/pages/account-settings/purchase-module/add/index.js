import Link from 'next/link'
import { IconButton, Typography } from '@mui/material'
import PageHeader from 'src/@core/components/page-header'
import { Close } from '@mui/icons-material'
import PageWrapper from 'src/@core/layouts/PageWrapper'
// import PurchaseModuleSettingForm from 'src/views/settings/purchasemodule/PurchaseMOduleSettingForm'
import { EDIT_PURCHASE_SETTING, SCHEMA_VERSION } from 'src/common-functions/utils/Constants'
import PurchaseModuleSettingForm from 'src/views/settings/purchasemodule/PurchaseModuleSettingForm'
import { useEffect, useState } from 'react'
import { checkAuthorizedRoute } from 'src/common-functions/utils/UtilityFunctions'
import ErrorBoundary from 'src/pages/ErrorBoundary'
import { useDispatch, useSelector } from 'react-redux'
import { useRouter } from 'next/router'

export default function AddPurchaseModule() {
  const dispatch = useDispatch()
  const router = useRouter()
  const userProfile = useSelector(state => state.userProfile)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const tenant = useSelector(state => state.tenants?.selectedTenant)
  const { tenantId } = tenant || ''

  const SETTING_FIELDS = {
    schemaVersion: SCHEMA_VERSION,
    purchaseType: '',
    default: false,
    taxes: [],
    expenses: [],
    subtotalInLocalCurrency: true,
    totalAmountInLocalCurrency: true
  }

  useEffect(() => {
    if (checkAuthorizedRoute(EDIT_PURCHASE_SETTING, router, userProfile)) {
      setIsAuthorized(true)
    } else {
      setIsAuthorized(false)
    }
  }, [userProfile])

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
            Add Purchase Module
          </Typography>
        }
        button={
          <IconButton
            variant='outlined'
            color='default'
            sx={{ fontSize: '21px' }}
            component={Link}
            scroll={true}
            href={`/account-settings/purchase-module/`}
          >
            <Close sx={{ color: theme => theme.palette.primary.main }} />
          </IconButton>
          // )
        }
      />
      <PageWrapper>
        <PurchaseModuleSettingForm defaultData={SETTING_FIELDS} />
      </PageWrapper>
    </ErrorBoundary>
  )
}
