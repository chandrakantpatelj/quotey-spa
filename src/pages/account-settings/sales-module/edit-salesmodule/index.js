import { Close } from '@mui/icons-material'
import { Backdrop, Box, Button, CircularProgress, Grid, IconButton, LinearProgress, Typography } from '@mui/material'
import Checkbox from '@mui/material/Checkbox'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { updateSalesModuleSettingsMutation } from 'src/@core/components/graphql/sales-module-setting'
import PageHeader from 'src/@core/components/page-header'
import PageWrapper from 'src/@core/layouts/PageWrapper'
import { writeData } from 'src/common-functions/GraphqlOperations'
import { EDIT_SALES_SETTING, SCHEMA_VERSION, TAXES } from 'src/common-functions/utils/Constants'
import { checkAuthorizedRoute } from 'src/common-functions/utils/UtilityFunctions'
import { useSalesModule } from 'src/hooks/getData/useSalesModule'
import ErrorBoundary from 'src/pages/ErrorBoundary'
import { createAlert } from 'src/store/apps/alerts'
import { addSalesModule } from 'src/store/apps/sales-module-settings'
import SalesExpensesTable from 'src/views/settings/salesmodule/SalesExpensesTable'
import SalesTaxsTable from 'src/views/settings/salesmodule/SalesTaxsTable'

const TAXES_FIELD = {
  taxId: '',
  taxType: '',
  taxName: '',
  taxRate: '',
  taxAuthorityId: null,
  enabled: true
}
const SETTING_FIELDS = {
  schemaVersion: SCHEMA_VERSION,
  taxes: [TAXES_FIELD],
  otherCharges: [
    {
      chargeId: '',
      chargeName: '',
      chargeType: '',
      includingTax: true,
      taxes: [TAXES_FIELD],
      enabled: true
    }
  ],
  enableDiscount: true
}

function EditSalesModule() {
  const dispatch = useDispatch()
  const router = useRouter()
  const userProfile = useSelector(state => state.userProfile)
  const [isAuthorized, setIsAuthorized] = useState(false)

  const [loader, setLoader] = useState(false)

  const tenantId = useSelector(state => state?.tenants?.selectedTenant?.tenantId || null)
  const { salesModules, salesModuleLoading: loading } = useSalesModule(tenantId)

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: Object?.keys(salesModules).length ? salesModules : SETTING_FIELDS,
    mode: 'onChange'
  })

  const updateSalesSettings = async settings => {
    setLoader(true)

    const {
      createdDateTime,
      createdBy,
      modifiedDateTime,
      modifiedBy,
      tenantId,
      version,
      latestVersion,
      currencies,
      sendInvoiceAutomatically,
      ...restSettings
    } = settings
    let payload = {
      ...restSettings
    }
    console.log('restSettings', restSettings)
    try {
      const response = await writeData(updateSalesModuleSettingsMutation(), { tenantId, settings: payload })

      if (response.updateSalesModuleSettings) {
        dispatch(createAlert({ message: 'Sales settings updated successfully!', type: 'success' }))
        dispatch(addSalesModule(response.updateSalesModuleSettings))
        router.push('/account-settings/sales-module/')
      } else {
        setLoader(false)
        dispatch(createAlert({ message: 'Failed to update sales settings!', type: 'error' }))
      }
    } catch (e) {
      console.error('Error updating sales settings:', e)
      setLoader(false) // Reset loader on error
      dispatch(createAlert({ message: 'Error updating sales settings!', type: 'error' }))
    }
  }

  const check = () => {
    // firstFieldRef?.current.focus()
    const fieldName = Object.keys(errors)[0]
    const errName = document.getElementById(fieldName)
    errName?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
  }

  const handleCancel = () => {
    router.push('/account-settings/sales-module/')
  }

  useEffect(() => {
    if (checkAuthorizedRoute(EDIT_SALES_SETTING, router, userProfile)) {
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
            Edit Sales Module
          </Typography>
        }
        button={
          <IconButton
            variant='outlined'
            color='default'
            sx={{ fontSize: '21px' }}
            component={Link}
            scroll={true}
            href={`/account-settings/sales-module/`}
          >
            <Close sx={{ color: theme => theme.palette.primary.main }} />
          </IconButton>
          // )
        }
      />
      <PageWrapper>
        {loading ? (
          <LinearProgress sx={{ mb: 4 }} />
        ) : (
          <form onSubmit={handleSubmit(updateSalesSettings)}>
            <Grid container spacing={{ xs: 6 }}>
              <Grid item xs={12} md={12}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Controller
                    name='enableDiscount'
                    control={control}
                    render={({ field }) => <Checkbox sx={{ p: '4px' }} defaultChecked={field?.value} {...field} />}
                  />
                  <Typography sx={{ fontSize: '13px' }}>Enable Discount</Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={12} lg={8}>
                <SalesTaxsTable control={control} namePrefix={TAXES} fieldArrayName={TAXES} errors={errors} />
              </Grid>
              <Grid item xs={12} md={12} lg={8}>
                <SalesExpensesTable control={control} errors={errors} />
              </Grid>
            </Grid>
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: { xs: 'center', sm: 'start' },
                gap: '20px',
                marginTop: { xs: '20px', sm: '50px' }
              }}
            >
              <Button variant='contained' type='submit' onClick={check}>
                Save
              </Button>
              <Button type='reset' variant='outlined' onClick={() => handleCancel()}>
                Cancel
              </Button>
            </Box>
          </form>
        )}
      </PageWrapper>
      {loader && (
        <Backdrop sx={{ color: '#fff', zIndex: theme => theme.zIndex.drawer + 1 }} open={loader}>
          <CircularProgress color='inherit' />
        </Backdrop>
      )}
    </ErrorBoundary>
  )
}

export default EditSalesModule
