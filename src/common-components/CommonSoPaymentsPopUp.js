import {
  Alert,
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
import { Box } from '@mui/system'
import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import Icon from 'src/@core/components/icon'
import { DateFunction, NumberFormat } from 'src/common-functions/utils/UtilityFunctions'
import useCurrencies from 'src/hooks/getData/useCurrencies'
import useCustomers from 'src/hooks/getData/useCustomers'
import usePaymentMethods from 'src/hooks/getData/usePaymentMethods'
import useSalesPayments from 'src/hooks/getData/useSalesPayment'
import ClearedSalesOrderReceivableList from 'src/views/sales/Payment/ClearedSalesOrderReceivableList'
import CustomCloseButton from './CustomCloseButton'

function CommonSoPaymentsPopUp({ paymentId, openSoPaymentDialog, setSoPaymentDialog }) {
  const tenantId = useSelector(state => state.tenants?.selectedTenant?.tenantId) || ''
  const { fetchSalesPayment, salesPaymentLoading } = useSalesPayments(tenantId)
  const theme = useTheme()

  const isLargeScreen = useMediaQuery(theme.breakpoints.up('xl'))

  const { currencies } = useCurrencies()
  const { fetchSingleCustomer } = useCustomers(tenantId)
  const { paymentMethods } = usePaymentMethods(tenantId)
  const [invoicePayment, setInvoicePayment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [customer, setCustomer] = useState({})

  useEffect(() => {
    const getCustomerObject = async () => {
      const customer = await fetchSingleCustomer(invoicePayment?.customerId)
      if (customer) {
        setCustomer(customer)
      }
    }
    getCustomerObject()
  }, [tenantId, invoicePayment?.customerId])

  const currency = useMemo(
    () => currencies?.find(item => item?.currencyId === invoicePayment?.currency) || {},
    [currencies, invoicePayment?.currency] // ✅ Fixed dependency array
  )

  const getSalesInvoicePaymentObject = async () => {
    if (!paymentId) return

    const payment = await fetchSalesPayment(paymentId)
    if (payment) {
      setInvoicePayment(payment)
      return
    }
  }
  useEffect(() => {
    getSalesInvoicePaymentObject()
  }, [tenantId, paymentId])

  const handleClose = () => {
    setSoPaymentDialog(false)
  }

  return (
    <Dialog
      open={openSoPaymentDialog}
      disableEscapeKeyDown
      maxWidth='xl'
      fullWidth={true}
      scroll='paper'
      aria-labelledby='alert-dialog-title'
      aria-describedby='alert-dialog-description'
      onClose={(event, reason) => {
        if (reason !== 'backdropClick') {
          handleClose()
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
          Invoice Payment Details
        </Alert>
      </DialogTitle>

      <DialogContent sx={{ py: 8 }}>
        <CustomCloseButton onClick={handleClose}>
          <Icon icon='tabler:x' fontSize='1.25rem' />
        </CustomCloseButton>

        {salesPaymentLoading ? (
          <LinearProgress />
        ) : invoicePayment ? (
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
                                #{invoicePayment?.paymentNo}
                              </Typography>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <Typography className='data-name'>
                                Date : {DateFunction(invoicePayment?.paymentDate)}{' '}
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
                                  paymentMethods.find(
                                    method => method.paymentMethodId === invoicePayment?.paymentMethod
                                  )?.paymentMethod
                                }
                              </Typography>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <Typography className='data-name'>
                                Reference : {invoicePayment?.referenceNo ? invoicePayment?.referenceNo : '-'}{' '}
                              </Typography>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <Typography className='data-name'>
                                Amount : <NumberFormat value={invoicePayment?.amount} currency={currency} />{' '}
                              </Typography>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <Typography className='data-name'>
                                Description : {invoicePayment?.description ? invoicePayment?.description : '-'}{' '}
                              </Typography>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <Typography className='data-name'>
                                Notes : {invoicePayment?.notes ? invoicePayment?.notes : '-'}{' '}
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
                  <ClearedSalesOrderReceivableList tenantId={tenantId} paymentId={invoicePayment?.paymentId} />
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
              Order Not Found / Deleted
            </Typography>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default CommonSoPaymentsPopUp
