import { Box, Button, FormHelperText, Grid } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import {
  createGeneralExpenseFromBankTransactionMutation,
  createGeneralExpenseMutation
} from 'src/@core/components/graphql/general-expense-queries'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import CustomTextField from 'src/@core/components/mui/text-field'
import { writeData } from 'src/common-functions/GraphqlOperations'
import { GENERAL_EXPENSE, SCHEMA_VERSION } from 'src/common-functions/utils/Constants'
import { filterPaymentMethods, parseDate, safeNumber } from 'src/common-functions/utils/UtilityFunctions'
import useGeneralExpenseType from 'src/hooks/getData/useGeneralExpenseType'
import usePaymentMethods from 'src/hooks/getData/usePaymentMethods'
import { createAlert } from 'src/store/apps/alerts'
import { resetExpenses, setUpdateExpense } from 'src/store/apps/expenses'
import CustomFilesUpload from 'src/views/forms/form-elements/custom-inputs/CustomFilesUpload'
import { UploadMultipleFileS3Api } from 'src/views/forms/form-elements/custom-inputs/UploadMultipleFileS3Api'
import CustomDatePicker from 'src/views/forms/form-elements/pickers/CustomDatePicker'

function CreateExpenseDrawer({ setOpenDrawer, transaction, setTransactions }) {
  const dispatch = useDispatch()
  const tenant = useSelector(state => state.tenants?.selectedTenant)
  const { tenantId } = tenant || ''
  const { paymentMethods } = usePaymentMethods(tenantId)

  const { generalExpenseTypes } = useGeneralExpenseType(tenantId)
  const currency = useSelector(state => state?.currencies?.selectedCurrency) || {}

  const [selectedPdFile, setSelectedPdFile] = useState([])
  const creditAmount = transaction?.debit
  const bankRelatedPaymentMethods = useMemo(() => filterPaymentMethods(paymentMethods), [paymentMethods])

  const expense_fields = {
    schemaVersion: SCHEMA_VERSION,
    expenseDate: transaction?.transactionDate,
    expenseType: '',
    expenseRef: '',
    paymentMethod: bankRelatedPaymentMethods[0]?.paymentMethodId ?? null,
    description: transaction?.description || '',
    notes: transaction?.notes || '',
    amount: creditAmount,
    currency: 'AUD',
    exchangeRate: '1',
    amountInLocalCurrency: creditAmount,
    bankTransactionId: transaction?.transactionId || null,
    files: []
  }

  const {
    reset,
    control,
    handleSubmit,
    setValue,

    formState: { errors }
  } = useForm({
    mode: 'onChange'
  })

  useEffect(() => {
    reset(expense_fields)
  }, [transaction])

  const toggleDrawer = open => event => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return
    }

    reset({})
    setOpenDrawer(open)
  }

  const closeDrawer = () => {
    setOpenDrawer(false)
    reset()
    toggleDrawer(false)
  }
  const createExpense = async expense => {
    setOpenDrawer(false)
    const modifiedObject = {
      ...expense,
      expenseDate: parseDate(expense.expenseDate),
      amount: safeNumber(expense.amount),
      exchangeRate: safeNumber(expense.exchangeRate)
    }
    try {
      // Call the mutation and await its response
      const response = await writeData(createGeneralExpenseFromBankTransactionMutation(), {
        tenantId,
        expense: modifiedObject
      })
      console.log('response', response)

      // Check if the mutation was successful
      if (response.createGeneralExpenseFromBankTransaction) {
        const { createGeneralExpenseFromBankTransaction } = response
        // Check if there are files to upload
        if (selectedPdFile?.length) {
          await UploadMultipleFileS3Api(selectedPdFile, dispatch)
        }
        dispatch(resetExpenses())
        setTransactions(prev => {
          return prev.map(item => {
            if (item.transactionId === createGeneralExpenseFromBankTransaction.transactionId) {
              return {
                ...item,
                status: createGeneralExpenseFromBankTransaction?.status,
                relatedRecords: createGeneralExpenseFromBankTransaction?.relatedRecords,
                matchType: createGeneralExpenseFromBankTransaction?.matchType
              }
            } else {
              return item
            }
          })
        })
        // Dispatch success alert
        dispatch(createAlert({ message: 'Expense created successfully!', type: 'success' }))
      } else {
        // Dispatch failure alert if the mutation didn't return expected data
        dispatch(createAlert({ message: 'Failed to create Expense!', type: 'error' }))
      }
    } catch (error) {
      // Log the error and dispatch an error alert
      console.error('Error:', error)
      dispatch(createAlert({ message: 'An error occurred while creating Expense.', type: 'error' }))
    }
  }
  return (
    <form onSubmit={handleSubmit(createExpense)}>
      <Grid container spacing={{ xs: 6 }}>
        <Grid item xs={12} md={12}>
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
                    value={bankRelatedPaymentMethods.find(option => option.paymentMethodId === field.value) || null}
                    onChange={(e, newValue) => {
                      field.onChange(newValue.paymentMethodId)
                    }}
                    disableClearable
                    renderInput={params => (
                      <CustomTextField
                        {...params}
                        label='Payment Method'
                        error={Boolean(errors.paymentMethod)}
                        {...(errors.paymentMethod && {
                          helperText: 'Payment Method is required'
                        })}
                      />
                    )}
                  />
                )}
              />
            </Grid>
            <Grid item xs={6} sm={6} md={4}>
              <Controller
                name='expenseType'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <CustomAutocomplete
                    id='expenseType'
                    {...field}
                    options={generalExpenseTypes}
                    getOptionLabel={option => option?.expenseType || ''}
                    value={generalExpenseTypes.find(option => option.expenseTypeId === field.value) || null}
                    onChange={(e, newValue) => {
                      field.onChange(newValue.expenseTypeId)
                    }}
                    disableClearable
                    renderInput={params => (
                      <CustomTextField
                        {...params}
                        label='Expense Type'
                        error={Boolean(errors.expenseType)}
                        {...(errors.expenseType && {
                          helperText: 'Expense Type is required'
                        })}
                      />
                    )}
                  />
                )}
              />
            </Grid>

            <Grid item xs={6} sm={6} md={4}>
              <Controller
                name='expenseDate'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <CustomDatePicker
                    label={'Date'}
                    fullWidth={true}
                    date={field?.value ? new Date(field.value) : field?.value}
                    onChange={field.onChange}
                    error={Boolean(errors?.expenseDate)}
                  />
                )}
              />
              {errors?.expenseDate && <FormHelperText error>Expense Date is required</FormHelperText>}
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} md={12}>
          <Grid container spacing={{ xs: 2, md: 3, lg: 3, xl: 3 }}>
            <Grid item xs={6} sm={6} md={4}>
              <CustomTextField
                label='Debit Amount'
                value={`${currency?.currencyId === 'AUD' ? currency?.symbol : ''} ${creditAmount || 0}`}
                disabled
                fullWidth
              />
            </Grid>
            <Grid item xs={6} sm={6} md={4}>
              <Controller
                name='expenseRef'
                control={control}
                rules={{ required: false }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    label='Reference'
                    fullWidth
                    error={Boolean(errors.expenseRef)}
                    {...(errors.expenseRef && {
                      helperText: 'Reference No is required'
                    })}
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
            render={({ field }) => <CustomTextField fullWidth label='Description' multiline minRows={2} {...field} />}
          />
        </Grid>

        <Grid item xs={12}>
          <Controller
            name='notes'
            control={control}
            rules={{ required: false }}
            render={({ field }) => <CustomTextField fullWidth {...field} label='Notes' multiline minRows={2} />}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomFilesUpload
            setValue={setValue}
            selectedPdFile={selectedPdFile}
            setSelectedPdFile={setSelectedPdFile}
            folderName={GENERAL_EXPENSE}
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
        <Button variant='contained' type='submit' disabled={transaction?.debit <= 0}>
          Save
        </Button>
        <Button variant='outlined' onClick={() => closeDrawer()}>
          Cancel
        </Button>
      </Box>
    </form>
  )
}

export default CreateExpenseDrawer
