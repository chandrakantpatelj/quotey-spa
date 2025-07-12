// ** Next Import
import Link from 'next/link'
import Router from 'next/router'
import React, { useState, useEffect } from 'react'
import {
  Box,
  IconButton,
  Typography,
  Grid,
  FormLabel,
  Button,
  FormHelperText,
  MenuItem,
  Snackbar,
  Alert,
  Backdrop,
  CircularProgress
} from '@mui/material'
import CustomTextField from 'src/@core/components/mui/text-field'
import { preference } from 'src/@fake-db/autocomplete'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import { useDispatch, useSelector } from 'react-redux'
import EditPhoneInput from 'src/common-components/EditPhoneInput'
import PageHeader from 'src/@core/components/page-header'
import { Close } from '@mui/icons-material'
import { writeData } from 'src/common-functions/GraphqlOperations'
import PageWrapper from 'src/@core/layouts/PageWrapper'
import { useForm, Controller } from 'react-hook-form'
import { createAlert } from 'src/store/apps/alerts'
import { updateVendorMutation } from 'src/@core/components/graphql/vendor-queries'
import CustomFilesUpload from 'src/views/forms/form-elements/custom-inputs/CustomFilesUpload'
import { UploadMultipleFileS3Api } from 'src/views/forms/form-elements/custom-inputs/UploadMultipleFileS3Api'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import DeleteUploadFile from 'src/views/forms/form-elements/custom-inputs/DeleteUploadFile'
import { fetchPdfFile } from 'src/common-functions/utils/UtilityFunctions'
import { VENDOR_PDF } from 'src/common-functions/utils/Constants'
import { setUpdateVendor } from 'src/store/apps/vendors'
import useCountries from 'src/hooks/getData/useCountries'
import useCurrencies from 'src/hooks/getData/useCurrencies'
import usePaymentTerms from 'src/hooks/getData/usePaymnetTerms'
import useVendors from 'src/hooks/getData/useVendors'

export default function EditVendor() {
  const router = Router
  const dispatch = useDispatch()
  const tenantId = useSelector(state => state.tenants?.selectedTenant.tenantId)

  const selectedVendor = useSelector(state => state?.vendors?.selectedVendor) || {}
  const { vendors } = useVendors(tenantId)

  const { currencies } = useCurrencies()
  const { paymentTerms } = usePaymentTerms()
  const { countries } = useCountries()
  const [selectedPdFile, setSelectedPdFile] = useState([])
  const [deletedPdFiles, setDeletedPdFiles] = useState([])
  const [vendorData, setVendorsData] = useState(selectedVendor || '')
  const tenant = useSelector(state => state.tenants?.selectedTenant)

  const [loader, setLoader] = React.useState(false)

  // useEffect(() => {
  //   reset({
  //     ...vendorData,
  //     currencyId:
  //       currencies?.find(item => {
  //         return item?.currencyId === vendorData?.currencyId
  //       }) || ''
  //   })
  // }, [currencies, vendorData])

  useEffect(() => {
    if (Object.keys(selectedVendor).length === 0) {
      router.push('/purchases/vendors/')
    }
  }, [selectedVendor, tenant])

  const [billingAddressCountry, setBillingAddressCountry] = useState()

  // let billingAddressCountry = countries?.find(item => item?.name === vendorData?.billingAddress?.country) || {}

  useEffect(() => {
    setValue('billingAddress.country', vendorData?.billingAddress?.country)
    setValue('billingAddress.state', vendorData?.billingAddress?.state)
    setBillingAddressCountry(countries?.find(item => item?.name === vendorData?.billingAddress?.country) || {})
  }, [tenant, countries])

  const {
    reset,
    control,
    setValue,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: vendorData,
    mode: 'onChange'
  })

  useEffect(() => {
    selectedVendor?.files?.length > 0 &&
      selectedVendor?.files.map(item => {
        setDeletedPdFiles(prev => [...prev, item])
        fetchPdfFile(setSelectedPdFile, item)
      })
  }, [selectedVendor])

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

  const handleNewVendorSave = async editvendor => {
    setOpen(false)
    setLoader(true)
    const {
      vendorId,
      tenantId,
      vendorNo,
      createdDateTime,
      vendorNoPrefix,
      currencyId: { currencyId },
      ...vendorDetails
    } = editvendor

    const vendor = {
      ...vendorDetails,
      currencyId
    }

    try {
      const response = await writeData(updateVendorMutation(), { tenantId, vendorId, vendor })
      if (response.updateVendor) {
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
        dispatch(setUpdateVendor(response.updateVendor))
        dispatch(createAlert({ message: 'Vendor Updated  successfully !', type: 'success' }))
        router.push('/purchases/vendors/')
      } else {
        const errorMessage = response?.errors?.[0] ? response.errors[0].message : 'Vendor Updation  failed !'
        setLoader(false)
        dispatch(createAlert({ message: errorMessage, type: 'error' }))
      }
    } catch (error) {
      // Handle any errors and optionally dispatch an error action
      setLoader(false)
      dispatch(createAlert({ message: 'Vendor Updation  failed !', type: 'error' }))
    }
  }

  return (
    <React.Fragment>
      <PageHeader
        title={
          <Typography
            sx={{
              fontSize: { xs: '16px', md: '18px' },
              fontWeight: '500'
            }}
          >
            {`Edit Vendor - ${vendorData?.vendorNo}`}
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
              href={`/purchases/vendors/add-vendor`}
            >
              Add New
            </Button>
            <IconButton
              variant='outlined'
              color='default'
              sx={{ fontSize: '21px' }}
              component={Link}
              scroll={true}
              href='/purchases/vendors/'
            >
              <Close sx={{ color: theme => theme.palette.primary.main }} />
            </IconButton>
          </Box>
        }
      />

      <PageWrapper>
        <form onSubmit={handleSubmit(handleNewVendorSave)}>
          <Grid container spacing={{ xs: 4, md: 8 }}>
            <Grid item xs={12} md={12}>
              <Grid container spacing={{ xs: 2, md: 3, lg: 3, xl: 3 }}>
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
                    rules={{ required: true }}
                    render={({ field }) => (
                      <CustomTextField
                        id='displayName'
                        {...field}
                        fullWidth
                        label='Vendor Name'
                        error={Boolean(errors.displayName)}
                        {...(errors.displayName && { helperText: 'Display Name is required' })}
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
                <Grid item xs={4.5} md={3}>
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
                <Grid item xs={4.5} md={3}>
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
                        {...(errors.primaryContact?.lastName && { helperText: 'Last Name is required' })}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={0} md={3} sx={{ display: { xs: 'none', md: 'block' } }}></Grid>

                <Grid item xs={12} sm={12} md={3}>
                  <Controller
                    name='emailAddress'
                    control={control}
                    rules={{ required: false }}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        fullWidth
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
              <FormLabel sx={{ fontSize: '15px', fontWeight: 500, lineHeight: '40px' }}> Billing Address</FormLabel>
              <Grid container spacing={{ xs: 2, md: 3, lg: 3, xl: 3 }}>
                <Grid item xs={12} sm={12} md={3}>
                  <Controller
                    name='billingAddress.addressLine1'
                    control={control}
                    rules={{ required: false }}
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

                <Grid item xs={12} sm={6} md={3}>
                  <Controller
                    name='billingAddress.postcode'
                    control={control}
                    rules={{ required: false }}
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

                <Grid item xs={12} sm={6} md={3}>
                  <Controller
                    name='billingAddress.cityOrTown'
                    control={control}
                    rules={{ required: false }}
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

                <Grid item xs={12} sm={6} md={3}>
                  <Controller
                    name='billingAddress.country'
                    control={control}
                    rules={{ required: false }}
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
                        renderInput={params => (
                          <CustomTextField
                            {...params}
                            label='Select Country'
                            fullWidth
                            error={Boolean(errors.billingAddress?.country)}
                            {...(errors.billingAddress?.country && { helperText: 'Country is required' })}
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
                    render={({ field }) => {
                      const selectedState =
                        billingAddressCountry?.states?.find(state => state.name === field.value) || null

                      return (
                        <CustomAutocomplete
                          {...field}
                          disableClearable={false} // Allow clearing for better control
                          options={billingAddressCountry?.states || []}
                          getOptionLabel={option => option.name || ''}
                          isOptionEqualToValue={(option, value) => option.name === value?.name}
                          value={selectedState}
                          onChange={(event, newValue) => {
                            field.onChange(newValue ? newValue.name : '') // Clear the value if null
                          }}
                          onInputChange={(event, newInputValue) => {
                            if (newInputValue === '') {
                              field.onChange('') // Ensure clearing works with backspace
                            }
                          }}
                          onBlur={field.onBlur} // Ensure proper blur handling
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
                      )
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} md={12}>
              <FormLabel sx={{ fontSize: '15px', fontWeight: 500, lineHeight: '40px' }}>Other Details</FormLabel>
              <Grid container spacing={{ xs: 2, md: 3, lg: 3, xl: 3 }}>
                <Grid item xs={6} sm={6} md={3}>
                  <Controller
                    name='preferredShippingVendorId'
                    control={control}
                    // rules={{ required: 'Preferred shipping vendor is required' }}
                    render={({ field, fieldState: { error } }) => (
                      <CustomAutocomplete
                        id='preferredShippingVendorId'
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
                            error={Boolean(errors.currencyId)}
                            {...(errors.currencyId && { helperText: 'Currency is required' })}
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
                    rules={{ required: false }}
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
                          renderInput={params => (
                            <CustomTextField
                              {...params}
                              id='paymentTerms'
                              label='Payment Term'
                              error={Boolean(errors.paymentTermsId)}
                              {...(errors.paymentTermsId && { helperText: 'Payment Term is required' })}
                            />
                          )}
                        />
                      )
                    }}
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
              marginTop: { xs: '30px', sm: '50px' }
            }}
          >
            <Button variant='contained' type='submit' onClick={check}>
              Save
            </Button>
            <Button
              variant='outlined'
              LinkComponent={Link}
              href='/purchases/vendors/'
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
  )
}
