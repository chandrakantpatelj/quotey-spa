// ** Next Import
import Link from 'next/link'
import Router from 'next/router'
import React, { useState, useEffect } from 'react'
import PageHeader from 'src/@core/components/page-header'
import PageWrapper from 'src/@core/layouts/PageWrapper'
import {
  Box,
  IconButton,
  Typography,
  Grid,
  FormLabel,
  FormHelperText,
  Button,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Snackbar,
  Alert,
  Backdrop,
  CircularProgress
} from '@mui/material'
import CustomTextField from 'src/@core/components/mui/text-field'
import { Close } from '@mui/icons-material'
import { preference } from 'src/@fake-db/autocomplete'
import { useDispatch, useSelector } from 'react-redux'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import { useForm, Controller } from 'react-hook-form'
import EditPhoneInput from 'src/common-components/EditPhoneInput'
import { writeData } from 'src/common-functions/GraphqlOperations'
import { updateCustomerMutation } from 'src/@core/components/graphql/customer-queries'
import { createAlert } from 'src/store/apps/alerts'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import CustomFilesUpload from 'src/views/forms/form-elements/custom-inputs/CustomFilesUpload'
import { UploadMultipleFileS3Api } from 'src/views/forms/form-elements/custom-inputs/UploadMultipleFileS3Api'
import DeleteUploadFile from 'src/views/forms/form-elements/custom-inputs/DeleteUploadFile'
import {
  capitalizeFirstLetterOnly,
  checkAuthorizedRoute,
  fetchPdfFile,
  getStates,
  trimStrings
} from 'src/common-functions/utils/UtilityFunctions'
import { CUSTOMER_PDF, EDIT_CUSTOMER } from 'src/common-functions/utils/Constants'
import { setUpdateCustomer } from 'src/store/apps/customers'
import useCurrencies from 'src/hooks/getData/useCurrencies'
import useCountries from 'src/hooks/getData/useCountries'
import usePaymentTerms from 'src/hooks/getData/usePaymnetTerms'
import AttributesTable from 'src/@core/components/common-components/AttributesTable'

export default function EditCustomer() {
  const router = Router
  const dispatch = useDispatch()
  const [checked, setChecked] = useState(false)
  const selectedCustomer = useSelector(state => state?.customers?.selectedCustomer)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const userProfile = useSelector(state => state.userProfile)
  const tenantId = useSelector(state => state.tenants?.selectedTenant.tenantId)

  const { currencies } = useCurrencies()
  const { countries } = useCountries()
  const { paymentTerms } = usePaymentTerms()

  const [selectedPdFile, setSelectedPdFile] = useState([])
  const [deletedPdFiles, setDeletedPdFiles] = useState([])

  const [loader, setLoader] = React.useState(false)

  useEffect(() => {
    selectedCustomer?.files?.length > 0 &&
      selectedCustomer?.files?.map(item => {
        setDeletedPdFiles(prev => [...prev, item])
        fetchPdfFile(setSelectedPdFile, item)
      })
  }, [selectedCustomer])

  useEffect(() => {
    if (Object.keys(selectedCustomer).length === 0) {
      router.push('/sales/customer/')
    }
  }, [selectedCustomer, tenantId])

  const {
    reset,
    control,
    getValues,
    setValue,
    trigger,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: selectedCustomer,
    mode: 'onChange'
  })
  useEffect(() => {
    setValue('currencyId', currencies?.find(item => item?.currencyId === selectedCustomer?.currencyId) || {})
  }, [currencies, selectedCustomer])

  const [open, setOpen] = useState(false)

  const [billingAddressCountry, setBillingAddressCountry] = useState()
  const [deliveryAddressCountry, setDeliveryAddressCountry] = useState()

  function findObjectById(array, countryId) {
    return array.find(obj => obj.name === countryId)
  }
  useEffect(() => {
    setBillingAddressCountry(findObjectById(countries, selectedCustomer?.billingAddress?.country))

    setDeliveryAddressCountry(findObjectById(countries, selectedCustomer?.deliveryAddress?.country))
  }, [countries, selectedCustomer])

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

  const handleUpdateCustomerSave = async editcustomer => {
    setOpen(false)
    setLoader(true)

    // Remove unnecessary properties from editcustomer
    const {
      customerId,
      tenantId, // Ignore the tenantId from editcustomer
      customerNo,
      createdDateTime,
      customerNoPrefix,
      modifiedBy,
      modifiedDateTime,
      createdBy,
      currencyId: { currencyId },
      ...customerDetails
    } = editcustomer

    const customer = {
      ...customerDetails,
      currencyId
    }

    try {
      const response = await writeData(updateCustomerMutation(), {
        tenantId,
        customerId,
        customer
      })

      if (response.updateCustomer) {
        if (deletedPdFiles.length > 0 && selectedPdFile) {
          deletedPdFiles.forEach(async element => {
            const findDeleted = selectedPdFile.find(item => item.key === element.key)
            if (!findDeleted) {
              await DeleteUploadFile(element.key)
            }
          })
        }
        if (selectedPdFile || selectedPdFile?.length !== 0 || selectedPdFile[0]) {
          await UploadMultipleFileS3Api(selectedPdFile, dispatch)
        }
        dispatch(setUpdateCustomer(response.updateCustomer))
        dispatch(createAlert({ message: 'Customer Updated  successfully !', type: 'success' }))
        router.push('/sales/customer/')
      } else {
        setLoader(false)
        const errorMessage = response?.errors?.[0] ? response.errors[0].message : 'Customer Updation  failed!'
        dispatch(createAlert({ message: errorMessage, type: 'error' }))
      }
    } catch (error) {
      // Handle any errors and optionally dispatch an error action
      setLoader(false)
      dispatch(createAlert({ message: 'Customer Updation  failed !', type: 'error' }))
    }
  }

  const handleSameBillingAddress = e => {
    setChecked(e.target.checked)
    const checked = e.target.checked
    if (checked == true) {
      setValue('deliveryAddress', getValues('billingAddress'))
    } else if (checked == false) {
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

  const array1 = selectedCustomer?.billingAddress || {}
  const array2 = selectedCustomer?.deliveryAddress || {}

  useEffect(() => {
    const areAddressesEqual = JSON.stringify(array1) === JSON.stringify(array2)
    setChecked(areAddressesEqual)
  }, [array1, array2])

  const billingAddress = getValues('billingAddress')
  const deliveryAddress = getValues('deliveryAddress')

  const areAddressesSame = (a, b) => {
    return JSON.stringify(trimStrings(a)) === JSON.stringify(trimStrings(b))
  }

  useEffect(() => {
    setChecked(areAddressesSame(billingAddress, deliveryAddress))
  }, [billingAddress, deliveryAddress])

  useEffect(() => {
    if (checkAuthorizedRoute(EDIT_CUSTOMER, router, userProfile)) {
      setIsAuthorized(true)
    } else {
      setIsAuthorized(false)
    }
  }, [userProfile])

  if (!isAuthorized) {
    return null
  }

  return (
    <div>
      <React.Fragment>
        <PageHeader
          title={
            <Typography
              sx={{
                fontSize: { xs: '16px', md: '18px' },
                fontWeight: '500'
              }}
            >
              Edit Customer - {selectedCustomer?.customerNo}
            </Typography>
          }
          button={
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Button
                variant='contained'
                color='primary'
                sx={{ display: { xs: 'none', sm: 'flex' } }}
                startIcon={<AddOutlinedIcon />}
                component={Link}
                scroll={true}
                href={`/sales/customer/add-customer`}
              >
                Add New
              </Button>
              <IconButton
                variant='outlined'
                color='default'
                sx={{ fontSize: '21px' }}
                component={Link}
                scroll={true}
                href='/sales/customer/'
              >
                <Close sx={{ color: theme => theme.palette.primary.main }} />
              </IconButton>
            </Box>
          }
        />
        <PageWrapper>
          <form onSubmit={handleSubmit(handleUpdateCustomerSave)}>
            <Grid container spacing={{ xs: 4, md: 8 }}>
              <Grid item xs={12} md={12}>
                <Grid container spacing={{ xs: 4 }}>
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
                          id='companyName'
                          {...field}
                          fullWidth
                          label='Company Name'
                          error={Boolean(errors.companyName)}
                          {...(errors.companyName && { helperText: 'Company name is required' })}
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
                          id='displayName'
                          {...field}
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
                <Grid container spacing={{ xs: 2, md: 3, lg: 3, xl: 3 }}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Controller
                      name='primaryContact.title'
                      control={control}
                      rules={{ required: false }}
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
                      rules={{ required: false }}
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
                      rules={{ required: false }}
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
                      name='emailAddress'
                      control={control}
                      rules={{ required: false }}
                      render={({ field }) => (
                        <CustomTextField
                          fullWidth
                          {...field}
                          label='Email'
                          type='email'
                          error={Boolean(errors.emailAddress)}
                          {...(errors.emailAddress && { helperText: 'Email is required' })}
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
                  <Grid item xs={12} sm={6} md={3}>
                    <Controller
                      name='mobile'
                      control={control}
                      rules={{ required: false }}
                      render={({ field: { value, onChange } }) => (
                        <EditPhoneInput
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
                <FormLabel sx={{ fontSize: '14px', fontWeight: 500, lineHeight: '40px' }}> Billing Address</FormLabel>
                <Grid container spacing={{ xs: 2, md: 3, lg: 3, xl: 3 }}>
                  <Grid item xs={12} sm={6} md={3}>
                    {' '}
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
                          {...(errors.billingAddress?.addressLine1 && { helperText: ' Address Line 1 is required' })}
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
                          fullWidth
                          label='Address Line 2'
                          {...field}
                          onChange={e => {
                            const formattedValue = capitalizeFirstLetterOnly(e.target.value)
                            field.onChange(formattedValue)
                          }}
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
                          {...field}
                          onChange={e => {
                            const formattedValue = capitalizeFirstLetterOnly(e.target.value)
                            field.onChange(formattedValue)
                          }}
                          fullWidth
                          label='Zip Code'
                          error={Boolean(errors.billingAddress?.postcode)}
                          {...(errors.billingAddress?.postcode && { helperText: 'Post Code is required' })}
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
                          disableClearable={false}
                          options={countries}
                          getOptionLabel={option => option.name || ''}
                          value={field.value ? { name: field.value } : null} // Handle null value properly
                          onChange={(event, newValue) => {
                            field.onChange(newValue ? newValue.name : '') // Ensure it clears correctly
                            setBillingAddressCountry(newValue)
                            setValue('billingAddress.state', '') // Reset state when country changes
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
              <Grid item xs={12} sx={{ padding: 0 }}>
                <FormControlLabel
                  control={<Checkbox checked={checked} onChange={e => handleSameBillingAddress(e)} />}
                  label='Set Delivery Address Same As Billing Address'
                  size='small'
                />
              </Grid>
              <Grid item xs={12} md={12} id='deliveryAddress'>
                <FormLabel sx={{ fontSize: '14px', fontWeight: 500, lineHeight: '40px' }}> Delivery Address</FormLabel>
                <Grid container spacing={{ xs: 2, md: 3, lg: 3, xl: 3 }}>
                  <Grid item xs={12} sm={6} md={3}>
                    {' '}
                    <Controller
                      name='deliveryAddress.addressLine1'
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
                          fullWidth
                          label='Address Line 2'
                          {...field}
                          onChange={e => {
                            const formattedValue = capitalizeFirstLetterOnly(e.target.value)
                            field.onChange(formattedValue)
                          }}
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
                          {...field}
                          onChange={e => {
                            const formattedValue = capitalizeFirstLetterOnly(e.target.value)
                            field.onChange(formattedValue)
                          }}
                          fullWidth
                          label='Zip Code'
                          error={Boolean(errors.deliveryAddress?.postcode)}
                          {...(errors.deliveryAddress?.postcode && { helperText: 'Post Code is required' })}
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
                          disableClearable={false} // Ensures clearing is allowed
                          options={countries}
                          getOptionLabel={option => option.name || ''}
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
                          value={field.value ? { name: field.value } : null} // Handle null value correctly
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
                <FormLabel sx={{ fontSize: '14px', fontWeight: 500, lineHeight: '40px' }}>Other Details</FormLabel>
                <Grid container spacing={{ xs: 2, md: 6, lg: 8, xl: 8 }}>
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
                          }}
                          options={currencies}
                          getOptionLabel={option => {
                            if (typeof option === 'string') {
                              return option
                            } else return `${option?.currencyId || ''}`
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
                              error={Boolean(errors.currencyId)}
                              {...(errors.currencyId && { helperText: 'Currency is required' })}
                            />
                          )}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    {' '}
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
                            } else return `${option?.paymentTerms || ''}`
                          }}
                          renderInput={params => (
                            <CustomTextField
                              {...params}
                              id='paymentTerms'
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
                              {...params}
                              id='shippingPreference'
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
              </Grid>
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
                gap: '20px',
                marginTop: { xs: '20px', sm: '50px' }
              }}
            >
              <Button variant='contained' type='submit' onClick={check}>
                Save
              </Button>
              <Button
                variant='outlined'
                component={Link}
                scroll={true}
                href='/sales/customer/'
                type='reset'
                onClick={() => reset()}
              >
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
      </React.Fragment>
    </div>
  )
}
