import Link from 'next/link'
import Router from 'next/router'
import React, { useEffect, useMemo, useState } from 'react'

import { Close } from '@mui/icons-material'
import {
  Alert,
  Backdrop,
  Box,
  Button,
  Card,
  CircularProgress,
  FormHelperText,
  Grid,
  IconButton,
  LinearProgress,
  Snackbar,
  Typography
} from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { createSalesInvoicePaymentMutation } from 'src/@core/components/graphql/sales-payment-queries'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import CustomTextField from 'src/@core/components/mui/text-field'
import PageHeader from 'src/@core/components/page-header'
import PageWrapper from 'src/@core/layouts/PageWrapper'
import AddCustomerPopup from 'src/common-components/AddCustomerPopup'
import { writeData } from 'src/common-functions/GraphqlOperations'
import {
  CREATE_SALES_PAYMENT,
  PaymentTypes,
  SALES_INVOICE_PAYMENT_PDF,
  SCHEMA_VERSION
} from 'src/common-functions/utils/Constants'
import {
  checkAuthorizedRoute,
  findObjectByCurrencyId,
  getAdornmentConfig,
  getOnFocusConfig,
  parseDate,
  safeNumber
} from 'src/common-functions/utils/UtilityFunctions'
import useCurrencies from 'src/hooks/getData/useCurrencies'
import useCustomers from 'src/hooks/getData/useCustomers'
import usePaymentMethods from 'src/hooks/getData/usePaymentMethods'
import useSalesOrders from 'src/hooks/getData/useSalesOrders'
import ErrorBoundary from 'src/pages/ErrorBoundary'
import { createAlert } from 'src/store/apps/alerts'
import { setSelectedCustomer } from 'src/store/apps/customers'
import { setAddSalesPayment } from 'src/store/apps/payments'
import CustomFilesUpload from 'src/views/forms/form-elements/custom-inputs/CustomFilesUpload'
import { UploadMultipleFileS3Api } from 'src/views/forms/form-elements/custom-inputs/UploadMultipleFileS3Api'
import CustomDatePicker from 'src/views/forms/form-elements/pickers/CustomDatePicker'
import CustomerViewSection from 'src/views/sales/customer/CustomerViewSection'

function NewPayment() {
  const router = Router
  const dispatch = useDispatch()
  const tenant = useSelector(state => state.tenants?.selectedTenant) || {}
  const { tenantId = '' } = tenant

  const { currencies } = useCurrencies()
  const { paymentMethods } = usePaymentMethods(tenantId)

  const [customerCurrency, setCustomerCurrency] = useState({})
  const customerAdornmentConfig = getAdornmentConfig(customerCurrency)
  const userProfile = useSelector(state => state.userProfile)

  const [isAuthorized, setIsAuthorized] = useState(false)
  const [open, setOpen] = useState(false)
  const [loader, setLoader] = React.useState(false)
  const [selectedPdFile, setSelectedPdFile] = useState([])
  const { customers, fetchCustomers } = useCustomers(tenantId)
  const { salesOrders, fetchSalesOrders, reloadSalesOrderInStore } = useSalesOrders(tenantId)
  const [loading, setLoading] = useState(false)

  const filterPaymentMethods = useMemo(
    () => paymentMethods.filter(method => method.paymentMethod != 'Loan'),
    [paymentMethods]
  )

  useEffect(() => {
    if (!tenantId) return
    const loadCustomers = async () => {
      await fetchCustomers()
      await fetchSalesOrders()
    }

    loadCustomers()
  }, [tenantId, fetchCustomers, fetchSalesOrders])

  function handleClose(event, reason) {
    if (reason === 'clickaway') {
      return
    }
    setOpen(false)
  }

  const defaultData = {
    schemaVersion: SCHEMA_VERSION,
    paymentDate: new Date(),
    customerId: '',
    currency: '',
    paymentType: PaymentTypes[0],
    paymentMethod: null,
    sourceSalesOrderId: null,
    sourceSalesInvoiceId: null,
    referenceNo: '',
    amount: 0.0,
    description: '',
    files: [],
    notes: ''
  }

  const {
    watch,
    reset,
    control,
    setValue,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: defaultData,
    mode: 'onChange'
  })

  const customer = watch('customerId')

  const check = () => {
    setOpen(true)
    const fieldName = Object.keys(errors)[0]
    const errName = document.getElementById(fieldName)
    errName?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
  }

  const [isAddNewModalOpen, setIsAddNewModalOpen] = useState(false)

  const handleAddNewCustomer = () => {
    setIsAddNewModalOpen(true)
  }

  const handleNewPaymentSave = async newPayment => {
    setOpen(false)
    setLoader(true)
    const payment = {
      ...newPayment,
      amount: safeNumber(newPayment?.amount),
      customerId: newPayment?.customerId?.customerId,
      paymentDate: parseDate(newPayment?.paymentDate),
      sourceSalesOrderId: newPayment?.sourceSalesOrderId.orderId || null,
      sourceSalesInvoiceId: newPayment?.sourceSalesOrderId?.salesInvoiceId || null
    }
    try {
      const response = await writeData(createSalesInvoicePaymentMutation(), { tenantId, payment })
      if (response.createSalesInvoicePayment) {
        if (selectedPdFile || selectedPdFile?.length !== 0 || selectedPdFile[0]) {
          await UploadMultipleFileS3Api(selectedPdFile, dispatch)
        }
        dispatch(setAddSalesPayment(response.createSalesInvoicePayment))
        await reloadSalesOrderInStore(response?.createSalesInvoicePayment?.sourceSalesOrderId ?? null)

        dispatch(createAlert({ message: 'Payment created successfully !', type: 'success' }))
        router.push('/sales/payments/')
      } else {
        setLoader(false)
        dispatch(createAlert({ message: 'Payment creation failed  !', type: 'error' }))
      }
    } catch (error) {
      console.error('error', error)
      setLoader(false)
      reset(newPayment)
    }
  }

  const handleCancel = () => {
    router.push('/sales/payments/')
    reset()
  }

  useEffect(() => {
    if (checkAuthorizedRoute(CREATE_SALES_PAYMENT, router, userProfile)) {
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
            New Payment
          </Typography>
        }
        button={
          <IconButton variant='outlined' color='default' component={Link} scroll={true} href={`/sales/payments`}>
            <Close sx={{ color: theme => theme.palette.primary.main }} />
          </IconButton>
          // )
        }
      />
      <PageWrapper>
        {loading ? (
          <LinearProgress />
        ) : (
          <Grid container spacing={{ xs: 6, md: 8, xl: 10 }}>
            <Grid item xs={12} md={3} lg={4} xl={4}>
              <form onSubmit={handleSubmit(handleNewPaymentSave)}>
                <Grid container spacing={4}>
                  {/* <Grid item xs={12} sm={12} md={6} lg={6}>
                    <Controller
                      name='paymentType'
                      control={control}
                      rules={{ required: false }}
                      render={({ field }) => (
                        <CustomAutocomplete
                          id='paymentType'
                          {...field}
                          options={PaymentTypes}
                          getOptionLabel={option => option || ''}
                          onChange={(e, newValue) => {
                            field.onChange(newValue)
                          }}
                          renderInput={params => (
                            <CustomTextField
                              {...params}
                              fullWidth
                              label='Payment Type'
                              error={Boolean(errors.paymentType)}
                              {...(errors.paymentType && { helperText: 'Payment type is required' })}
                            />
                          )}
                        />
                      )}
                    />
                  </Grid> */}
                  <Grid item xs={12} sm={6} md={12} lg={6}>
                    <Controller
                      name='paymentDate'
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <CustomDatePicker
                          disabled={false}
                          label={'Date'}
                          fullWidth={true}
                          date={field?.value ? new Date(field.value) : new Date()}
                          onChange={field.onChange}
                          error={Boolean(errors?.paymentDate)}
                        />
                      )}
                    />
                    {errors?.paymentDate && <FormHelperText error>Order Date is required</FormHelperText>}
                  </Grid>
                  <Grid item xs={12} sm={6} md={12} lg={6}>
                    <Controller
                      name='customerId'
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <CustomAutocomplete
                          id='customerId'
                          {...field}
                          getOptionLabel={option => {
                            if (typeof option === 'string') {
                              return option
                            } else
                              return `${option?.customerNoPrefix || ''}  ${option?.customerNo || ''} - ${
                                option?.customerName || ''
                              }`
                          }}
                          onChange={(e, newValue) => {
                            dispatch(setSelectedCustomer(newValue))
                            // if (newValue?.customerId === 'add-new') {
                            //   handleAddNewCustomer()
                            //   return
                            // }
                            field.onChange(newValue)
                            const currency = findObjectByCurrencyId(currencies, newValue?.currencyId)
                            setCustomerCurrency(currency)
                            setValue('currency', currency?.currencyId)
                          }}
                          // getOptionLabel={option => option?.customerName || ''}

                          isOptionEqualToValue={(option, value) => option.customerId === value.customerId}
                          renderOption={(props, option) => {
                            // Check if the option is "Add New Customer"
                            if (option?.customerId === 'add-new') {
                              return (
                                <li
                                  {...props}
                                  style={{ display: 'flex', justifyContent: 'center', fontWeight: 'bold' }}
                                >
                                  <Button
                                    variant='contained'
                                    color='primary'
                                    sx={{ width: '100%' }}
                                    onClick={handleAddNewCustomer}
                                  >
                                    + Add New
                                  </Button>
                                </li>
                              )
                            }

                            // Normal customer option rendering
                            return (
                              <li {...props}>
                                {option?.customerNoPrefix || ''}
                                {option?.customerNo || ''}-{option?.customerName || ''}
                              </li>
                            )
                          }}
                          options={[{ customerName: 'Add New', customerId: 'add-new' }, ...customers]}
                          renderInput={params => (
                            <CustomTextField
                              {...params}
                              label='Customer'
                              error={Boolean(errors.customerId)}
                              {...(errors.customerId && { helperText: 'Customer is required' })}
                            />
                          )}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={12} lg={6}>
                    <Controller
                      name='paymentMethod'
                      control={control}
                      rules={{ required: 'Payment Method is required' }}
                      render={({ field, fieldState: { error } }) => (
                        <CustomAutocomplete
                          {...field}
                          value={filterPaymentMethods.find(method => method.paymentMethodId === field.value)}
                          onChange={(e, newValue) => {
                            field.onChange(newValue?.paymentMethodId)
                          }}
                          options={filterPaymentMethods || []}
                          getOptionLabel={option => option?.paymentMethod || ''}
                          isOptionEqualToValue={(option, value) => option.paymentMethod === value.paymentMethod}
                          renderInput={params => (
                            <CustomTextField
                              id='paymentMethod'
                              {...params}
                              label='Payment Method'
                              error={Boolean(error)}
                              helperText={error?.message}
                            />
                          )}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={12} lg={6}>
                    <Controller
                      name='referenceNo'
                      control={control}
                      render={({ field }) => <CustomTextField {...field} fullWidth label='Reference No' />}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={12} lg={6}>
                    <Controller
                      name='amount'
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <CustomTextField
                          {...field}
                          fullWidth
                          label='Amount'
                          InputProps={{
                            ...getOnFocusConfig(field, 0),
                            ...customerAdornmentConfig
                          }}
                          error={Boolean(errors.amount)}
                          {...(errors.amount && { helperText: 'Amount is required' })}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={12} lg={6}>
                    <Controller
                      name='sourceSalesOrderId'
                      control={control}
                      rules={{ required: false }}
                      render={({ field }) => (
                        <CustomAutocomplete
                          id='sourceSalesOrderId'
                          {...field}
                          value={salesOrders.find(order => order.orderId === field.value)}
                          onChange={(event, newValue) => {
                            field.onChange(newValue)
                          }}
                          options={salesOrders || []}
                          isOptionEqualToValue={(option, value) => option.orderId === value.orderId}
                          getOptionLabel={option => `${option?.orderNo || ''}`}
                          renderOption={(props, option) => {
                            const customer = customers?.find(val => val?.customerId === option?.customerId)
                            return (
                              <Box component='li' {...props} key={option?.orderId}>
                                {`${option?.orderNo} (${customer?.customerName})`}
                              </Box>
                            )
                          }}
                          renderInput={params => <CustomTextField {...params} label='Sales Order' />}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Controller
                      name='description'
                      control={control}
                      render={({ field: { value, onChange } }) => (
                        <CustomTextField
                          fullWidth
                          label='Description'
                          multiline
                          minRows={2}
                          value={value}
                          onChange={onChange}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Controller
                      name='notes'
                      control={control}
                      render={({ field: { value, onChange } }) => (
                        <CustomTextField
                          fullWidth
                          label='Notes'
                          multiline
                          minRows={2}
                          value={value}
                          onChange={onChange}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <CustomFilesUpload
                      setValue={setValue}
                      selectedPdFile={selectedPdFile}
                      setSelectedPdFile={setSelectedPdFile}
                      SALES_INVOICE_PAYMENT_PDF
                      folderName={SALES_INVOICE_PAYMENT_PDF}
                    />
                  </Grid>
                </Grid>

                <Box
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: { xs: 'center', sm: 'start' },
                    gap: { xs: '10px', md: '20px' },
                    marginTop: { xs: '20px', sm: '30px' }
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
            </Grid>
            {customer?.customerId && (
              <Grid item xs={0} md={9} lg={8} xl={8} sx={{ display: { xs: 'none', md: 'block' } }}>
                <Card sx={{ p: 6, width: '100%' }}>
                  <Box sx={{ mb: 5 }}>
                    <Alert severity='info' sx={{ color: 'rgba(0,0,0,0.8)' }}>
                      Customer Details
                    </Alert>
                  </Box>
                  <CustomerViewSection customerId={customer?.customerId} defaultTab='transactions' />
                </Card>
              </Grid>
            )}
          </Grid>
        )}
      </PageWrapper>{' '}
      {isAddNewModalOpen && <AddCustomerPopup open={isAddNewModalOpen} setOpen={setIsAddNewModalOpen} />}
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

export default NewPayment
