// ** Next Import
import Link from 'next/link'
import Router from 'next/router'
import React, { useEffect, useMemo, useState } from 'react'
import {
  Box,
  IconButton,
  Typography,
  Grid,
  Button,
  FormHelperText,
  Snackbar,
  Alert,
  Backdrop,
  CircularProgress,
  RadioGroup,
  FormControlLabel,
  Radio,
  LinearProgress
} from '@mui/material'
import CustomTextField from 'src/@core/components/mui/text-field'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import { useDispatch, useSelector } from 'react-redux'
import PageHeader from 'src/@core/components/page-header'
import { Close } from '@mui/icons-material'
import PageWrapper from 'src/@core/layouts/PageWrapper'
import { useForm, Controller } from 'react-hook-form'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import CustomDatePicker from 'src/views/forms/form-elements/pickers/CustomDatePicker'
import StockAdjustmentItemsTable from './StockAdjustmentItemsTable'
import { UpdateStockAdjustmentMutation } from 'src/@core/components/graphql/stock-adjustment-queries'
import { writeData } from 'src/common-functions/GraphqlOperations'
import { createAlert } from 'src/store/apps/alerts'
import { setUpdateStock } from 'src/store/apps/stock-adjustments'
import { STATUS_CONFIRMED, STATUS_DRAFT } from 'src/common-functions/utils/Constants'

export default function EditStockAdustment({ loading, adjutmentsData }) {
  const router = Router
  const dispatch = useDispatch()
  const tenantId = useSelector(state => state.tenants?.selectedTenant.tenantId)

  const { products, warehouses, currencies, generalStockAdujstmentSettings } = adjutmentsData
  const selectedStock = useSelector(state => state.stockAdjustments?.selectedStock)
  let currency = currencies.find(cur => cur?.currencyId === selectedStock?.currency)
  const [status, setStatus] = useState('')

  const adjustData = {
    ...selectedStock,
    warehouseId: warehouses?.find(item => item?.warehouseId === selectedStock?.warehouseId)
  }

  const [loader, setLoader] = useState(false)

  useEffect(() => {
    if (Object.keys(selectedStock).length === 0) {
      router.push('/inventory/stock-adjustments/')
    }
  }, [selectedStock, tenantId])

  const {
    reset,
    control,
    setValue,
    watch,
    getValues,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: adjustData,
    mode: 'onChange'
  })

  let typeValue = watch('stockMovement')

  const reasons = useMemo(
    () => generalStockAdujstmentSettings?.find(item => item?.stockMovement === typeValue)?.reasons || [],
    [typeValue, generalStockAdujstmentSettings]
  )

  const [open, setOpen] = useState(false)
  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }
    setOpen(false)
  }

  const check = status => {
    setOpen(true)
    setStatus(status)
    const fieldName = Object.keys(errors)[0]
    const errName = document.getElementById(fieldName)
    errName?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
  }

  const handleAdjustStockSubmit = async editData => {
    setOpen(false)
    setLoader(true)
    const { stockAdjustmentId, tenantId, adjustmentNoPrefix, adjustmentNo, subTotal, totalQty, ...data } = editData

    const stockAdjustment = {
      ...data,
      status: status,

      warehouseId: data?.warehouseId?.warehouseId,
      adjustmentItems: editData?.adjustmentItems?.map(
        ({ enableDimension, enablePackingUnit, dimensions, packingUnits, ...rest }) => rest
      )
    }

    try {
      const response = await writeData(UpdateStockAdjustmentMutation(), {
        tenantId,
        stockAdjustmentId,
        stockAdjustment
      })
      if (response.updateStockAdjustment) {
        dispatch(setUpdateStock(response.updateStockAdjustment))
        dispatch(createAlert({ message: 'Stock adjustment updated successfully.', type: 'success' }))
        router.push('/inventory/stock-adjustments/')
      } else {
        setLoader(false)
        dispatch(createAlert({ message: 'Failed to update stock adjustment.', type: 'error' }))
      }
    } catch (error) {
      setLoader(false)
      dispatch(createAlert({ message: 'Failed to update stock adjustment.', type: 'error' }))
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
              Edit Stock Adjustment - {selectedStock?.adjustmentNo}
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
                href={`/inventory/stock-adjustments/new`}
              >
                New
              </Button>
              <IconButton
                variant='outlined'
                color='default'
                sx={{ fontSize: '21px' }}
                component={Link}
                scroll={true}
                href='/inventory/stock-adjustments/'
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
                  <Grid container spacing={{ xs: 2, md: 3 }}>
                    <Grid item xs={6} sm={4} md={3}>
                      <Controller
                        name='adjustmentDate'
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                          <CustomDatePicker
                            label={'Date'}
                            fullWidth={true}
                            date={new Date(field.value)}
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
                            disableClearable
                            value={warehouses?.length === 1 ? warehouses[0] : field?.value}
                            onChange={(e, newValue) => {
                              field.onChange(newValue)
                            }}
                            renderOption={(props, option) => {
                              return (
                                <li {...props} key={option.warehouseId}>
                                  {option.name}
                                </li>
                              )
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
                            renderInput={params => <CustomTextField {...params} label='Select Reason' fullWidth />}
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
                  products={products}
                  currency={currency}
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
                {selectedStock?.status !== STATUS_CONFIRMED && (
                  <Button variant='contained' type='submit' onClick={() => check(STATUS_CONFIRMED)}>
                    Save as Confirmed
                  </Button>
                )}

                <Button
                  variant='outlined'
                  LinkComponent={Link}
                  href='/inventory/stock-adjustments/'
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
