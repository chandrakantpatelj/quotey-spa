import Link from 'next/link'
import { useEffect, useState } from 'react'
import PageHeader from 'src/@core/components/page-header'
import { Typography, Button, LinearProgress } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import PageWrapper from 'src/@core/layouts/PageWrapper'
import TaxSettingsListTable from 'src/views/settings/tax-settings/TaxSettingsListTable'
import { checkAuthorizedRoute, hasPermission } from 'src/common-functions/utils/UtilityFunctions'
import { LIST_TAX_SETTING, EDIT_TAX_SETTING } from 'src/common-functions/utils/Constants'
import ErrorBoundary from 'src/pages/ErrorBoundary'
import { useRouter } from 'next/router'
import useTaxAuthorities from 'src/hooks/getData/useTaxAuthorities'
import { useTaxSettings } from 'src/hooks/getData/useTaxSettings'
import { useFinancialAccounts } from 'src/hooks/getData/useFinancialAccounts'

function TaxSettings() {
  const dispatch = useDispatch()
  const router = useRouter()
  const tenantId = useSelector(state => state.tenants?.selectedTenant?.tenantId) || ''

  const { taxAuthorities, taxAuthorityLoading } = useTaxAuthorities(tenantId)
  const { taxSettings, taxSettingLoader } = useTaxSettings(tenantId)
  const { financialAccounts, financialAccountloading } = useFinancialAccounts(tenantId)

  const [taxModuleData, setTaxModuleData] = useState({})

  const loading = taxSettingLoader || taxAuthorityLoading || financialAccountloading
  const userProfile = useSelector(state => state.userProfile)
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    if (checkAuthorizedRoute(LIST_TAX_SETTING, router, userProfile)) {
      setTaxModuleData({ taxSettings, taxAuthorities, financialAccounts })
      setIsAuthorized(true)
    } else {
      setIsAuthorized(false)
    }
  }, [tenantId, taxSettings, userProfile])

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
            Tax Module Settings
          </Typography>
        }
        button={
          hasPermission(userProfile, EDIT_TAX_SETTING) && (
            <Button
              variant='contained'
              color='primary'
              startIcon={<AddOutlinedIcon />}
              component={Link}
              scroll={true}
              href={`/account-settings/tax-settings/add`}
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
          <TaxSettingsListTable tenantId={tenantId} taxModuleData={taxModuleData} setTaxModuleData={setTaxModuleData} />
        )}
      </PageWrapper>
    </ErrorBoundary>
  )
}

export default TaxSettings
