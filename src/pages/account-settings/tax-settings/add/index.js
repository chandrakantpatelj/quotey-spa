import { Close } from '@mui/icons-material'
import { Backdrop, CircularProgress, IconButton, Typography } from '@mui/material'
import Link from 'next/link'
import Router from 'next/router'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import PageHeader from 'src/@core/components/page-header'
import PageWrapper from 'src/@core/layouts/PageWrapper'
import { EDIT_TAX_SETTING, SCHEMA_VERSION } from 'src/common-functions/utils/Constants'
import { checkAuthorizedRoute } from 'src/common-functions/utils/UtilityFunctions'
import ErrorBoundary from 'src/pages/ErrorBoundary'
import TaxModuleSettingForm from 'src/views/settings/tax-settings/TaxModuleSettingForm'

const SETTING_FIELDS = {
  schemaVersion: SCHEMA_VERSION,
  taxAccountingMethod: '',
  taxStatementAccounts: [
    {
      accountId: null,
      accountType: null,
      description: null,
      statementLabel: null,
      statementDescription: null
    }
  ],
  accountPayableAccountId: null,
  differedTaxAccountId: null,
  salesRevenueAccountId: null,
  costOfGoodsSoldAccountId: null
}

function AddTaxSetting() {
  const router = Router
  const dispatch = useDispatch()
  const [loader, setLoader] = useState(false)

  const tenantId = useSelector(state => state?.tenants?.selectedTenant?.tenantId || null)

  const userProfile = useSelector(state => state.userProfile)
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    if (checkAuthorizedRoute(EDIT_TAX_SETTING, router, userProfile)) {
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
            Add Tax Setting
          </Typography>
        }
        button={
          <IconButton
            variant='outlined'
            color='default'
            sx={{ fontSize: '21px' }}
            component={Link}
            scroll={true}
            href={`/account-settings/tax-settings/`}
          >
            <Close sx={{ color: theme => theme.palette.primary.main }} />
          </IconButton>
          // )
        }
      />
      <PageWrapper>
        <TaxModuleSettingForm defaultData={SETTING_FIELDS} />
      </PageWrapper>
      {loader && (
        <Backdrop sx={{ color: '#fff', zIndex: theme => theme.zIndex.drawer + 1 }} open={loader}>
          <CircularProgress color='inherit' />
        </Backdrop>
      )}
    </ErrorBoundary>
  )
}

export default AddTaxSetting
