import Router from 'next/router'
import React, { useEffect, useState } from 'react'
import { Backdrop, Box, Button, Checkbox, CircularProgress, Grid, LinearProgress, Typography } from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import CustomTextField from 'src/@core/components/mui/text-field'
import TaxsTable from 'src/@core/components/common-components/TaxsTable'
import ExpenseTable from 'src/@core/components/common-components/ExpensesTable'
import { writeData } from 'src/common-functions/GraphqlOperations'
import { updatePurchaseModuleSettingsMutation } from 'src/@core/components/graphql/purchase-module-setting'
import { createAlert } from 'src/store/apps/alerts'
import { resetPurchaseSetting } from 'src/store/apps/purchase-module-settings'
import { useFinancialAccounts } from 'src/hooks/getData/useFinancialAccounts'
import useTaxAuthorities from 'src/hooks/getData/useTaxAuthorities'
import useVendors from 'src/hooks/getData/useVendors'

export default function PurchaseModuleSettingForm({ defaultData }) {
  const router = Router
  const dispatch = useDispatch()
  const [loader, setLoader] = React.useState(false)
  const tenantId = useSelector(state => state?.tenants?.selectedTenant?.tenantId || null)
  const { vendors, loading: vendorLoading } = useVendors(tenantId)
  const { financialAccounts, financialAccountloading } = useFinancialAccounts(tenantId)
  const { taxAuthorities, taxAuthorityLoading } = useTaxAuthorities(tenantId)
  const loading = financialAccountloading || taxAuthorityLoading || vendorLoading
  const [purchaseSettingData, setPurchaseSettingData] = useState([])

  const {
    reset,
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: defaultData,
    mode: 'onChange'
  })

  useEffect(() => {
    setPurchaseSettingData({
      vendors,
      taxAuthorities,
      financialAccounts
    })
  }, [tenantId])

  const check = () => {
    const fieldName = Object.keys(errors)[0]
    const errName = document.getElementById(fieldName)
    errName?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
  }

  const updatePurchaseSettings = async data => {
    setLoader(true)
    delete data?.tenantId
    const { createdDateTime, createdBy, modifiedDateTime, modifiedBy, ...rest } = data

    const settings = {
      ...rest,
      taxes: rest.taxes?.map(({ taxId, taxType, isManuallyEntered, ...taxRest }) => taxRest),
      expenses: rest.expenses?.map(({ expenseId, expenseType, paidToMainVendor, ...expenseRest }) => expenseRest)
    }

    try {
      const response = await writeData(updatePurchaseModuleSettingsMutation(), { tenantId, settings })
      if (response.updatePurchaseModuleSettings) {
        dispatch(resetPurchaseSetting())
        dispatch(createAlert({ message: 'Updated purchase settings !', type: 'success' }))
        router.push('/account-settings/purchase-module/')
      } else {
        setLoader(false)
        dispatch(createAlert({ message: 'Updated purchase settings failed  !', type: 'error' }))
      }
    } catch (e) {
      console.error('error', e)
    }
  }

  const handleCancel = () => {
    router.push('/account-settings/purchase-module/')
    reset()
  }

  return (
    <>
      {loading ? (
        <LinearProgress />
      ) : (
        <form onSubmit={handleSubmit(updatePurchaseSettings)}>
          <Grid container spacing={{ xs: 6, lg: 8 }}>
            <Grid item xs={12} md={12} lg={9}>
              <Grid container spacing={{ xs: 2, md: 3 }}>
                <Grid item xs={6} sm={6} md={3}>
                  <Controller
                    name='purchaseType'
                    control={control}
                    rules={{
                      required: 'Purchase Type is required',
                      pattern: {
                        value: /^\S+$/,
                        message: 'Spaces are not allowed in Purchase Type'
                      }
                    }}
                    render={({ field }) => (
                      <CustomTextField
                        id='purchaseType'
                        {...field}
                        fullWidth
                        label='Purchase Type'
                        error={Boolean(errors.purchaseType)}
                        helperText={errors.purchaseType ? errors.purchaseType.message : ''}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={6} sm={6} md={2}>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Controller
                      name={`default`}
                      control={control}
                      render={({ field }) => <Checkbox sx={{ p: '4px' }} defaultChecked={field?.value} {...field} />}
                    />
                    <Typography sx={{ fontSize: '12px' }}>Set Default</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={6} md={3.5}>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Controller
                      name='subtotalInLocalCurrency'
                      control={control}
                      render={({ field }) => <Checkbox sx={{ p: '4px' }} defaultChecked={field?.value} {...field} />}
                    />
                    <Typography sx={{ fontSize: '13px' }}>Subtotal In Local Currency</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={6} md={3.5}>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Controller
                      name='totalAmountInLocalCurrency'
                      control={control}
                      render={({ field }) => <Checkbox sx={{ p: '4px' }} defaultChecked={field?.value} {...field} />}
                    />
                    <Typography sx={{ fontSize: '13px' }}>Total Amount In Local Currency</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} md={12} lg={12} xl={12}>
              <TaxsTable control={control} errors={errors} purchaseSettingData={purchaseSettingData} />
            </Grid>
            <Grid item xs={12} md={12} lg={12} xl={12}>
              <ExpenseTable control={control} errors={errors} purchaseSettingData={purchaseSettingData} />
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
            <Button type='reset' variant='outlined' onClick={handleCancel}>
              Cancel
            </Button>
          </Box>
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
