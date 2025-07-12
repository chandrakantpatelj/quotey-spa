import { useRouter } from 'next/router'
import React, { useMemo, useState } from 'react'
import PageHeader from 'src/@core/components/page-header'
import PageWrapper from 'src/@core/layouts/PageWrapper'
import {
  Typography,
  Button,
  IconButton,
  MenuItem,
  FormLabel,
  Grid,
  Box,
  LinearProgress,
  FormHelperText,
  Checkbox,
  Snackbar,
  Alert
} from '@mui/material'
import CustomTextField from 'src/@core/components/mui/text-field'
import { Close } from '@mui/icons-material'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import AttributesTable from 'src/@core/components/common-components/AttributesTable'
import EditPhoneInput from 'src/common-components/EditPhoneInput'
import { getAccountQuery, updateAccountMutation } from 'src/@core/components/graphql/account-queries'
import { fetchData, writeData } from 'src/common-functions/GraphqlOperations'
import { createAlert } from 'src/store/apps/alerts'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import { checkAuthorizedRoute, trimStrings } from 'src/common-functions/utils/UtilityFunctions'
import { EDIT_ACCOUNT_SETTING } from 'src/common-functions/utils/Constants'
import ErrorBoundary from 'src/pages/ErrorBoundary'
import useCountries from 'src/hooks/getData/useCountries'

function EditAccount() {
  const dispatch = useDispatch()
  const route = useRouter()
  const userProfile = useSelector(state => state.userProfile)

  const [isAuthorized, setIsAuthorized] = useState(false)
  const [loader, setLoader] = useState(false)
  const [checked, setChecked] = useState(false)
  const tenantId = useSelector(state => state.tenants?.selectedTenant?.tenantId)
  const { countries } = useCountries()
  const [accountsObject, setAccountsObject] = useState({})
  const [loading, setLoading] = useState(true)
  async function getAccountFunction() {
    try {
      setLoading(true)
      const accounts = await fetchData(getAccountQuery(tenantId))
      const { getAccount } = accounts
      const distructObject = {
        account: getAccount
      }
      setAccountsObject(distructObject)
    } catch (error) {
      console.error('Error fetching data to update financial account:', error)
    } finally {
      setLoading(false)
    }
  }
  const { account = [] } = accountsObject || {}

  // const data = { ...account }

  const [data, setData] = useState(account)

  const [states, setStates] = useState([])
  const [deliveryStates, setDeliveryStates] = useState([])

  const {
    reset,
    control,
    handleSubmit,
    setValue,
    trigger,
    getValues,
    formState: { errors }
  } = useForm({
    defaultValues: data,
    mode: 'onChange'
  })

  useEffect(() => {
    setStates(getStates(account?.billingAddress?.country))
    setDeliveryStates(getStates(account?.address?.country))
    setValue('attributes', account?.attributes)
  }, [account, countries])

  function getStates(name) {
    if (!name || !countries) return []
    const selectedCountry = countries?.find(item => item.name === name)
    return selectedCountry ? selectedCountry.states : []
  }

  const [open, setOpen] = useState(false)

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }

    setOpen(false)
  }

  const check = () => {
    setOpen(true)
    const fieldName = Object.keys(errors)[0]
    const errName = document.getElementById(fieldName)
    errName?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
  }

  const handleUpdateAccount = async editAccount => {
    setOpen(false)
    setLoader(true)
    const account = editAccount
    delete account.accountId
    delete account.accountNo
    delete account.phoneNumberVerified
    delete account.emailVerified
    delete account.email
    try {
      const response = await writeData(updateAccountMutation(), { account })
      if (response?.updateAccount) {
        dispatch(createAlert({ message: 'Account Updated  successfully !', type: 'success' }))
        route.push(`/account-settings/account`)
      } else {
        dispatch(createAlert({ message: 'Account Updation  failed !', type: 'error' }))
      }
      return response
    } catch (error) {
      // Handle any errors and optionally dispatch an error action
      console.log('error', error)
    } finally {
      setLoader(false)
    }
  }

  const handleCancel = () => {
    route.push(`/account-settings/account`)
    reset()
  }

  const handleSameBillingAddress = e => {
    const checked = e.target.checked
    setChecked(checked)

    if (checked) {
      setValue('billingAddress', getValues('address'))
    } else if (!checked) {
      setValue('billingAddress', {
        addressLine1: '',
        addressLine2: '',
        cityOrTown: '',
        state: '',
        postcode: '',
        country: ''
      })
    }
    trigger(['billingAddress'])
  }

  const address = useWatch({ control, name: 'address' }) || getValues('address')
  const billingAddress = useWatch({ control, name: 'billingAddress' })

  const areAddressesSame = (a, b) => {
    return JSON.stringify(trimStrings(a)) === JSON.stringify(trimStrings(b))
  }

  useEffect(() => {
    setChecked(areAddressesSame(billingAddress, address))
  }, [billingAddress, address])

  useEffect(() => {
    if (checkAuthorizedRoute(EDIT_ACCOUNT_SETTING, route, userProfile)) {
      setIsAuthorized(true)
      getAccountFunction()
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
            Edit Account
          </Typography>
        }
        button={
          <IconButton variant='outlined' color='default' sx={{ fontSize: '21px' }} onClick={handleCancel}>
            <Close sx={{ color: theme => theme.palette.primary.main }} />
          </IconButton>
        }
      />
      <PageWrapper>
        {loading ? (
          <LinearProgress sx={{ mb: 4 }} />
        ) : (
          <form onSubmit={handleSubmit(handleUpdateAccount)}>
            <Grid container spacing={{ xs: 6 }}>
              <Grid item xs={12} md={12}>
                <Grid container spacing={{ xs: 2, md: 3, lg: 3, xl: 3 }}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Controller
                      name='displayName'
                      control={control}
                      defaultValue={account?.displayName}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <CustomTextField
                          id='displayName'
                          {...field}
                          fullWidth
                          label='Company Name'
                          error={Boolean(errors.displayName)}
                          {...(errors.displayName && { helperText: 'Display Name is required' })}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Controller
                      name='businessName'
                      control={control}
                      defaultValue={account?.businessName}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <CustomTextField
                          id='businessName'
                          {...field}
                          fullWidth
                          label='Business Name'
                          error={Boolean(errors.businessName)}
                          {...(errors.businessName && { helperText: 'Business Name is required' })}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} md={12} id='primaryContact'>
                <FormLabel sx={{ fontSize: '15px', fontWeight: 500, lineHeight: '40px' }}>Primary Contact</FormLabel>
                <Grid container spacing={{ xs: 2, md: 3, lg: 3, xl: 3 }}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Controller
                      name='primaryContact.title'
                      control={control}
                      rules={{ required: false }}
                      defaultValue={account?.primaryContact?.title}
                      render={({ field }) => (
                        <CustomTextField
                          {...field}
                          select
                          fullWidth
                          size='small'
                          label='Title'
                          error={Boolean(errors.primaryContact?.title)}
                          {...(errors.primaryContact?.title && { helperText: 'Title is required' })}
                        >
                          <MenuItem value='Mr'>Mr</MenuItem>
                          <MenuItem value='Ms'>Ms</MenuItem>
                          <MenuItem value='Miss'>Miss</MenuItem>
                          <MenuItem value='Dr'>Dr</MenuItem>
                        </CustomTextField>
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Controller
                      name='primaryContact.firstName'
                      control={control}
                      rules={{ required: true }}
                      defaultValue={account?.primaryContact?.firstName}
                      render={({ field }) => (
                        <CustomTextField
                          {...field}
                          fullWidth
                          label='First Name'
                          error={Boolean(errors.primaryContact?.firstName)}
                          {...(errors.primaryContact?.firstName && { helperText: 'First Name is required' })}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Controller
                      name='primaryContact.lastName'
                      control={control}
                      rules={{ required: true }}
                      defaultValue={account?.primaryContact?.lastName}
                      render={({ field }) => (
                        <CustomTextField
                          {...field}
                          fullWidth
                          label='Last Name'
                          error={Boolean(errors.primaryContact?.lastName)}
                          {...(errors.primaryContact?.firstName && { helperText: 'Last Name is required' })}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={0} sm={6} md={3} sx={{ display: { xs: 'none', md: 'block' } }}></Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Controller
                      name='contactEmail'
                      control={control}
                      rules={{ required: true }}
                      defaultValue={account?.contactEmail}
                      render={({ field }) => (
                        <CustomTextField
                          {...field}
                          fullWidth
                          label='Email'
                          type='email'
                          error={Boolean(errors.contactEmail)}
                          {...(errors.contactEmail && { helperText: 'Email is required' })}
                          {...(errors.contactEmail?.type && { helperText: 'Please enter valid email' })}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Controller
                      name='phoneNumber'
                      control={control}
                      rules={{ required: true }}
                      defaultValue={account?.phoneNumber}
                      render={({ field: { value, onChange } }) => (
                        <EditPhoneInput
                          label='Mobile'
                          value={value}
                          onChange={onChange}
                          error={Boolean(errors.phoneNumber)}
                        />
                      )}
                    />
                    {errors?.phoneNumber && <FormHelperText error>Mobile Number is required</FormHelperText>}
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Controller
                      name='workPhone'
                      control={control}
                      rules={{ required: true }}
                      defaultValue={account?.workPhone}
                      render={({ field: { value, onChange } }) => (
                        <EditPhoneInput
                          name='workPhone'
                          label='Work Phone'
                          value={value}
                          onChange={onChange}
                          error={Boolean(errors.workPhone)}
                        />
                      )}
                    />
                    {errors?.workPhone && <FormHelperText error>Work Phone is required</FormHelperText>}
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} lg={12} id='address'>
                {' '}
                <FormLabel sx={{ fontSize: '15px', fontWeight: 500, lineHeight: '40px' }}>Address</FormLabel>
                <Grid container spacing={{ xs: 2, md: 3, lg: 3, xl: 3 }}>
                  <Grid item xs={12} sm={12} md={3}>
                    <Controller
                      name='address.addressLine1'
                      control={control}
                      rules={{ required: true }}
                      defaultValue={account?.address?.addressLine1}
                      render={({ field }) => (
                        <CustomTextField
                          {...field}
                          fullWidth
                          label='Address Line 1'
                          error={Boolean(errors.address?.addressLine1)}
                          {...(errors.address?.addressLine1 && { helperText: ' Address Line 1 is required' })}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={12} md={3}>
                    <Controller
                      name='address.addressLine2'
                      control={control}
                      rules={{ required: false }}
                      defaultValue={account?.address?.addressLine2}
                      render={({ field }) => (
                        <CustomTextField fullWidth label='Address Line 2' {...field} onChange={field.onChange} />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Controller
                      name='address.postcode'
                      control={control}
                      rules={{ required: true }}
                      defaultValue={account?.address?.postcode}
                      render={({ field }) => (
                        <CustomTextField
                          {...field}
                          fullWidth
                          label='Zip Code'
                          error={Boolean(errors.address?.postcode)}
                          {...(errors.address?.postcode && { helperText: 'ZIP Code is required' })}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={0} sm={6} md={3} sx={{ display: { xs: 'none', md: 'block' } }}></Grid>

                  <Grid item xs={13} sm={6} md={3}>
                    <Controller
                      name='address.cityOrTown'
                      control={control}
                      rules={{ required: true }}
                      defaultValue={account?.address?.cityOrTown}
                      render={({ field }) => (
                        <CustomTextField
                          {...field}
                          fullWidth
                          label='City/Town'
                          error={Boolean(errors.address?.cityOrTown)}
                          {...(errors.address?.cityOrTown && { helperText: 'City is required' })}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Controller
                      name='address.country'
                      control={control}
                      rules={{ required: true }}
                      defaultValue={account?.address?.country}
                      render={({ field }) => (
                        <CustomAutocomplete
                          {...field}
                          options={countries}
                          disableClearable
                          getOptionLabel={option => option.name || ''}
                          value={{ name: field.value }}
                          onChange={(event, newValue) => {
                            field.onChange(newValue?.name)
                            let states = getStates(newValue?.name)
                            setDeliveryStates(states)
                            setValue('address.state', '')
                          }}
                          renderInput={params => (
                            <CustomTextField
                              {...params}
                              label='Select Country'
                              fullWidth
                              error={Boolean(errors.address?.country)}
                              {...(errors.address?.country && { helperText: ' Country is required' })}
                            />
                          )}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Controller
                      name='address.state'
                      control={control}
                      rules={{ required: true }}
                      defaultValue={account?.address?.state}
                      render={({ field }) => (
                        <CustomAutocomplete
                          {...field}
                          options={deliveryStates}
                          getOptionLabel={option => option?.name || ''}
                          value={{ name: field.value }}
                          onChange={(event, newValue) => {
                            field.onChange(newValue?.name)
                          }}
                          disableClearable
                          renderInput={params => (
                            <CustomTextField
                              {...params}
                              label='Select State'
                              fullWidth
                              error={Boolean(errors.address?.state)}
                              {...(errors.address?.state && { helperText: 'State is required' })}
                            />
                          )}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} sx={{ padding: 0 }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Checkbox
                    size='small'
                    checked={checked}
                    onChange={e => handleSameBillingAddress(e)}
                    sx={{ p: '0px' }}
                  />
                  <Typography sx={{ fontSize: '13px' }}>Set Delivery Address Same As Billing Address</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} lg={12} id='billingAddress'>
                {' '}
                <FormLabel sx={{ fontSize: '15px', fontWeight: 500, lineHeight: '40px' }}>Billing Address</FormLabel>
                <Grid container spacing={{ xs: 2, md: 3, lg: 3, xl: 3 }}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Controller
                      name='billingAddress.addressLine1'
                      control={control}
                      rules={{ required: true }}
                      defaultValue={account?.billingAddress?.addressLine1}
                      render={({ field }) => (
                        <CustomTextField
                          {...field}
                          fullWidth
                          label='Address Line 1'
                          error={Boolean(errors.billingAddress?.addressLine1)}
                          {...(errors.billingAddress?.addressLine1 && {
                            helperText: ' Address Line 1 is required'
                          })}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Controller
                      name='billingAddress.addressLine2'
                      control={control}
                      rules={{ required: false }}
                      defaultValue={account?.billingAddress?.addressLine2}
                      render={({ field }) => (
                        <CustomTextField fullWidth label='Address Line 2' {...field} onChange={field.onChange} />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Controller
                      name='billingAddress.postcode'
                      control={control}
                      rules={{ required: true }}
                      defaultValue={account?.billingAddress?.postcode}
                      render={({ field }) => (
                        <CustomTextField
                          {...field}
                          fullWidth
                          label='Zip Code'
                          error={Boolean(errors.billingAddress?.postcode)}
                          {...(errors.billingAddress?.postcode && { helperText: 'Post Code is required' })}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={0} sm={6} md={3} sx={{ display: { xs: 'none', md: 'block' } }}></Grid>

                  <Grid item xs={13} sm={6} md={3}>
                    <Controller
                      name='billingAddress.cityOrTown'
                      control={control}
                      rules={{ required: true }}
                      defaultValue={account?.billingAddress?.cityOrTown}
                      render={({ field }) => (
                        <CustomTextField
                          {...field}
                          fullWidth
                          label='City/Town'
                          error={Boolean(errors.billingAddress?.cityOrTown)}
                          {...(errors.billingAddress?.cityOrTown && { helperText: 'City is required' })}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Controller
                      name='billingAddress.country'
                      control={control}
                      rules={{ required: true }}
                      defaultValue={account?.billingAddress?.country}
                      render={({ field }) => (
                        <CustomAutocomplete
                          {...field}
                          options={countries}
                          getOptionLabel={option => option.name || ''}
                          value={{ name: field.value }}
                          onChange={(event, newValue) => {
                            field.onChange(newValue?.name)
                            let states = getStates(newValue?.name)
                            setStates(states)
                          }}
                          disableClearable
                          renderInput={params => (
                            <CustomTextField
                              {...params}
                              label='Select Country'
                              fullWidth
                              error={Boolean(errors.billingAddress?.country)}
                              {...(errors.billingAddress?.country && { helperText: ' Country is required' })}
                            />
                          )}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Controller
                      name='billingAddress.state'
                      control={control}
                      rules={{ required: true }}
                      defaultValue={account?.billingAddress?.state}
                      render={({ field }) => (
                        <CustomAutocomplete
                          {...field}
                          options={states}
                          getOptionLabel={option => option.name || ''}
                          value={{ name: field.value }}
                          disableClearable
                          onChange={(event, newValue) => {
                            field.onChange(newValue?.name)
                          }}
                          renderInput={params => (
                            <CustomTextField
                              {...params}
                              label='Select State'
                              fullWidth
                              error={Boolean(errors.billingAddress?.state)}
                              {...(errors.billingAddress?.state && { helperText: 'State is required' })}
                            />
                          )}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} md={4.5}>
                <AttributesTable control={control} errors={errors} />
              </Grid>
            </Grid>
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: { xs: 'center', sm: 'start' },
                gap: '20px',
                marginTop: { xs: '30px', sm: '50px' }
              }}
            >
              <Button variant='contained' type='submit' onClick={check}>
                Save
              </Button>
              <Button variant='outlined' type='reset' onClick={handleCancel}>
                Cancel
              </Button>
            </Box>
          </form>
        )}
      </PageWrapper>
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        open={open}
        autoHideDuration={3000}
        onClose={handleClose}
      >
        <Alert onClose={handleClose} severity='error' variant='filled' sx={{ width: '100%' }}>
          Please enter all required data
        </Alert>
      </Snackbar>
      {/* {loader ? (
        <Backdrop sx={{ color: '#fff', zIndex: theme => theme.zIndex.drawer + 1 }} open={loading}>
          <CircularProgress color='inherit' />
        </Backdrop>
      ) : null} */}
    </ErrorBoundary>
  )
}

export default EditAccount
