import { DateFunction, NumberFormat, rowStatusChip } from 'src/common-functions/utils/UtilityFunctions'
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
import useVendors from 'src/hooks/getData/useVendors'
import ClearedPurchaseOrdersPayableList from 'src/views/purchase/Payment/ClearedPurchaseOrdersPayableList'
import usePurchasePayments from 'src/hooks/getData/usePurchasePayment'
import { useEffect, useMemo, useState } from 'react'
import { getPurchaseOrderPaymentQuery } from 'src/@core/components/graphql/purchases-payment-queries'
import { fetchData } from 'src/common-functions/GraphqlOperations'

function CommonPoPaymentsPopUp({ paymentId, open, onClose }) {
  const theme = useTheme()
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'))
  const tenant = useSelector(state => state.tenants?.selectedTenant)
  const { tenantId = '' } = tenant
  const { currencies } = useCurrencies()
  const { vendors } = useVendors(tenantId)
  const { purchasePayments } = usePurchasePayments(tenantId)
  const { paymentMethods } = usePaymentMethods(tenantId)
  const paymentCurrency = useSelector(state => state?.currencies?.selectedCurrency)
  const [payment, setPayment] = useState(null)
  const [loading, setLoading] = useState(true)

  const vendor = useMemo(() => {
    return vendors?.find(item => item?.vendorId === payment?.vendorId) ?? ''
  }, [vendors, payment?.vendorId])

  const amtCurrency = useMemo(() => {
    return currencies?.find(currencyObj => currencyObj.currencyId === payment?.currency)
  }, [currencies, payment?.currency])

  const paymentMethod = useMemo(() => {
    return paymentMethods?.find(method => method.paymentMethodId === payment?.paymentMethod) || {}
  }, [paymentMethods, payment?.paymentMethod])

  const getPOPaymentObject = async () => {
    setLoading(true)
    const payment = purchasePayments?.find(item => item?.paymentId === paymentId)
    if (payment) {
      setPayment(payment)
      setLoading(false)
      return
    }
    try {
      const response = await fetchData(getPurchaseOrderPaymentQuery(tenantId, paymentId))
      if (response.getPurchaseOrderPayment) {
        setPayment(response.getPurchaseOrderPayment || null)
      }
    } catch (e) {
      console.error('Error fetching payment:', e)
      setPayment(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!payment) {
      getPOPaymentObject()
    }
  }, [purchasePayments, tenantId, paymentId])

  return (
    <Dialog
      open={open}
      disableEscapeKeyDown
      maxWidth='xl'
      fullWidth={true}
      scroll='paper'
      aria-labelledby='alert-dialog-title'
      aria-describedby='alert-dialog-description'
      onClose={(event, reason) => {
        if (reason !== 'backdropClick') {
          onClose
        }
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
          Purchase Payment
        </Alert>{' '}
      </DialogTitle>
      <DialogContent sx={{ py: 8 }}>
        <CustomCloseButton onClick={onClose}>
          <Icon icon='tabler:x' fontSize='1.25rem' />
        </CustomCloseButton>
        {loading ? (
          <LinearProgress />
        ) : payment ? (
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
                          <Typography className='data-name'>Date : {DateFunction(payment?.paymentDate)}</Typography>
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
              Payment Not Found / Deleted
            </Typography>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default CommonPoPaymentsPopUp
