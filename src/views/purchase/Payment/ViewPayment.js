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
  useMediaQuery,
  useTheme
} from '@mui/material'
import Link from 'next/link'
import Router from 'next/router'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import CustomTextField from 'src/@core/components/mui/text-field'
import PageHeader from 'src/@core/components/page-header'
import PageWrapper from 'src/@core/layouts/PageWrapper'
import { CREATE_PURCHASE_PAYMENT } from 'src/common-functions/utils/Constants'
import { DateFunction, hasPermission, NumberFormat, rowStatusChip } from 'src/common-functions/utils/UtilityFunctions'
import usePaymentMethods from 'src/hooks/getData/usePaymentMethods'
import usePurchasePayments from 'src/hooks/getData/usePurchasePayment'
import { setActionPayment } from 'src/store/apps/purchases-payment'
import ClearedPurchaseOrdersPayableList from './ClearedPurchaseOrdersPayableList'

export default function ViewPurchasePayment({ paymentData, loading }) {
  const route = Router
  const dispatch = useDispatch()
  const theme = useTheme()

  const isLargeScreen = useMediaQuery(theme.breakpoints.up('xl'))
  const userProfile = useSelector(state => state.userProfile)
  const { vendors = [], currencies = [], taxAuthorities = [] } = paymentData || {}
  const payment = useSelector(state => state?.purchasesPayment?.selectedPayment)
  const tenantId = useSelector(state => state.tenants?.selectedTenant?.tenantId) || ''
  const { paymentMethods } = usePaymentMethods(tenantId)
  const paymentCurrency = useSelector(state => state?.currencies?.selectedCurrency)
  const vendor = vendors?.find(item => item?.vendorId === payment?.vendorId) ?? {}
  const taxAuthority = taxAuthorities?.find(item => item?.taxAuthorityId === payment?.taxAuthorityId) ?? {}

  const amtCurrency = currencies?.find(cuurencyObj => cuurencyObj.currencyId === payment.currency)
  const paymentMethod = paymentMethods?.find(method => method.paymentMethodId === payment?.paymentMethod) || {}
  const { purchasePayments } = usePurchasePayments(tenantId)
  const [filteredPOPayments, setFilterePOPayments] = useState([])

  useEffect(() => {
    if (Object.keys(payment).length === 0) {
      route.push('/purchases/payments/')
    }
  }, [payment, tenantId])

  const handleSearchChange = (event, newValue) => {
    const searchValue = newValue ? newValue.toLowerCase() : ''

    if (searchValue) {
      const matchedSOPayments = purchasePayments.filter(payment => {
        const vendor = vendors.find(vend => vend.vendorId === payment.vendorId)
        const displayName = vendor ? vendor.displayName.toLowerCase() : ''
        const amount = payment.amount ? payment.amount.toString().toLowerCase() : ''

        return (
          payment.paymentNo.toLowerCase().includes(searchValue) ||
          displayName.includes(searchValue) ||
          amount.includes(searchValue)
        )
      })

      setFilterePOPayments(matchedSOPayments.length > 0 ? matchedSOPayments : [])
    } else {
      setFilterePOPayments([])
    }
  }
  return (
    <React.Fragment>
      <PageHeader
        title={
          <Typography
            sx={{
              fontSize: { xs: '16px', md: '18px' },
              fontWeight: '500'
            }}
          >
            View Payment - {payment?.paymentNo}
          </Typography>
        }
        button={
          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
            {hasPermission(userProfile, CREATE_PURCHASE_PAYMENT) && (
              <Button
                variant='contained'
                color='primary'
                sx={{ display: { xs: 'none', sm: 'flex' } }}
                startIcon={<AddOutlinedIcon />}
                component={Link}
                scroll={true}
                href={`/purchases/payments/new-payment`}
              >
                New
              </Button>
            )}

            <IconButton component={Link} scroll={true} href='/purchases/payments/'>
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
                  options={filteredPOPayments.length > 0 ? filteredPOPayments : purchasePayments}
                  getOptionLabel={option => {
                    if (!option) return ''

                    const vendor = vendors.find(vend => vend.vendorId === option.vendorId)
                    const currencyObj = currencies.find(cur => cur.currencyId === option.currency)
                    const currencySymbol = currencyObj ? currencyObj.symbol : ''

                    const formattedAmount =
                      option.amount && currencySymbol ? `-${currencySymbol} ${option.amount.toLocaleString()}` : ''
                    return `${vendor?.displayName} - ${option.paymentNo} ${formattedAmount}`.trim()
                  }}
                  filterOptions={options => options}
                  value={purchasePayments.find(option => option.paymentId === payment.paymentId) || null}
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
                <Grid item xs={12} xl={3}>
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
                          <TableCell>
                            <Typography className='data-name'>Date : {DateFunction(payment?.paymentDate)}</Typography>
                          </TableCell>
                        </TableRow>
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
                              #{payment?.paymentNoPrefix}
                              {payment?.paymentNo}
                            </Typography>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <Typography className='data-name'>Status : {rowStatusChip(payment?.status)}</Typography>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <Typography className='data-name'>
                              Reconciliation Status : {rowStatusChip(payment?.reconciliationStatus)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <Typography className='data-name'>Vendor : {vendor?.displayName}</Typography>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <Typography className='data-name'>
                              Tax Authority : {taxAuthority?.taxAuthorityName || '-'}
                            </Typography>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <Typography className='data-name'>
                              Invoice Amount : <NumberFormat value={payment?.amount} currency={amtCurrency} />
                            </Typography>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <Typography className='data-name'>
                              Paid Amount : <NumberFormat value={payment?.paidAmount} currency={paymentCurrency} />
                            </Typography>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <Typography className='data-name'>
                              Payment Method : {paymentMethod?.paymentMethod || '-'}
                            </Typography>
                          </TableCell>
                        </TableRow>

                        <TableRow>
                          <TableCell>
                            <Typography className='data-name'>Reference : {payment?.referenceNo || '-'} </Typography>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <Typography className='data-name'>Notes : {payment?.notes || '-'} </Typography>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <Typography className='data-name'>Description : {payment?.description || '-'} </Typography>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </Box>
                </Grid>

                <Grid item xs={12} xl={0.2} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <Divider
                    orientation={isLargeScreen ? 'vertical' : 'horizontal'}
                    flexItem={true}
                    sx={{ width: '100%' }}
                  />
                </Grid>
                <Grid item xs={12} xl={8.8}>
                  <Box sx={{ p: 6 }}>
                    <ClearedPurchaseOrdersPayableList tenantId={tenantId} paymentId={payment?.paymentId} />
                  </Box>
                </Grid>
              </Grid>
            </Card>
          </>
        )}
      </PageWrapper>
    </React.Fragment>
  )
}
