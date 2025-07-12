import { useState } from 'react'
import Router from 'next/router'
import { useDispatch, useSelector } from 'react-redux'
import { Backdrop, Box, Button, CircularProgress, Grid, LinearProgress } from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import { updateTaxModuleSettingsMutation } from 'src/@core/components/graphql/tax-module-settings-queries'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import CustomTextField from 'src/@core/components/mui/text-field'
import { writeData } from 'src/common-functions/GraphqlOperations'
import { useFinancialAccounts } from 'src/hooks/getData/useFinancialAccounts'
import useTaxAuthorities from 'src/hooks/getData/useTaxAuthorities'
import { createAlert } from 'src/store/apps/alerts'
import { resetTaxSettings } from 'src/store/apps/tax-settings'
import TaxSettingsAccountsTable from 'src/views/settings/tax-settings/TaxSettingsAccountsTable'

function TaxModuleSettingForm({ defaultData }) {
  const router = Router
  const dispatch = useDispatch()
  const [loader, setLoader] = useState(false)

  const tenantId = useSelector(state => state?.tenants?.selectedTenant?.tenantId || null)
  const { financialAccounts, financialAccountloading } = useFinancialAccounts(tenantId)
  const { taxAuthorities, taxAuthorityLoading } = useTaxAuthorities(tenantId)

  const loading = financialAccountloading || taxAuthorityLoading

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: defaultData,
    mode: 'onChange'
  })

  const updateTaxSettings = async settings => {
    setLoader(true)
    let taxAuthorityId = settings?.taxAuthorityId || null
    delete settings?.tenantId
    delete settings?.taxAuthorityId

    const { createdDateTime, createdBy, modifiedDateTime, modifiedBy, ...restSettings } = settings
    let payload = {
      ...restSettings
    }

    try {
      const response = await writeData(updateTaxModuleSettingsMutation(), {
        tenantId,
        taxAuthorityId: taxAuthorityId,
        settings: payload
      })

      if (response.updateTaxModuleSettings) {
        dispatch(resetTaxSettings())
        dispatch(createAlert({ message: 'Updated tax settings!', type: 'success' }))
        router.push('/account-settings/tax-settings/')
      } else {
        setLoader(false)
        dispatch(createAlert({ message: 'Updating tax settings failed!', type: 'error' }))
      }
    } catch (e) {
      console.error('Error updating tax settings:', e)
      setLoader(false) // Reset loader on error
      dispatch(createAlert({ message: 'Error updating tax settings!', type: 'error' }))
    }
  }

  const handleCancel = () => {
    router.push('/account-settings/tax-settings/')
  }

  return (
    <>
      {loading ? (
        <LinearProgress sx={{ mb: 4 }} />
      ) : (
        <form onSubmit={handleSubmit(updateTaxSettings)}>
          <Grid container spacing={{ xs: 6, lg: 8 }}>
            <Grid item xs={12} md={12}>
              <Grid container spacing={{ xs: 2, md: 3 }}>
                <Grid item xs={12} sm={6} md={3} lg={2}>
                  <Controller
                    name='taxAuthorityId'
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <CustomAutocomplete
                        id='taxAuthorityId'
                        {...field}
                        options={taxAuthorities}
                        getOptionLabel={option => option?.taxAuthorityName || ''}
                        value={taxAuthorities.find(option => option.taxAuthorityId === field.value) || null}
                        onChange={(e, newValue) => field.onChange(newValue?.taxAuthorityId)}
                        disableClearable
                        renderInput={params => (
                          <CustomTextField
                            {...params}
                            label='Tax Authority'
                            error={Boolean(errors.taxAuthorityId)}
                            helperText={errors.taxAuthorityId ? 'Tax Authority is required' : ''}
                          />
                        )}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3} lg={2}>
                  <Controller
                    name='taxAccountingMethod'
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        label='Tax Accounting Method'
                        error={Boolean(errors.taxAccountingMethod)}
                        helperText={errors.taxAccountingMethod ? 'Tax Accounting Method is required' : ''}
                        fullWidth
                      />
                    )}
                  />
                </Grid>

                {/* Account Payable Account */}
                <Grid item xs={12} sm={6} md={3} lg={2}>
                  <Controller
                    name='accountPayableAccountId'
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <CustomAutocomplete
                        id='accountPayableAccountId'
                        {...field}
                        options={financialAccounts}
                        getOptionLabel={option => option?.accountName || ''}
                        value={financialAccounts.find(option => option.accountId === field.value) || null}
                        onChange={(e, newValue) => field.onChange(newValue?.accountId)}
                        disableClearable
                        renderInput={params => (
                          <CustomTextField
                            {...params}
                            label='Account Payable Account'
                            error={Boolean(errors.accountPayableAccountId)}
                            helperText={errors.accountPayableAccountId ? 'Account Payable Account is required' : ''}
                          />
                        )}
                      />
                    )}
                  />
                </Grid>

                {/* Differed Tax Account */}
                <Grid item xs={12} sm={6} md={3} lg={2}>
                  <Controller
                    name='differedTaxAccountId'
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <CustomAutocomplete
                        id='differedTaxAccountId'
                        {...field}
                        options={financialAccounts}
                        getOptionLabel={option => option?.accountName || ''}
                        value={financialAccounts.find(option => option.accountId === field.value) || null}
                        onChange={(e, newValue) => field.onChange(newValue?.accountId)}
                        disableClearable
                        renderInput={params => (
                          <CustomTextField
                            {...params}
                            label='Differed Tax Account'
                            error={Boolean(errors.differedTaxAccountId)}
                            helperText={errors.differedTaxAccountId ? 'Differed Tax Account is required' : ''}
                          />
                        )}
                      />
                    )}
                  />
                </Grid>

                {/* Sales Revenue Account */}
                <Grid item xs={12} sm={6} md={3} lg={2}>
                  <Controller
                    name='salesRevenueAccountId'
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <CustomAutocomplete
                        id='salesRevenueAccountId'
                        {...field}
                        options={financialAccounts}
                        getOptionLabel={option => option?.accountName || ''}
                        value={financialAccounts.find(option => option.accountId === field.value) || null}
                        onChange={(e, newValue) => field.onChange(newValue?.accountId)}
                        disableClearable
                        renderInput={params => (
                          <CustomTextField
                            {...params}
                            label='Sales Revenue Account'
                            error={Boolean(errors.salesRevenueAccountId)}
                            helperText={errors.salesRevenueAccountId ? 'Sales Revenue Account is required' : ''}
                          />
                        )}
                      />
                    )}
                  />
                </Grid>

                {/* Cost of Goods Sold Account */}
                <Grid item xs={12} sm={6} md={3} lg={2}>
                  <Controller
                    name='costOfGoodsSoldAccountId'
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <CustomAutocomplete
                        id='costOfGoodsSoldAccountId'
                        {...field}
                        options={financialAccounts}
                        getOptionLabel={option => option?.accountName || ''}
                        value={financialAccounts.find(option => option.accountId === field.value) || null}
                        onChange={(e, newValue) => field.onChange(newValue?.accountId)}
                        disableClearable
                        renderInput={params => (
                          <CustomTextField
                            {...params}
                            label='Cost of Goods Sold Account'
                            error={Boolean(errors.costOfGoodsSoldAccountId)}
                            helperText={errors.costOfGoodsSoldAccountId ? 'Cost of Goods Sold Account is required' : ''}
                          />
                        )}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Grid>
            {/* Tax Statement Accounts Table */}
            <Grid item xs={12} md={12} lg={12}>
              <TaxSettingsAccountsTable
                control={control}
                namePrefix={'taxStatementAccounts'}
                fieldArrayName={'taxStatementAccounts'}
                accounts={financialAccounts}
                errors={errors}
              />
            </Grid>

            {/* Save and Cancel Buttons */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 2, marginTop: 2 }}>
                <Button variant='contained' type='submit'>
                  Save
                </Button>
                <Button type='reset' variant='outlined' onClick={() => handleCancel()}>
                  Cancel
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      )}
      {loader && (
        <Backdrop sx={{ color: '#fff', zIndex: theme => theme.zIndex.drawer + 1 }} open={loader}>
          <CircularProgress color='inherit' />
        </Backdrop>
      )}
    </>
  )
}

export default TaxModuleSettingForm
