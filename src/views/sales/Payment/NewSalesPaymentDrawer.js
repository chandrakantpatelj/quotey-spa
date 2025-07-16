'use client'
import {
  Alert,
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Drawer,
  FormHelperText,
  Grid,
  IconButton,
  Snackbar,
  Typography
} from '@mui/material'
import { useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { createSalesInvoicePaymentMutation } from 'src/@core/components/graphql/sales-payment-queries'
import Icon from 'src/@core/components/icon'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import CustomTextField from 'src/@core/components/mui/text-field'
import { writeData } from 'src/common-functions/GraphqlOperations'
import { PaymentTypes, SALES_INVOICE_PAYMENT_PDF, SCHEMA_VERSION } from 'src/common-functions/utils/Constants'
import {
  findObjectByCurrencyId,
  getAdornmentConfig,
  getOnFocusConfig,
  parseDate,
  safeNumber
} from 'src/common-functions/utils/UtilityFunctions'
import useCurrencies from 'src/hooks/getData/useCurrencies'
import usePaymentMethods from 'src/hooks/getData/usePaymentMethods'
import useSalesOrders from 'src/hooks/getData/useSalesOrders'
import { createAlert } from 'src/store/apps/alerts'
import { setAddSalesPayment } from 'src/store/apps/payments'
import CustomFilesUpload from 'src/views/forms/form-elements/custom-inputs/CustomFilesUpload'
import { UploadMultipleFileS3Api } from 'src/views/forms/form-elements/custom-inputs/UploadMultipleFileS3Api'
import CustomDatePicker from 'src/views/forms/form-elements/pickers/CustomDatePicker'

function NewSalesPaymentDrawer({ setOpenDrawer, openDrawer, setReloadPayment, order, customer }) {
  const dispatch = useDispatch()

  const tenant = useSelector(state => state.tenants?.selectedTenant)
  const { tenantId } = tenant || ''
  const { currencies } = useCurrencies()
  const { paymentMethods } = usePaymentMethods(tenantId)
  const [selectedPdFile, setSelectedPdFile] = useState([])
  const [open, setOpen] = useState(false)
  const [loader, setLoader] = useState(false)
  const { reloadSalesOrderInStore } = useSalesOrders(tenantId)
  const currency = findObjectByCurrencyId(currencies, customer?.currencyId)
  const customerAdornmentConfig = getAdornmentConfig(currency)

  const filterPaymentMethods = useMemo(
    () => paymentMethods.filter(method => method.paymentMethod != 'Loan'),
    [paymentMethods]
  )
  const defaultData = {
    schemaVersion: SCHEMA_VERSION,
    paymentDate: new Date(),
    customerId: customer?.customerId,
    currency: customer?.currencyId,
    paymentType: PaymentTypes[0],
    paymentMethod: null,
    referenceNo: '',
    amount: order?.totalAmount,
    sourceSalesInvoiceId: order?.salesInvoiceId || null,
    sourceSalesOrderId: order?.orderId || null,
    description: '',
    files: [],
    notes: ''
  }

  const {
    reset,
    control,
    setValue,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: defaultData,
    mode: 'onChange'
  })

  function handleClose(event, reason) {
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

  const toggleDrawer = open => event => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return
    }
    setOpenDrawer(open)
  }

  const handleCancel = () => {
    setOpenDrawer(false)
    reset()
  }

  const handleNewPaymentSave = async newPayment => {
    setOpen(false)
    setLoader(true)
    const payment = {
      ...newPayment,
      amount: safeNumber(newPayment?.amount),
      customerId: newPayment?.customerId,
      paymentDate: parseDate(newPayment?.paymentDate)
    }
    try {
      const response = await writeData(createSalesInvoicePaymentMutation(), { tenantId, payment })
      if (response.createSalesInvoicePayment) {
        if (selectedPdFile || selectedPdFile?.length !== 0 || selectedPdFile[0]) {
          await UploadMultipleFileS3Api(selectedPdFile, dispatch)
        }
        dispatch(setAddSalesPayment(response.createSalesInvoicePayment))
        await reloadSalesOrderInStore(response?.createSalesInvoicePayment?.sourceSalesOrderId ?? null)
        dispatch(createAlert({ message: 'Payment added successfully !', type: 'success' }))
        setOpenDrawer(false)
        setReloadPayment(true)
      } else {
        setLoader(false)
        dispatch(createAlert({ message: response.errors[0].message, type: 'error' }))
      }
    } catch (error) {
      console.error('error', error)
      setLoader(false)
      reset()
    }
  }

  return (
    <Drawer
      anchor='right'
      open={openDrawer}
      onClose={toggleDrawer(false)}
      sx={{ '& .MuiDrawer-paper': { width: { xs: '100%', sm: 600 } } }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: { xs: '20px', lg: '22px' },
          borderBottom: '1px solid #DBDBDB'
        }}
      >
        <Typography sx={{ fontSize: { xs: '16px', md: '20px' }, fontWeight: 500 }}>New Sales Payment</Typography>

        <IconButton
          sx={{ fontSize: '28px' }}
          color='primary'
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}
        >
          <Icon icon='tabler:x' />
        </IconButton>
      </Box>
      <Box sx={{ p: { xs: '20px', lg: '40px' } }}>
        <form onSubmit={handleSubmit(handleNewPaymentSave)}>
          <Grid container spacing={4}>
            <Grid item xs={12} sm={6} md={6}>
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
            <Grid item xs={12} sm={6} md={6}>
              <Controller
                name='customerId'
                control={control}
                render={({ field }) => (
                  <CustomTextField {...field} value={customer?.customerName} fullWidth label='Customer' disabled />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={6}>
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
            <Grid item xs={12} sm={6} md={6}>
              <Controller
                name='referenceNo'
                control={control}
                render={({ field }) => <CustomTextField {...field} fullWidth label='Reference No' />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={6}>
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
                  <CustomTextField fullWidth label='Notes' multiline minRows={2} value={value} onChange={onChange} />
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
      </Box>
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
    </Drawer>
  )
}

export default NewSalesPaymentDrawer
