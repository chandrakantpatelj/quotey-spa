import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useMemo, useEffect, useState } from 'react'
import {
  Typography,
  IconButton,
  Grid,
  Box,
  Button,
  FormHelperText,
  Snackbar,
  Alert,
  Backdrop,
  CircularProgress,
  RadioGroup,
  FormControlLabel,
  Radio
} from '@mui/material'
import CustomTextField from 'src/@core/components/mui/text-field'
import PageHeader from 'src/@core/components/page-header'
import PageWrapper from 'src/@core/layouts/PageWrapper'
import { Close } from '@mui/icons-material'
import { useDispatch, useSelector } from 'react-redux'
import { useForm, Controller } from 'react-hook-form'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import ErrorBoundary from 'src/pages/ErrorBoundary'
import CustomDatePicker from 'src/views/forms/form-elements/pickers/CustomDatePicker'
import useWarehouses from 'src/hooks/getData/useWarehouses'
import StockAdjustmentItemsTable from 'src/views/inventory/stockAdjutments/StockAdjustmentItemsTable'
import useProducts from 'src/hooks/getData/useProducts'
import { writeData } from 'src/common-functions/GraphqlOperations'
import { createAlert } from 'src/store/apps/alerts'
import { CreateStockAdjustmentMutation } from 'src/@core/components/graphql/stock-adjustment-queries'
import { setAddStock } from 'src/store/apps/stock-adjustments'
import usestockAdjustmentSettings from 'src/hooks/getData/useStockAdjustmentSettings'
import { checkAuthorizedRoute } from 'src/common-functions/utils/UtilityFunctions'
import { CREATE_STOCK, STATUS_CONFIRMED, STATUS_DRAFT } from 'src/common-functions/utils/Constants'

function NewAdjustStock() {
  const router = useRouter()
  const dispatch = useDispatch()

  const tenant = useSelector(state => state.tenants?.selectedTenant)
  const { tenantId = '' } = tenant

  const { products, fetchProducts } = useProducts(tenantId)
  const { warehouses } = useWarehouses(tenantId)
  const { generalStockAdujstmentSettings = [] } = usestockAdjustmentSettings(tenantId)
  const currency = useSelector(state => state?.currencies?.selectedCurrency)

  const [loader, setLoader] = React.useState(false)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [status, setStatus] = useState('')

  const userProfile = useSelector(state => state.userProfile)
  const [open, setOpen] = useState(false)

  const defaultData = {
    schemaVersion: '1.0',
    adjustmentDate: new Date(),
    warehouseId: warehouses.length === 1 ? warehouses[0] : null,
    reference: '',
    stockMovement: 'INWARD',
    currency: currency,
    adjustmentItems: [
      {
        itemId: '',
        itemCodePrefix: '',
        itemCode: '',
        itemName: '',
        itemDescription: '',
        itemDimension: {
          length: 0,
          width: 0,
          height: 0,
          qty: 0
        },
        packingUnit: {
          unit: '',
          description: '',
          qtyPerUnit: 0,
          qty: 0
        },
        qty: 0.0,
        uom: '',
        totalValue: 0.0,
        currency: ''
      }
    ],
    status: 'DRAFT',
    reason: '',
    notes: ''
  }

  const {
    reset,
    control,
    handleSubmit,
    setValue,
    watch,
    getValues,
    formState: { errors }
  } = useForm({
    defaultValues: defaultData,
    mode: 'onChange'
  })

  let typeValue = watch('stockMovement')
  const reasons = useMemo(
    () => generalStockAdujstmentSettings?.find(item => item?.stockMovement === typeValue)?.reasons || [],
    [typeValue, generalStockAdujstmentSettings]
  )

  useEffect(() => {
    if (checkAuthorizedRoute(CREATE_STOCK, router, userProfile)) {
      fetchProducts()
      setIsAuthorized(true)
    } else {
      setIsAuthorized(false)
    }
  }, [tenantId, userProfile, fetchProducts])

  if (!isAuthorized) {
    return null
  }

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }

    setOpen(false)
  }

  const check = status => {
    setStatus(status)

    setOpen(true)
    const fieldName = Object.keys(errors)[0]
    const errName = document.getElementById(fieldName)
    errName?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
  }
  const handleAdjustStockSubmit = async newData => {
    setOpen(false)
    setLoader(true)
    const tenantId = tenant?.tenantId

    const { totalQty, subTotal, ...data } = newData

    const stockAdjustment = {
      ...data,
      status: status,
      currency: data?.currency?.currencyId,
      warehouseId: data?.warehouseId?.warehouseId,
      adjustmentItems: newData?.adjustmentItems?.map(
        ({ enableDimension, enablePackingUnit, dimensions, packingUnits, ...rest }) => rest
      )
    }
    try {
      const response = await writeData(CreateStockAdjustmentMutation(), { tenantId, stockAdjustment })
      if (response.createStockAdjustment) {
        dispatch(setAddStock(response.createStockAdjustment))
        dispatch(createAlert({ message: 'Stock adjustment created successfully.', type: 'success' }))
        router.push('/inventory/stock-adjustments/')
      } else {
        setLoader(false)
        dispatch(createAlert({ message: 'Failed to create stock adjustment.', type: 'error' }))
      }
      return response
    } catch (error) {
      // Handle any errors and optionally dispatch an error action
      console.log('error: ', error)
      setLoader(false)
    }
  }

  const handleCancel = () => {
    router.push('/inventory/stock-adjustments/')
    reset()
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
            New Stock Adjustment
          </Typography>
        }
        button={
          <IconButton
            variant='outlined'
            color='default'
            sx={{ fontSize: '21px' }}
            component={Link}
            scroll={true}
            href={`/inventory/stock-adjustments/`}
          >
            <Close sx={{ color: theme => theme.palette.primary.main }} />
          </IconButton>
          // )
        }
      />
      <PageWrapper>
        <form onSubmit={handleSubmit(handleAdjustStockSubmit)}>
          <Grid container spacing={{ xs: 6 }}>
            <Grid item xs={12} sm={12} md={6}>
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: { xs: 'wrap', sm: 'nowrap' },
                  alignItems: 'center',
                  gap: { xs: 0, sm: 3 }
                }}
              >
                <Controller
                  name='stockMovement'
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <RadioGroup
                      row
                      name='stockMovement'
                      value={field?.value}
                      onChange={(e, newValue) => {
                        field?.onChange(newValue)
                        setValue('reason', null)
                      }}
                    >
                      <FormControlLabel value={'INWARD'} control={<Radio />} label='Inward Stock' />
                      <FormControlLabel value={'OUTWARD'} control={<Radio />} label='Outward Stock' />
                    </RadioGroup>
                  )}
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={12} xl={9.5}>
              <Grid container spacing={{ xs: 2, md: 3, lg: 3, xl: 3 }}>
                <Grid item xs={6} sm={4} md={3}>
                  <Controller
                    name='adjustmentDate'
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <CustomDatePicker
                        label={'Date'}
                        fullWidth={true}
                        date={field.value}
                        onChange={field.onChange}
                        error={Boolean(errors?.adjustmentDate)}
                      />
                    )}
                  />
                  {errors?.adjustmentDate && <FormHelperText error> Date is required</FormHelperText>}
                </Grid>
                <Grid item xs={6} sm={4} md={3}>
                  <Controller
                    name='warehouseId'
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <CustomAutocomplete
                        {...field}
                        options={warehouses}
                        getOptionLabel={option => option?.name || ''}
                        renderOption={(props, option) => {
                          return (
                            <li {...props} key={option.warehouseId}>
                              {option.name}
                            </li>
                          )
                        }}
                        disableClearable
                        onChange={(e, newValue) => {
                          field.onChange(newValue)
                        }}
                        renderInput={params => (
                          <CustomTextField
                            {...params}
                            label='Select Warehouse'
                            fullWidth
                            error={Boolean(errors.warehouseId)}
                            {...(errors.warehouseId && { helperText: 'Warehouse is required' })}
                          />
                        )}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={6} sm={4} md={3}>
                  <Controller
                    name='reason'
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <CustomAutocomplete
                        {...field}
                        options={reasons}
                        getOptionLabel={option => option?.reasonName || null}
                        value={reasons?.find(item => item?.reasonCode === field?.value) || null}
                        renderOption={(props, option) => {
                          return (
                            <li {...props} key={option.reasonCode}>
                              {option.reasonName}
                            </li>
                          )
                        }}
                        disableClearable
                        onChange={(e, newValue) => {
                          field.onChange(newValue?.reasonCode)
                        }}
                        renderInput={params => (
                          <CustomTextField
                            {...params}
                            label='Select Reason'
                            fullWidth
                            error={Boolean(errors.reason)}
                            {...(errors.reason && { helperText: 'Reason is required' })}
                          />
                        )}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={6} sm={4} md={3}>
                  <Controller
                    name='reference'
                    control={control}
                    rules={{ required: false }}
                    render={({ field }) => <CustomTextField {...field} fullWidth label='Reference' />}
                  />{' '}
                </Grid>
              </Grid>
            </Grid>

            <StockAdjustmentItemsTable
              control={control}
              currency={currency}
              products={products}
              setValue={setValue}
              getValues={getValues}
            />
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
            <Button variant='contained' type='submit' onClick={() => check(STATUS_DRAFT)}>
              Save
            </Button>
            <Button variant='contained' type='submit' onClick={() => check(STATUS_CONFIRMED)}>
              Save as Confirmed
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

export default NewAdjustStock
