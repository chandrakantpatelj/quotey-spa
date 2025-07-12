import Link from 'next/link'
import { Box, Button, IconButton, Typography } from '@mui/material'
import PageHeader from 'src/@core/components/page-header'
import { AddOutlined, Close } from '@mui/icons-material'
import PageWrapper from 'src/@core/layouts/PageWrapper'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect, useState } from 'react'
import { checkAuthorizedRoute } from 'src/common-functions/utils/UtilityFunctions'
import { EDIT_TAX_SETTING } from 'src/common-functions/utils/Constants'
import ErrorBoundary from 'src/pages/ErrorBoundary'
import { useRouter } from 'next/router'
import TaxModuleSettingForm from 'src/views/settings/tax-settings/TaxModuleSettingForm'

function EditTaxModule() {
  const tenant = useSelector(state => state.tenants?.selectedTenant)
  const { tenantId } = tenant || ''
  const dispatch = useDispatch()
  const router = useRouter()
  const userProfile = useSelector(state => state.userProfile)
  const [isAuthorized, setIsAuthorized] = useState(false)

  const selectedTaxSetting = useSelector(state => state.taxSettings?.selectedTaxSetting || {})
  useEffect(() => {
    if (Object.keys(selectedTaxSetting).length === 0) {
      router.push('/account-settings/tax-settings')
    }
  }, [selectedTaxSetting, tenantId])

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
            Edit Tax Setting
          </Typography>
        }
        button={
          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
            <Button
              variant='contained'
              color='primary'
              startIcon={<AddOutlined />}
              component={Link}
              scroll={true}
              href={`/account-settings/tax-settings/add`}
            >
              New
            </Button>
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
          </Box>
        }
      />
      <PageWrapper>
        <TaxModuleSettingForm defaultData={selectedTaxSetting} />
      </PageWrapper>
    </ErrorBoundary>
  )
}

export default EditTaxModule
