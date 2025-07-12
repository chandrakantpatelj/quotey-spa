import Link from 'next/link'
import Router from 'next/router'

import { useState, useEffect } from 'react'
import PageHeader from 'src/@core/components/page-header'
import PageWrapper from 'src/@core/layouts/PageWrapper'
import { Close } from '@mui/icons-material'
import {
  Typography,
  Button,
  IconButton,
  FormLabel,
  Grid,
  Box,
  MenuItem,
  FormHelperText,
  Snackbar,
  Alert,
  Backdrop,
  CircularProgress
} from '@mui/material'
import CustomTextField from 'src/@core/components/mui/text-field'
import { useDispatch, useSelector } from 'react-redux'
import AttributesTable from 'src/@core/components/common-components/AttributesTable'
import { useForm, Controller } from 'react-hook-form'
import CustomPhoneInput from 'src/common-components/CustomPhoneInput'
import { writeData } from 'src/common-functions/GraphqlOperations'
import { CreateWareHouseMutation } from 'src/@core/components/graphql/warehouses-queries'
import { createAlert } from 'src/store/apps/alerts'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import { setAddWarehouse } from 'src/store/apps/warehouses'
import useCountries from 'src/hooks/getData/useCountries'
import { checkAuthorizedRoute } from 'src/common-functions/utils/UtilityFunctions'
import { CREATE_WAREHOUSE } from 'src/common-functions/utils/Constants'
import ErrorBoundary from 'src/pages/ErrorBoundary'

function Warehouses() {
  const router = Router
  const dispatch = useDispatch()
  const [loader, setLoader] = useState(false)
  const tenant = useSelector(state => state.tenants?.selectedTenant)
  const { countries } = useCountries()
  const userProfile = useSelector(state => state.userProfile)

  const [isAuthorized, setIsAuthorized] = useState(false)
  const { tenantId } = tenant || ''

  function findObjectById(array, countryId) {
    return array.find(obj => obj.name === countryId)
  }

  const [deliveryAddressCountry, setDeliveryAddressCountry] = useState([])
  useEffect(() => {
    setDeliveryAddressCountry(findObjectById(countries, tenant?.address?.country))
  }, [countries, tenant])

  const [wareHouseData, setWareHouseData] = useState({
    schemaVersion: '1.0',
    name: '',
    primaryContact: {
      title: '',
      firstName: '',
      lastName: ''
    },
    emailAddress: '',
    workPhone: '',
    mobile: '',
    address: {
      addressLine1: '',
      addressLine2: '',
      cityOrTown: '',
      state: tenant?.address?.state,
      postcode: '',
      country: tenant?.address?.country
    },
    attributes: [
      // {
      //   key: '',
      //   value: ''
      // }
    ]
  })

  const {
    reset,
    control,
    setValue,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: wareHouseData,
    mode: 'onChange'
  })

  useEffect(() => {
    setValue('address.country', tenant?.address?.country)
    setValue('address.state', tenant?.address?.state)
    setDeliveryAddressCountry(findObjectById(countries, tenant?.address?.country))
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
    const fieldName = Object.keys(errors)[0]
    const errName = document.getElementById(fieldName)
    errName?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
  }

  const handleNewWareHousesSave = async newwarehouse => {
    setOpen(false)
    setLoader(true)
    const tenantId = tenant?.tenantId
    const warehouse = newwarehouse
    try {
      const response = await writeData(CreateWareHouseMutation(), { tenantId, warehouse })
      if (response.createWarehouse) {
        dispatch(createAlert({ message: 'Warehouse created successfully !', type: 'success' }))
        dispatch(setAddWarehouse(response.createWarehouse))
        router.push('/account-settings/warehouses/')
      } else {
        dispatch(createAlert({ message: 'Warehouse creation failed  !', type: 'error' }))
      }
      return response
    } catch (error) {
      throw error
    } finally {
      setLoader(false)
    }
    // setIsList(!isList)
    // reset()
  }

  const handleCancel = () => {
    router.push('/account-settings/warehouses/')
    reset()
  }

  useEffect(() => {
    if (checkAuthorizedRoute(CREATE_WAREHOUSE, router, userProfile)) {
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
            Add Warehouse
          </Typography>
        }
        button={
          <IconButton
            variant='outlined'
            color='default'
            sx={{ fontSize: '21px' }}
            component={Link}
            scroll={true}
            href={`/account-settings/warehouses/`}
          >
            <Close sx={{ color: theme => theme.palette.primary.main }} />
          </IconButton>
          // )
        }
      />
      <PageWrapper>
        <form onSubmit={handleSubmit(handleNewWareHousesSave)}>
          <Grid container spacing={{ xs: 4, md: 8 }}>
            <Grid item xs={12} md={12}>
              {/* <Grid container > */}
              <Grid item xs={12} sm={6} md={3}>
                <Controller
                  name='name'
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <CustomTextField
                      fullWidth
                      id='name'
                      {...field}
                      label='Name'
                      error={Boolean(errors.name)}
                      {...(errors.name && { helperText: 'Name is required' })}
                    />
                  )}
                />{' '}
                {/* </Grid> */}
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
                    render={({ field }) => (
                      <CustomTextField
                        select
                        fullWidth
                        {...field}
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
              </Grid>
            </Grid>
            <Grid item xs={12} md={12} id='address'>
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

                <Grid item xs={12} sm={6} md={3}>
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
                <Grid item xs={0} sm={6} md={3} sx={{ display: { xs: 'none', md: 'block' } }}></Grid>
                <Grid item xs={12} sm={6} md={3}>
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
                        {...(errors.address?.cityOrTown && { helperText: 'City / Town is required' })}
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
                        disableClearable
                        options={countries}
                        getOptionLabel={option => option.name || ''}
                        getoptionselected={(option, value) => {
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
                        disableClearable
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
              marginTop: { xs: '20px', sm: '50px' }
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

export default Warehouses
