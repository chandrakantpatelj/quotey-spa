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
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { updatePurchaseOrderPaymentMutation } from 'src/@core/components/graphql/purchases-payment-queries'
import Icon from 'src/@core/components/icon'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import CustomTextField from 'src/@core/components/mui/text-field'
import AddVendorPopup from 'src/common-components/AddVendorPopup'
import { writeData } from 'src/common-functions/GraphqlOperations'
import { PURCHASE_PAYMENT_PDF, SCHEMA_VERSION } from 'src/common-functions/utils/Constants'
import {
  convertCurrency,
  floatPattern,
  floatPatternMsg,
  getAdornmentConfig,
  getOnFocusConfig,
  handleDecimalPlaces,
  parseDate
} from 'src/common-functions/utils/UtilityFunctions'
import useCurrencies from 'src/hooks/getData/useCurrencies'
import { useFinancialAccounts } from 'src/hooks/getData/useFinancialAccounts'
import usePaymentMethods from 'src/hooks/getData/usePaymentMethods'
import useVendors from 'src/hooks/getData/useVendors'
import { createAlert } from 'src/store/apps/alerts'
import { setUpdatePurchasePayment } from 'src/store/apps/purchases-payment'
import { setSelectedVendor } from 'src/store/apps/vendors'
import CustomFilesUpload from 'src/views/forms/form-elements/custom-inputs/CustomFilesUpload'
import { UploadMultipleFileS3Api } from 'src/views/forms/form-elements/custom-inputs/UploadMultipleFileS3Api'
import CustomDatePicker from 'src/views/forms/form-elements/pickers/CustomDatePicker'

function EditPurchasePaymentDrawer({ setOpenDrawer, openDrawer, reloadPayment, setReloadPayment }) {
  const dispatch = useDispatch()
  const tenant = useSelector(state => state.tenants?.selectedTenant)
  const { tenantId = '' } = tenant
  const payment = useSelector(state => state?.purchasesPayment?.selectedPayment)

  const { vendors } = useVendors(tenantId)
  const { currencies } = useCurrencies()
  const { paymentMethods } = usePaymentMethods(tenantId)
  const { financialAccounts } = useFinancialAccounts(tenantId)
  const [selectedPdFile, setSelectedPdFile] = useState([])
  const [open, setOpen] = useState(false)
  const [loader, setLoader] = useState(false)

  const [isAddNewModalOpen, setIsAddNewModalOpen] = useState(false)

  const [amtCurrency, setAmtCurrency] = useState({})

  const liableAccounts = financialAccounts?.filter(val => val?.accountType === 'Liability')

  const paymentCurrency = useSelector(state => state?.currencies?.selectedCurrency)

  const {
    reset,
    control,
    watch,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors }
  } = useForm({
    defaultValues: payment,
    mode: 'onChange'
  })

  useEffect(() => {
    const vendor = vendors?.find(val => val?.vendorId === payment?.vendorId)
    setValue('vendorId', vendor)
    const paymentMethod = paymentMethods?.find(val => val?.paymentMethodId === payment?.paymentMethod)
    setValue('paymentMethod', paymentMethod)
    const currency = currencies?.find(val => val?.currencyId === payment?.currency)
    setAmtCurrency(currency)
    const paymentCurrency = currencies?.find(val => val?.currencyId === payment?.paidCurrency)
    setValue('paidCurrency', paymentCurrency)
  }, [payment])

  const paymentMethod = watch('paymentMethod')
  const currencyAdornmentConfig = getAdornmentConfig(amtCurrency)
  const localAdornmentConfig = getAdornmentConfig(paymentCurrency)

  const handleAddNewVendor = () => {
    setIsAddNewModalOpen(true)
  }

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

  const handleEditPaymentSubmit = async formData => {
    setOpen(false)
    setLoader(true)

    const {
      paymentId,
      paymentNoPrefix,
      paymentNo,
      exchangeRate,
      status,
      reconciliationStatus,
      taxAuthorityId,
      createdDateTime,
      createdBy,
      modifiedDateTime,
      modifiedBy,
      deletedDateTime,
      ...data
    } = formData

    const payment = {
      ...data,
      vendorId: data?.vendorId?.vendorId,
      paymentDate: parseDate(data?.paymentDate),
      currency: amtCurrency?.currencyId,
      paidCurrency: paymentCurrency?.currencyId,
      schemaVersion: SCHEMA_VERSION,
      paymentMethod: data?.paymentMethod?.paymentMethodId
    }

    try {
      const response = await writeData(updatePurchaseOrderPaymentMutation(), { tenantId, paymentId, payment })
      if (response.updatePurchaseOrderPayment) {
        if (selectedPdFile || selectedPdFile?.length !== 0 || selectedPdFile[0]) {
          await UploadMultipleFileS3Api(selectedPdFile, dispatch)
        }
        dispatch(setUpdatePurchasePayment(response.updatePurchaseOrderPayment))
        dispatch(createAlert({ message: 'Payment updated successfully!', type: 'success' }))
        setOpenDrawer(false)
        setReloadPayment(!reloadPayment)
      } else {
        const errorMessage = response?.errors?.[0] ? response.errors[0].message : 'Faild to update purchase payment!'
        dispatch(createAlert({ message: errorMessage, type: 'error' }))
      }
    } catch (error) {
      console.error('error', error)
    } finally {
      setOpenDrawer(false)
      reset()
      setLoader(false)
    }
  }

  const handleCancel = () => {
    setOpenDrawer(false)
    reset()
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
        <Typography sx={{ fontSize: { xs: '16px', md: '20px' }, fontWeight: 500 }}>
          Edit Purchase Payment - {payment?.paymentNo}
        </Typography>

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
        <form onSubmit={handleSubmit(handleEditPaymentSubmit)}>
          <Grid container spacing={4}>
            <Grid item xs={12} sm={6} md={12} lg={6}>
              {/* Date Picker */}
              <Controller
                name='paymentDate'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <CustomDatePicker
                    disabled={false}
                    label='Date'
                    fullWidth
                    date={field.value ? new Date(field.value) : new Date()}
                    onChange={field.onChange}
                    error={Boolean(errors?.paymentDate)}
                  />
                )}
              />
              {errors?.paymentDate && <FormHelperText error>Order Date is required</FormHelperText>}
            </Grid>

            <Grid item xs={12} sm={6} md={12} lg={6}>
              {/* Vendor Autocomplete */}
              <Controller
                name='vendorId'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <CustomAutocomplete
                    id='vendorId'
                    {...field}
                    getOptionLabel={option => {
                      if (typeof option === 'string') {
                        return option
                      } else
                        return `${option?.vendorNoPrefix || ''}  ${option?.vendorNo || ''} - ${
                          option?.displayName || ''
                        }`
                    }}
                    onChange={(e, newValue) => {
                      if (newValue?.vendorId === 'add-new') {
                        handleAddNewVendor()
                        return
                      }
                      dispatch(setSelectedVendor(newValue))
                      field.onChange(newValue)
                      const vendorCurrency = currencies?.find(
                        currencyObj => currencyObj.currencyId === newValue?.currencyId
                      )
                      setAmtCurrency(vendorCurrency)
                      const paidamt = getValues('paidAmount')

                      if (paymentCurrency?.currencyId && paidamt) {
                        setValue(
                          `amount`,
                          convertCurrency(
                            paymentCurrency?.exchangeRate,
                            1,
                            vendorCurrency?.exchangeRate,
                            paidamt
                          ).toFixed(2)
                        )
                      }
                    }}
                    options={[{ displayName: 'Add New', vendorId: 'add-new' }, ...vendors]}
                    isOptionEqualToValue={(option, value) => option.vendorId === value.vendorId}
                    renderOption={(props, option) => {
                      // Check if the option is "Add New Customer"
                      if (option?.vendorId === 'add-new') {
                        return (
                          <li {...props} style={{ display: 'flex', justifyContent: 'center', fontWeight: 'bold' }}>
                            <Button
                              variant='contained'
                              color='primary'
                              sx={{ width: '100%' }}
                              onClick={handleAddNewVendor}
                            >
                              + Add New
                            </Button>
                          </li>
                        )
                      }

                      // Normal customer option rendering
                      return (
                        <li {...props}>
                          {option?.vendorNoPrefix || ''}
                          {option?.vendorNo || ''}-{option?.displayName || ''}
                        </li>
                      )
                    }}
                    renderInput={params => (
                      <CustomTextField
                        {...params}
                        label='Vendor'
                        error={Boolean(errors.vendorId)}
                        {...(errors.vendorId && { helperText: 'Vendor is required' })}
                      />
                    )}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={12} lg={6}>
              {/* Invoice Amount */}
              <Controller
                name={`amount`}
                control={control}
                rules={{
                  pattern: {
                    required: 'amount is required',
                    value: floatPattern,
                    message: floatPatternMsg
                  }
                }}
                render={({ field, fieldState: { error } }) => (
                  <CustomTextField
                    value={field.value}
                    onChange={e => {
                      const value = e.target.value
                      const formattedValue = handleDecimalPlaces(value)
                      field.onChange(formattedValue)

                      if (amtCurrency?.currencyId && paymentCurrency.currencyId && formattedValue) {
                        setValue(
                          `paidAmount`,
                          convertCurrency(
                            amtCurrency?.exchangeRate,
                            1,
                            paymentCurrency?.exchangeRate,
                            formattedValue
                          ).toFixed(2)
                        )
                      }
                    }}
                    label='Invoice Amount'
                    fullWidth
                    InputProps={{
                      ...getOnFocusConfig(field, 0),
                      ...currencyAdornmentConfig
                    }}
                    error={Boolean(error)}
                    helperText={error?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={12} lg={6}>
              {/* Payment Amount */}
              <Controller
                name={`paidAmount`}
                control={control}
                rules={{
                  pattern: {
                    value: floatPattern,
                    message: floatPatternMsg
                  }
                }}
                render={({ field, fieldState: { error } }) => (
                  <CustomTextField
                    value={field.value}
                    onChange={e => {
                      const value = e.target.value
                      const formattedValue = handleDecimalPlaces(value)
                      field.onChange(formattedValue)
                    }}
                    label='Payment Amount'
                    fullWidth
                    inputProps={{
                      min: 0
                    }}
                    InputProps={{
                      ...getOnFocusConfig(field, 0),
                      ...localAdornmentConfig
                    }}
                    error={Boolean(error)}
                    helperText={error?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={12} lg={6}>
              <Controller
                name='paymentMethod'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <CustomAutocomplete
                    {...field}
                    onChange={(event, newValue) => {
                      field.onChange(newValue)
                      if (newValue !== 'Loan') {
                        setValue('financialAccountId', null)
                      }
                    }}
                    options={paymentMethods}
                    getOptionLabel={option => option?.paymentMethod || ''}
                    renderInput={params => (
                      <CustomTextField
                        id='paymentMethod'
                        {...params}
                        label='Payment Method'
                        error={Boolean(errors.paymentMethod)}
                        helperText={errors.paymentMethod ? 'Payment Method is required' : ''}
                      />
                    )}
                  />
                )}
              />
            </Grid>

            {paymentMethod?.paymentMethod === 'Loan' && (
              <Grid item xs={12} sm={6} md={12} lg={6}>
                <Controller
                  name='financialAccountId'
                  control={control}
                  rules={{ required: 'Account is required' }}
                  render={({ field, fieldState: { error } }) => (
                    <CustomAutocomplete
                      {...field}
                      options={liableAccounts}
                      getOptionLabel={option => option?.accountName || ''}
                      value={liableAccounts?.find(option => option.accountId === field.value) || null}
                      onChange={(e, newValue) => {
                        field.onChange(newValue?.accountId || null)
                        setValue('financialAccountName', newValue?.accountName)
                      }}
                      disableClearable
                      renderInput={params => (
                        <CustomTextField
                          {...params}
                          fullWidth
                          label='Account'
                          error={Boolean(error)}
                          helperText={error?.message}
                        />
                      )}
                    />
                  )}
                />
              </Grid>
            )}
            <Grid item xs={12} sm={6} md={12} lg={6}>
              <Controller
                name='referenceNo'
                control={control}
                render={({ field }) => <CustomTextField {...field} fullWidth label='Reference No' />}
              />
            </Grid>

            <Grid item xs={12}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Controller
                    name='notes'
                    control={control}
                    render={({ field }) => (
                      <CustomTextField
                        fullWidth
                        label='Notes'
                        multiline
                        minRows={2}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Controller
                    name='description'
                    control={control}
                    render={({ field }) => (
                      <CustomTextField
                        fullWidth
                        label='Description'
                        multiline
                        minRows={2}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              {/* File Upload */}
              <CustomFilesUpload
                setValue={setValue}
                selectedPdFile={selectedPdFile}
                setSelectedPdFile={setSelectedPdFile}
                folderName={PURCHASE_PAYMENT_PDF}
              />
            </Grid>

            <Grid item xs={12}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: {
                    xs: 'center',
                    sm: 'flex-start'
                  },
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
            </Grid>
          </Grid>
        </form>
      </Box>
      {isAddNewModalOpen && <AddVendorPopup open={isAddNewModalOpen} setOpen={setIsAddNewModalOpen} />}

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

export default EditPurchasePaymentDrawer
