import Link from 'next/link'
import Router from 'next/router'
import { useState } from 'react'
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
import { SCHEMA_VERSION, STATUS_DRAFT } from 'src/common-functions/utils/Constants'
import { getAdornmentConfig, handleDecimalPlaces, parseDate } from 'src/common-functions/utils/UtilityFunctions'
import CustomDatePicker from 'src/views/forms/form-elements/pickers/CustomDatePicker'
import ErrorBoundary from 'src/pages/ErrorBoundary'
import { useFinancialAccounts } from 'src/hooks/getData/useFinancialAccounts'
import AccountTransactionTable from 'src/views/accounting/transactions/AccountTransactionTable'
import { createAccountEntryMutation } from 'src/@core/components/graphql/account-transaction-queries'
import { setAddAccountTransaction } from 'src/store/apps/account-transactions'

export default function NewAccountTransaction() {
  const router = Router
  const dispatch = useDispatch()
  const tenantId = useSelector(state => state.tenants?.selectedTenant?.tenantId) || ''

  const [open, setOpen] = useState(false)
  const [loader, setLoader] = useState(false)
  const { financialAccounts, financialAccountloading: loading } = useFinancialAccounts(tenantId)

  const localCurrency = useSelector(state => state?.currencies?.selectedCurrency) || {}

  const localAdornmentConfig = getAdornmentConfig(localCurrency)

  const typeOptions = ['DEBIT', 'CREDIT']

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }
    setOpen(false)
  }

  const defaultData = {
    schemaVersion: SCHEMA_VERSION,
    transactionDate: new Date(),
    transactionType: 'ACCOUNT_ENTRY',
    reference: '',
    entries: [{ accountId: null, accountType: '', effect: '', amount: 0 }],
    amount: 0,
    currency: localCurrency?.currencyId,
    description: '',
    notes: ''
  }

  const {
    reset,
    control,
    setValue,
    getValues,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: defaultData,
    mode: 'onChange'
  })

  const check = () => {
    setOpen(true)
    const fieldName = Object.keys(errors)[0]
    const errName = document.getElementById(fieldName)
    errName?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
  }

  const entries = getValues('entries')

  const handleNewTransactionSubmit = async newData => {
    setOpen(false)
    setLoader(true)

    console.log('newData', newData)

    const transaction = {
      ...newData,
      transactionDate: parseDate(newData?.transactionDate),
      entries: entries?.map(({ id, ...item }) => ({
        ...item
      }))
    }

    try {
      const response = await writeData(createAccountEntryMutation(), { tenantId, transaction })

      if (response.createAccountEntry) {
        dispatch(setAddAccountTransaction(response.createAccountEntry))
        dispatch(createAlert({ message: 'Transaction created  successfully !', type: 'success' }))

        router.push('/accounting/transactions/')
      } else {
        setLoader(false)
        dispatch(createAlert({ message: 'Transaction creation  failed!', type: 'error' }))
      }
      return response
    } catch (error) {
      console.error('error: ', error)
      setLoader(false)
    }
  }

  const handleCancel = () => {
    reset()
    router.push('/accounting/transactions/')
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
            New Transaction
          </Typography>
        }
        button={
          <IconButton
            variant='outlined'
            color='default'
            sx={{ fontSize: '21px' }}
            component={Link}
            scroll={true}
            href={`/accounting/transactions/`}
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
          <form onSubmit={handleSubmit(handleNewTransactionSubmit)}>
            <Grid container spacing={{ xs: 6 }}>
              <Grid item xs={12} lg={8}>
                <Grid container spacing={{ xs: 2, md: 3, lg: 3, xl: 3 }}>
                  <Grid item xs={6} sm={4} md={3}>
                    <Controller
                      name='transactionDate'
                      control={control}
                      rules={{ required: false }}
                      render={({ field }) => (
                        <CustomDatePicker label='Date' fullWidth={true} date={field.value} onChange={field.onChange} />
                      )}
                    />
                  </Grid>

                  <Grid item xs={6} sm={4} md={3}>
                    <Controller
                      name='reference'
                      control={control}
                      rules={{ required: false }}
                      render={({ field }) => <CustomTextField {...field} fullWidth label='Reference' />}
                    />
                  </Grid>
                  <Grid item xs={6} sm={4} md={3}>
                    <Controller
                      name='amount'
                      control={control}
                      render={({ field }) => (
                        <CustomTextField
                          value={field?.value}
                          onChange={e => {
                            const value = e.target.value
                            const formattedValue = handleDecimalPlaces(value)
                            field.onChange(formattedValue)
                          }}
                          InputProps={{
                            ...localAdornmentConfig
                          }}
                          label='Amount'
                          fullWidth
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12} lg={9} xl={7.5}>
                <AccountTransactionTable
                  control={control}
                  errors={errors}
                  accounts={financialAccounts}
                  setValue={setValue}
                  typeOptions={typeOptions}
                  entries={entries}
                />
              </Grid>

              <Grid item xs={12} lg={7}>
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
              <Grid item xs={12} lg={7}>
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
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: { xs: 'center', sm: 'start' },
                gap: '20px',
                marginTop: { xs: '20px', sm: '30px' }
              }}
            >
              <Button variant='contained' type='submit' onClick={() => check(STATUS_DRAFT)}>
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
