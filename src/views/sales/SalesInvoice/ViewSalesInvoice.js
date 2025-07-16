// ** Next Import
import { Close } from '@mui/icons-material'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import {
  Box,
  Button,
  Card,
  Grid,
  IconButton,
  LinearProgress,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography
} from '@mui/material'
import Link from 'next/link'
import Router from 'next/router'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { NumericFormat } from 'react-number-format'
import { useDispatch, useSelector } from 'react-redux'
import { useReactToPrint } from 'react-to-print'
import Icon from 'src/@core/components/icon'
import PageHeader from 'src/@core/components/page-header'
import PageWrapper from 'src/@core/layouts/PageWrapper'
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
import CommonStyledMenu from 'src/common-components/CommonStyledMenu'
import LogoBox from 'src/common-components/LogoBox'
import StyledButton from 'src/common-components/StyledMuiButton'
import {
  CREATE_SALES_INVOICE,
  EDIT_SALES_INVOICE,
  STATUS_DRAFT,
  STATUS_ISSUED,
  VIEW_SALES_INVOICE
} from 'src/common-functions/utils/Constants'
import {
  checkAuthorizedRoute,
  DateFunction,
  findObjectByCurrencyId,
  hasPermission,
  NumberFormat,
  rowStatusChip
} from 'src/common-functions/utils/UtilityFunctions'
import useIsDesktop from 'src/hooks/IsDesktop'
import { setActionSalesOrder } from 'src/store/apps/sales'
import { PrintSalesInvoice } from './PrintSalesInvoice'
import SalesInvoiceWidgets from './SalesInvoiceWidgets'
import SendInvoiceCopyDrawer from './SendInvoiceCopyDrawer'

export default function ViewSalesInvoice({ loading, setLoading, salesOrdersObject }) {
  const route = Router
  const dispatch = useDispatch()
  const isDesktop = useIsDesktop()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const userProfile = useSelector(state => state.userProfile)
  const [openSendCopyDrawer, setOpenSendCopyDrawer] = useState(false)
  const tenantId = useSelector(state => state.tenants?.selectedTenant.tenantId || null)
  const selectedInvoice = useSelector(state => state.salesInvoices?.selectedInvoice) || {}

  const {
    totalAmount = 0,
    subtotal = 0,
    totalQty = 0,
    discountValue = 0,
    taxes = [],
    otherCharges = []
  } = selectedInvoice || {}

  const { customers = [], currencies = [] } = salesOrdersObject || {}

  const componentRef = useRef(null)
  const handlePrint = useReactToPrint({
    content: () => componentRef.current
  })

  useEffect(() => {
    if (Object.keys(selectedInvoice).length === 0) {
      route.push('/sales/invoice/')
    }
  }, [selectedInvoice, tenantId])

  const currency = useMemo(
    () => findObjectByCurrencyId(currencies, selectedInvoice?.currency),
    [currencies, selectedInvoice]
  )

  const customer = useMemo(
    () => customers?.find(item => item?.customerId === selectedInvoice?.customerId) || {},
    [customers, selectedInvoice?.customerId]
  )

  const discountType =
    currencies?.find(currency => currency.currencyId === selectedInvoice.discountType)?.symbol ||
    selectedInvoice.discountType

  const [anchorEl, setAnchorEl] = React.useState(null)

  const open = Boolean(anchorEl)

  const handleClick = event => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }
  const handleSelectSalesOrder = response => {
    dispatch(setActionSalesOrder(response))
  }

  const [openCustomerDialog, setOpenCustomerDialog] = useState(false)

  const handleCustomerDialoge = () => {
    setOpenCustomerDialog(!openCustomerDialog)
  }

  useEffect(() => {
    if (
      checkAuthorizedRoute(VIEW_SALES_INVOICE, route, userProfile) &&
      (process.env.NEXT_PUBLIC_APP_ENV === 'dev' || process.env.NEXT_PUBLIC_APP_ENV === 'test')
    ) {
      setIsAuthorized(true)
    } else {
      route.push('/unauthorized')
      setIsAuthorized(false)
    }
  }, [userProfile])

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
            View Invoice - {selectedInvoice?.invoiceNo}
          </Typography>
        }
        button={
          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
            {hasPermission(userProfile, CREATE_SALES_INVOICE) && (
              <Button
                variant='contained'
                color='primary'
                sx={{ display: { xs: 'none', sm: 'flex' } }}
                startIcon={<AddOutlinedIcon />}
                component={Link}
                scroll={true}
                href={`/sales/invoice/add-invoice/`}
              >
                Add New
              </Button>
            )}
            {hasPermission(userProfile, EDIT_SALES_INVOICE) && selectedInvoice?.status === STATUS_DRAFT && (
              <IconButton
                variant='outlined'
                sx={{ fontSize: '21px' }}
                component={Link}
                scroll={true}
                href={`/sales/invoice/edit/${selectedInvoice?.orderId}`}
                onClick={() => handleSelectSalesOrder(selectedInvoice)}
              >
                {' '}
                <Icon icon='tabler:edit' />
              </IconButton>
            )}

            <IconButton
              variant='outlined'
              color='default'
              sx={{ fontSize: '21px' }}
              component={Link}
              scroll={true}
              href='/sales/invoice/'
            >
              <Close sx={{ color: theme => theme.palette.primary.main }} />
            </IconButton>
            {selectedInvoice?.status !== STATUS_DRAFT && (
              <div>
                <IconButton
                  aria-label='more'
                  id='long-button'
                  aria-controls={open ? 'long-menu' : undefined}
                  aria-expanded={open ? 'true' : undefined}
                  aria-haspopup='true'
                  onClick={handleClick}
                >
                  <Icon icon='iconamoon:menu-kebab-vertical-circle' width={23} height={23} />
                </IconButton>

                <CommonStyledMenu anchorEl={anchorEl} open={open} onClose={handleClose}>
                  {selectedInvoice?.status === STATUS_ISSUED && (
                    <MenuItem
                      onClick={() => {
                        setAnchorEl(null)
                        setOpenSendCopyDrawer(true)
                      }}
                      disableRipple
                    >
                      <Icon icon={'iconoir:send'} />
                      Send Invoice
                    </MenuItem>
                  )}
                  <MenuItem
                    variant='outlined'
                    onClick={() => {
                      setAnchorEl(null)
                      handlePrint()
                    }}
                  >
                    <Icon icon={'ion:print-outline'} fontSize={24} />
                    Print Invoice
                  </MenuItem>
                </CommonStyledMenu>
              </div>
            )}

            <div style={{ position: 'fixed', top: '100%', left: '100%', transform: 'translate(100%, 100%)' }}>
              <PrintSalesInvoice ref={componentRef} selectedInvoice={selectedInvoice} />
            </div>
          </Box>
        }
      />
      <PageWrapper>
        {loading ? (
          <LinearProgress />
        ) : (
          <Grid container spacing={{ xs: 5, xl: 10 }}>
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
                      <Grid item xs={12} sm={7} md={6.5} xl={7.1}>
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', md: 'row' },
                            flexWrap: { xs: 'wrap', md: 'nowrap' },
                            gap: 2
                          }}
                        >
                          <LogoBox data={selectedInvoice} />
                          <div>
                            <CompanyData data={selectedInvoice} />
                          </div>
                        </Box>
                      </Grid>

                      <Grid item xs={12} sm={5} md={4} lg={4} xl={3.7}>
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
                                  Invoice Date
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography className='data-value' sx={{ fontWeight: 400, lineHeight: '22px' }}>
                                  {DateFunction(selectedInvoice?.invoiceDate)}
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
                                  {DateFunction(selectedInvoice?.dueDate)}
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
                                  {selectedInvoice?.paymentTerms ? selectedInvoice?.paymentTerms : '-'}
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
                                  #{selectedInvoice?.invoiceNo}
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
                              <TableCell>{rowStatusChip(selectedInvoice?.status)}</TableCell>
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
                            <ShowAddress data={selectedInvoice?.deliveryAddress} />
                          </TableBody>
                        </CommonViewTable>
                      </Grid>{' '}
                    </Grid>
                  </Grid>
                  <Grid item xs={12}>
                    <ViewItemsTableWrapper>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ width: '3%' }}>#</TableCell>
                          <TableCell sx={{ width: '37%' }}>Item</TableCell>
                          <TableCell sx={{ width: '8%' }}>Qty</TableCell>
                          {isDesktop ? <TableCell sx={{ width: '11%' }}>Rate</TableCell> : null}
                          <TableCell sx={{ width: isDesktop ? '18%' : '35%' }}>Total</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedInvoice?.invoiceItems?.length > 0 ? (
                          selectedInvoice?.invoiceItems?.map((orderItem, index) => {
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

                                <TableCell colSpan={isDesktop ? 1 : 2}>
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
                          {selectedInvoice?.customerNotes ? (
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
                                    {selectedInvoice?.customerNotes}
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
                                        discountType !== 'PERCENTAGE' && currency?.displayAlignment === 'left'
                                          ? `${currency?.symbol}`
                                          : ''
                                      }
                                      suffix={
                                        discountType === 'PERCENTAGE'
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

                            {taxes
                              ?.filter(tax => tax.taxValue !== 0)
                              ?.map(item => (
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

                            {otherCharges
                              ?.filter(val => val.chargedAmount !== 0 || val.totalChargeValue !== 0)
                              ?.map(item => {
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
                                      {item.taxes
                                        ?.filter(tax => tax.taxValue !== 0)
                                        ?.map(tax => (
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
                                      {item.taxes
                                        ?.filter(tax => tax.taxValue !== 0)
                                        ?.map(tax => (
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
                    {selectedInvoice?.termsAndConditions ? (
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
                              {selectedInvoice?.termsAndConditions}
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
              <SalesInvoiceWidgets selectedInvoice={selectedInvoice} />
            </Grid>
          </Grid>
        )}
        {openSendCopyDrawer && (
          <SendInvoiceCopyDrawer
            order={selectedInvoice}
            setOpenSendCopyDrawer={setOpenSendCopyDrawer}
            openSendCopyDrawer={openSendCopyDrawer}
          />
        )}
      </PageWrapper>
    </React.Fragment>
  )
}
