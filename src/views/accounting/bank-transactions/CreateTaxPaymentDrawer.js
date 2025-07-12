import { useEffect, useMemo, useState } from 'react'
import { Box, Button, Grid, Snackbar, Alert } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import CustomTextField from 'src/@core/components/mui/text-field'
import { useForm, Controller } from 'react-hook-form'
import { writeData } from 'src/common-functions/GraphqlOperations'
import { createAlert } from 'src/store/apps/alerts'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import CustomFilesUpload from 'src/views/forms/form-elements/custom-inputs/CustomFilesUpload'
import { UploadMultipleFileS3Api } from 'src/views/forms/form-elements/custom-inputs/UploadMultipleFileS3Api'
import { SCHEMA_VERSION, TAX_PAYMENT_PDF } from 'src/common-functions/utils/Constants'
import { filterPaymentMethods, getAdornmentConfig, parseDate } from 'src/common-functions/utils/UtilityFunctions'
import CustomDatePicker from 'src/views/forms/form-elements/pickers/CustomDatePicker'
import { createTaxPaymentFromBankTransactionMutation } from 'src/@core/components/graphql/tax-payments-queries'
import usePaymentMethods from 'src/hooks/getData/usePaymentMethods'
import useCurrencies from 'src/hooks/getData/useCurrencies'
import useTaxAuthorities from 'src/hooks/getData/useTaxAuthorities'
import { resettaxPayments } from 'src/store/apps/tax-payments'

export default function CreateTaxPaymentDrawer({ setOpenDrawer, transaction, setTransactions }) {
  const dispatch = useDispatch()
  const [open, setOpen] = useState(false)
  const tenant = useSelector(state => state.tenants?.selectedTenant)
  const { tenantId = '' } = tenant
  const { currencies } = useCurrencies()
  const { paymentMethods } = usePaymentMethods(tenantId)
  const { taxAuthorities } = useTaxAuthorities(tenantId)

  const [selectedPdFile, setSelectedPdFile] = useState([])
  const creditAmount = transaction?.debit
  const transactionDate = transaction?.transactionDate
  const localAdornmentConfig = getAdornmentConfig(currencies.find(item => item.currencyId === tenant.currencyId))

  const bankRelatedPaymentMethods = useMemo(() => filterPaymentMethods(paymentMethods), [paymentMethods])

  const handleClose = () => {
    setOpenDrawer(false)
    reset()
    setOpen(false)
  }

  const defaultData = {
    schemaVersion: SCHEMA_VERSION,
    bankTransactionId: transaction.transactionId,
    paymentDate: new Date(transactionDate),
    taxAuthorityId: null,
    paymentMethod: bankRelatedPaymentMethods[0]?.paymentMethodId ?? null,
    referenceNo: '',
    description: '',
    currency: tenant.currencyId,
    amount: creditAmount,
    notes: '',
    files: []
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
  useEffect(() => {
    setValue('taxAuthorityId', taxAuthorities[0]?.taxAuthorityId ?? null)
  }, [])

  const handleSaveTaxPayment = async newTaxPayment => {
    setOpenDrawer(false)
    setOpen(false)
    const tenantId = tenant?.tenantId

    const payment = {
      ...newTaxPayment,
      paymentDate: parseDate(newTaxPayment?.paymentDate)
    }

    try {
      const response = await writeData(createTaxPaymentFromBankTransactionMutation(), { tenantId, payment })

      if (response.createTaxPaymentFromBankTransaction) {
        dispatch(createAlert({ message: 'Tax Payment created  successfully !', type: 'success' }))
        if (selectedPdFile || selectedPdFile?.length !== 0 || selectedPdFile[0]) {
          await UploadMultipleFileS3Api(selectedPdFile, dispatch)
        }
        setTransactions(prev => {
          return prev.map(item => {
            if (item.transactionId === response.createTaxPaymentFromBankTransaction.transactionId) {
              return {
                ...item,
                status: response.createTaxPaymentFromBankTransaction.status,
                relatedRecords: response.createTaxPaymentFromBankTransaction.relatedRecords,
                matchType: response.createTaxPaymentFromBankTransaction.matchType
              }
            } else {
              return item
            }
          })
        })
        dispatch(resettaxPayments())
      } else {
        dispatch(createAlert({ message: 'Tax Payment creation  failed !', type: 'error' }))
        setOpenDrawer(true)
        reset(newTaxPayment)
      }
      return response
    } catch (error) {
      console.error('error: ', error)
      setOpenDrawer(false)
      setOpenDrawer(true)
      reset(newTaxPayment)
    }
  }

  const handleCancel = () => {
    setOpenDrawer(false)
    reset()
  }

  return (
    <>
      <form onSubmit={handleSubmit(handleSaveTaxPayment)}>
        <Grid container spacing={{ xs: 6 }}>
          <Grid item xs={12} lg={12}>
            <Grid container spacing={{ xs: 2, md: 3, lg: 3, xl: 3 }}>
              <Grid item xs={6} sm={6} md={4}>
                <Controller
                  name='taxAuthorityId'
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <CustomAutocomplete
                      id='taxAuthorityId'
                      {...field}
                      options={taxAuthorities}
                      getOptionLabel={option => option?.taxAuthorityName || ''}
                      value={taxAuthorities.find(option => option.taxAuthorityId === field?.value) || null}
                      onChange={(e, newValue) => {
                        field.onChange(newValue.taxAuthorityId)
                      }}
                      disableClearable
                      renderInput={params => (
                        <CustomTextField
                          {...params}
                          fullWidth
                          label='Tax Authority'
                          error={Boolean(errors.taxAuthorityId)}
                          {...(errors.taxAuthorityId && { helperText: 'Tax Authority is required' })}
                        />
                      )}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={6} sm={6} md={4}>
                <Controller
                  name='paymentDate'
                  control={control}
                  rules={{ required: false }}
                  render={({ field }) => (
                    <CustomDatePicker
                      disabled={true}
                      label={'Payment Date'}
                      fullWidth={true}
                      date={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} lg={12}>
            <Grid container spacing={{ xs: 2, md: 3, lg: 3, xl: 3 }}>
              <Grid item xs={6} sm={6} md={4}>
                <Controller
                  name='paymentMethod'
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <CustomAutocomplete
                      id='paymentMethod'
                      {...field}
                      options={bankRelatedPaymentMethods}
                      getOptionLabel={option => option?.paymentMethod || ''}
                      value={bankRelatedPaymentMethods?.find(option => option.paymentMethodId === field?.value) || null}
                      onChange={(e, newValue) => {
                        field.onChange(newValue.paymentMethodId)
                      }}
                      disableClearable
                      renderInput={params => (
                        <CustomTextField
                          {...params}
                          fullWidth
                          label='Payment Method'
                          error={Boolean(errors.paymentMethod)}
                          {...(errors.paymentMethod && { helperText: 'Payment method is required' })}
                        />
                      )}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={6} sm={6} md={4}>
                <Controller
                  name='amount'
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      label='Amount'
                      disabled={true}
                      InputProps={{
                        ...localAdornmentConfig
                      }}
                      error={Boolean(errors.amount)}
                      {...(errors.amount && { helperText: 'Amount is required' })}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={6} sm={6} md={4}>
                <Controller
                  name='referenceNo'
                  control={control}
                  rules={{ required: false }}
                  render={({ field }) => <CustomTextField {...field} fullWidth label='Reference No' />}
                />
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12} md={12}>
            <Grid container spacing={{ xs: 2, md: 3, lg: 3, xl: 3 }}>
              <Grid item xs={12} lg={12}>
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
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <CustomFilesUpload
              setValue={setValue}
              selectedPdFile={selectedPdFile}
              setSelectedPdFile={setSelectedPdFile}
              folderName={TAX_PAYMENT_PDF}
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
          <Button variant='contained' type='submit'>
            Save
          </Button>

          <Button variant='outlined' type='reset' onClick={handleCancel}>
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
