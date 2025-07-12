// ** Next Import
import Link from 'next/link'
import Router from 'next/router'
import React, { useEffect, useState } from 'react'
import PageHeader from 'src/@core/components/page-header'
import PageWrapper from 'src/@core/layouts/PageWrapper'
import {
  Box,
  IconButton,
  Typography,
  MenuItem,
  Grid,
  FormLabel,
  Button,
  FormHelperText,
  FormControlLabel,
  Checkbox,
  Snackbar,
  Alert,
  Backdrop,
  CircularProgress,
  LinearProgress
} from '@mui/material'
import CustomTextField from 'src/@core/components/mui/text-field'
import { Close } from '@mui/icons-material'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import AttributesTable from 'src/@core/components/common-components/AttributesTable'
import EditPhoneInput from 'src/common-components/EditPhoneInput'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import TaxationTable from 'src/@core/components/common-components/TaxationTable'
import UploadLogo from 'src/views/forms/form-elements/custom-inputs/UploadLogo'
import { fetchImage, trimStrings } from 'src/common-functions/utils/UtilityFunctions'
import { createAlert } from 'src/store/apps/alerts'
import { writeData } from 'src/common-functions/GraphqlOperations'
import { updateTenantMutation } from 'src/@core/components/graphql/company-queries'
import { deleteImage } from 'src/views/forms/form-elements/custom-inputs/DeleteImage'
import { uploadImage } from 'src/views/forms/form-elements/custom-inputs/UploadImage'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import { setUpdateTenant } from 'src/store/apps/company'
import useCurrencies from 'src/hooks/getData/useCurrencies'
import useCountries from 'src/hooks/getData/useCountries'

export default function EditCompany({ tenantsObject, loading }) {
  const router = Router
  const dispatch = useDispatch()
  const [checked, setChecked] = useState(false)

  const tenant = useSelector(state => state.tenants?.actionSelectedTenant) || {}
  const { currencies } = useCurrencies()
  const { countries } = useCountries()
  const { tradings = [], account = {} } = tenantsObject || {}

  const [deliveryAddressCountry, setDeliveryAddressCountry] = useState({})
  const [billingAddressCountry, setBillingAddressCountry] = useState({})
  const [editImg, setEditImg] = useState(false)
  const [imgUploaded, setImgUploaded] = useState(false)
  const [isEditComponent, setIsEditComponent] = React.useState(true)
  const [files, setFiles] = useState([])
  const [imageUrl, setImageUrl] = React.useState(null)

  useEffect(() => {
    setDeliveryAddressCountry(countries?.find(item => item?.name === tenant?.address?.country) || {})
    setBillingAddressCountry(countries?.find(item => item?.name === tenant?.billingAddress?.country) || {})
  }, [countries, tenant])

  useEffect(() => {
    tenant?.logoImage && fetchImage(setImageUrl, tenant?.logoImage?.key, setImgUploaded)
  }, [tenant])
  const [loader, setLoader] = React.useState(false)

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
    defaultValues: {
      ...tenant,
      currencyId: currencies?.find(item => item?.currencyId === tenant?.currencyId) || {}
    },
    mode: 'onChange'
  })

  const useInfo = watch('useTradingInfo')

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
  const handleEditTenantSave = async newCompany => {
    setOpen(false)
    setLoader(true)
    const currencyId = newCompany?.currencyId?.currencyId
    const updateData = { ...newCompany, currencyId: currencyId }
    const updateTenant = updateData
    delete updateTenant.accountId
    const tenantId = updateTenant.tenantId
    delete updateTenant.tenantId
    delete updateTenant.tenantNo
    delete updateTenant.createdDateTime
    delete updateTenant.createdBy
    delete updateTenant.modifiedDateTime
    delete updateTenant.modifiedBy
    try {
      const response = await writeData(updateTenantMutation(), { tenantId, tenant: updateTenant })
      if (response.updateTenant) {
        dispatch(setUpdateTenant(response.updateTenant))

        if (tenant.logoImage !== null && response?.updateTenant?.logoImage?.key !== tenant?.logoImage?.key) {
          await deleteImage(tenant?.logoImage?.key)
        }
        await uploadImage(files, getValues('logoImage'), dispatch)

        dispatch(createAlert({ message: 'Company Updated  successfully !', type: 'success' }))
        router.push('/account-settings/company/')
      } else {
        dispatch(createAlert({ message: 'Company Updation  failed !', type: 'error' }))
      }
      return response
    } catch (error) {
      // Handle any errors and optionally dispatch an error action
      throw error
    }
  }

  const handleSameBillingAddress = e => {
    setChecked(e.target.checked)
    const checked = e.target.checked

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
  // Null check for tenant and its properties
  const addressObject = tenant?.address || {}
  const billingAddressObject = tenant?.billingAddress || {}

  useEffect(() => {
    setChecked(JSON.stringify(billingAddressObject) === JSON.stringify(addressObject))
  }, [billingAddressObject, addressObject])

  const billingAddress = useWatch({ control, name: 'billingAddress' })
  const address = useWatch({ control, name: 'address' })

  const areAddressesSame = (a, b) => {
    return JSON.stringify(trimStrings(a)) === JSON.stringify(trimStrings(b))
  }

  useEffect(() => {
    setChecked(areAddressesSame(billingAddress, address))
  }, [billingAddress, address])

  return (
    <div>
      <PageHeader
        title={
          <Typography
            sx={{
              fontSize: { xs: '15px', md: '18px' },
              fontWeight: '500'
            }}
          >
            {`Edit Company - ${tenant?.tenantNo}`}{' '}
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
              href={`/account-settings/company/add-company`}
            >
              Add New
            </Button>
            <IconButton
              variant='outlined'
              color='default'
              sx={{ fontSize: '21px' }}
              component={Link}
              scroll={true}
              href='/account-settings/company/'
            >
              <Close sx={{ color: theme => theme.palette.primary.main }} />
            </IconButton>
          </Box>
        }
      />
      <PageWrapper>
        {loading ? (
          <LinearProgress />
        ) : (
          <form onSubmit={handleSubmit(handleEditTenantSave)}>
            <Grid container spacing={{ xs: 4, md: 6 }}>
              <Grid item xs={12} md={12}>
                <Box
                  sx={{
                    width: '100%',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 4,
                    alignItems: 'center',
                    mb: 3
                  }}
                >
                  <UploadLogo
                    selectedTenant={getValues('logoImage')}
                    imageUrl={imageUrl}
                    setValue={setValue}
                    setIsEdit={setEditImg}
                    imgUploaded={imgUploaded}
                    editImg={editImg}
                    files={files}
                    setFiles={setFiles}
                    isEditComponent={isEditComponent}
                    accountNo={account?.accountNo}
                  />

                  <Box>
                    <Typography variant='h6'>
                      {' '}
                      This logo will be displayed in transaction PDFs and email notifications.{' '}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={12}>
                <Grid container spacing={{ xs: 2, md: 3, lg: 3, xl: 3 }}>
                  <Grid item xs={12} sm={6} md={6} lg={3}>
                    <Controller
                      name='displayName'
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <CustomTextField
                          id='displayName'
                          {...field}
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
                          id='businessName'
                          {...field}
                          fullWidth
                          label='Business Name'
                          error={Boolean(errors.businessName)}
                          {...(errors.businessName && { helperText: 'Business Name is required' })}
                        />
                      )}
                    />
                    {/* <Box sx={{ display: 'flex', gap: 1, mt: 1, alignItems: 'center' }}>
                        <Checkbox size='small' sx={{ p: '0px' }} />
                        <Typography sx={{ fontSize: '13px' }}>Use Trading Name</Typography>
                        <Controller
                          name='tradingId'
                          control={control}
                          rules={{ required: false }}
                          render={({ field }) => (
                            <CustomAutocomplete
                              {...field}
                              options={tradings}
                              getOptionLabel={option => option.tradingName || ''}
                              value={tradings.find(option => option.tradingId === field.value) || null}
                              onChange={(event, newValue) => {
                                field.onChange(newValue?.tradingId || '')
                              }}
                              // getOptionSelected={(option, value) => {
                              //   return option.tradingId === value.tradingId
                              // }}
                              // isOptionEqualToValue={(option, value) => option.tradingId === value?.tradingId}
                              sx={{ flexGrow: 1 }}
                              renderInput={params => <CustomTextField {...params} fullWidth label='' />}
                            />
                          )}
                        />
                      </Box> */}
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
              <Grid item xs={12} md={12}>
                <Grid container spacing={{ xs: 2, md: 3, lg: 3, xl: 3 }}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <Controller
                        name='useTradingInfo'
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <Checkbox
                            sx={{ p: '0px' }}
                            checked={value}
                            onChange={event => {
                              onChange(event.target.checked)
                              if (event.target.checked === false) {
                                setValue('tradingId', null)
                              } else setValue('tradingId', tradings[0]?.tradingId || '')
                            }}
                          />
                        )}
                      />
                      <Typography sx={{ fontSize: '13px' }}>Use Trading Name</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    {useInfo ? (
                      <Controller
                        name='tradingId'
                        control={control}
                        rules={{ required: false }}
                        render={({ field }) => (
                          <CustomAutocomplete
                            {...field}
                            options={tradings}
                            getOptionLabel={option => option.tradingName || ''}
                            value={tradings.find(option => option.tradingId === field.value) || null}
                            onChange={(event, newValue) => {
                              field.onChange(newValue ? newValue.tradingId : null)
                              if (newValue === null) {
                                setValue('useTradingInfo', null)
                              }
                            }}
                            sx={{ flexGrow: 1 }}
                            renderInput={params => <CustomTextField {...params} fullWidth label='Trading Name' />}
                          />
                        )}
                      />
                    ) : null}
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} md={12} id='primaryContact'>
                <FormLabel sx={{ fontSize: '15px', fontWeight: 500, lineHeight: '40px' }}>Primary Contact</FormLabel>
                <Grid container spacing={{ xs: 2, md: 3, lg: 3, xl: 3 }}>
                  <Grid item xs={3} sm={6} md={3}>
                    <Controller
                      name='primaryContact.title'
                      control={control}
                      rules={{ required: false }}
                      render={({ field }) => (
                        <CustomTextField select {...field} fullWidth size='small' label='Title' {...field}>
                          <MenuItem value='Mr'>Mr</MenuItem>
                          <MenuItem value='Ms'>Ms</MenuItem>
                          <MenuItem value='Miss'>Miss</MenuItem>
                          <MenuItem value='Dr'>Dr</MenuItem>
                        </CustomTextField>
                      )}
                    />
                  </Grid>
                  <Grid item xs={4.5} sm={6} md={3}>
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
                  <Grid item xs={4.5} sm={6} md={3}>
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
                      name='workPhone'
                      control={control}
                      rules={{ required: true }}
                      render={({ field: { value, onChange } }) => (
                        <EditPhoneInput
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
                  <Grid item xs={12} sm={6} md={3}>
                    <Controller
                      name='mobile'
                      control={control}
                      rules={{ required: true }}
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
                  </Grid>
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
                            setValue('address.state', '')
                            setDeliveryAddressCountry(newValue)
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
                      sx={{ fontSize: '13px' }}
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
                          {...(errors.billingAddress?.postcode && { helperText: 'Post Code is required' })}
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
                            setValue('billingAddress.state', '')
                            setBillingAddressCountry(newValue)
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
              <Button
                variant='contained'
                type='submit'
                onClick={check}
                // onClick={() => {
                //   router.push('/account-settings/company/')
                // }}
              >
                Save
              </Button>
              <Button
                variant='outlined'
                component={Link}
                scroll={true}
                href='/account-settings/company/'
                type='reset'
                onClick={() => reset()}
              >
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
      {loader ? (
        <Backdrop sx={{ color: '#fff', zIndex: theme => theme.zIndex.drawer + 1 }} open={loader}>
          <CircularProgress color='inherit' />
        </Backdrop>
      ) : null}
    </div>
  )
}
