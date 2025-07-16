import Link from 'next/link'
import Router from 'next/router'
import React, { useEffect, useState } from 'react'
import { Backdrop, Box, Button, CircularProgress, Grid, IconButton, Typography } from '@mui/material'
import PageHeader from 'src/@core/components/page-header'
import { Close } from '@mui/icons-material'
import { writeData } from 'src/common-functions/GraphqlOperations'
import { CREATE_ACCOUNT, SCHEMA_VERSION } from 'src/common-functions/utils/Constants'
import CustomTextField from 'src/@core/components/mui/text-field'
import PageWrapper from 'src/@core/layouts/PageWrapper'
import { accountCategory, accountType } from 'src/@fake-db/autocomplete'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import { Controller, useForm } from 'react-hook-form'
import { createAlert } from 'src/store/apps/alerts'
import { useDispatch, useSelector } from 'react-redux'
import { CreateFinancialAccountMutation } from 'src/@core/components/graphql/financial-account-queries'
import ErrorBoundary from 'src/pages/ErrorBoundary'
import { checkAuthorizedRoute } from 'src/common-functions/utils/UtilityFunctions'
import { addFinancialAccounts } from 'src/store/apps/financial-Accounts'
import useCurrencies from 'src/hooks/getData/useCurrencies'

function AddFinancialAccounting() {
  const router = Router
  const dispatch = useDispatch()
  const [loader, setLoader] = React.useState(false)
  const [reportTypeOptions, setReportTypeOptions] = React.useState(['ALL', 'CASH', 'ACCRUED'])
  const tenant = useSelector(state => state.tenants?.selectedTenant) || {}
  const { tenantId = '' } = tenant
  const userProfile = useSelector(state => state.userProfile)
  const { currencies } = useCurrencies()

  const [isAuthorized, setIsAuthorized] = useState(false)

  const [accountData, setAccountData] = useState({
    schemaVersion: SCHEMA_VERSION,
    accountName: '',
    accountType: '',
    description: '',
    accountCategory: '',
    parentAccount: '',
    reportType: 'ALL',
    currency: ''
  })

  const {
    reset,
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: accountData,
    mode: 'onChange'
  })
  const check = () => {
    // firstFieldRef?.current.focus()
    const fieldName = Object.keys(errors)[0]
    const errName = document.getElementById(fieldName)
    errName?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
  }

  const handleNewAccountSave = async account => {
    //setOpen(false)
    setLoader(true)
    const response = await writeData(CreateFinancialAccountMutation(), { tenantId, account })
    try {
      if (response.createFinancialAccount) {
        dispatch(addFinancialAccounts(response.createFinancialAccount))
        dispatch(createAlert({ message: 'Account created successfully !', type: 'success' }))
        router.push('/accounting/accounts/')
      } else {
        setLoader(false)
        dispatch(createAlert({ message: 'Account creation failed  !', type: 'error' }))
      }
    } catch (e) {
      setLoader(false)
      console.error(e)
    }
  }

  const handleCancel = () => {
    router.push('/accounting/accounts/')
    reset()
  }

  useEffect(() => {
    if (checkAuthorizedRoute(CREATE_ACCOUNT, router, userProfile)) {
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
            Add Account
          </Typography>
        }
        button={
          <IconButton component={Link} scroll={true} href={`/accounting/accounts/`}>
            <Close sx={{ color: theme => theme.palette.primary.main }} />
          </IconButton>
          // )
        }
      />

      <PageWrapper>
        <form onSubmit={handleSubmit(handleNewAccountSave)}>
          <Grid container spacing={{ xs: 6 }}>
            <Grid item xs={12} md={12} lg={9}>
              <Grid container spacing={{ xs: 2, md: 3, lg: 3, xl: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Controller
                    name='accountName'
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <CustomTextField
                        id='accountName'
                        {...field}
                        fullWidth
                        label='Account Name'
                        error={Boolean(errors.accountName)}
                        {...(errors.accountName && { helperText: 'Account Name is required' })}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} md={12} lg={9}>
              <Grid container spacing={{ xs: 2, md: 3, lg: 3, xl: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Controller
                    name='accountType'
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <CustomAutocomplete
                        id='accountType'
                        {...field}
                        onChange={(event, newValue) => {
                          field.onChange(newValue)
                        }}
                        options={accountType || []}
                        getOptionLabel={option => option || ''}
                        renderInput={params => (
                          <CustomTextField
                            {...params}
                            label='Account Type'
                            error={Boolean(errors.accountType)}
                            {...(errors.accountType && { helperText: 'Account Type is required' })}
                          />
                        )}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Controller
                    name='accountCategory'
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <CustomAutocomplete
                        id='accountCategory'
                        {...field}
                        onChange={(event, newValue) => {
                          field.onChange(newValue)
                        }}
                        options={accountCategory || []}
                        getOptionLabel={option => option || ''}
                        renderInput={params => (
                          <CustomTextField
                            {...params}
                            label='Account Category'
                            error={Boolean(errors.accountCategory)}
                            {...(errors.accountCategory && { helperText: 'Account Category is required' })}
                          />
                        )}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Controller
                    name='reportType'
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <CustomAutocomplete
                        id='reportType'
                        {...field}
                        onChange={(event, newValue) => {
                          field.onChange(newValue)
                        }}
                        options={reportTypeOptions || []}
                        getOptionLabel={option => option || ''}
                        renderInput={params => (
                          <CustomTextField
                            {...params}
                            label='Report Type'
                            error={Boolean(errors.accountType)}
                            {...(errors.accountType && { helperText: 'Report Type is required' })}
                          />
                        )}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ mt: 5 }}>
                    <Controller
                      name='currency'
                      control={control}
                      rules={{ required: false }}
                      render={({ field }) => {
                        // Get the selected currency object from the currencies array based on the field's value
                        const selectedCurrency =
                          currencies.find(currency => currency.currencyId === field.value) || null

                        return (
                          <CustomAutocomplete
                            {...field}
                            value={selectedCurrency} // Set the selected currency as the value
                            onChange={(event, newValue) => {
                              field.onChange(newValue ? newValue.currencyId : null) // Update field value with currency or null
                            }}
                            options={currencies}
                            getOptionLabel={option => (typeof option === 'string' ? option : `${option.currencyId}`)}
                            renderOption={(props, option) => (
                              <Box component='li' {...props}>
                                {option.symbol} - {option.currencyId}
                              </Box>
                            )}
                            renderInput={params => (
                              <CustomTextField
                                id='currency'
                                {...params}
                                label='Currency'
                                error={Boolean(errors.currency)}
                                {...(errors.currency && { helperText: 'Currency is required' })}
                              />
                            )}
                          />
                        )
                      }}
                    />{' '}
                  </Box>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ mt: 5 }}>
                <Controller
                  name='description'
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <CustomTextField
                      value={value}
                      onChange={onChange}
                      fullWidth
                      minRows={5}
                      multiline
                      id='description'
                      label='Description'
                    />
                  )}
                />
              </Box>
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
        {loader && (
          <Backdrop sx={{ color: '#fff', zIndex: theme => theme.zIndex.drawer + 1 }} open={loader}>
            <CircularProgress color='inherit' />
          </Backdrop>
        )}
      </PageWrapper>
    </ErrorBoundary>
  )
}

export default AddFinancialAccounting
