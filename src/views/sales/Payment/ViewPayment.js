// ** Next Import
import { Close } from '@mui/icons-material'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import {
  Box,
  Button,
  Card,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
  useMediaQuery
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import Link from 'next/link'
import Router from 'next/router'
import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Icon from 'src/@core/components/icon'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import CustomTextField from 'src/@core/components/mui/text-field'
import PageHeader from 'src/@core/components/page-header'
import PageWrapper from 'src/@core/layouts/PageWrapper'
import {
  CREATE_SALES_PAYMENT,
  EDIT_SALES_PAYMENT,
  STATUS_AWAITING_RECONCILIATION,
  STATUS_PENDING_CLEARANCE
} from 'src/common-functions/utils/Constants'
import { DateFunction, hasPermission, NumberFormat } from 'src/common-functions/utils/UtilityFunctions'
import useCurrencies from 'src/hooks/getData/useCurrencies'
import useCustomers from 'src/hooks/getData/useCustomers'
import usePaymentMethods from 'src/hooks/getData/usePaymentMethods'
import { setActionPayment } from 'src/store/apps/payments'
import ClearedSalesOrderReceivableList from './ClearedSalesOrderReceivableList'

export default function ViewPayment({ paymentData, loading }) {
  const route = Router
  const theme = useTheme()
  const dispatch = useDispatch()
  const tenant = useSelector(state => state.tenants?.selectedTenant)
  const { tenantId = '' } = tenant
  const { paymentMethods } = usePaymentMethods(tenantId)
  const { currencies } = useCurrencies()
  const { customers, fetchCustomers, fetchSingleCustomer } = useCustomers(tenantId)
  const { payments = [] } = paymentData || {}
  const payment = useSelector(state => state?.salesPayments?.selectedPayment) || {}
  const userProfile = useSelector(state => state.userProfile)
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('xl'))
  const [filteredSOPayments, setFiltereSOPayments] = useState([])
  const [customer, setCustomer] = useState({})

  useEffect(() => {
    if (Object.keys(payment).length === 0) {
      route.push('/sales/payments/')
    }
  }, [payment, tenantId])

  useEffect(() => {
    if (!tenantId) return
    const loadCustomers = async () => {
      await fetchCustomers()
    }

    loadCustomers()
  }, [tenantId, fetchCustomers])

  useEffect(() => {
    const getCustomerObject = async () => {
      const customer = await fetchSingleCustomer(payment?.customerId)
      if (customer) {
        setCustomer(customer)
      }
    }
    getCustomerObject()
  }, [tenantId, payment?.customerId])

  const currency = useMemo(
    () => currencies?.find(item => item?.currencyId === payment?.currency) || {},
    [currencies, payment?.currency]
  )

  const handleSearchChange = (event, newValue) => {
    const searchValue = newValue ? newValue.toLowerCase() : ''

    if (searchValue) {
      const matchedSOPayments = payments.filter(payment => {
        const customer = customers.find(cust => cust.customerId === payment.customerId)
        const customerName = customer ? customer.customerName.toLowerCase() : ''
        const amount = payment.amount ? payment.amount.toString().toLowerCase() : ''

        return (
          payment.paymentNo.toLowerCase().includes(searchValue) ||
          customerName.includes(searchValue) ||
          amount.includes(searchValue)
        )
      })

      setFiltereSOPayments(matchedSOPayments.length > 0 ? matchedSOPayments : [])
    } else {
      setFiltereSOPayments([])
      // setSearchedSOPayments('')
    }
  }
  return (
    <div>
      <PageHeader
        title={
          <Typography
            sx={{
              fontSize: { xs: '16px', md: '18px' },
              fontWeight: '500'
            }}
          >
            View Payment - {payment?.paymentNoPrefix}
            {payment?.paymentNo}
          </Typography>
        }
        button={
          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
            {hasPermission(userProfile, CREATE_SALES_PAYMENT) && (
              <Button
                variant='contained'
                color='primary'
                sx={{ display: { xs: 'none', sm: 'flex' } }}
                startIcon={<AddOutlinedIcon />}
                component={Link}
                scroll={true}
                href={`/sales/payments/new-payment`}
              >
                New
              </Button>
            )}

            {hasPermission(userProfile, EDIT_SALES_PAYMENT) &&
              payment?.reconciliationStatus === STATUS_AWAITING_RECONCILIATION &&
              (payment?.status === STATUS_AWAITING_RECONCILIATION || payment?.status === STATUS_PENDING_CLEARANCE) && (
                <IconButton
                  variant='outlined'
                  component={Link}
                  scroll={true}
                  href={`/sales/payments/edit/${payment?.paymentId}`}
                  onClick={() => {
                    dispatch(setActionPayment(payment))
                  }}
                >
                  <Icon icon='tabler:edit' />
                </IconButton>
              )}

            <IconButton variant='outlined' color='default' component={Link} scroll={true} href='/sales/payments/'>
              <Close sx={{ color: theme => theme.palette.primary.main }} />
            </IconButton>
          </Box>
        }
      />
      <PageWrapper>
        {loading ? (
          <LinearProgress />
        ) : (
          <>
            <Grid container spacing={{ xs: 5, xl: 10 }} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={6} lg={4} xl={4}>
                <CustomAutocomplete
                  options={filteredSOPayments.length > 0 ? filteredSOPayments : payments}
                  getOptionLabel={option => {
                    if (!option) return ''

                    const customer = customers.find(cust => cust.customerId === option.customerId)
                    const currencyObj = currencies.find(cur => cur.currencyId === option.currency)
                    const currencySymbol = currencyObj ? currencyObj.symbol : ''

                    const formattedAmount =
                      option.amount && currencySymbol ? `-${currencySymbol} ${option.amount.toLocaleString()}` : ''
                    return `${customer?.customerName} - ${option.paymentNo} ${formattedAmount}`.trim()
                  }}
                  filterOptions={options => options}
                  value={payments.find(option => option.paymentId === payment.paymentId) || null}
                  onChange={(event, newValue) => {
                    newValue && dispatch(setActionPayment(newValue))
                  }}
                  onInputChange={(event, newValue) => handleSearchChange(event, newValue)}
                  disableClearable
                  renderInput={params => <CustomTextField {...params} fullWidth label='Payments' />}
                />
              </Grid>
            </Grid>

            <Card sx={{ p: 0 }}>
              <Grid container spacing={{ xs: 5, xl: 0 }}>
                <Grid item xs={12} xl={2.5}>
                  <Grid container spacing={8}>
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
                                    fontSize: '14px',
                                    fontWeight: 500,
                                    lineHeight: '26px',
                                    color: '#4567c6 !important',
                                    textAlign: 'left'
                                  }}
                                >
                                  #{payment?.paymentNo}
                                </Typography>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>
                                <Typography className='data-name'>
                                  Date : {DateFunction(payment?.paymentDate)}{' '}
                                </Typography>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>
                                <Typography className='data-name'>Customer : {customer?.customerName}</Typography>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>
                                <Typography className='data-name'>
                                  Payment Method :{' '}
                                  {
                                    paymentMethods.find(method => method.paymentMethodId === payment?.paymentMethod)
                                      ?.paymentMethod
                                  }
                                </Typography>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>
                                <Typography className='data-name'>
                                  Reference : {payment?.referenceNo ? payment?.referenceNo : '-'}{' '}
                                </Typography>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>
                                <Typography className='data-name'>
                                  Amount : <NumberFormat value={payment?.amount} currency={currency} />{' '}
                                </Typography>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>
                                <Typography className='data-name'>
                                  Description : {payment?.description ? payment?.description : '-'}{' '}
                                </Typography>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>
                                <Typography className='data-name'>
                                  Notes : {payment?.notes ? payment?.notes : '-'}{' '}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </Box>{' '}
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12} xl={0.5} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <Divider
                    orientation={isLargeScreen ? 'vertical' : 'horizontal'}
                    flexItem={true}
                    sx={{ width: '100%' }}
                  />
                </Grid>
                <Grid item xs={12} xl={9}>
                  <Box sx={{ p: 6 }}>
                    <ClearedSalesOrderReceivableList tenantId={tenantId} paymentId={payment?.paymentId} />
                  </Box>
                </Grid>
              </Grid>
            </Card>
          </>
        )}
      </PageWrapper>
    </div>
  )
}
