// ** Next Import
import Link from 'next/link'
import * as React from 'react'
import Router from 'next/router'
import { useState, useEffect } from 'react'
import {
  Box,
  IconButton,
  Typography,
  MenuItem,
  Grid,
  FormLabel,
  Button,
  FormHelperText,
  Snackbar,
  Alert,
  CircularProgress,
  Backdrop
} from '@mui/material'
import CustomTextField from 'src/@core/components/mui/text-field'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import { useDispatch, useSelector } from 'react-redux'
import AttributesTable from 'src/@core/components/common-components/AttributesTable'
import EditPhoneInput from 'src/common-components/EditPhoneInput'
import PageWrapper from 'src/@core/layouts/PageWrapper'
import PageHeader from 'src/@core/components/page-header'
import { Close } from '@mui/icons-material'
import { useForm, Controller } from 'react-hook-form'
import { UpdateWareHouseMutation } from 'src/@core/components/graphql/warehouses-queries'
import { writeData } from 'src/common-functions/GraphqlOperations'
import { createAlert } from 'src/store/apps/alerts'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import { setUpdateWarehouse } from 'src/store/apps/warehouses'
import useCountries from 'src/hooks/getData/useCountries'

export default function EditWarehouse() {
  const dispatch = useDispatch()
  const route = Router
  const [loader, setLoader] = React.useState(false)

  const tenant = useSelector(state => state.tenants?.selectedTenant) || {}
  const [deliveryAddressCountry, setDeliveryAddressCountry] = useState({})
  const { countries } = useCountries()

  const selecedWarehouse = useSelector(state => state.warehouses?.selectedWarehouse) || []
  const [wareHouseData, setWareHouseData] = useState({ ...selecedWarehouse })
  function findObjectById(array, countryId) {
    return array.find(obj => obj.name === countryId)
  }

  useEffect(() => {
    setDeliveryAddressCountry(findObjectById(countries, tenant?.address?.country))
  }, [countries, tenant])

  useEffect(() => {
    if (Object.keys(selecedWarehouse).length === 0) {
      route.push('/account-settings/warehouses/')
    }
  }, [selecedWarehouse, tenant])

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
    setWareHouseData(selecedWarehouse)
  }, [selecedWarehouse])

  const [open, setOpen] = useState(false)

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }

    setOpen(false)
  }

  // const check = () => {
  //   setOpen(true)
  // }

  const handleUpdateWarehouse = async editWareHouse => {
    setLoader(true)

    const {
      warehouseId,
      tenantId,
      warehouseNo,
      createdDateTime,
      modifiedBy,
      modifiedDateTime,
      createdBy,

      ...warehouseDetails
    } = editWareHouse

    const payload = {
      ...warehouseDetails
    }

    const warehouse = payload
    try {
      const response = await writeData(UpdateWareHouseMutation(), { tenantId, warehouseId, warehouse })
      if (response.updateWarehouse) {
        dispatch(setUpdateWarehouse(response.updateWarehouse))
        dispatch(createAlert({ message: 'Warehouse Updated  successfully !', type: 'success' }))
        route.push('/account-settings/warehouses/')
      } else {
        dispatch(createAlert({ message: 'Warehouse Updation  failed !', type: 'error' }))
      }
      return response
    } catch (error) {
      // Handle any errors and optionally dispatch an error action
      throw error
    } finally {
      setLoader(false)
      setOpen(false)
    }
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
              {`Edit WareHouse - ${wareHouseData?.warehouseNo}`}{' '}
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
                href={`/account-settings/warehouses/add-warehouse`}
              >
                Add New
              </Button>
              <IconButton
                variant='outlined'
                color='default'
                sx={{ fontSize: '21px' }}
                component={Link}
                scroll={true}
                href='/account-settings/warehouses/'
              >
                <Close sx={{ color: theme => theme.palette.primary.main }} />
              </IconButton>
            </Box>
          }
        />
        <PageWrapper>
          <form onSubmit={handleSubmit(handleUpdateWarehouse)}>
            <Grid container spacing={{ xs: 4, md: 8 }}>
              <Grid item xs={12} md={12}>
                <Grid container spacing={{ xs: 2, md: 3, lg: 3, xl: 3 }}>
                  <Grid item xs={12} sm={6} md={3}>
                    {' '}
                    <Controller
                      name='name'
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <CustomTextField
                          {...field}
                          id='name'
                          fullWidth
                          label='Name'
                          error={Boolean(errors.name)}
                          {...(errors.name && { helperText: 'Name is required' })}
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
                      render={({ field }) => (
                        <CustomTextField select {...field} fullWidth size='small' label='Title' {...field}>
                          <MenuItem value='Mr'>Mr</MenuItem>
                          <MenuItem value='Ms'>Ms</MenuItem>.<MenuItem value='Miss'>Miss</MenuItem>
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
                        <EditPhoneInput name='workPhone' label='Work Phone' value={value} onChange={onChange} />
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
                  <Grid item xs={0} sm={6} md={3} sx={{ display: { xs: 'none', md: 'block' } }}></Grid>

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

                  <Grid item xs={12} sm={6} md={3}>
                    <Controller
                      name='address.country'
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <CustomAutocomplete
                          {...field}
                          options={countries}
                          disableClearable
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
                </Grid>
              </Grid>
              <Grid item xs={12} md={4.5}>
                <AttributesTable control={control} errors={errors} data={wareHouseData} setData={setWareHouseData} />
              </Grid>
            </Grid>
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: { xs: 'center', sm: 'start' },
                gap: '20px',
                marginTop: { xs: '20px', sm: '40px' }
              }}
            >
              <Button
                variant='contained'
                type='submit'
                // onClick={check}
                // onClick={() => {
                //   router.push('/account-settings/warehouses/')
                // }}
              >
                Save
              </Button>
              <Button
                variant='outlined'
                component={Link}
                scroll={true}
                href='/account-settings/warehouses/'
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
      </React.Fragment>
      {loader ? (
        <Backdrop sx={{ color: '#fff', zIndex: theme => theme.zIndex.drawer + 1 }} open={loader}>
          <CircularProgress color='inherit' />
        </Backdrop>
      ) : null}
    </div>
  )
}
