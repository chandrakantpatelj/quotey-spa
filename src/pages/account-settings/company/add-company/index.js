import Link from 'next/link'
import React, { useEffect, useState } from 'react'
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
  FormHelperText,
  FormControlLabel,
  Checkbox,
  Snackbar,
  Alert,
  Backdrop,
  CircularProgress
} from '@mui/material'
import { Close } from '@mui/icons-material'
import CustomTextField from 'src/@core/components/mui/text-field'
import { useDispatch, useSelector } from 'react-redux'
import { useForm, Controller, useWatch } from 'react-hook-form'
import AttributesTable from 'src/@core/components/common-components/AttributesTable'
import CustomPhoneInput from 'src/common-components/CustomPhoneInput'
import Router, { useRouter } from 'next/router'
import { writeData } from 'src/common-functions/GraphqlOperations'
import { createTenantMutation } from 'src/@core/components/graphql/company-queries'
import TaxationTable from 'src/@core/components/common-components/TaxationTable'
import { createAlert } from 'src/store/apps/alerts'
import UploadLogo from 'src/views/forms/form-elements/custom-inputs/UploadLogo'
import { uploadImage } from 'src/views/forms/form-elements/custom-inputs/UploadImage'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import { SCHEMA_VERSION, CREATE_TENANT } from 'src/common-functions/utils/Constants'
import { checkAuthorizedRoute, clearReduxStore, trimStrings } from 'src/common-functions/utils/UtilityFunctions'
import { setHeaderLoader } from 'src/store/apps/other-setting'
import useCurrencies from 'src/hooks/getData/useCurrencies'
import useCountries from 'src/hooks/getData/useCountries'
import ErrorBoundary from 'src/pages/ErrorBoundary'
import {
  createUserPreferenceMutation,
  updateUserPreferenceMutation
} from 'src/@core/components/graphql/user-preference-queries'
import { setSelectedTenant } from 'src/store/apps/company'
import { setPermissionByTenantId } from 'src/store/apps/user-profile'

function NewCompany() {
  const dispatch = useDispatch()
  const router = useRouter()
  const tenant = useSelector(state => state.tenants?.selectedTenant)
  const { tenantId = null } = tenant || ''
  console.log('', tenantId)
  const userProfile = useSelector(state => state.userProfile)

  const [isAuthorized, setIsAuthorized] = useState(false)
  const [billingAddressCountry, setBillingAddressCountry] = useState({})
  const [deliveryAddressCountry, setDeliveryAddressCountry] = useState({})
  const [loader, setLoader] = React.useState(false)
  const [editImg, setEditImg] = useState(false)
  const [imgUploaded, setImgUploaded] = useState(false)
  const [isEditComponent, setIsEditComponent] = React.useState(false)
  const [files, setFiles] = useState([])
  const { currencies } = useCurrencies()
  const { countries } = useCountries()
  const accounts = useSelector(state => state?.accounts?.data || {})
  const [checked, setChecked] = useState(false)
  const AddressField = {
    addressLine1: '',
    addressLine2: '',
    cityOrTown: '',
    state: '',
    postcode: '',
    country: ''
  }
  const [tenantData, setTenantData] = React.useState({
    schemaVersion: SCHEMA_VERSION,
    businessName: '',
    displayName: '',
    primaryContact: {
      title: '',
      firstName: '',
      lastName: ''
    },
    emailAddress: '',
    workPhone: '',
    mobile: '',
    logoImage: {},
    useTradingInfo: false,
    tradingId: null,
    address: AddressField,
    billingAddress: AddressField,
    taxations: [],
    attributes: []
  })

  const {
    reset,
    control,
    getValues,
    setValue,
    trigger,
    watch,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: tenantData,
    mode: 'onChange'
  })

  useEffect(() => {
    dispatch(setHeaderLoader(false))
  }, [])

  const [open, setOpen] = useState(false)

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }

    setOpen(false)
  }

  const useInfo = watch('useTradingInfo')

  const handleSameBillingAddress = e => {
    const checked = e.target.checked
    setChecked(checked)

    if (checked) {
      setValue('billingAddress', getValues('address'))
    } else if (!checked) {
      setValue('billingAddress', AddressField)
    }
    trigger(['billingAddress'])
  }

  const address = useWatch({ control, name: 'address' })
  const billingAddress = useWatch({ control, name: 'billingAddress' })

  const areAddressesSame = (a, b) => {
    return JSON.stringify(trimStrings(a)) === JSON.stringify(trimStrings(b))
  }

  useEffect(() => {
    setChecked(areAddressesSame(billingAddress, address))
  }, [billingAddress, address])

  const check = () => {
    setOpen(true)
    const fieldName = Object.keys(errors)[0]
    const errName = document.getElementById(fieldName)
    errName?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
  }

  const handleNewItemSave = async newCompany => {
    setOpen(false)
    setLoader(true)
    const tenant = { ...newCompany, currencyId: newCompany?.currencyId?.currencyId }
    try {
      const response = await writeData(createTenantMutation(), { tenant })

      if (response.createTenant) {
        await uploadImage(files, getValues('logoImage'), dispatch)
        if (!tenantId) {
          const userPreference = { tenantId: response.createTenant?.tenantId }
          console.log('response.createTenant', response.createTenant)
          dispatch(setSelectedTenant(response.createTenant))

          try {
            const response = await writeData(updateUserPreferenceMutation(), { userPreference })
            if (response?.data?.updateUserPreference === null && response?.errors?.[0]?.message === 'Not found') {
              await writeData(createUserPreferenceMutation(), { userPreference })
              dispatch(createAlert({ message: 'User Preference Added successfully!', type: 'success' }))
            } else {
              dispatch(createAlert({ message: 'Preference Updated successfully!', type: 'success' }))
            }
            // dispatch(setPermissionByTenantId(response.createTenant.tenantId))
            clearReduxStore(dispatch)
          } catch (error) {
            console.error('Error updating user preference:', error)
          }
        }
        dispatch(createAlert({ message: 'Company created successfully !', type: 'success' }))
        router.push('/account-settings/company/')
      } else {
        setLoader(false)
        dispatch(createAlert({ message: 'Company creation failed  !', type: 'error' }))
      }
    } catch (error) {
      setLoader(false)

      throw error
    }
  }

  const handleCancel = () => {
    reset()
    router.push('/account-settings/company/')
  }

  // useEffect(() => {
  //   if (checkAuthorizedRoute(CREATE_TENANT, router, userProfile)) {
  //     setIsAuthorized(true)
  //   } else {
  //     setIsAuthorized(false)
  //   }
  // }, [userProfile])

  // if (!isAuthorized) {
  //   return null
  // }

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
            Add Company
          </Typography>
        }
        button={
          <IconButton
            variant='outlined'
            color='default'
            component={Link}
            scroll={true}
            href={`/account-settings/company/`}
          >
            <Close sx={{ color: theme => theme.palette.primary.main }} />
          </IconButton>
          // )
        }
      />
      <PageWrapper>
        <form onSubmit={handleSubmit(handleNewItemSave)}>
          <Grid container spacing={{ xs: 4, md: 6 }}>
            <Grid item xs={12} md={12}>
              <Box
                sx={{
                  width: '100%',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 4,
                  alignItems: 'center'
                }}
              >
                <UploadLogo
                  getValues={getValues}
                  setValue={setValue}
                  setIsEdit={setEditImg}
                  imgUploaded={imgUploaded}
                  editImg={editImg}
                  files={files}
                  setFiles={setFiles}
                  isEditComponent={isEditComponent}
                  accountNo={accounts?.accountNo}
                />

                <Box>
                  <Typography sx={{ fontSize: '14px', fontWeight: 500 }}>
                    This logo will be displayed in transaction PDFs and email notifications.
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={12}>
              <Grid container spacing={{ xs: 2, md: 3, lg: 3, xl: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Controller
                    name='displayName'
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        id='displayName'
                        fullWidth
                        label='Company Name'
                        error={Boolean(errors.displayName)}
                        {...(errors.displayName && { helperText: 'Company Name is required' })}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Controller
                    name='businessName'
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        id='businessName'
                        fullWidth
                        label='Business Name'
                        error={Boolean(errors.businessName)}
                        {...(errors.businessName && { helperText: 'Business Name is required' })}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Controller
                    name='currencyId'
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <CustomAutocomplete
                        {...field}
                        value={field.value}
                        onChange={(event, newValue) => {
                          field.onChange(newValue)
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
              </Grid>
            </Grid>
            <Grid item xs={12} md={12} id='primaryContact'>
              <FormLabel sx={{ fontSize: '15px', fontWeight: 500, lineHeight: '40px' }}>Primary Contact</FormLabel>
              <Grid container spacing={{ xs: 2, md: 3, lg: 3, xl: 3 }}>
                <Grid item xs={3} md={3}>
                  <Controller
                    name='primaryContact.title'
                    control={control}
                    rules={{ required: true }}
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
                    rules={{ required: true }}
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
                <Grid item xs={4.5} md={3}>
                  <Controller
                    name='primaryContact.lastName'
                    control={control}
                    rules={{ required: true }}
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
                    rules={{ required: true }}
                    render={({ field }) => (
                      <CustomTextField
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
                    name='mobile'
                    control={control}
                    rules={{ required: true }}
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
                <Grid item xs={12} sm={6} md={3}>
                  <Controller
                    name='workPhone'
                    control={control}
                    rules={{ required: true }}
                    render={({ field: { value, onChange } }) => (
                      <CustomPhoneInput
                        name='workPhone'
                        label='Work Phone'
                        value={value}
                        onChange={onChange}
                        // error={Boolean(errors.workPhone)}
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
                    render={({ field }) => (
                      <CustomTextField fullWidth label='Address Line 2' {...field} onChange={field.onChange} />
                    )}
                  />
                </Grid>
                <Grid item xs={6} sm={6} md={3}>
                  <Controller
                    name='address.cityOrTown'
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        fullWidth
                        label='City / Town'
                        error={Boolean(errors.address?.cityOrTown)}
                        {...(errors.address?.cityOrTown && { helperText: 'City is required' })}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={0} sm={6} md={3} sx={{ display: { xs: 'none', md: 'block' } }}></Grid>
                <Grid item xs={6} sm={6} md={3}>
                  <Controller
                    name='address.postcode'
                    control={control}
                    rules={{ required: true }}
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
                </Grid>{' '}
                <Grid item xs={12} sm={6} md={3}>
                  <Controller
                    name='address.country'
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <CustomAutocomplete
                        {...field}
                        options={countries}
                        getOptionLabel={option => option.name || ''}
                        getOptionSelected={(option, value) => {
                          return option.name === value.name
                        }}
                        isOptionEqualToValue={(option, value) => option.name === value?.name}
                        value={{ name: field.value }}
                        onChange={(event, newValue) => {
                          field.onChange(newValue?.name)
                          setDeliveryAddressCountry(newValue)
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
                    render={({ field }) => (
                      <CustomAutocomplete
                        {...field}
                        options={!deliveryAddressCountry?.states?.length <= 0 ? deliveryAddressCountry?.states : []}
                        getOptionLabel={option => option.name || ''}
                        getOptionSelected={(option, value) => {
                          return option.name === value.name
                        }}
                        isOptionEqualToValue={(option, value) => option.name === value?.name}
                        value={{ name: field.value }}
                        onChange={(event, newValue) => {
                          field.onChange(newValue?.name)
                        }}
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
                <Grid item xs={12} sx={{ padding: 0 }}>
                  <FormControlLabel
                    control={<Checkbox checked={checked} onChange={e => handleSameBillingAddress(e)} />}
                    label='Address Same As Billing Address'
                    size='small'
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12} lg={12} id='billingAddress'>
              <FormLabel sx={{ fontSize: '15px', fontWeight: 500, lineHeight: '40px' }}>Billing Address</FormLabel>
              <Grid container spacing={{ xs: 2, md: 3, lg: 3, xl: 3 }}>
                <Grid item xs={12} sm={12} md={3}>
                  <Controller
                    name='billingAddress.addressLine1'
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        fullWidth
                        label='Address Line 1'
                        error={Boolean(errors.billingAddress?.addressLine1)}
                        {...(errors.billingAddress?.addressLine1 && { helperText: ' Address Line 1 is required' })}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={12} md={3}>
                  <Controller
                    name='billingAddress.addressLine2'
                    control={control}
                    rules={{ required: false }}
                    render={({ field }) => (
                      <CustomTextField fullWidth label='Address Line 2' {...field} onChange={field.onChange} />
                    )}
                  />
                </Grid>
                <Grid item xs={6} sm={6} md={3}>
                  <Controller
                    name='billingAddress.cityOrTown'
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        fullWidth
                        label='City / Town'
                        error={Boolean(errors.billingAddress?.cityOrTown)}
                        {...(errors.billingAddress?.cityOrTown && { helperText: 'City is required' })}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={0} sm={6} md={3} sx={{ display: { xs: 'none', md: 'block' } }}></Grid>
                <Grid item xs={6} sm={6} md={3}>
                  <Controller
                    name='billingAddress.postcode'
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        fullWidth
                        label='Zip Code'
                        error={Boolean(errors.billingAddress?.postcode)}
                        {...(errors.billingAddress?.postcode && { helperText: 'ZIP Code is required' })}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Controller
                    name='billingAddress.country'
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <CustomAutocomplete
                        {...field}
                        options={countries}
                        getOptionLabel={option => option.name || ''}
                        getOptionSelected={(option, value) => {
                          return option.name === value.name
                        }}
                        isOptionEqualToValue={(option, value) => option.name === value?.name}
                        value={{ name: field.value }}
                        onChange={(event, newValue) => {
                          field.onChange(newValue?.name)
                          setBillingAddressCountry(newValue)
                          setValue('billingAddress.state', '')
                        }}
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
                    render={({ field }) => (
                      <CustomAutocomplete
                        {...field}
                        options={!billingAddressCountry?.states?.length <= 0 ? billingAddressCountry?.states : []}
                        getOptionLabel={option => option.name || ''}
                        getOptionSelected={(option, value) => {
                          return option.name === value.name
                        }}
                        isOptionEqualToValue={(option, value) => option.name === value?.name}
                        value={{ name: field.value }}
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
            <Grid item xs={12} md={12} lg={9}>
              <Grid container spacing={6}>
                <Grid item xs={12} md={6}>
                  <AttributesTable control={control} errors={errors} />
                </Grid>
              </Grid>
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

export default NewCompany
