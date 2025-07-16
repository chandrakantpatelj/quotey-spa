import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import PageHeader from 'src/@core/components/page-header'
import PageWrapper from 'src/@core/layouts/PageWrapper'
import {
  Typography,
  Button,
  IconButton,
  FormLabel,
  Grid,
  Box,
  FormHelperText,
  Snackbar,
  Alert,
  Backdrop,
  CircularProgress,
  LinearProgress
} from '@mui/material'
import { Close } from '@mui/icons-material'
import CustomTextField from 'src/@core/components/mui/text-field'
import { useDispatch, useSelector } from 'react-redux'
import { useForm, Controller } from 'react-hook-form'
import AttributesTable from 'src/@core/components/common-components/AttributesTable'
import CustomPhoneInput from 'src/common-components/CustomPhoneInput'
import Router, { useRouter } from 'next/router'
import { CreateTradingMutation } from 'src/@core/components/graphql/trading-queries'
import { writeData } from 'src/common-functions/GraphqlOperations'
import { createAlert } from 'src/store/apps/alerts'
import UploadLogo from 'src/views/forms/form-elements/custom-inputs/UploadLogo'
import { uploadImage } from 'src/views/forms/form-elements/custom-inputs/UploadImage'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import { SCHEMA_VERSION, CREATE_TRADING } from 'src/common-functions/utils/Constants'
import useCountries from 'src/hooks/getData/useCountries'
import { setAddTrading } from 'src/store/apps/tradings'
import { checkAuthorizedRoute } from 'src/common-functions/utils/UtilityFunctions'
import ErrorBoundary from 'src/pages/ErrorBoundary'

function NewTradings() {
  const dispatch = useDispatch()
  const router = useRouter()
  const userProfile = useSelector(state => state.userProfile)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [loader, setLoader] = React.useState(false)
  const tenant = useSelector(state => state.tenants?.selectedTenant) || {}
  const { tenantId = '' } = tenant || {}
  const { countries } = useCountries()
  const [loading, setLoading] = useState(true)
  const [editImg, setEditImg] = useState(false)
  const [imgUploaded, setImgUploaded] = useState(false)
  const [isEditComponent, setIsEditComponent] = React.useState(false)
  const [deletedImageUrl, setDeletedImageUrl] = useState('')
  const [tradingsObject, setTradingObject] = useState({})
  const [files, setFiles] = useState([])
  const accounts = useSelector(state => state.accounts?.data || [])

  async function getTradingData() {
    try {
      setLoading(true)
      const distructObject = {
        account: accounts
      }
      setTradingObject(distructObject)
    } catch (error) {
      console.error('Error fetching trading:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getTradingData()
  }, [tenantId])

  const tenantData = {
    schemaVersion: SCHEMA_VERSION,
    tradingName: '',
    businessName: '',
    emailAddress: '',
    mobile: '',
    logoImage: null,
    workPhone: '',
    address: {
      addressLine1: '',
      addressLine2: '',
      cityOrTown: '',
      state: tenant?.address?.state,
      postcode: '',
      country: tenant?.address?.country
    },
    attributes: []
  }

  const {
    reset,
    control,
    getValues,
    setValue,
    trigger,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: tenantData,
    mode: 'onChange'
  })

  const [open, setOpen] = useState(false)

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }

    setOpen(false)
  }

  const [addressCountry, setAddressCountry] = useState()
  function findObjectById(array, countryId) {
    return array.find(obj => obj.name === countryId)
  }

  useEffect(() => {
    setAddressCountry(findObjectById(countries, tenant?.address?.country))
  }, [countries, tenant])

  const check = () => {
    setOpen(true)
    const fieldName = Object.keys(errors)[0]
    const errName = document.getElementById(fieldName)
    errName?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
  }

  const handleNewItemSave = async newTrading => {
    setOpen(false)
    //setLoader(true)
    const tenantId = tenant?.tenantId
    const trading = newTrading
    try {
      const response = await writeData(CreateTradingMutation(), { tenantId, trading })
      if (response.createTrading) {
        await uploadImage(files, getValues('logoImage'), dispatch)
        dispatch(setAddTrading(response.createTrading))
        dispatch(createAlert({ message: 'Trading created successfully !', type: 'success' }))
        router.push('/account-settings/tradings/')
      } else {
        setLoader(false)
        dispatch(createAlert({ message: 'Trading creation failed  !', type: 'error' }))
      }
    } catch (error) {
      setLoader(false)

      throw error
    }
  }

  const handleCancel = () => {
    reset()
    router.push('/account-settings/tradings/')
  }

  useEffect(() => {
    if (checkAuthorizedRoute(CREATE_TRADING, router, userProfile)) {
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
            Add Trading Profile
          </Typography>
        }
        button={
          <IconButton
            variant='outlined'
            color='default'
            sx={{ fontSize: '21px' }}
            component={Link}
            scroll={true}
            href={`/account-settings/tradings/`}
          >
            <Close sx={{ color: theme => theme.palette.primary.main }} />
          </IconButton>
          // )
        }
      />
      <PageWrapper>
        {loading ? (
          <LinearProgress />
        ) : (
          <form onSubmit={handleSubmit(handleNewItemSave)}>
            <Grid container spacing={{ xs: 4, md: 8 }}>
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
                    accountNo={tradingsObject?.account.accountNo}
                  />

                  <Box>
                    <Typography sx={{ fontSize: '14px', fontWeight: 500 }}>
                      This logo will be displayed in transaction PDFs and email notifications.
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={9}>
                <Grid container spacing={{ xs: 2, md: 3, lg: 3, xl: 3 }}>
                  <Grid item xs={12} sm={6} lg={3}>
                    <Controller
                      name='tradingName'
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <CustomTextField
                          {...field}
                          id='tradingName'
                          fullWidth
                          label='Trading Name'
                          error={Boolean(errors.tradingName)}
                          {...(errors.tradingName && { helperText: 'Trading Name is required' })}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} lg={3}>
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
                </Grid>
              </Grid>
              <Grid item xs={12} md={9}>
                <FormLabel sx={{ fontSize: '15px', fontWeight: 500, lineHeight: '40px' }}>Primary Contact</FormLabel>
                <Grid container spacing={{ xs: 2, md: 3, lg: 3, xl: 3 }}>
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
                          label='Phone'
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

              <Grid item xs={12} md={9} id='address'>
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
                  <Grid item xs={13} sm={6} md={3}>
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
                            setAddressCountry(newValue)
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
                          options={!addressCountry?.states?.length <= 0 ? addressCountry?.states : []}
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
    </ErrorBoundary>
  )
}

export default NewTradings
