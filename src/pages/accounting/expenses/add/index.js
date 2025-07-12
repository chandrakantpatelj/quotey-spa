import Link from 'next/link'
import Router from 'next/router'
import React, { useEffect, useState } from 'react'
import PageHeader from 'src/@core/components/page-header'
import {
  Box,
  Typography,
  Button,
  Grid,
  IconButton,
  FormHelperText,
  Snackbar,
  Alert,
  Backdrop,
  CircularProgress
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
import { CREATE_EXPENSE, EXPENSE_PDF, SCHEMA_VERSION } from 'src/common-functions/utils/Constants'
import {
  checkAuthorizedRoute,
  floatPattern,
  floatPatternMsg,
  getAdornmentConfig,
  getOnFocusConfig,
  handleDecimalPlaces,
  parseDate
} from 'src/common-functions/utils/UtilityFunctions'
import CustomDatePicker from 'src/views/forms/form-elements/pickers/CustomDatePicker'
import { createGeneralExpenseMutation } from 'src/@core/components/graphql/general-expense-queries'
import { setAddExpense } from 'src/store/apps/expenses'
import ErrorBoundary from 'src/pages/ErrorBoundary'
import usePaymentMethods from 'src/hooks/getData/usePaymentMethods'
import useGeneralExpenseType from 'src/hooks/getData/useGeneralExpenseType'

function Expense() {
  const router = Router
  const dispatch = useDispatch()
  const tenant = useSelector(state => state.tenants?.selectedTenant)
  const { tenantId } = tenant
  const currency = useSelector(state => state?.currencies?.selectedCurrency)
  const { paymentMethods } = usePaymentMethods(tenantId)
  const { generalExpenseTypes } = useGeneralExpenseType(tenantId)
  const [open, setOpen] = useState(false)
  const [loader, setLoader] = React.useState(false)
  const [selectedPdFile, setSelectedPdFile] = useState([])
  const userProfile = useSelector(state => state.userProfile)

  const [isAuthorized, setIsAuthorized] = useState(false)
  const localAdornmentConfig = getAdornmentConfig(currency)

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }
    setOpen(false)
  }

  const [generalExpenseData, setGeneralExpenseData] = useState({
    schemaVersion: SCHEMA_VERSION,
    expenseDate: '',
    expenseType: '',
    paymentMethod: '',
    amount: 0.0,
    currency: currency?.currencyId,
    description: '',
    notes: '',
    bankTransactionId: null,
    files: []
  })

  const {
    reset,
    control,
    setValue,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: generalExpenseData,
    mode: 'onChange'
  })

  const check = () => {
    setOpen(true)
    const fieldName = Object.keys(errors)[0]
    const errName = document.getElementById(fieldName)
    errName?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
  }

  const handleNewExpenseSave = async newexpense => {
    setOpen(false)
    setLoader(true)
    // No errors, proceed with save
    const tenantId = tenant?.tenantId
    const paymentMethod = newexpense?.paymentMethod?.paymentMethodId
    const expenseType = newexpense?.expenseType?.expenseTypeId
    const expense = {
      ...newexpense,
      paymentMethod,
      expenseType,
      expenseDate: parseDate(newexpense?.expenseDate)
    }

    try {
      const response = await writeData(createGeneralExpenseMutation(), { tenantId, expense })

      if (response.createGeneralExpense) {
        dispatch(createAlert({ message: 'Expense created  successfully !', type: 'success' }))
        if (selectedPdFile || selectedPdFile?.length !== 0 || selectedPdFile[0]) {
          await UploadMultipleFileS3Api(selectedPdFile, dispatch)
        }
        dispatch(setAddExpense(response.createGeneralExpense))
        router.push('/accounting/expenses/')
      } else {
        setLoader(false)

        dispatch(createAlert({ message: 'Expense creation  failed !', type: 'error' }))
      }
      return response
    } catch (error) {
      // Handle any errors and optionally dispatch an error action
      console.log('error: ', error)
      setLoader(false)
    }
  }

  const handleCancel = () => {
    reset()
    router.push('/accounting/expenses/')
  }

  useEffect(() => {
    if (checkAuthorizedRoute(CREATE_EXPENSE, router, userProfile)) {
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
            Add Expense
          </Typography>
        }
        button={
          <IconButton
            variant='outlined'
            color='default'
            sx={{ fontSize: '21px' }}
            component={Link}
            scroll={true}
            href={`/accounting/expenses/`}
          >
            <Close sx={{ color: theme => theme.palette.primary.main }} />
          </IconButton>
          // )
        }
      />
      <PageWrapper>
        <form onSubmit={handleSubmit(handleNewExpenseSave)}>
          <Grid container spacing={{ xs: 6 }}>
            <Grid item xs={12} lg={8}>
              <Grid container spacing={{ xs: 2, md: 3, lg: 3, xl: 3 }}>
                <Grid item xs={6} sm={6} md={3}>
                  <Controller
                    name='expenseDate'
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <CustomDatePicker
                        label={'Date'}
                        fullWidth={true}
                        date={field.value}
                        onChange={field.onChange}
                        error={Boolean(errors?.expenseDate)}
                      />
                    )}
                  />
                  {errors?.expenseDate && <FormHelperText error>Expense Date is required</FormHelperText>}
                </Grid>
                <Grid item xs={6} sm={6} md={3}>
                  <Controller
                    name='expenseType'
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <CustomAutocomplete
                        {...field}
                        onChange={(event, newValue) => {
                          field.onChange(newValue)
                        }}
                        options={generalExpenseTypes}
                        getOptionLabel={option => option?.expenseType || ''}
                        renderInput={params => (
                          <CustomTextField
                            id='expenseType'
                            {...params}
                            label='Expense Type'
                            error={Boolean(errors.expenseType)}
                            {...(errors.expenseType && { helperText: 'Expense Type is required' })}
                          />
                        )}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={6} sm={6} md={3}>
                  <Controller
                    name='amount'
                    control={control}
                    rules={{
                      pattern: {
                        value: floatPattern,
                        message: floatPatternMsg
                      }
                    }}
                    render={({ field, fieldState: { error } }) => (
                      <CustomTextField
                        {...field}
                        onChange={e => {
                          const value = e.target.value
                          const formattedValue = handleDecimalPlaces(value)
                          field.onChange(formattedValue)
                        }}
                        InputProps={{
                          ...getOnFocusConfig(field, 0),
                          ...localAdornmentConfig
                        }}
                        label='Amount'
                        fullWidth
                        error={Boolean(error)}
                        helperText={error?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={6} sm={6} md={3}>
                  <Controller
                    name='paymentMethod'
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <CustomAutocomplete
                        {...field}
                        onChange={(event, newValue) => {
                          field.onChange(newValue)
                        }}
                        options={paymentMethods}
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
                folderName={EXPENSE_PDF}
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
            <Button variant='contained' type='submit' onClick={check}>
              Save
            </Button>
            <Button variant='outlined' type='reset' onClick={handleCancel}>
              Cancel
            </Button>
          </Box>
        </form>
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

export default Expense
