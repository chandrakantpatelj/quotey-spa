'use client'
import {
  Box,
  Button,
  Divider,
  Drawer,
  FormHelperText,
  IconButton,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography
} from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import {
  createSalesInvoicePaymentsMutation,
  getMatchingSalesInvoicePaymentsMutation
} from 'src/@core/components/graphql/sales-payment-queries'
import Icon from 'src/@core/components/icon'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import CustomTextField from 'src/@core/components/mui/text-field'
import { writeData } from 'src/common-functions/GraphqlOperations'
import { BANK_PAYMENT_TYPE, SALES_INVOICE_PAYMENT_PDF, SCHEMA_VERSION } from 'src/common-functions/utils/Constants'
import { getAdornmentConfig, parseDate, safeNumber } from 'src/common-functions/utils/UtilityFunctions'
import { createAlert } from 'src/store/apps/alerts'
import CustomFilesUpload from 'src/views/forms/form-elements/custom-inputs/CustomFilesUpload'
import CustomDatePicker from 'src/views/forms/form-elements/pickers/CustomDatePicker'
import MultiCustomers from './MultiCustomers'
import { UploadMultipleFileS3Api } from 'src/views/forms/form-elements/custom-inputs/UploadMultipleFileS3Api'
import { getAllPendingOrdersMatchingPaymentInfo } from 'src/@core/components/graphql/sales-order-queries'
import usePaymentMethods from 'src/hooks/getData/usePaymentMethods'
import { resetSalesPayment } from 'src/store/apps/payments'
import { createInvestmentAccountEntryFromBankTransactionMutation } from 'src/@core/components/graphql/account-entry-queries'
import { createTaxPaymentFromBankTransactionMutation } from 'src/@core/components/graphql/tax-payments-queries'
import MultipleAccountTransaction from './MultipleAccountTransaction'

function TransactionReviewDrawer({ setOpenDrawer, transaction, openDrawer, setTransactions }) {
  const dispatch = useDispatch()
  const tenant = useSelector(state => state.tenants?.selectedTenant)
  const { tenantId } = tenant || ''
  const [total, setTotalAmount] = useState(0)
  const { paymentMethods } = usePaymentMethods(tenantId)
  const PaymentTypes = [
    { name: 'Sales Invoice Payment', value: 'PAYMENT' },
    { name: 'Tax Refund', value: 'REFUND' },
    { name: 'Investment', value: 'INVESTMENT' }
  ]
  const paymentMethodsByBank = useMemo(
    () => paymentMethods.filter(method => method.paymentMethodType === BANK_PAYMENT_TYPE),
    [paymentMethods]
  )

  const currency = useSelector(state => state?.currencies?.selectedCurrency) || {}
  const [selectedPdFile, setSelectedPdFile] = useState([])
  const [loader, setLoader] = useState(false)
  const localAdornmentConfig = getAdornmentConfig(currency)

  const creditAmount = transaction?.credit
  const Payment_Transaction_fields = {
    schemaVersion: SCHEMA_VERSION,
    paymentDate: transaction?.transactionDate,
    customers: [{ customerId: null, amount: 0 }],
    paymentType: '',
    paymentMethod: '',
    referenceNo: '',
    amount: creditAmount,
    currency: currency?.currencyId || null,
    description: transaction?.description || '',
    entries: [{ accountId: null, accountType: '', amount: creditAmount }],
    notes: transaction?.notes || '',
    bankTransactionId: transaction?.transactionId || null,
    files: []
  }
  const [selectedPaymentType, setSelectedPaymentType] = useState(null)
  const {
    reset,
    control,
    handleSubmit,
    setValue,
    getValues,
    setError,
    clearErrors,
    formState: { errors }
  } = useForm({
    mode: 'onChange',
    defaultValues: Payment_Transaction_fields
  })

  const [customerTotalAmount, setCustomerTotalAmount] = useState(0)
  const [entriesTotalAmount, setEntriesTotalAmount] = useState(0)

  useEffect(() => {
    reset(Payment_Transaction_fields)
  }, [transaction])

  const handleChangePaymentMethod = async paymentInfo => {
    try {
      setLoader(true)
      const { getMatchingSalesInvoicePayments } = await writeData(getMatchingSalesInvoicePaymentsMutation(), {
        tenantId,
        paymentInfo
      })
      if (getMatchingSalesInvoicePayments?.length) {
        setValue(
          'customers',
          getMatchingSalesInvoicePayments.map(({ customerId, amount, orderNo, paymentDate }) => ({
            customerId,
            orderNo,
            orderDate: parseDate(paymentDate),
            amount
          }))
        )
      } else {
        setValue('customers', [{ customerId: null, amount: 0 }])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoader(false)
    }
  }

  const toggleDrawer = open => event => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return
    }

    reset()
    setOpenDrawer(open)
  }

  const closeDrawer = () => {
    reset()
    setOpenDrawer(false)
    toggleDrawer(false)
  }
  const createMultiplePayment = async payment => {
    setOpenDrawer(false)

    const modifiedObject = {
      ...payment,
      customers: payment.customers.map(({ customerId, amount }) => {
        return {
          customerId,
          amount: safeNumber(amount)
        }
      }),
      paymentDate: parseDate(payment.paymentDate)
    }
    // const secondObject = {
    //   schemaVersion: payment.schemaVersion,
    //   paymentDate: parseDate(payment.paymentDate),
    //   amount: payment.amount,
    //   paymentMethod: payment.paymentMethod,
    //   currency: payment.currency,
    //   description: payment.description,
    //   notes: payment.notes,
    //   bankTransactionId: payment.bankTransactionId
    // }
    try {
      if (selectedPaymentType === 'INVESTMENT') {
        delete modifiedObject.customers
        modifiedObject.transactionDate = modifiedObject.paymentDate
        delete modifiedObject.paymentDate
        delete modifiedObject.files
        delete modifiedObject.paymentType
        delete modifiedObject.referenceNo
        const response = await writeData(createInvestmentAccountEntryFromBankTransactionMutation(), {
          tenantId,
          transaction: modifiedObject
        })
        if (response.createInvestmentAccountEntryFromBankTransaction) {
          setTransactions(prev => {
            return prev.map(item => {
              if (item.transactionId === response.createInvestmentAccountEntryFromBankTransaction.transactionId) {
                return {
                  ...item,
                  status: response.createInvestmentAccountEntryFromBankTransaction.status,
                  relatedRecords: response.createInvestmentAccountEntryFromBankTransaction.relatedRecords,
                  matchType: response.createInvestmentAccountEntryFromBankTransaction.matchType
                }
              } else {
                return item
              }
            })
          })

          if (selectedPdFile?.length) {
            await UploadMultipleFileS3Api(selectedPdFile, dispatch)
          }
          dispatch(createAlert({ message: 'Created account transaction !', type: 'success' }))
        } else {
          dispatch(createAlert({ message: response?.errors[0]?.message, type: 'error' }))
        }
      } else if (selectedPaymentType === 'REFUND') {
        delete modifiedObject.customers
        delete modifiedObject.entries
        const response = await writeData(createTaxPaymentFromBankTransactionMutation(), {
          tenantId,
          payment: modifiedObject
        })

        if (response.createTaxPaymentFromBankTransaction) {
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

          if (selectedPdFile?.length) {
            await UploadMultipleFileS3Api(selectedPdFile, dispatch)
          }
          dispatch(createAlert({ message: 'Created tax payments !', type: 'success' }))
        } else {
          dispatch(createAlert({ message: response?.errors[0]?.message, type: 'error' }))
        }
      } else {
        delete modifiedObject.entries

        const response = await writeData(createSalesInvoicePaymentsMutation(), { tenantId, payments: modifiedObject })
        if (response.createSalesInvoicePayments) {
          dispatch(resetSalesPayment())
          setTransactions(prev => {
            return prev.map(item => {
              if (item.transactionId === response.createSalesInvoicePayments.transactionId) {
                return {
                  ...item,
                  status: response.createSalesInvoicePayments.status,
                  relatedRecords: response.createSalesInvoicePayments.relatedRecords,
                  matchType: response.createSalesInvoicePayments.matchType
                }
              } else {
                return item
              }
            })
          })

          if (selectedPdFile?.length) {
            await UploadMultipleFileS3Api(selectedPdFile, dispatch)
          }
          dispatch(createAlert({ message: 'Created sales payments !', type: 'success' }))
        } else {
          dispatch(createAlert({ message: response?.errors[0]?.message, type: 'error' }))
        }
      }
    } catch (e) {
      console.error('error', e)
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
        <Typography sx={{ fontSize: { xs: '16px', md: '20px' }, fontWeight: 500 }}>Review</Typography>

        <IconButton
          sx={{ fontSize: '28px' }}
          color='primary'
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}
        >
          <Icon icon='tabler:x' />
        </IconButton>
      </Box>
      <form onSubmit={handleSubmit(createMultiplePayment)}>
        <Box sx={{ p: { xs: '20px', lg: '40px' } }}>
          <Table
            sx={{
              minWidth: 300,
              width: '100%',
              '& .MuiTableCell-root': {
                padding: '5px 6px !important',
                borderBottom: '0px',
                verticalAlign: 'top'
              }
            }}
          >
            <TableBody>
              <TableRow>
                <TableCell sx={{ width: '50%', mb: 3 }}>
                  <Controller
                    name='paymentType'
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <CustomAutocomplete
                        id='paymentType'
                        {...field}
                        options={PaymentTypes}
                        getOptionLabel={option => option.name || ''}
                        value={PaymentTypes.find(option => option.value === field?.value) || null}
                        onChange={(e, newValue) => {
                          field.onChange(newValue.value)
                          setSelectedPaymentType(newValue.value)
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
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={4}>
                  <Divider variant='fullWidth' orientation='horizontal' sx={{ display: 'block', my: 5 }} />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ width: '50%' }}>
                  <Controller
                    name='paymentMethod'
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <CustomAutocomplete
                        id='paymentMethod'
                        {...field}
                        options={paymentMethodsByBank}
                        getOptionLabel={option => option?.paymentMethod || ''}
                        value={paymentMethodsByBank.find(option => option.paymentMethodId === field.value) || null}
                        onChange={(e, newValue) => {
                          field.onChange(newValue.paymentMethodId)
                          if (
                            typeof newValue.paymentMethod === 'string' &&
                            newValue?.paymentMethod?.startsWith('EFTPOS')
                          ) {
                            const paymentInfo = {
                              paymentDate: getValues('paymentDate'),
                              paymentAmount: creditAmount || 0,
                              paymentMethod: newValue.paymentMethodId
                            }
                            handleChangePaymentMethod(paymentInfo)
                          }
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
                </TableCell>

                <TableCell sx={{ width: '50%' }}>
                  <Controller
                    name='paymentDate'
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <CustomDatePicker
                        label={'Date'}
                        fullWidth={true}
                        disabled={selectedPaymentType === 'PAYMENT'}
                        date={field?.value ? new Date(field.value) : field?.value}
                        onChange={date => {
                          field.onChange(date)

                          const paymentMethodId = getValues('paymentMethod')

                          const selectedMethod =
                            paymentMethodsByBank.find(option => option.paymentMethodId === paymentMethodId)
                              ?.paymentMethod || null

                          if (typeof selectedMethod === 'string' && selectedMethod.startsWith('EFTPOS')) {
                            const paymentInfo = {
                              paymentDate: date,
                              paymentAmount: creditAmount || 0,
                              paymentMethod: paymentMethodId
                            }
                            handleChangePaymentMethod(paymentInfo)
                          }
                        }}
                        error={Boolean(errors?.paymentDate)}
                      />
                    )}
                  />
                  {errors?.paymentDate && <FormHelperText error>PaymentDate is required</FormHelperText>}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ width: '20%' }}>
                  <CustomTextField
                    label='Credit Amount'
                    InputProps={{
                      ...localAdornmentConfig
                    }}
                    value={creditAmount || 0}
                    disabled
                    fullWidth
                  />
                </TableCell>
                <TableCell sx={{ width: '50%' }}>
                  <Controller
                    name='referenceNo'
                    control={control}
                    rules={{ required: false }}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        label='referenceNo'
                        fullWidth
                        error={Boolean(errors.referenceNo)}
                        {...(errors.referenceNo && {
                          helperText: 'Reference No is required'
                        })}
                      />
                    )}
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={4}>
                  <Divider variant='fullWidth' orientation='horizontal' sx={{ display: 'block', my: 5 }} />
                </TableCell>
              </TableRow>

              {selectedPaymentType === 'PAYMENT' &&
                (loader ? (
                  <TableRow>
                    <TableCell colSpan={4}>
                      <LinearProgress sx={{ mb: 4 }} />
                    </TableCell>
                  </TableRow>
                ) : (
                  <MultiCustomers
                    control={control}
                    errors={errors}
                    getValues={getValues}
                    setError={setError}
                    clearErrors={clearErrors}
                    creditAmount={creditAmount}
                    setCustomerTotalAmount={setCustomerTotalAmount}
                  />
                ))}
              {selectedPaymentType === 'INVESTMENT' && (
                <MultipleAccountTransaction
                  control={control}
                  errors={errors}
                  setValue={setValue}
                  setError={setError}
                  getValues={getValues}
                  clearErrors={clearErrors}
                  creditAmount={creditAmount}
                  setEntriesTotalAmount={setEntriesTotalAmount}
                />
              )}
              <TableRow>
                <TableCell colSpan={4}>
                  <Controller
                    name='description'
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <CustomTextField
                        fullWidth
                        {...field}
                        label='Description'
                        error={Boolean(errors.description)}
                        {...(errors.description && {
                          helperText: 'Description is required'
                        })}
                      />
                    )}
                  />
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell colSpan={4}>
                  <Controller
                    name='notes'
                    control={control}
                    rules={{ required: false }}
                    render={({ field }) => (
                      <CustomTextField
                        fullWidth
                        {...field}
                        label='Notes'
                        error={Boolean(errors.notes)}
                        {...(errors.notes && {
                          helperText: 'Notes is required'
                        })}
                      />
                    )}
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={4}>
                  <CustomFilesUpload
                    setValue={setValue}
                    selectedPdFile={selectedPdFile}
                    setSelectedPdFile={setSelectedPdFile}
                    folderName={SALES_INVOICE_PAYMENT_PDF}
                  />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: { xs: 'center', sm: 'end' },
              gap: '20px',
              marginTop: { xs: '30px', md: '50px' }
            }}
          >
            <Button
              variant='contained'
              type='submit'
              disabled={
                (selectedPaymentType === 'PAYMENT' && customerTotalAmount <= 0) ||
                (selectedPaymentType === 'INVESTMENT' && entriesTotalAmount <= 0)
              }
            >
              Save
            </Button>
            <Button variant='outlined' onClick={() => closeDrawer()}>
              Cancel
            </Button>
          </Box>
        </Box>
      </form>
    </Drawer>
  )
}

export default TransactionReviewDrawer
