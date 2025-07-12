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
  Snackbar,
  Alert,
  Backdrop,
  CircularProgress,
  LinearProgress,
  Divider
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
import {
  SCHEMA_VERSION,
  CREATE_STATEMENT,
  STATUS_CONFIRMED,
  STATUS_DRAFT,
  TAX_STATEMENT_PDF
} from 'src/common-functions/utils/Constants'
import { checkAuthorizedRoute, parseDate } from 'src/common-functions/utils/UtilityFunctions'
import CustomDatePicker from 'src/views/forms/form-elements/pickers/CustomDatePicker'
import { createTaxStatementMutation } from 'src/@core/components/graphql/tax-statement-queries'
import ErrorBoundary from 'src/pages/ErrorBoundary'
import { setAddtaxStatement } from 'src/store/apps/tax-statements'
import useTaxAuthorities from 'src/hooks/getData/useTaxAuthorities'
import { useFinancialAccounts } from 'src/hooks/getData/useFinancialAccounts'
import TaxStatementAccountsTable from 'src/views/accounting/tax-statements/TaxStatementAccountsTable'

export default function AddTaxStatement() {
  const router = Router
  const dispatch = useDispatch()
  const tenantId = useSelector(state => state.tenants?.selectedTenant?.tenantId) || ''

  const [isAuthorized, setIsAuthorized] = useState(false)
  const [open, setOpen] = useState(false)
  const [loader, setLoader] = React.useState(false)
  const [selectedPdFile, setSelectedPdFile] = useState([])
  const userProfile = useSelector(state => state.userProfile)
  const { taxAuthorities = [], loading: taxAuthoritiesLoading } = useTaxAuthorities(tenantId)
  const { financialAccounts, financialAccountloading } = useFinancialAccounts(tenantId)

  const loading = taxAuthoritiesLoading || financialAccountloading

  const liableAccounts = financialAccounts?.filter(val => val?.accountType === 'Liability')
  const assetAccounts = financialAccounts?.filter(val => val?.accountType === 'Asset' || val?.accountType === 'Expense')

  const [status, setStatus] = useState(false)

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }
    setOpen(false)
  }

  const defaultData = {
    schemaVersion: SCHEMA_VERSION,
    taxAuthorityId: '',
    periodStartDate: new Date(),
    periodEndDate: new Date(),
    description: '',
    notes: '',
    statementDate: new Date(),
    statementMethod: 'CASH',
    taxStatementAseetAccounts: [],
    taxStatementLiableAccounts: [],
    taxStatementAccounts: [],
    netStatementAmount: 0,
    status: '',
    files: []
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

  const check = status => {
    setStatus(status)
    setOpen(true)
    const fieldName = Object.keys(errors)[0]
    const errName = document.getElementById(fieldName)
    errName?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
  }

  const taxStatementLiableAccounts = getValues('taxStatementLiableAccounts')
  const taxStatementAseetAccounts = getValues('taxStatementAseetAccounts')

  const getTotal = () => {
    const assetsTotal = taxStatementAseetAccounts.reduce((sum, item) => {
      return sum + parseFloat(item?.amount)
    }, 0)
    const liableTotal = taxStatementLiableAccounts.reduce((sum, item) => {
      return sum + parseFloat(item?.amount)
    }, 0)
    return parseFloat(liableTotal - assetsTotal)
  }

  useEffect(() => {
    setValue('netStatementAmount', getTotal())
  }, [taxStatementAseetAccounts, taxStatementLiableAccounts])

  const handleNewTaxStatementSave = async newTaxStatement => {
    setOpen(false)
    setLoader(true)

    const { taxStatementLiableAccounts, taxStatementAseetAccounts, ...data } = newTaxStatement

    const taxStatementAccounts = [...taxStatementLiableAccounts, ...taxStatementAseetAccounts]

    const taxStatement = {
      ...data,
      status: status,
      periodStartDate: parseDate(newTaxStatement?.periodStartDate),
      periodEndDate: parseDate(newTaxStatement?.periodEndDate),
      statementDate: parseDate(newTaxStatement?.statementDate),
      taxStatementAccounts: taxStatementAccounts.map(({ id, ...item }) => ({
        ...item
      }))
    }

    try {
      const response = await writeData(createTaxStatementMutation(), { tenantId, taxStatement })

      if (response.createTaxStatement) {
        dispatch(setAddtaxStatement(response.createTaxStatement))
        dispatch(createAlert({ message: 'Tax Statement created  successfully !', type: 'success' }))
        if (selectedPdFile || selectedPdFile?.length !== 0 || selectedPdFile[0]) {
          await UploadMultipleFileS3Api(selectedPdFile, dispatch)
        }
        router.push('/accounting/tax-statements/')
      } else {
        setLoader(false)
        dispatch(createAlert({ message: 'Tax Statement creation  failed!', type: 'error' }))
      }
      return response
    } catch (error) {
      console.error('error: ', error)
      setLoader(false)
    }
  }

  const handleCancel = () => {
    reset()
    router.push('/accounting/tax-statements/')
  }

  useEffect(() => {
    if (checkAuthorizedRoute(CREATE_STATEMENT, router, userProfile)) {
      setIsAuthorized(true)
    } else {
      setIsAuthorized(false)
    }
  }, [tenantId, userProfile])

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
            Create Tax Statement
          </Typography>
        }
        button={
          <IconButton
            variant='outlined'
            color='default'
            sx={{ fontSize: '21px' }}
            component={Link}
            scroll={true}
            href={`/accounting/tax-statements/`}
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
          <form onSubmit={handleSubmit(handleNewTaxStatementSave)}>
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
                </Grid>
              </Grid>
              <Grid item xs={12} lg={8}>
                <Grid container spacing={{ xs: 2, md: 3, lg: 3, xl: 3 }}>
                  <Grid item xs={4} sm={4} md={3}>
                    <Controller
                      name='periodStartDate'
                      control={control}
                      rules={{ required: false }}
                      render={({ field }) => (
                        <CustomDatePicker
                          label='Period StartDate'
                          fullWidth={true}
                          date={field.value}
                          onChange={field.onChange}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={4} sm={4} md={3}>
                    <Controller
                      name='periodEndDate'
                      control={control}
                      rules={{ required: false }}
                      render={({ field }) => (
                        <CustomDatePicker
                          label='Period EndDate'
                          fullWidth={true}
                          date={field.value}
                          onChange={field.onChange}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={4} sm={4} md={3}>
                    <Controller
                      name='statementDate'
                      control={control}
                      rules={{ required: false }}
                      render={({ field }) => (
                        <CustomDatePicker
                          label={'Statement Date'}
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
                  <Grid item xs={12} sm={12} md={6}>
                    <TaxStatementAccountsTable
                      control={control}
                      errors={errors}
                      namePrefix='taxStatementLiableAccounts'
                      title='Summary of amounts you owes to tax authority'
                      accounts={liableAccounts}
                      setValue={setValue}
                    />
                  </Grid>
                  <Grid item xs={12} sm={12} md={6}>
                    <TaxStatementAccountsTable
                      control={control}
                      errors={errors}
                      namePrefix='taxStatementAseetAccounts'
                      title='Summary of amounts tax authority owes to you'
                      accounts={assetAccounts}
                      setValue={setValue}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Divider variant='fullWidth' orientation='horizontal' sx={{ display: 'block', mb: 8 }} />

                    <Box sx={{ width: '200px', ml: 'auto' }}>
                      <Controller
                        name='netStatementAmount'
                        control={control}
                        render={({ field }) => (
                          <CustomTextField
                            value={parseFloat(field?.value).toFixed(2)}
                            InputProps={{
                              disabled: true
                            }}
                            label='Net Statement Amount'
                            fullWidth
                          />
                        )}
                      />
                    </Box>
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
                  folderName={TAX_STATEMENT_PDF}
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
              <Button variant='contained' type='submit' onClick={() => check(STATUS_CONFIRMED)}>
                Save As Confirmed
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
