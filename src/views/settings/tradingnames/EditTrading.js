// ** Next Import
import Link from 'next/link'
import Router from 'next/router'
import React, { useEffect, useMemo, useState } from 'react'
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
  Snackbar,
  Alert,
  Backdrop,
  CircularProgress,
  LinearProgress
} from '@mui/material'
import CustomTextField from 'src/@core/components/mui/text-field'
import { Close } from '@mui/icons-material'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import EditPhoneInput from 'src/common-components/EditPhoneInput'
import { writeData } from 'src/common-functions/GraphqlOperations'
import AttributesTable from 'src/@core/components/common-components/AttributesTable'
import { useForm, Controller } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { createAlert } from 'src/store/apps/alerts'
import UploadLogo from 'src/views/forms/form-elements/custom-inputs/UploadLogo'
import { fetchImage } from 'src/common-functions/utils/UtilityFunctions'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import { uploadImage } from 'src/views/forms/form-elements/custom-inputs/UploadImage'
import { UpdateTradingMutation } from 'src/@core/components/graphql/trading-queries'
import { deleteImage } from 'src/views/forms/form-elements/custom-inputs/DeleteImage'
import useCountries from 'src/hooks/getData/useCountries'
import { setUpdateTrading } from 'src/store/apps/tradings'

export default function EditTrading({ tradingsObject, loading }) {
  const route = Router
  const dispatch = useDispatch()
  const tenantId = useSelector(state => state.tenants?.selectedTenant?.tenantId)
  const { countries } = useCountries()
  const account = useSelector(state => state.accounts?.data || {})

  const selecedTrading = useSelector(state => state?.tradings?.selectedTrading)
  const [deliveryAddressCountry, setDeliveryAddressCountry] = useState({})
  const [editImg, setEditImg] = useState(false)
  const [imgUploaded, setImgUploaded] = useState(false)
  const [isEditComponent, setIsEditComponent] = React.useState(true)
  const [files, setFiles] = useState([])
  const [imageUrl, setImageUrl] = React.useState(null)

  useEffect(() => {
    if (Object.keys(selecedTrading).length === 0) {
      route.push('/account-settings/tradings/')
    }
  }, [selecedTrading, tenantId])

  useEffect(() => {
    setDeliveryAddressCountry(countries?.find(item => item?.name === selecedTrading?.address?.country) || {})
  }, [countries, selecedTrading])

  useEffect(() => {
    selecedTrading?.logoImage && fetchImage(setImageUrl, selecedTrading?.logoImage?.key, setImgUploaded)
  }, [selecedTrading])
  const [loader, setLoader] = React.useState(false)
  const {
    reset,
    control,
    getValues,
    setValue,
    trigger,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: selecedTrading,
    mode: 'onChange'
  })

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
  const handleEditTradingSave = async editTrading => {
    setOpen(false)
    setLoader(true)
    const trading = editTrading
    delete trading.tradingId
    delete trading.tenantId
    delete trading.tradingNo
    delete trading.createdDateTime
    delete trading.modifiedDateTime
    delete trading.createdBy
    delete trading.modifiedBy
    delete trading.tradingNoPrefix

    const tradingId = selecedTrading?.tradingId
    try {
      const response = await writeData(UpdateTradingMutation(), { tenantId, tradingId, trading })
      if (response.updateTrading) {
        if (
          selecedTrading.logoImage !== null &&
          response?.updateTrading?.logoImage?.key !== selecedTrading?.logoImage?.key
        ) {
          await deleteImage(selecedTrading?.logoImage?.key)
        }
        await uploadImage(files, getValues('logoImage'), dispatch)
        dispatch(setUpdateTrading(response.updateTrading))
        dispatch(createAlert({ message: 'Trading Updated successfully !', type: 'success' }))
        route.push('/account-settings/tradings/')
      } else {
        setLoader(false)
        dispatch(createAlert({ message: 'Trading Updated failed  !', type: 'error' }))
      }
      return response
    } catch (error) {
      setLoader(false)
      throw error
    }
  }

  return (
    <div>
      <React.Fragment>
        <PageHeader
          title={
            <Typography
              sx={{
                fontSize: { xs: '15px', md: '18px' },
                fontWeight: '500'
              }}
            >
              {` Edit Trading Profile - ${selecedTrading?.tradingNo}`}{' '}
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
                href={`/account-settings/tradings/add-trading`}
              >
                Add New
              </Button>
              <IconButton
                variant='outlined'
                color='default'
                sx={{ fontSize: '21px' }}
                component={Link}
                scroll={true}
                href='/account-settings/tradings/'
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
            <form onSubmit={handleSubmit(handleEditTradingSave)}>
              <Grid container spacing={{ xs: 6 }}>
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
                <Grid item xs={12} md={9}>
                  <Grid container spacing={{ xs: 2, md: 3, lg: 3, xl: 3 }}>
                    <Grid item xs={12} sm={6} lg={3}>
                      <Controller
                        name='tradingName'
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                          <CustomTextField
                            id='tradingName'
                            {...field}
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
                <Grid item xs={12} md={9} id='primaryContact'>
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
                    <Grid item xs={12} sm={6} lg={3}>
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
                    <Grid item xs={12} sm={6} lg={3}>
                      <Controller
                        name='address.addressLine2'
                        control={control}
                        rules={{ required: false }}
                        render={({ field }) => (
                          <CustomTextField fullWidth label='Address Line 2' {...field} onChange={field.onChange} />
                        )}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6} lg={3}>
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
                    <Grid item xs={12} sm={6} lg={3}>
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
                    <Grid item xs={12} sm={6} lg={3}>
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
                    <Grid item xs={12} sm={6} lg={3}>
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
                  </Grid>
                </Grid>
                <Grid item xs={12} md={12} lg={9}>
                  <Grid container spacing={6}>
                    {' '}
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
                  //   router.push('/account-settings/tradings/')
                  // }}
                >
                  Save
                </Button>
                <Button
                  variant='outlined'
                  component={Link}
                  scroll={true}
                  href='/account-settings/tradings/'
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
      </React.Fragment>
    </div>
  )
}
