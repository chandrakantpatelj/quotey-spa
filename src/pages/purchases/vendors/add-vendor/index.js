import Link from 'next/link'
import Router, { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import {
  Typography,
  IconButton,
  Grid,
  Box,
  Button,
  FormHelperText,
  MenuItem,
  Snackbar,
  Alert,
  Backdrop,
  CircularProgress
} from '@mui/material'
import CustomTextField from 'src/@core/components/mui/text-field'
import PageHeader from 'src/@core/components/page-header'
import PageWrapper from 'src/@core/layouts/PageWrapper'
import { Close } from '@mui/icons-material'
import { preference } from 'src/@fake-db/autocomplete'
import { useDispatch, useSelector } from 'react-redux'
import CustomPhoneInput from 'src/common-components/CustomPhoneInput'
import { writeData } from 'src/common-functions/GraphqlOperations'
import { useForm, Controller } from 'react-hook-form'
import { createAlert } from 'src/store/apps/alerts'
import CustomFilesUpload from 'src/views/forms/form-elements/custom-inputs/CustomFilesUpload'
import { UploadMultipleFileS3Api } from 'src/views/forms/form-elements/custom-inputs/UploadMultipleFileS3Api'
import { CreateVendorMutation } from 'src/@core/components/graphql/vendor-queries'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import { CREATE_VENDOR, VENDOR_PDF } from 'src/common-functions/utils/Constants'
import { setAddVendor } from 'src/store/apps/vendors'
import useCountries from 'src/hooks/getData/useCountries'
import useCurrencies from 'src/hooks/getData/useCurrencies'
import usePaymentTerms from 'src/hooks/getData/usePaymnetTerms'
import ErrorBoundary from 'src/pages/ErrorBoundary'
import { checkAuthorizedRoute } from 'src/common-functions/utils/UtilityFunctions'
import useVendors from 'src/hooks/getData/useVendors'

function Vendors() {
  const router = useRouter()
  const dispatch = useDispatch()

  const userProfile = useSelector(state => state.userProfile)
  const tenant = useSelector(state => state.tenants?.selectedTenant)

  const { vendors } = useVendors(tenant.tenantId)

  const [isAuthorized, setIsAuthorized] = useState(false)
  const currency = useSelector(state => state?.currencies?.selectedCurrency)
  const [selectedCurrency, setSelectedCurrency] = useState(currency)
  const { currencies } = useCurrencies()
  const { paymentTerms } = usePaymentTerms()
  const { countries } = useCountries()
  const [loader, setLoader] = React.useState(false)
  const [selectedPdFile, setSelectedPdFile] = useState([])

  function findObjectById(array, countryId) {
    return array.find(obj => obj.name === countryId)
  }

  const [billingAddressCountry, setBillingAddressCountry] = useState(
    findObjectById(countries, tenant?.billingAddress?.country)
  )
  const [vendorData, setVendorsData] = useState({
    schemaVersion: '1.0',
    companyName: '',
    displayName: '',
    primaryContact: {
      title: '',
      firstName: '',
      lastName: ''
    },
    emailAddress: '',
    workPhone: '',
    mobile: '',
    currencyId: selectedCurrency,
    paymentTermsId: 'Due On Receipt',
    shippingPreference: 'Standard',
    billingAddress: {
      addressLine1: '',
      addressLine2: '',
      cityOrTown: '',
      postcode: '',
      country: tenant?.billingAddress?.country,
      state: tenant?.billingAddress?.state
    },
    files: []
  })

  const {
    reset,
    control,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues: vendorData,
    mode: 'onChange'
  })

  useEffect(() => {
    setValue('currencyId', currency)
    setSelectedCurrency(currency)
    setValue('billingAddress.country', tenant?.billingAddress?.country)
    setValue('billingAddress.state', tenant?.billingAddress?.state)
    setBillingAddressCountry(findObjectById(countries, tenant?.billingAddress?.country))
  }, [tenant])

  const [open, setOpen] = useState(false)

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }

    setOpen(false)
  }

  const check = () => {
    setOpen(true)
    // firstFieldRef?.current.focus()
    const fieldName = Object.keys(errors)[0]
    const errName = document.getElementById(fieldName)
    errName?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
  }
  const handleNewVendorSave = async newvendor => {
    setOpen(false)
    setLoader(true)
    const tenantId = tenant?.tenantId
    const currencyId = newvendor?.currencyId?.currencyId
    const vendor1 = {
      ...newvendor,
      currencyId: currencyId
    }
    const vendor = vendor1
    try {
      const response = await writeData(CreateVendorMutation(), { tenantId, vendor })
      if (response.createVendor) {
        if (selectedPdFile || selectedPdFile?.length !== 0 || selectedPdFile[0]) {
          await UploadMultipleFileS3Api(selectedPdFile, dispatch)
        }
        dispatch(setAddVendor(response.createVendor))
        dispatch(createAlert({ message: 'Vendor created  successfully !', type: 'success' }))
        router.push('/purchases/vendors/')
      } else {
        const errorMessage = response?.errors?.[0] ? response.errors[0].message : 'Vendor creation  failed!'
        setLoader(false)
        dispatch(createAlert({ message: errorMessage, type: 'error' }))
      }
      return response
    } catch (error) {
      // Handle any errors and optionally dispatch an error action
      console.error('error: ', error)
      setLoader(false)
    }
  }

  const handleCancel = () => {
    router.push('/purchases/vendors/')
    reset()
  }

  useEffect(() => {
    if (checkAuthorizedRoute(CREATE_VENDOR, router, userProfile)) {
      setIsAuthorized(true)
    } else {
      setIsAuthorized(false)
    }
  }, [userProfile])

  if (!isAuthorized) {
    return null
  }

  return (
    <ErrorBoundary tenantId={tenant?.tenantId} dispatch={dispatch}>
      <PageHeader
        title={
          <Typography
            sx={{
              fontSize: { xs: '16px', md: '18px' },
              fontWeight: '500'
            }}
          >
            Add Vendor
          </Typography>
        }
        button={
          <IconButton
            variant='outlined'
            color='default'
            sx={{ fontSize: '21px' }}
            component={Link}
            scroll={true}
            href={`/purchases/vendors/`}
          >
            <Close sx={{ color: theme => theme.palette.primary.main }} />
          </IconButton>
          // )
        }
      />
      <PageWrapper>
        <form onSubmit={handleSubmit(handleNewVendorSave)}>
          <Grid container spacing={{ xs: 6 }}>
            <Grid item xs={12} md={12}>
              <Grid container spacing={{ xs: 2, md: 3, lg: 3, xl: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Controller
                    name='companyName'
                    control={control}
                    render={({ field }) => (
                      <CustomTextField id='companyName' {...field} fullWidth label='Company Name' />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Controller
                    name='displayName'
                    control={control}
                    rules={{ required: 'Display name is required' }}
                    render={({ field, fieldState: { error } }) => (
                      <CustomTextField
                        id='displayName'
                        {...field}
                        fullWidth
                        label='Vendor Name'
                        error={Boolean(error)}
                        helperText={error?.message}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} md={12} id='primaryContact'>
              <Typography sx={{ fontSize: '15px', fontWeight: 500, lineHeight: '40px' }}>Primary Contact</Typography>

              <Grid container spacing={{ xs: 2, md: 3, lg: 3, xl: 3 }}>
                <Grid item xs={3} md={3}>
                  <Controller
                    name='primaryContact.title'
                    control={control}
                    render={({ field }) => (
                      <CustomTextField
                        select
                        {...field}
                        fullWidth
                        size='small'
                        label='Title'
                        // value={field.value}
                        // onChange={field.onChange}
                      >
                        <MenuItem value='Mr'>Mr</MenuItem>
                        <MenuItem value='Ms'>Ms</MenuItem>.<MenuItem value='Miss'>Miss</MenuItem>
                        <MenuItem value='Dr'>Dr</MenuItem>
                      </CustomTextField>
                    )}
                  />
                </Grid>
                <Grid item xs={4.5} md={3}>
                  <Controller
                    name='primaryContact.firstName'
                    control={control}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        fullWidth
                        label='First Name'
                        // value={field.value}
                        // onChange={field.onChange}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={4.5} md={3}>
                  <Controller
                    name='primaryContact.lastName'
                    control={control}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        fullWidth
                        label='Last Name'
                        // value={field.value}
                        // onChange={field.onChange}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={0} md={3} sx={{ display: { xs: 'none', md: 'block' } }}></Grid>

                <Grid item xs={12} sm={12} md={3}>
                  <Controller
                    name='emailAddress'
                    control={control}
                    render={({ field }) => (
                      <CustomTextField
                        fullWidth
                        label='Email'
                        type='email'
                        value={field.value}
                        onChange={field.onChange}
                        error={Boolean(errors.emailAddress)}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Controller
                    name='mobile'
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <CustomPhoneInput
                        name='mobile'
                        label='Mobile'
                        value={value?.phone}
                        // onChange={(phone, country) => onChange({ phone, country })}
                        onChange={onChange}
                        error={Boolean(errors.mobile)}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Controller
                    name='workPhone'
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <CustomPhoneInput
                        name='workPhone'
                        label='Work Phone'
                        value={value}
                        onChange={onChange}
                        error={Boolean(errors.workPhone)}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} md={12} id='billingAddress'>
              <Typography sx={{ fontSize: '15px', fontWeight: 500, lineHeight: '40px' }}>Billing Address</Typography>
              <Grid container spacing={{ xs: 2, md: 3, lg: 3, xl: 3 }}>
                <Grid item xs={12} sm={12} md={3}>
                  <Controller
                    name='billingAddress.addressLine1'
                    control={control}
                    render={({ field }) => <CustomTextField {...field} fullWidth label='Address Line 1' />}
                  />
                </Grid>
                <Grid item xs={12} sm={12} md={3}>
                  <Controller
                    name='billingAddress.addressLine2'
                    control={control}
                    render={({ field }) => (
                      <CustomTextField fullWidth label='Address Line 2' {...field} onChange={field.onChange} />
                    )}
                  />
                </Grid>
                <Grid item xs={6} sm={6} md={3}>
                  <Controller
                    name='billingAddress.postcode'
                    control={control}
                    render={({ field }) => <CustomTextField {...field} fullWidth label='Zip Code' />}
                  />
                </Grid>
                <Grid item xs={0} sm={6} md={3} sx={{ display: { xs: 'none', md: 'block' } }}></Grid>
                <Grid item xs={6} sm={6} md={3}>
                  <Controller
                    name='billingAddress.cityOrTown'
                    control={control}
                    render={({ field }) => <CustomTextField {...field} fullWidth label='City / Town' />}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Controller
                    name='billingAddress.country'
                    control={control}
                    render={({ field }) => (
                      <CustomAutocomplete
                        {...field}
                        options={countries}
                        getOptionLabel={option => option.name || ''}
                        isOptionEqualToValue={(option, value) => option.name === value?.name}
                        value={field.value ? countries.find(country => country.name === field.value) : null}
                        onChange={(event, newValue) => {
                          field.onChange(newValue ? newValue.name : '')
                          setBillingAddressCountry(newValue)
                          setValue('billingAddress.state', '') // Clear state when country changes
                        }}
                        onBlur={field.onBlur} // Ensure proper blur handling
                        renderInput={params => <CustomTextField {...params} label='Select Country' fullWidth />}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Controller
                    name='billingAddress.state'
                    control={control}
                    render={({ field }) => {
                      const selectedState =
                        billingAddressCountry?.states?.find(state => state.name === field.value) || null

                      return (
                        <CustomAutocomplete
                          {...field}
                          disableClearable={false}
                          options={billingAddressCountry?.states || []}
                          getOptionLabel={option => option.name || ''}
                          isOptionEqualToValue={(option, value) => option.name === value?.name}
                          value={selectedState}
                          onChange={(event, newValue) => {
                            field.onChange(newValue ? newValue.name : '')
                          }}
                          onInputChange={(event, newInputValue) => {
                            if (newInputValue === '') {
                              field.onChange('')
                            }
                          }}
                          onBlur={field.onBlur}
                          renderInput={params => <CustomTextField {...params} label='Select State' fullWidth />}
                        />
                      )
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} md={12}>
              <Typography sx={{ fontSize: '15px', fontWeight: 500, lineHeight: '40px' }}>Other Details</Typography>
              <Grid container spacing={{ xs: 2, md: 3, lg: 3, xl: 3 }}>
                <Grid item xs={6} sm={6} md={3}>
                  <Controller
                    name='preferredShippingVendorId'
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <CustomAutocomplete
                        {...field}
                        value={vendors.find(vendor => vendor.vendorId === field.value)}
                        onChange={(event, newValue) => {
                          field.onChange(newValue?.vendorId ?? null)
                        }}
                        getOptionLabel={option => {
                          if (typeof option === 'string') {
                            return option
                          } else
                            return `${option?.vendorNoPrefix || ''}  ${option?.vendorNo || ''} - ${
                              option?.displayName || ''
                            }`
                        }}
                        isOptionEqualToValue={(option, value) => option.vendorId === value}
                        renderOption={(props, option) => {
                          return (
                            <li {...props}>
                              {option?.vendorNoPrefix || ''}
                              {option?.vendorNo || ''}-{option?.displayName || ''}
                            </li>
                          )
                        }}
                        options={vendors}
                        renderInput={params => (
                          <CustomTextField
                            {...params}
                            label='Preferred Shipping Vendor'
                            error={Boolean(error)}
                            helperText={error?.message}
                          />
                        )}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={6} sm={6} md={3}>
                  <Controller
                    name='currencyId'
                    control={control}
                    rules={{ required: 'Currency is required' }}
                    render={({ field, fieldState: { error } }) => (
                      <CustomAutocomplete
                        {...field}
                        onChange={(event, newValue) => {
                          field.onChange(newValue)
                          setSelectedCurrency(newValue)
                        }}
                        options={currencies}
                        // getOptionLabel={option => option?.displayName || ''}
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
                            {...params}
                            id='currencyId'
                            label='Currency'
                            error={Boolean(error)}
                            helperText={error?.message}
                          />
                        )}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={6} sm={6} md={3}>
                  <Controller
                    name='paymentTermsId'
                    control={control}
                    render={({ field }) => {
                      const selectedPaymentTerm = paymentTerms.find(term => term.paymentTerms === field.value) || null

                      return (
                        <CustomAutocomplete
                          {...field}
                          value={selectedPaymentTerm}
                          options={paymentTerms}
                          getOptionLabel={option => option.paymentTerms || ''}
                          isOptionEqualToValue={(option, value) => option.paymentTerms === value?.paymentTerms}
                          onChange={(event, newValue) => {
                            field.onChange(newValue ? newValue.paymentTerms : '')
                          }}
                          onInputChange={(event, newInputValue) => {
                            if (newInputValue === '') {
                              field.onChange('') // Clear when input is empty
                            }
                          }}
                          onBlur={field.onBlur} // Handle blur to trigger form validation
                          renderInput={params => <CustomTextField {...params} id='paymentTerms' label='Payment Term' />}
                        />
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Controller
                    name='shippingPreference'
                    control={control}
                    render={({ field }) => (
                      <CustomAutocomplete
                        {...field}
                        onChange={(event, newValue) => {
                          field.onChange(newValue)
                        }}
                        options={preference}
                        getOptionLabel={option => option || ''}
                        renderInput={params => (
                          <CustomTextField {...params} id='shippingPreference' label='Shipping Preference' />
                        )}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <CustomFilesUpload
                setValue={setValue}
                selectedPdFile={selectedPdFile}
                setSelectedPdFile={setSelectedPdFile}
                folderName={VENDOR_PDF}
              />
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
      {loader ? (
        <Backdrop sx={{ color: '#fff', zIndex: theme => theme.zIndex.drawer + 1 }} open={loader}>
          <CircularProgress color='inherit' />
        </Backdrop>
      ) : null}
    </ErrorBoundary>
  )
}

export default Vendors
