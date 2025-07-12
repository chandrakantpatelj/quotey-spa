import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import PageHeader from 'src/@core/components/page-header'
import {
  Box,
  Typography,
  Button,
  Grid,
  IconButton,
  Snackbar,
  Alert,
  Backdrop,
  CircularProgress,
  LinearProgress
} from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import CustomTextField from 'src/@core/components/mui/text-field'
import { Close } from '@mui/icons-material'
import PageWrapper from 'src/@core/layouts/PageWrapper'
import { useForm, Controller } from 'react-hook-form'
import { writeData } from 'src/common-functions/GraphqlOperations'
import { createAlert } from 'src/store/apps/alerts'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import CustomFilesUpload from 'src/views/forms/form-elements/custom-inputs/CustomFilesUpload'
import { UploadMultipleFileS3Api } from 'src/views/forms/form-elements/custom-inputs/UploadMultipleFileS3Api'
import { SCHEMA_VERSION, CREATE_TAX_PAYMENT, TAX_PAYMENT_PDF } from 'src/common-functions/utils/Constants'
import { checkAuthorizedRoute, getAdornmentConfig, parseDate } from 'src/common-functions/utils/UtilityFunctions'
import CustomDatePicker from 'src/views/forms/form-elements/pickers/CustomDatePicker'
import { createTaxPaymentMutation } from 'src/@core/components/graphql/tax-payments-queries'
import ErrorBoundary from 'src/pages/ErrorBoundary'
import usePaymentMethods from 'src/hooks/getData/usePaymentMethods'
import useCurrencies from 'src/hooks/getData/useCurrencies'
import useTaxAuthorities from 'src/hooks/getData/useTaxAuthorities'
import { setAddtaxPayment, setLoading } from 'src/store/apps/tax-payments'

export default function AddTaxPayment() {
  const dispatch = useDispatch()
  const router = useRouter()
  const userProfile = useSelector(state => state.userProfile)

  const [isAuthorized, setIsAuthorized] = useState(false)
  const tenant = useSelector(state => state.tenants?.selectedTenant)

  const [open, setOpen] = useState(false)
  const [loader, setLoader] = React.useState(false)
  const tenantId = useSelector(state => state.tenants?.selectedTenant?.tenantId) || ''
  const { paymentMethods } = usePaymentMethods(tenantId)
  const PaymentTypes = ['PAYMENT', 'REFUND']
  const { currencies, loading: currencyLoading } = useCurrencies()
  const { taxAuthorities, taxAuthorityLoading } = useTaxAuthorities(tenantId)

  const loading = currencyLoading || taxAuthorityLoading

  const [selectedPdFile, setSelectedPdFile] = useState([])

  const localAdornmentConfig = getAdornmentConfig(currencies.find(item => item.currencyId === tenant.currencyId))

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }
    setOpen(false)
  }

  const defaultData = {
    schemaVersion: SCHEMA_VERSION,
    paymentDate: new Date(),
    taxAuthorityId: null,
    paymentType: PaymentTypes[0],
    paymentMethod: null,
    referenceNo: '',
    description: '',
    currency: '',
    amount: 0,
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

  const handleSaveTaxPayment = async newTaxPayment => {
    setOpen(false)
    setLoader(true)
    const tenantId = tenant?.tenantId

    const payment = {
      ...newTaxPayment,
      paymentDate: parseDate(newTaxPayment?.paymentDate),
      currency: tenant.currencyId
    }

    try {
      dispatch(setLoading(true))
      const response = await writeData(createTaxPaymentMutation(), { tenantId, payment })

      if (response.createTaxPayment) {
        dispatch(createAlert({ message: 'Tax Payment created  successfully !', type: 'success' }))
        if (selectedPdFile || selectedPdFile?.length !== 0 || selectedPdFile[0]) {
          await UploadMultipleFileS3Api(selectedPdFile, dispatch)
        }
        dispatch(setAddtaxPayment(response.createTaxPayment))
        router.push('/accounting/tax-payments/')
      } else {
        setLoader(false)
        dispatch(createAlert({ message: 'Tax Payment creation  failed !', type: 'error' }))
      }
      return response
    } catch (error) {
      console.error('error: ', error)
      setLoader(false)
    }
  }

  const handleCancel = () => {
    reset()
    router.push('/accounting/tax-payments/')
  }

  useEffect(() => {
    if (checkAuthorizedRoute(CREATE_TAX_PAYMENT, router, userProfile)) {
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
            Create Tax Payment
          </Typography>
        }
        button={
          <IconButton
            variant='outlined'
            color='default'
            sx={{ fontSize: '21px' }}
            component={Link}
            scroll={true}
            href={`/accounting/tax-payments/`}
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
          <form onSubmit={handleSubmit(handleSaveTaxPayment)}>
            <Grid container spacing={{ xs: 6 }}>
              <Grid item xs={12} lg={8}>
                <Grid container spacing={{ xs: 2, md: 3, lg: 3, xl: 3 }}>
                  <Grid item xs={12} sm={6} md={3}>
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
                  <Grid item xs={4} sm={4} md={3}>
                    <Controller
                      name='paymentDate'
                      control={control}
                      rules={{ required: false }}
                      render={({ field }) => (
                        <CustomDatePicker
                          label={'Payment Date'}
                          fullWidth={true}
                          date={field.value}
                          onChange={field.onChange}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={4} sm={4} md={3}>
                    <Controller
                      name='paymentType'
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <CustomAutocomplete
                          id='paymentType'
                          {...field}
                          options={PaymentTypes}
                          getOptionLabel={option => option || ''}
                          value={PaymentTypes.find(option => option === field?.value) || null}
                          onChange={(e, newValue) => {
                            field.onChange(newValue)
                          }}
                          disableClearable
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
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} lg={8}>
                <Grid container spacing={{ xs: 2, md: 3, lg: 3, xl: 3 }}>
                  <Grid item xs={4} sm={4} md={3}>
                    <Controller
                      name='paymentMethod'
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <CustomAutocomplete
                          id='paymentMethod'
                          {...field}
                          options={paymentMethods}
                          getOptionLabel={option => option?.paymentMethod || ''}
                          value={paymentMethods.find(option => option.paymentMethodId === field?.value) || null}
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
                  <Grid item xs={4} sm={4} md={3}>
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
                            ...localAdornmentConfig
                          }}
                          error={Boolean(errors.amount)}
                          {...(errors.amount && { helperText: 'Amount is required' })}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={4} sm={4} md={3}>
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
                  <Grid item xs={12} lg={8}>
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
                  <Grid item xs={12} lg={8}>
                    <Controller
                      name='notes'
                      control={control}
                      rules={{ required: false }}
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
                justifyContent: { xs: 'center', sm: 'start' },
                gap: '20px',
                marginTop: { xs: '30px', sm: '50px' }
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
        )}
      </PageWrapper>{' '}
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
