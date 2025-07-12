import React, { useState, useMemo, useCallback } from 'react'
import { Box, Button, Grid, FormHelperText, Snackbar, Alert } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import { useForm, Controller } from 'react-hook-form'
import { writeData } from 'src/common-functions/GraphqlOperations'
import CustomTextField from 'src/@core/components/mui/text-field'
import CustomDatePicker from 'src/views/forms/form-elements/pickers/CustomDatePicker'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import CustomFilesUpload from 'src/views/forms/form-elements/custom-inputs/CustomFilesUpload'
import { UploadMultipleFileS3Api } from 'src/views/forms/form-elements/custom-inputs/UploadMultipleFileS3Api'
import { createAlert } from 'src/store/apps/alerts'
import { createPurchaseOrderPaymentFromBankTransaction } from 'src/@core/components/graphql/purchases-payment-queries'
import {
  convertCurrency,
  filterPaymentMethods,
  getAdornmentConfig,
  parseDate
} from 'src/common-functions/utils/UtilityFunctions'
import { PURCHASE_PAYMENT_PDF, SCHEMA_VERSION } from 'src/common-functions/utils/Constants'
import usePaymentMethods from 'src/hooks/getData/usePaymentMethods'
import useVendors from 'src/hooks/getData/useVendors'
import useCurrencies from 'src/hooks/getData/useCurrencies'
import { resetPurchasePayment } from 'src/store/apps/purchases-payment'
import { resetPurchaseOrder } from 'src/store/apps/purchaseorder'

function CreatePurchasePaymentDrawer({ setOpenDrawer, transaction, setTransactions }) {
  const dispatch = useDispatch()

  const { tenantId = '' } = useSelector(state => state.tenants?.selectedTenant) || {}
  const { vendors } = useVendors(tenantId)
  const { currencies } = useCurrencies()
  const { paymentMethods } = usePaymentMethods(tenantId)
  const paymentCurrency = useSelector(state => state?.currencies?.selectedCurrency) || {}

  const creditAmount = transaction?.debit || 0
  const transactionDate = transaction?.transactionDate
  const localAdornmentConfig = getAdornmentConfig(paymentCurrency)
  const [selectedPdFile, setSelectedPdFile] = useState([])
  const [vendorObject, setVendorObject] = useState({})
  const [open, setOpen] = useState(false)

  const handleCurrencyConversion = useCallback(
    vendor => {
      const vendorCurrency = currencies.find(currency => currency.currencyId === vendor.currencyId) || {}
      if (paymentCurrency?.currencyId) {
        const convertedAmount = convertCurrency(
          paymentCurrency?.exchangeRate,
          1,
          vendorCurrency?.exchangeRate,
          creditAmount
        ).toFixed(2)
        setVendorObject(vendorCurrency)
        return { amount: convertedAmount, currency: vendorCurrency.currencyId }
      }
      return { amount: 0, currency: 'AUD' }
    },
    [paymentCurrency, currencies, creditAmount]
  )

  const defaultConvertedValues = useMemo(() => {
    if (vendors.length > 0) {
      return handleCurrencyConversion(vendors[0])
    }
    return { amount: 0, currency: 'AUD' }
  }, [vendors, handleCurrencyConversion])

  const {
    control,
    setValue,
    reset,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      schemaVersion: SCHEMA_VERSION,
      paymentDate: new Date(transactionDate),
      vendorId: vendors[0]?.vendorId || '',
      paymentMethod: paymentMethods[0]?.paymentMethodId || '',
      referenceNo: '',
      files: [],
      amount: defaultConvertedValues.amount, //invoice amount
      currency: defaultConvertedValues.currency, //invoice amount currency
      description: '',
      notes: '',
      paidAmount: creditAmount,
      paidCurrency: 'AUD',
      bankTransactionId: transaction?.transactionId || null,
      tenantId
    },
    mode: 'onChange'
  })

  const bankRelatedPaymentMethods = useMemo(() => filterPaymentMethods(paymentMethods), [paymentMethods])

  const check = () => {
    setOpen(true)
    const fieldName = Object.keys(errors)[0]
    const errName = document.getElementById(fieldName)
    errName?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
  }
  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }
    setOpen(false)
  }

  const closeDrawer = () => {
    setOpenDrawer(false)
    reset()
  }

  const handleNewPaymentSave = async newPayment => {
    setOpenDrawer(false)
    setOpen(false)

    try {
      const payment = {
        ...newPayment,
        paymentDate: parseDate(newPayment.paymentDate),
        tenantId: tenantId
      }

      const response = await writeData(createPurchaseOrderPaymentFromBankTransaction(), { tenantId, payment })
      if (response.createPurchaseOrderPaymentFromBankTransaction) {
        const { createPurchaseOrderPaymentFromBankTransaction } = response
        dispatch(resetPurchasePayment())
        if (selectedPdFile.length > 0) {
          await UploadMultipleFileS3Api(selectedPdFile, dispatch)
        }

        setTransactions(prev => {
          return prev.map(item => {
            if (item.transactionId === createPurchaseOrderPaymentFromBankTransaction.transactionId) {
              return {
                ...item,
                status: createPurchaseOrderPaymentFromBankTransaction?.status,
                relatedRecords: createPurchaseOrderPaymentFromBankTransaction?.relatedRecords,
                matchType: createPurchaseOrderPaymentFromBankTransaction?.matchType
              }
            } else {
              return item
            }
          })
        })
        dispatch(resetPurchaseOrder())
        dispatch(createAlert({ message: 'Payment created successfully!', type: 'success' }))
        closeDrawer()
      } else {
        dispatch(createAlert({ message: 'Payment creation failed!', type: 'error' }))
        setOpenDrawer(true)
        reset(newPayment)
      }
    } catch (error) {
      console.error(error)
      dispatch(createAlert({ message: 'Error creating payment!', type: 'error' }))
      setOpenDrawer(true)
      reset(newPayment)
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit(handleNewPaymentSave)}>
        <Grid container spacing={{ xs: 6 }}>
          <Grid item xs={12} md={12}>
            <Grid container spacing={{ xs: 2, md: 3, lg: 3, xl: 3 }}>
              <Grid item xs={6} sm={6} md={4}>
                <Controller
                  name='paymentDate'
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <CustomDatePicker
                      disabled
                      label={'Date'}
                      fullWidth
                      date={field?.value ? new Date(field.value) : new Date()}
                      onChange={field.onChange}
                      error={Boolean(errors?.paymentDate)}
                    />
                  )}
                />
                {errors?.paymentDate && <FormHelperText error>Order Date is required</FormHelperText>}
              </Grid>
              <Grid item xs={6} sm={6} md={4}>
                <Controller
                  name='vendorId'
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <CustomAutocomplete
                      id='vendorId'
                      {...field}
                      disableClearable
                      value={vendors.find(v => v.vendorId === field.value) || null}
                      onChange={(e, newValue) => {
                        const { amount, currency } = handleCurrencyConversion(newValue)
                        setValue('amount', amount)
                        setValue('currency', currency)
                        field.onChange(newValue.vendorId)
                      }}
                      options={vendors}
                      getOptionLabel={option => option?.displayName || ''}
                      isOptionEqualToValue={(option, value) => option.vendorId === value.vendorId}
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
              <Grid item xs={6} sm={6} md={4}>
                <Controller
                  name='referenceNo'
                  control={control}
                  render={({ field }) => <CustomTextField {...field} fullWidth label='Reference No' />}
                />
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12} md={12}>
            <Grid container spacing={{ xs: 2, md: 3, lg: 3, xl: 3 }}>
              <Grid item xs={6} sm={6} md={4}>
                <Controller
                  name={`amount`}
                  control={control}
                  rules={{
                    required: true,
                    pattern: {
                      value: /^[0-9]+(\.[0-9]{1,2})?$/,
                      message: 'Please enter a valid float number'
                    },
                    validate: value => {
                      const floatValue = parseFloat(value)
                      if (floatValue < 1) {
                        return 'Value should not be less than 1'
                      }

                      return true
                    }
                  }}
                  render={({ field: { value, onChange } }) => (
                    <CustomTextField
                      value={value}
                      onChange={e => {
                        const newValue = e.target.value.trim() === '' ? null : e.target.value
                        onChange(newValue)
                      }}
                      label='Invoice Amount'
                      fullWidth
                      inputProps={{
                        min: 0
                      }}
                      InputProps={{
                        ...getAdornmentConfig(vendorObject)
                      }}
                      error={errors?.items && Boolean(errors?.items[index]?.invoiceAmount)}
                      {...(errors?.items && errors?.items[index]?.invoiceAmount?.type === 'pattern'
                        ? { helperText: 'Enter a valid integer or float price' }
                        : '')}
                      {...(errors?.items && errors?.items[index]?.invoiceAmount?.type === 'required'
                        ? { helperText: 'Please enter Payment Amount' }
                        : '')}
                      {...(errors?.items && errors?.items[index]?.invoiceAmount?.type === 'validate'
                        ? { helperText: errors.items[index].invoiceAmount.message }
                        : '')}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={6} sm={6} md={4}>
                <Controller
                  name={`paidAmount`}
                  control={control}
                  rules={{
                    required: true,
                    pattern: {
                      value: /^[0-9]+(\.[0-9]{1,2})?$/,
                      message: 'Please enter a valid float number'
                    }
                  }}
                  render={({ field: { value, onChange } }) => (
                    <CustomTextField
                      value={value}
                      label='Payment Amount'
                      fullWidth
                      disabled
                      inputProps={{
                        min: 0
                      }}
                      InputProps={{
                        ...localAdornmentConfig
                      }}
                      error={errors?.items && Boolean(errors?.paymentAmount)}
                      {...(errors?.items && errors?.items[index]?.paymentAmount?.type === 'pattern'
                        ? { helperText: 'Enter  valid integer or float price' }
                        : '')}
                      {...(errors?.items && errors?.items[index]?.paymentAmount?.type === 'required'
                        ? { helperText: 'Please enter Payment Amount' }
                        : '')}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={6} sm={6} md={4}>
                <Controller
                  name='paymentMethod'
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <CustomAutocomplete
                      {...field}
                      onChange={(event, newValue) => {
                        field.onChange(newValue?.paymentMethodId ?? null)
                      }}
                      options={bankRelatedPaymentMethods}
                      value={bankRelatedPaymentMethods.find(option => option.paymentMethodId === field.value) || null}
                      getOptionLabel={option => option?.paymentMethod || ''}
                      renderInput={params => (
                        <CustomTextField
                          id='paymentMethod'
                          {...params}
                          label='Payment Method'
                          error={Boolean(errors.paymentMethod)}
                          {...(errors.paymentMethod && { helperText: 'Payment Method is required' })}
                        />
                      )}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Controller
              name='description'
              control={control}
              rules={{ required: false }}
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
              rules={{ required: false }}
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
              folderName={PURCHASE_PAYMENT_PDF}
            />
          </Grid>
        </Grid>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: { xs: 'center', sm: 'end' },
            gap: '20px',
            marginTop: { xs: '20px', md: '30px' }
          }}
        >
          <Button variant='contained' type='submit' onClick={check}>
            Save
          </Button>
          <Button variant='outlined' type='reset' onClick={() => closeDrawer()}>
            Cancel
          </Button>
        </Box>
      </form>

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
    </>
  )
}

export default CreatePurchasePaymentDrawer
