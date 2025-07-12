// ** Next Import
import {
  Alert,
  Box,
  Card,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography
} from '@mui/material'
import { useEffect, useMemo, useRef, useState } from 'react'
import { NumericFormat } from 'react-number-format'
import { useSelector } from 'react-redux'
import { useReactToPrint } from 'react-to-print'
import Icon from 'src/@core/components/icon'
import CommonCustomerPopup from 'src/common-components/CommonCustomerPopup'
import {
  CommonAddress,
  CommonViewTable,
  CompanyData,
  RendorDimensions,
  RendorSalesItemData,
  ShowAddress,
  ViewItemsTableWrapper
} from 'src/common-components/CommonPdfDesign'
import LogoBox from 'src/common-components/LogoBox'
import StyledButton from 'src/common-components/StyledMuiButton'
import {
  DateFunction,
  findObjectByCurrencyId,
  NumberFormat,
  rowStatusChip
} from 'src/common-functions/utils/UtilityFunctions'
import useCurrencies from 'src/hooks/getData/useCurrencies'
import useCustomers from 'src/hooks/getData/useCustomers'
import useSalesInvoices from 'src/hooks/getData/useSaleInvoices'
import useIsDesktop from 'src/hooks/IsDesktop'
import SalesInvoiceWidgets from 'src/views/sales/SalesInvoice/SalesInvoiceWidgets'
import CustomCloseButton from './CustomCloseButton'

export default function CommonInvoicePopUp({ invoiceId, open, setOpen }) {
  const tenant = useSelector(state => state.tenants?.selectedTenant) || ''
  const { tenantId = '' } = tenant

  const { currencies, loading: currencyLoading } = useCurrencies()
  const { fetchSingleCustomer, customerLoading } = useCustomers(tenantId)

  const isDesktop = useIsDesktop()
  const [salesInvoice, setSalesInvoice] = useState({})
  const { fetchSalesInvoice, loading: salesInvoiceLoader } = useSalesInvoices(tenantId)
  const [customer, setCustomer] = useState(null)

  const loading = currencyLoading || customerLoading || salesInvoiceLoader

  useEffect(() => {
    const fetchData = async () => {
      if (!invoiceId) return
      const invoiceData = await fetchSalesInvoice(invoiceId)
      if (invoiceData?.customerId) {
        const customer = await fetchSingleCustomer(invoiceData?.customerId)
        if (customer) {
          setCustomer(customer)
        }
      }
      setSalesInvoice(invoiceData)
    }
    fetchData()
  }, [invoiceId])

  const {
    totalAmount = 0,
    subtotal = 0,
    totalQty = 0,
    discountValue = 0,
    taxes = [],
    otherCharges = []
  } = salesInvoice || {}

  const componentRef = useRef(null)
  const handlePrint = useReactToPrint({
    content: () => componentRef.current
  })

  const currency = useMemo(() => findObjectByCurrencyId(currencies, salesInvoice?.currency), [currencies, salesInvoice])

  const [openCustomerDialog, setOpenCustomerDialog] = useState(false)

  const handleCustomerDialoge = () => {
    setOpenCustomerDialog(!openCustomerDialog)
  }

  const handleClose = () => {
    setOpen(false)
  }

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
          handleClose()
        }
      }}
      sx={{
        '& .MuiDialog-paper': {
          overflow: 'visible',
          p: '20px 0px !important',
          height: '100%',
          verticalAlign: 'top'
        }
      }}
    >
      <DialogTitle id='alert-dialog-title'>
        <Alert severity='info' sx={{ color: 'rgba(0,0,0,0.8)' }}>
          Invoice Details
        </Alert>{' '}
      </DialogTitle>
      <DialogContent sx={{ py: 8 }}>
        <CustomCloseButton onClick={handleClose}>
          <Icon icon='tabler:x' fontSize='1.25rem' />
        </CustomCloseButton>

        {loading ? (
          <LinearProgress />
        ) : (
          <Grid container spacing={{ xs: 5 }}>
            <Grid item xs={12} md={12} lg={7.5} xl={7.5}>
              <Card sx={{ p: 6, width: '100%' }}>
                <Grid container spacing={5}>
                  <Grid item xs={12}>
                    <Grid
                      container
                      spacing={5}
                      sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' }
                      }}
                    >
                      <Grid item xs={12} sm={6} md={6.5} xl={7.5}>
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', md: 'row' },
                            flexWrap: { xs: 'wrap', md: 'nowrap' },
                            gap: 2
                          }}
                        >
                          <LogoBox data={salesInvoice} />
                          <div>
                            <CompanyData data={salesInvoice} />
                          </div>
                        </Box>
                      </Grid>

                      <Grid item xs={12} sm={6} md={5} lg={4.5} xl={4.5}>
                        <CommonViewTable>
                          <TableBody>
                            {' '}
                            <TableRow>
                              <TableCell sx={{ width: '50%' }}>
                                <Typography
                                  className='data-name'
                                  sx={{
                                    lineHeight: '22px'
                                  }}
                                >
                                  Order Date
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography className='data-value' sx={{ fontWeight: 400, lineHeight: '22px' }}>
                                  {DateFunction(salesInvoice?.invoiceDate)}
                                </Typography>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell sx={{ width: '50%' }}>
                                <Typography
                                  className='data-name'
                                  sx={{
                                    lineHeight: '22px'
                                  }}
                                >
                                  Due Date
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography className='data-value' sx={{ fontWeight: 400, lineHeight: '22px' }}>
                                  {DateFunction(salesInvoice?.dueDate)}
                                </Typography>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell sx={{ width: '50%' }}>
                                <Typography
                                  className='data-name'
                                  sx={{
                                    lineHeight: '22px'
                                  }}
                                >
                                  Terms
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography className='data-value' sx={{ fontWeight: 400, lineHeight: '22px' }}>
                                  {salesInvoice?.paymentTerms ? salesInvoice?.paymentTerms : '-'}
                                </Typography>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell sx={{ width: '50%' }}>
                                <Typography
                                  className='data-name'
                                  sx={{
                                    lineHeight: '22px'
                                  }}
                                >
                                  Invoice No
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography
                                  className='data-value'
                                  sx={{
                                    fontWeight: 400,
                                    lineHeight: '22px',
                                    color: '#4567c6 !important'
                                  }}
                                >
                                  #{salesInvoice?.invoiceNo}
                                </Typography>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell sx={{ width: '50%' }}>
                                <Typography
                                  className='data-name'
                                  sx={{
                                    lineHeight: '22px'
                                  }}
                                >
                                  Status{' '}
                                </Typography>
                              </TableCell>
                              <TableCell>{rowStatusChip(salesInvoice?.status)}</TableCell>
                            </TableRow>
                          </TableBody>
                        </CommonViewTable>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={12}>
                    <Grid
                      container
                      spacing={5}
                      sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' }
                      }}
                    >
                      {' '}
                      <Grid item xs={12} sm={6} md={5} xl={3.5}>
                        <Typography
                          sx={{
                            fontSize: '13px',
                            fontWeight: 600,
                            lineHeight: '24px'
                          }}
                        >
                          Customer
                        </Typography>
                        <CommonViewTable>
                          <TableBody>
                            <TableRow>
                              <TableCell>
                                <StyledButton color='primary' onClick={handleCustomerDialoge}>
                                  {' '}
                                  {customer?.customerName}
                                </StyledButton>
                                {openCustomerDialog && (
                                  <CommonCustomerPopup
                                    customerId={customer?.customerId}
                                    open={openCustomerDialog}
                                    setOpen={setOpenCustomerDialog}
                                  />
                                )}
                              </TableCell>
                            </TableRow>

                            <CommonAddress data={customer} />
                          </TableBody>
                        </CommonViewTable>
                      </Grid>
                      <Grid item xs={0} sm={0} md={1.5} xl={3.6} sx={{ display: { xs: 'none', md: 'block' } }}></Grid>
                      <Grid item xs={12} sm={6} md={5} lg={4} xl={3.7}>
                        {' '}
                        <Typography
                          sx={{
                            fontSize: '13px',
                            fontWeight: 600,
                            lineHeight: '24px'
                          }}
                        >
                          Delivery Address
                        </Typography>
                        <CommonViewTable>
                          <TableBody>
                            <ShowAddress data={salesInvoice?.deliveryAddress} />
                          </TableBody>
                        </CommonViewTable>
                      </Grid>{' '}
                    </Grid>
                  </Grid>
                  <Grid item xs={12}>
                    <ViewItemsTableWrapper>
                      {' '}
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ width: '3%' }}>#</TableCell>
                          <TableCell sx={{ width: '40%' }}>Item</TableCell>
                          <TableCell sx={{ width: '8%' }}>Qty</TableCell>
                          {isDesktop ? <TableCell sx={{ width: '11%' }}>Rate</TableCell> : null}
                          <TableCell sx={{ width: '18%' }}>Total</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {salesInvoice?.invoiceItems?.length > 0 ? (
                          salesInvoice?.invoiceItems?.map((orderItem, index) => {
                            return (
                              <TableRow key={orderItem.itemId}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>
                                  <RendorSalesItemData
                                    index={index}
                                    orderItem={orderItem}
                                    currency={currency}
                                    showData={true}
                                  />
                                  <RendorDimensions orderItem={orderItem} />
                                </TableCell>

                                <TableCell>
                                  {orderItem?.qty} {orderItem?.uom}
                                </TableCell>

                                {isDesktop ? (
                                  <TableCell>
                                    <NumberFormat value={orderItem?.sellingPrice.toFixed(2)} currency={currency} />
                                  </TableCell>
                                ) : null}
                                <TableCell>
                                  <NumberFormat value={orderItem?.subtotal?.toFixed(2)} currency={currency} />
                                </TableCell>
                              </TableRow>
                            )
                          })
                        ) : (
                          <TableRow>
                            <TableCell colSpan={8}>
                              <Box
                                sx={{
                                  width: '100%',
                                  height: '100%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  p: '30px 10px'
                                }}
                              >
                                <Typography variant='h5' align='center' display='block'>
                                  No Items
                                </Typography>
                              </Box>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </ViewItemsTableWrapper>
                  </Grid>
                  <Grid item xs={12}>
                    <Grid
                      container
                      spacing={6}
                      sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column-reverse', md: 'row' },
                        justifyContent: 'space-between'
                      }}
                    >
                      <Grid item xs={12} md={6}>
                        <Box sx={{ p: 4 }}>
                          {salesInvoice?.customerNotes ? (
                            <>
                              <Typography
                                sx={{
                                  fontSize: '14px',
                                  fontWeight: 600,
                                  lineHeight: '22px'
                                }}
                              >
                                Notes
                              </Typography>
                              <Typography sx={{ fontSize: '12px', color: '#818181', lineHeight: '22px' }}>
                                <div>
                                  <pre
                                    style={{
                                      fontFamily: 'inherit',
                                      whiteSpace: 'pre-wrap'
                                    }}
                                  >
                                    {salesInvoice?.customerNotes}
                                  </pre>
                                </div>
                              </Typography>{' '}
                            </>
                          ) : null}
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Table
                          sx={{
                            '& .MuiTableCell-root': {
                              padding: '8px 10px !important',
                              borderBottom: '1px dashed #EBEBEB',
                              textAlign: 'right',
                              fontSize: '12px'
                            },
                            '& .data-value p': {
                              textWrap: 'nowrap'
                            }
                          }}
                        >
                          <TableBody>
                            <TableRow>
                              <TableCell>
                                {' '}
                                <Typography
                                  sx={{
                                    fontFamily: 'Kanit',
                                    fontSize: '14px',
                                    fontWeight: 400,
                                    color: '#667380',
                                    textAlign: 'right'
                                  }}
                                >
                                  Total Qty:
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography sx={{ fontSize: 'inherit', fontWeight: 400 }}>
                                  <NumberFormat value={parseFloat(totalQty).toFixed(2)} currency={currency} />
                                </Typography>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>
                                {' '}
                                <Typography
                                  sx={{
                                    fontFamily: 'Kanit',

                                    fontSize: '14px',
                                    fontWeight: 400,
                                    color: '#667380',
                                    textAlign: 'right'
                                  }}
                                >
                                  Sub Total:
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography sx={{ fontSize: 'inherit', fontWeight: 400 }}>
                                  <NumberFormat value={subtotal} currency={currency} />
                                </Typography>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>
                                {' '}
                                <Typography
                                  sx={{
                                    fontFamily: 'Kanit',

                                    fontSize: '14px',
                                    fontWeight: 400,
                                    color: '#667380',
                                    textAlign: 'right'
                                  }}
                                >
                                  Discount:
                                </Typography>
                              </TableCell>
                              <TableCell>
                                {discountValue <= 0 ? (
                                  <Typography sx={{ fontSize: 'inherit', fontWeight: 400 }}>0.00</Typography>
                                ) : (
                                  <Typography color='error' sx={{ fontSize: 'inherit', fontWeight: 400 }}>
                                    -{' '}
                                    <NumericFormat
                                      value={parseFloat(discountValue || 0).toFixed(2)}
                                      thousandSeparator=','
                                      displayType={'text'}
                                      prefix={
                                        salesInvoice.discountType !== 'PERCENTAGE' &&
                                        currency?.displayAlignment === 'left'
                                          ? `${currency?.symbol}`
                                          : ''
                                      }
                                      suffix={
                                        salesInvoice.discountType === 'PERCENTAGE'
                                          ? '%'
                                          : currency?.displayAlignment === 'right'
                                          ? `${currency?.symbol}`
                                          : ''
                                      }
                                    />
                                  </Typography>
                                )}
                              </TableCell>
                            </TableRow>

                            {taxes?.map(item => (
                              <TableRow key={item.taxName}>
                                <TableCell>
                                  {' '}
                                  <Typography
                                    sx={{
                                      fontFamily: 'Kanit',

                                      fontSize: '14px',

                                      fontWeight: 400,
                                      color: '#667380',
                                      textAlign: 'right'
                                    }}
                                  >
                                    {item.taxName}({item.taxRate}%):
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography sx={{ fontSize: 'inherit', fontWeight: 400 }}>
                                    <NumberFormat value={item.taxValue} currency={currency} />
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            ))}

                            {otherCharges?.map(item => {
                              return (
                                <TableRow key={item.chargeName}>
                                  <TableCell>
                                    <Typography
                                      sx={{
                                        fontFamily: 'Kanit',
                                        fontSize: '14px',
                                        fontWeight: 400,
                                        color: '#667380',
                                        textAlign: 'right',
                                        minWidth: 'max-content'
                                      }}
                                    >
                                      {item.chargeName}
                                      {/* {'(Exc. Tax)'}: */}
                                      {item.includingTax && item.taxes.length === 0 ? '(Inc. Tax)' : '(Exc. Tax)'}:
                                    </Typography>
                                    {item.taxes.map(tax => (
                                      <Typography
                                        key={tax.taxName}
                                        sx={{
                                          fontFamily: 'Kanit',
                                          fontSize: '12px',
                                          fontWeight: 400,
                                          color: '#667380',
                                          textAlign: 'right'
                                        }}
                                      >
                                        {tax.taxName}({tax.taxRate}%):
                                      </Typography>
                                    ))}
                                  </TableCell>
                                  <TableCell>
                                    <Typography sx={{ fontSize: 'inherit', fontWeight: 400 }}>
                                      <NumberFormat
                                        value={item.includingTax ? item.chargedAmount : item.totalChargeValue}
                                        currency={currency}
                                      />
                                    </Typography>
                                    {item.taxes.map(tax => (
                                      <Typography
                                        key={tax.taxName}
                                        sx={{
                                          fontFamily: 'Kanit',
                                          fontSize: 'inherit',
                                          fontWeight: 400,
                                          color: '#667380',
                                          textAlign: 'right'
                                        }}
                                      >
                                        <NumberFormat value={tax.taxValue} currency={currency} />
                                      </Typography>
                                    ))}
                                  </TableCell>
                                </TableRow>
                              )
                            })}

                            <TableRow>
                              <TableCell>
                                {' '}
                                <Typography
                                  sx={{
                                    fontFamily: 'Kanit',
                                    fontSize: '14px',
                                    fontWeight: 500,
                                    color: '#667380',
                                    textAlign: 'right'
                                  }}
                                >
                                  Total (Inc. Tax):
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography sx={{ fontSize: 'inherit', fontWeight: 600 }}>
                                  <NumberFormat value={totalAmount} currency={currency} />
                                </Typography>
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid item xs={12}>
                    {salesInvoice?.termsAndConditions ? (
                      <>
                        <Typography
                          sx={{
                            fontSize: '14px',
                            fontWeight: 600
                          }}
                        >
                          Terms and Conditions
                        </Typography>
                        <Typography sx={{ fontSize: '12px', color: '#818181', lineHeight: '22px' }}>
                          <div>
                            <pre
                              style={{
                                fontFamily: 'inherit',
                                whiteSpace: 'pre-wrap'
                              }}
                            >
                              {salesInvoice?.termsAndConditions}
                            </pre>
                          </div>
                        </Typography>
                      </>
                    ) : null}
                  </Grid>
                </Grid>
              </Card>
            </Grid>
            <Grid item xs={12} md={12} lg={4.5} xl={4.5}>
              <SalesInvoiceWidgets selectedInvoice={salesInvoice} />
            </Grid>
          </Grid>
        )}
      </DialogContent>
    </Dialog>
  )
}
