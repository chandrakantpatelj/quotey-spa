'use client'
import { NumberFormat } from 'src/common-functions/utils/UtilityFunctions'
import {
  Alert,
  Box,
  Card,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material'
import { useSelector } from 'react-redux'
import CustomCloseButton from './CustomCloseButton'
import Icon from 'src/@core/components/icon'
import usePaymentMethods from 'src/hooks/getData/usePaymentMethods'
import useCurrencies from 'src/hooks/getData/useCurrencies'
import ClearedPurchaseOrdersPayableList from 'src/views/purchase/Payment/ClearedPurchaseOrdersPayableList'
import { useEffect, useMemo, useState } from 'react'
import useExpenses from 'src/hooks/getData/useExpenses'
import { getGeneralExpensesQuery } from 'src/@core/components/graphql/general-expense-queries'
import useGeneralExpenseType from 'src/hooks/getData/useGeneralExpenseType'
import { fetchData } from 'src/common-functions/GraphqlOperations'

function CommonExpensePopUp({ expenseId, open, setClose }) {
  const theme = useTheme()
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'))
  const tenant = useSelector(state => state.tenants?.selectedTenant)
  const { tenantId = '' } = tenant

  const { currencies } = useCurrencies()
  const { expenses } = useExpenses(tenantId)
  const [generalExpense, setGeneralExpense] = useState(null)
  const [loading, setLoading] = useState(true)
  const { paymentMethods } = usePaymentMethods(tenantId)
  const { generalExpenseTypes } = useGeneralExpenseType(tenantId)
  const payment = expenses?.find(item => item?.expenseId === expenseId)

  const currency = useMemo(
    () => currencies?.find(item => item?.currencyId === generalExpense?.currency) || {},
    [currencies, generalExpense?.currency] // ✅ Fixed dependency array
  )
  const getGeneralExpenseObject = async () => {
    setLoading(true)

    const payment = expenses?.find(item => item?.expenseId === expenseId)
    if (payment) {
      setGeneralExpense(payment)
      setLoading(false)
      return
    }

    try {
      const response = await fetchData(getGeneralExpensesQuery(tenantId, expenseId))
      if (response.getGeneralExpense) {
        setGeneralExpense(response.getGeneralExpense || null)
      }
    } catch (e) {
      console.error('Error fetching payment:', e)
      setGeneralExpense(null)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    getGeneralExpenseObject()
  }, [expenses, tenantId, expenseId])

  const expenseTypeObj = useMemo(
    () =>
      generalExpenseTypes?.find(item => {
        return item?.expenseTypeId === generalExpense?.expenseType
      }) || {},
    [generalExpense, generalExpenseTypes]
  )
  const paymentMethodObj = useMemo(
    () =>
      paymentMethods?.find(item => {
        return item?.paymentMethodId === generalExpense?.paymentMethod
      }) || {},
    [generalExpense, paymentMethods]
  )
  const handleClose = () => {
    console.log('Closing dialog...')
    setClose()
  }

  return (
    <Dialog
      open={open}
      disableEscapeKeyDown
      maxWidth='md'
      fullWidth={true}
      scroll='paper'
      aria-labelledby='alert-dialog-title'
      aria-describedby='alert-dialog-description'
      onClose={(event, reason) => {
        handleClose()
      }}
      sx={{
        '& .MuiDialog-paper': {
          overflow: 'visible',
          p: '20px 0px !important',
          verticalAlign: 'top'
        }
      }}
    >
      <DialogTitle id='alert-dialog-title'>
        <Alert severity='info' sx={{ color: 'rgba(0,0,0,0.8)' }}>
          Expense Details
        </Alert>{' '}
      </DialogTitle>
      <DialogContent sx={{ py: 8 }}>
        <CustomCloseButton onClick={handleClose}>
          <Icon icon='tabler:x' fontSize='1.25rem' />
        </CustomCloseButton>
        {loading ? (
          <LinearProgress />
        ) : generalExpense ? (
          <Card sx={{ p: 0 }}>
            <Grid container spacing={{ xs: 5, xl: 0 }}>
              <Grid item xs={12}>
                <Box sx={{ p: 6 }}>
                  <Table
                    sx={{
                      width: '100%',
                      border: 0,
                      '& .MuiTableCell-root': {
                        border: 0,
                        padding: '0px !important',
                        verticalAlign: 'top',
                        width: '50%'
                      },
                      '& .MuiTableCell-root .data-name': {
                        fontSize: '13px',
                        color: '#818181',
                        lineHeight: '28px'
                      },
                      '& .MuiTableCell-root .data-value': {
                        fontSize: '13px',
                        fontWeight: 500,
                        color: '#000',
                        lineHeight: '28px'
                      }
                    }}
                  >
                    <TableBody>
                      <TableRow>
                        <TableCell colSpan={2}>
                          <Typography
                            sx={{
                              fontSize: '13px',
                              fontWeight: 500,
                              lineHeight: '26px',
                              color: '#4567c6 !important',
                              textAlign: 'left'
                            }}
                          >
                            #{generalExpense?.expenseNoPrefix}
                            {generalExpense?.expenseNo}
                          </Typography>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <Typography className='data-name'>
                            Expense Type: {expenseTypeObj?.expenseType || ''}
                          </Typography>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <Typography className='data-name'>Reference: {generalExpense?.expenseRef || ''}</Typography>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <Typography className='data-name'>
                            Payment Method: {paymentMethodObj?.paymentMethod || ''}
                          </Typography>
                        </TableCell>
                      </TableRow>

                      <TableRow>
                        <TableCell>
                          <Typography className='data-name'>
                            Amount: <NumberFormat value={generalExpense?.amount} currency={currency} />
                          </Typography>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <Typography className='data-name'>Description: {generalExpense?.description}</Typography>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <Typography className='data-name'>Notes: {generalExpense?.notes}</Typography>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </Box>
              </Grid>
            </Grid>
          </Card>
        ) : (
          <Card sx={{ p: 6 }}>
            <Typography
              sx={{
                textAlign: 'center',
                fontSize: '16px',
                fontWeight: '500',
                color: '#FF0000'
              }}
            >
              Expense Not Found
            </Typography>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default CommonExpensePopUp
