import Link from 'next/link'
import Router from 'next/router'
import React, { useEffect, useState } from 'react'
import PageHeader from 'src/@core/components/page-header'
import {
  Box,
  Typography,
  Button,
  Grid,
  IconButton,
  FormLabel,
  FormHelperText,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Snackbar,
  Alert,
  Backdrop,
  CircularProgress
} from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import CustomTextField from 'src/@core/components/mui/text-field'
import { Close } from '@mui/icons-material'
import { preference } from 'src/@fake-db/autocomplete'
import PageWrapper from 'src/@core/layouts/PageWrapper'
import CustomPhoneInput from 'src/common-components/CustomPhoneInput'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { writeData } from 'src/common-functions/GraphqlOperations'
import { createCustomerMutation } from 'src/@core/components/graphql/customer-queries'
import { createAlert } from 'src/store/apps/alerts'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import CustomFilesUpload from 'src/views/forms/form-elements/custom-inputs/CustomFilesUpload'
import { UploadMultipleFileS3Api } from 'src/views/forms/form-elements/custom-inputs/UploadMultipleFileS3Api'
import { CREATE_CUSTOMER, CUSTOMER_PDF, SCHEMA_VERSION } from 'src/common-functions/utils/Constants'
import {
  capitalizeFirstLetterOnly,
  checkAuthorizedRoute,
  trimStrings
} from 'src/common-functions/utils/UtilityFunctions'
import { setAddCustomer } from 'src/store/apps/customers'
import useCurrencies from 'src/hooks/getData/useCurrencies'
import ErrorBoundary from 'src/pages/ErrorBoundary'
import useCountries from 'src/hooks/getData/useCountries'
import usePaymentTerms from 'src/hooks/getData/usePaymnetTerms'
import AttributesTable from 'src/@core/components/common-components/AttributesTable'

function Customer() {
  const router = Router
  const dispatch = useDispatch()
  const tenant = useSelector(state => state.tenants?.selectedTenant)
  const { tenantId = '' } = tenant

  const { countries } = useCountries()
  const { currencies } = useCurrencies()
  const { paymentTerms } = usePaymentTerms()
  const currency = useSelector(state => state?.currencies?.selectedCurrency)

  const [isAuthorized, setIsAuthorized] = useState(false)
  const userProfile = useSelector(state => state.userProfile)

  const [selectedCurrency, setSelectedCurrency] = useState(currency)
  const [open, setOpen] = useState(false)
  const [loader, setLoader] = React.useState(false)

  const [selectedPdFile, setSelectedPdFile] = useState([])
  const [checked, setChecked] = useState(false)

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }
    setOpen(false)
  }

  function findObjectById(array, countryId) {
    return array.find(obj => obj.name === countryId)
  }

  const [billingAddressCountry, setBillingAddressCountry] = useState()
  const [deliveryAddressCountry, setDeliveryAddressCountry] = useState()
  useEffect(() => {
    setDeliveryAddressCountry(findObjectById(countries, tenant?.address?.country))
    setBillingAddressCountry(findObjectById(countries, tenant?.billingAddress?.country))
  }, [countries, tenant])
  const [customerData, setCustomerData] = useState({
    schemaVersion: SCHEMA_VERSION,
    customerName: '',
    displayName: '',
    companyName: '',
    emailAddress: '',
    workPhone: '',
    mobile: '',
    paymentTerms: 'Due On Receipt',
    shippingPreference: 'Standard',
    currencyId: selectedCurrency,
    primaryContact: {
      title: '',
      firstName: '',
      lastName: ''
    },
    billingAddress: {
      addressLine1: '',
      addressLine2: '',
      cityOrTown: '',
      state: tenant?.billingAddress?.state,
      postcode: '',
      country: tenant?.billingAddress?.country
    },
    deliveryAddress: {
      addressLine1: '',
      addressLine2: '',
      cityOrTown: '',
      state: tenant?.address?.state,
      postcode: '',
      country: tenant?.address?.country
    },
    files: []
  })

  const {
    reset,
    control,
    getValues,
    setValue,
    watch,
    trigger,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: customerData,
    mode: 'onChange'
  })

  useEffect(() => {
    setValue('currencyId', currency)
    setSelectedCurrency(currency)
    setValue('billingAddress.country', tenant?.billingAddress?.country)
    setValue('billingAddress.state', tenant?.billingAddress?.state)
    setValue('deliveryAddress.country', tenant?.address?.country)
    setValue('deliveryAddress.state', tenant?.address?.state)
  }, [tenantId])

  const check = () => {
    setOpen(true)
    const fieldName = Object.keys(errors)[0]
    const errName = document.getElementById(fieldName)
    errName?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
  }

  const handleNewCustomerSave = async newcustomer => {
    setOpen(false)
    setLoader(true)
    const customer1 = {
      ...newcustomer,
      currencyId: newcustomer?.currencyId?.currencyId
    }
    const customer = customer1

    try {
      const response = await writeData(createCustomerMutation(), { tenantId, customer })

      if (response.createCustomer) {
        if (selectedPdFile || selectedPdFile?.length !== 0 || selectedPdFile[0]) {
          await UploadMultipleFileS3Api(selectedPdFile, dispatch)
        }
        dispatch(setAddCustomer(response.createCustomer))
        dispatch(createAlert({ message: 'Customer created  successfully !', type: 'success' }))

        router.push('/sales/customer/')
      } else {
        setLoader(false)
        const errorMessage = response?.errors?.[0] ? response.errors[0].message : 'Customer creation  failed!'
        dispatch(createAlert({ message: errorMessage, type: 'error' }))
      }
      return response
    } catch (error) {
      // Handle any errors and optionally dispatch an error action
      console.log('error: ', error)
      setLoader(false)
    }
  }

  const handleCancel = () => {
    reset()
    router.push('/sales/customer/')
  }

  const handleSameBillingAddress = e => {
    const checked = e.target.checked
    setChecked(checked)
    if (checked) {
      setValue('deliveryAddress', getValues('billingAddress'))
    } else if (!checked) {
      const addressFields = {
        addressLine1: '',
        addressLine2: '',
        cityOrTown: '',
        state: '',
        postcode: '',
        country: ''
      }
      setValue('deliveryAddress', addressFields)
    }
    trigger(['deliveryAddress'])
  }

  const billingAddress = useWatch({ control, name: 'billingAddress' })
  const deliveryAddress = useWatch({ control, name: 'deliveryAddress' })

  const areAddressesSame = (a, b) => {
    return JSON.stringify(trimStrings(a)) === JSON.stringify(trimStrings(b))
  }

  useEffect(() => {
    setChecked(areAddressesSame(billingAddress, deliveryAddress))
  }, [billingAddress, deliveryAddress])

  useEffect(() => {
    if (checkAuthorizedRoute(CREATE_CUSTOMER, router, userProfile)) {
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
            Add Customer
          </Typography>
        }
        button={
          <IconButton
            variant='outlined'
            color='default'
            sx={{ fontSize: '21px' }}
            component={Link}
            scroll={true}
            href={`/sales/customer/`}
          >
            <Close sx={{ color: theme => theme.palette.primary.main }} />
          </IconButton>
          // )
        }
      />
      <PageWrapper>
        <form onSubmit={handleSubmit(handleNewCustomerSave)}>
          <Grid container spacing={{ xs: 6 }}>
            <Grid item xs={12} md={12}>
              <Grid container spacing={{ xs: 2, md: 3, lg: 3, xl: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Controller
                    name='customerName'
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        id='customerName'
                        fullWidth
                        label='Customer Name'
                        error={Boolean(errors.customerName)}
                        {...(errors.customerName && { helperText: 'Customer Name is required' })}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Controller
                    name='companyName'
                    control={control}
                    rules={{ required: false }}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        id='companyName'
                        fullWidth
                        label='Company Name'
                        error={Boolean(errors.companyName)}
                        {...(errors.companyName && { helperText: 'Company Name is required' })}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Controller
                    name='displayName'
                    control={control}
                    rules={{ required: false }}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        id='displayName'
                        fullWidth
                        label='Display Name'
                        error={Boolean(errors.displayName)}
                        {...(errors.displayName && { helperText: 'Display Name is required' })}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} md={12} id='primaryContact'>
              <Typography sx={{ fontSize: '14px', fontWeight: 500, lineHeight: '40px' }}>Primary Contact</Typography>
              <Grid container spacing={{ xs: 2, md: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Controller
                    name='primaryContact.title'
                    control={control}
                    rules={{ required: false }}
                    render={({ field }) => (
                      <CustomTextField
                        // id='title'
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
                    rules={{ required: false }}
                    render={({ field }) => (
                      <CustomTextField
                        // id='firstName'
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
                    rules={{ required: false }}
                    render={({ field }) => (
                      <CustomTextField
                        // id='lastName'
                        {...field}
                        fullWidth
                        label='Last Name'
                        error={Boolean(errors.primaryContact?.lastName)}
                        {...(errors.primaryContact?.lastName && { helperText: 'Last Name is required' })}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={0} sm={6} md={3} sx={{ display: { xs: 'none', md: 'block' } }}></Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Controller
                    name='emailAddress'
                    control={control}
                    rules={{ required: false }}
                    render={({ field }) => (
                      <CustomTextField
                        // id='emailAddress'
                        {...field}
                        fullWidth
                        label='Email'
                        type='email'
                        error={Boolean(errors.emailAddress)}
                        {...(errors.emailAddress?.required && { helperText: 'Email is required' })}
                        {...(errors.emailAddress?.type && { helperText: 'Please enter valid email' })}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Controller
                    name='workPhone'
                    control={control}
                    rules={{ required: false }}
                    render={({ field: { value, onChange } }) => (
                      <CustomPhoneInput
                        // id='workPhone'
                        label='Work Phone'
                        value={value}
                        onChange={onChange}
                        // error={Boolean(errors.workPhone)}
                      />
                    )}
                  />
                  {errors?.workPhone && <FormHelperText error>Work Phone is required</FormHelperText>}
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Controller
                    name='mobile'
                    control={control}
                    rules={{ required: false }}
                    render={({ field: { value, onChange } }) => (
                      <CustomPhoneInput
                        name='mobile'
                        label='Mobile'
                        value={value}
                        onChange={onChange}
                        error={Boolean(errors.mobile)}
                      />
                    )}
                  />
                  {errors?.mobile && <FormHelperText error>Mobile Number is required</FormHelperText>}
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} md={12} id='billingAddress'>
              <FormLabel sx={{ fontSize: '14px', fontWeight: 500, lineHeight: '40px' }}>Billing Address</FormLabel>
              <Grid container spacing={{ xs: 2, md: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Controller
                    name='billingAddress.addressLine1'
                    control={control}
                    rules={{ required: false }}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        onChange={e => {
                          const formattedValue = capitalizeFirstLetterOnly(e.target.value)
                          field.onChange(formattedValue)
                        }}
                        fullWidth
                        label='Address Line 1'
                        error={Boolean(errors.billingAddress?.addressLine1)}
                        {...(errors.billingAddress?.addressLine1 && { helperText: 'Address Line 1 is required' })}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Controller
                    name='billingAddress.addressLine2'
                    control={control}
                    rules={{ required: false }}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        onChange={e => {
                          const formattedValue = capitalizeFirstLetterOnly(e.target.value)
                          field.onChange(formattedValue)
                        }}
                        fullWidth
                        label='Address Line 2'
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Controller
                    name='billingAddress.postcode'
                    control={control}
                    rules={{ required: false }}
                    render={({ field }) => (
                      <CustomTextField
                        // id='billingAddress.postcode'
                        {...field}
                        onChange={e => {
                          const formattedValue = capitalizeFirstLetterOnly(e.target.value)
                          field.onChange(formattedValue)
                        }}
                        fullWidth
                        label='Zip Code'
                        error={Boolean(errors.billingAddress?.postcode)}
                        {...(errors.billingAddress?.postcode && { helperText: 'ZIP Code is required' })}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={0} sm={6} md={3} sx={{ display: { xs: 'none', md: 'block' } }}></Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Controller
                    name='billingAddress.cityOrTown'
                    control={control}
                    rules={{ required: false }}
                    render={({ field }) => (
                      <CustomTextField
                        // id='billingAddress.cityOrTown'
                        {...field}
                        onChange={e => {
                          const formattedValue = capitalizeFirstLetterOnly(e.target.value)
                          field.onChange(formattedValue)
                        }}
                        fullWidth
                        label='City / Town'
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
                    rules={{ required: false }}
                    render={({ field }) => (
                      <CustomAutocomplete
                        {...field}
                        disableClearable={false} // Ensure clearable behavior
                        options={countries}
                        getOptionLabel={option => option.name || ''}
                        isOptionEqualToValue={(option, value) => option?.name === value?.name}
                        value={field.value ? { name: field.value } : null} // Fix value resetting issue
                        onChange={(event, newValue) => {
                          field.onChange(newValue ? newValue.name : '') // Ensure it clears properly
                          setBillingAddressCountry(newValue)
                          setValue('billingAddress.state', '')
                        }}
                        renderInput={params => (
                          <CustomTextField
                            {...params}
                            label='Select Country'
                            fullWidth
                            error={Boolean(errors.billingAddress?.country)}
                            helperText={errors.billingAddress?.country ? 'Country is required' : ''}
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
                    rules={{ required: false }}
                    render={({ field }) => (
                      <CustomAutocomplete
                        {...field}
                        disableClearable={false}
                        options={billingAddressCountry?.states?.length ? billingAddressCountry.states : []}
                        getOptionLabel={option => option.name || ''}
                        isOptionEqualToValue={(option, value) => option?.name === value?.name}
                        value={field.value ? { name: field.value } : null} // Handle null value properly
                        onChange={(event, newValue) => {
                          field.onChange(newValue ? newValue.name : '') // Ensure it clears correctly
                        }}
                        renderInput={params => (
                          <CustomTextField
                            {...params}
                            label='Select State'
                            fullWidth
                            error={Boolean(errors.billingAddress?.state)}
                            helperText={errors.billingAddress?.state ? 'State is required' : ''}
                          />
                        )}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={<Checkbox checked={checked} onChange={e => handleSameBillingAddress(e)} />}
                label='Set Delivery  Address Same As Billing Address'
                size='small'
              />
            </Grid>
            <Grid item xs={12} md={12} id='deliveryAddress'>
              <FormLabel sx={{ fontSize: '14px', fontWeight: 500, lineHeight: '40px' }}>Delivery Address</FormLabel>
              <Grid container spacing={{ xs: 2, md: 3, lg: 3, xl: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                  {' '}
                  <Controller
                    name='deliveryAddress.addressLine1'
                    control={control}
                    rules={{ required: false }}
                    render={({ field }) => (
                      <CustomTextField
                        // id='deliveryAddress.addressLine1'
                        {...field}
                        onChange={e => {
                          const formattedValue = capitalizeFirstLetterOnly(e.target.value)
                          field.onChange(formattedValue)
                        }}
                        fullWidth
                        label='Address Line 1'
                        error={Boolean(errors.deliveryAddress?.addressLine1)}
                        {...(errors.deliveryAddress?.addressLine1 && { helperText: ' Address Line 1 is required' })}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Controller
                    name='deliveryAddress.addressLine2'
                    control={control}
                    rules={{ required: false }}
                    render={({ field }) => (
                      <CustomTextField
                        // id='deliveryAddress.addressLine2'
                        {...field}
                        onChange={e => {
                          const formattedValue = capitalizeFirstLetterOnly(e.target.value)
                          field.onChange(formattedValue)
                        }}
                        fullWidth
                        label='Address Line 2'
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Controller
                    name='deliveryAddress.postcode'
                    control={control}
                    rules={{ required: false }}
                    render={({ field }) => (
                      <CustomTextField
                        // id='deliveryAddress.postcode'
                        {...field}
                        onChange={e => {
                          const formattedValue = capitalizeFirstLetterOnly(e.target.value)
                          field.onChange(formattedValue)
                        }}
                        fullWidth
                        label='Zip Code'
                        error={Boolean(errors.deliveryAddress?.postcode)}
                        {...(errors.deliveryAddress?.postcode && { helperText: 'ZIP Code is required' })}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={0} sm={6} md={3} sx={{ display: { xs: 'none', md: 'block' } }}></Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Controller
                    name='deliveryAddress.cityOrTown'
                    control={control}
                    rules={{ required: false }}
                    render={({ field }) => (
                      <CustomTextField
                        // id='deliveryAddress.cityOrTown'
                        {...field}
                        onChange={e => {
                          const formattedValue = capitalizeFirstLetterOnly(e.target.value)
                          field.onChange(formattedValue)
                        }}
                        fullWidth
                        label='City / Town'
                        error={Boolean(errors.deliveryAddress?.cityOrTown)}
                        {...(errors.deliveryAddress?.cityOrTown && { helperText: 'City is required' })}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Controller
                    name='deliveryAddress.country'
                    control={control}
                    rules={{ required: false }}
                    render={({ field }) => (
                      <CustomAutocomplete
                        {...field}
                        disableClearable={false}
                        options={countries}
                        getOptionLabel={option => option.name || ''}
                        isOptionEqualToValue={(option, value) => option?.name === value?.name}
                        value={field.value ? { name: field.value } : null} // Handle null value properly
                        onChange={(event, newValue) => {
                          field.onChange(newValue ? newValue.name : '') // Ensure it clears correctly
                          setDeliveryAddressCountry(newValue)
                          setValue('deliveryAddress.state', '')
                        }}
                        renderInput={params => (
                          <CustomTextField
                            {...params}
                            label='Select Country'
                            fullWidth
                            error={Boolean(errors.deliveryAddress?.country)}
                            helperText={errors.deliveryAddress?.country ? 'Country is required' : ''}
                          />
                        )}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Controller
                    name='deliveryAddress.state'
                    control={control}
                    rules={{ required: false }}
                    render={({ field }) => (
                      <CustomAutocomplete
                        {...field}
                        disableClearable={false}
                        options={deliveryAddressCountry?.states?.length ? deliveryAddressCountry.states : []}
                        getOptionLabel={option => option.name || ''}
                        isOptionEqualToValue={(option, value) => option?.name === value?.name}
                        value={field.value ? { name: field.value } : null} // Handle null value properly
                        onChange={(event, newValue) => {
                          field.onChange(newValue ? newValue.name : '') // Ensure it clears correctly
                        }}
                        renderInput={params => (
                          <CustomTextField
                            {...params}
                            label='Select State'
                            fullWidth
                            error={Boolean(errors.deliveryAddress?.state)}
                            helperText={errors.deliveryAddress?.state ? 'State is required' : ''}
                          />
                        )}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} md={12}>
              <Typography sx={{ fontSize: '14px', fontWeight: 500, lineHeight: '40px' }}>Other Details</Typography>
              <Grid container spacing={{ xs: 2, md: 3, lg: 3, xl: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Controller
                    name='currencyId'
                    control={control}
                    rules={{ required: false }}
                    render={({ field }) => (
                      <CustomAutocomplete
                        {...field}
                        onChange={(event, newValue) => {
                          field.onChange(newValue)
                          setSelectedCurrency(newValue)
                        }}
                        options={currencies}
                        getOptionLabel={option => {
                          if (typeof option === 'string') {
                            return option
                          } else return `${option?.currencyId}`
                        }}
                        renderOption={(props, option) => (
                          <Box component='li' {...props}>
                            {option.symbol} - {option.currencyId}
                          </Box>
                        )}
                        renderInput={params => (
                          <CustomTextField
                            id='currencyId'
                            {...params}
                            label='Currency'
                            error={Boolean(errors.currencyId)}
                            {...(errors.currencyId && { helperText: 'Currency is required' })}
                          />
                        )}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Controller
                    name='paymentTerms'
                    control={control}
                    rules={{ required: false }}
                    render={({ field }) => (
                      <CustomAutocomplete
                        {...field}
                        value={{ paymentTerms: field.value }}
                        onChange={(event, newValue) => {
                          field.onChange(newValue?.paymentTerms)
                        }}
                        options={paymentTerms}
                        getOptionLabel={option => {
                          if (typeof option === 'string') {
                            return option
                          } else return `${option?.paymentTerms}`
                        }}
                        renderInput={params => (
                          <CustomTextField
                            id='paymentTerms'
                            {...params}
                            label='Payment Term'
                            error={Boolean(errors.paymentTerms)}
                            {...(errors.paymentTerms && { helperText: 'Payment Term is required' })}
                          />
                        )}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Controller
                    name='shippingPreference'
                    control={control}
                    rules={{ required: false }}
                    render={({ field }) => (
                      <CustomAutocomplete
                        {...field}
                        onChange={(event, newValue) => {
                          field.onChange(newValue)
                        }}
                        options={preference}
                        getOptionLabel={option => option || ''}
                        renderInput={params => (
                          <CustomTextField
                            id='shippingPreference'
                            {...params}
                            label='Shipping Preference'
                            error={Boolean(errors.shippingPreference)}
                            {...(errors.shippingPreference && { helperText: 'Shipping Preference is required' })}
                          />
                        )}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Grid>{' '}
            <Grid item xs={12}>
              <CustomFilesUpload
                setValue={setValue}
                selectedPdFile={selectedPdFile}
                setSelectedPdFile={setSelectedPdFile}
                folderName={CUSTOMER_PDF}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <AttributesTable control={control} errors={errors} />
            </Grid>
          </Grid>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: { xs: 'center', sm: 'start' },
              gap: { xs: '10px', md: '20px' },
              marginTop: { xs: '20px', sm: '30px' }
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
      </PageWrapper>{' '}
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
      {loader ? (
        <Backdrop sx={{ color: '#fff', zIndex: theme => theme.zIndex.drawer + 1 }} open={loader}>
          <CircularProgress color='inherit' />
        </Backdrop>
      ) : null}
    </ErrorBoundary>
  )
}

export default Customer
