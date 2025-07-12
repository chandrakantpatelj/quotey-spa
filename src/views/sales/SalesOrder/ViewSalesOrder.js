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
import {
  undoSalesOrderConfirmationQuery,
  undoTaxInvoiceForSalesOrderQuery
} from 'src/@core/components/graphql/sales-order-queries'
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
import { writeData } from 'src/common-functions/GraphqlOperations'
import {
  CREATE_SALES_ORDER,
  EDIT_SALES_ORDER,
  LIST_SALES_ORDER,
  STATUS_CONFIRMED,
  STATUS_DRAFT,
  STATUS_INVOICED
} from 'src/common-functions/utils/Constants'
import {
  checkAuthorizedRoute,
  DateFunction,
  findObjectByCurrencyId,
  hasPermission,
  NumberFormat,
  rowStatusChip
} from 'src/common-functions/utils/UtilityFunctions'
import usePackages from 'src/hooks/getData/usePackages'
import useSalesInvoices from 'src/hooks/getData/useSaleInvoices'
import useIsDesktop from 'src/hooks/IsDesktop'
import { createAlert } from 'src/store/apps/alerts'
import { resetPackage } from 'src/store/apps/packages'
import { setActionSalesOrder, setUpdateSalesOrder } from 'src/store/apps/sales'
import { resetInvoice } from 'src/store/apps/sales-invoices'
import { PrintSalesInvoice } from '../SalesInvoice/PrintSalesInvoice'
import SendInvoiceCopyDrawer from '../SalesInvoice/SendInvoiceCopyDrawer'
import IssueTaxInvoicePopUp from './IssueTaxInvoicePopUp'
import SalesWidgets from './SalesWidgets'

export default function ViewSalesOrder({ loading, salesOrdersObject }) {
  const route = Router
  const dispatch = useDispatch()
  const isDesktop = useIsDesktop()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const userProfile = useSelector(state => state.userProfile)
  const tenantId = useSelector(state => state.tenants?.selectedTenant?.tenantId)
  const { fetchSalesInvoice, fetchSalesInvoices } = useSalesInvoices(tenantId)
  const { fetchPackages } = usePackages(tenantId)
  const order = useSelector(state => state.sales?.selectedSalesOrder) || {}
  const { totalAmount = 0, subtotal = 0, totalQty = 0, discountValue = 0, taxes = [], otherCharges = [] } = order || {}

  const { customers = [], warehouses = [], currencies = [] } = salesOrdersObject || {}

  const [selectedInvoice, setselectedInvoice] = useState(null)

  const getselectedInvoiceObject = async () => {
    // setLoading(true)
    const invoiceId = order?.salesInvoiceId

    const response = await fetchSalesInvoice(invoiceId)

    setselectedInvoice(response)
  }

  useEffect(() => {
    if (order?.salesInvoiceId) {
      getselectedInvoiceObject()
    }
  }, [tenantId, order?.salesInvoiceId])

  const componentRef = useRef(null)

  const handlePrint = useReactToPrint({
    content: () => componentRef.current
  })
  useEffect(() => {
    if (Object.keys(order).length === 0) {
      route.push('/sales/sales-order/')
    }
  }, [order, tenantId])
  const currency = useMemo(() => findObjectByCurrencyId(currencies, order?.currency), [currencies, order])

  const customer = useMemo(
    () => customers?.find(item => item?.customerId === order?.customerId) || {},
    [customers, order?.customerId]
  )

  const discountType =
    currencies?.find(currency => currency.currencyId === order.discountType)?.symbol || order.discountType

  const [anchorEl, setAnchorEl] = React.useState(null)
  const [openSendCopyDrawer, setOpenSendCopyDrawer] = React.useState(false)

  const open = Boolean(anchorEl)

  const handleClick = event => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }

  const [openCustomerDialog, setOpenCustomerDialog] = useState(false)

  const handleCustomerDialoge = () => {
    setOpenCustomerDialog(!openCustomerDialog)
  }

  const [openIssueInvoicePopup, setOpenIssueInvoicePopup] = useState(false)

  const handleIssueTaxInvoiceFromOrder = async order => {
    handleClose(order)
    setOpenIssueInvoicePopup(true)
  }

  const UndoTaxInvoice = async data => {
    handleClose(order)
    const { tenantId, orderId } = data
    try {
      const response = await writeData(undoTaxInvoiceForSalesOrderQuery(), { tenantId, orderId })
      if (response.undoTaxInvoiceForSalesOrder) {
        dispatch(resetInvoice())
        fetchSalesInvoices()
        dispatch(setUpdateSalesOrder(response.undoTaxInvoiceForSalesOrder))
        dispatch(setActionSalesOrder(response.undoTaxInvoiceForSalesOrder))
        dispatch(createAlert({ message: 'Status changed successfully!', type: 'success' }))
      } else {
        dispatch(createAlert({ message: response?.errors?.[0]?.message, type: 'error' }))
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    }
  }

  const UndoConfirmation = async data => {
    handleClose(order)
    const { tenantId, orderId } = data
    try {
      const response = await writeData(undoSalesOrderConfirmationQuery(), { tenantId, orderId })
      if (response.undoSalesOrderConfirmation) {
        dispatch(resetPackage())
        fetchPackages()
        dispatch(setUpdateSalesOrder(response.undoSalesOrderConfirmation))
        dispatch(setActionSalesOrder(response.undoSalesOrderConfirmation))
        dispatch(createAlert({ message: 'Order confirmed successfully!', type: 'success' }))
      } else {
        dispatch(createAlert({ message: response?.errors?.[0]?.message, type: 'error' }))
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    }
  }
  const [selectedSalesInvoice, setSelectedSalesInvoice] = useState()

  useEffect(() => {
    if (checkAuthorizedRoute(LIST_SALES_ORDER, route, userProfile)) {
      setIsAuthorized(true)
    } else {
      setIsAuthorized(false)
    }
  }, [userProfile])

  if (!isAuthorized) {
    return null
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
            View Order - {order?.orderNo}
          </Typography>
        }
        button={
          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
            {hasPermission(userProfile, CREATE_SALES_ORDER) && (
              <Button
                variant='contained'
                color='primary'
                sx={{ display: { xs: 'none', sm: 'flex' } }}
                startIcon={<AddOutlinedIcon />}
                component={Link}
                scroll={true}
                href={`/sales/sales-order/add-salesorder`}
              >
                Add New
              </Button>
            )}
            {hasPermission(userProfile, EDIT_SALES_ORDER) && (
              <IconButton
                variant='outlined'
                component={Link}
                scroll={true}
                href={`/sales/sales-order/edit/${order?.orderId}`}
                onClick={() => dispatch(setActionSalesOrder(order))}
              >
                {' '}
                <Icon icon='tabler:edit' />
              </IconButton>
            )}
            <IconButton variant='outlined' color='default' component={Link} scroll={true} href='/sales/sales-order/'>
              <Close sx={{ color: theme => theme.palette.primary.main }} />
            </IconButton>
            {order?.status !== STATUS_DRAFT && (
              <>
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
                  {order?.status === STATUS_CONFIRMED && (
                    <MenuItem onClick={() => handleIssueTaxInvoiceFromOrder(order)}>
                      <Icon icon={'iconamoon:invoice-light'} />
                      Issue TaxInvoice
                    </MenuItem>
                  )}
                  {order?.status !== STATUS_DRAFT && (
                    <MenuItem
                      variant='outlined'
                      component={Link}
                      scroll={true}
                      href={`/sales/packages/add-package/`}
                      onClick={() => dispatch(setActionSalesOrder(order))}
                    >
                      <Icon icon={'ph:package'} />
                      Create Package
                    </MenuItem>
                  )}
                  {order?.status === STATUS_INVOICED && (
                    <MenuItem onClick={() => UndoTaxInvoice(order)}>
                      <Icon icon={'iconamoon:do-undo-light'} />
                      Undo TaxInvoice
                    </MenuItem>
                  )}
                  {order?.status === STATUS_CONFIRMED && (
                    <MenuItem onClick={() => UndoConfirmation(order)}>
                      <Icon icon={'iconamoon:do-undo-light'} />
                      Undo Confirmation
                    </MenuItem>
                  )}

                  {order.salesInvoiceId && order?.status === STATUS_INVOICED && (
                    <MenuItem
                      onClick={() => {
                        handleClose()
                        setOpenSendCopyDrawer(true)
                        setSelectedSalesInvoice(order)
                      }}
                      disableRipple
                    >
                      <Icon icon={'iconoir:send'} />
                      Send Invoice
                    </MenuItem>
                  )}
                  {order.salesInvoiceId && order?.status === STATUS_INVOICED && (
                    <MenuItem
                      onClick={() => {
                        handleClose()
                        handlePrint()
                      }}
                      disableRipple
                    >
                      <Icon icon={'ion:print-outline'} />
                      Print Invoice
                    </MenuItem>
                  )}
                </CommonStyledMenu>
              </>
            )}
            {openSendCopyDrawer && (
              <SendInvoiceCopyDrawer
                order={selectedSalesInvoice}
                setOpenSendCopyDrawer={setOpenSendCopyDrawer}
                openSendCopyDrawer={openSendCopyDrawer}
              />
            )}
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
                          <LogoBox data={order} />
                          <div>
                            <CompanyData data={order} />
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
                                  Order Date
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography className='data-value' sx={{ fontWeight: 400, lineHeight: '22px' }}>
                                  {DateFunction(order?.orderDate)}
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
                                  {DateFunction(order?.dueDate)}
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
                                  Exp. Packing Date
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography className='data-value' sx={{ fontWeight: 400, lineHeight: '22px' }}>
                                  {order?.expectedPackingDate ? DateFunction(order?.expectedPackingDate) : '-'}
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
                                  {order?.paymentTerms ? order?.paymentTerms : '-'}
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
                                  Order No
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
                                  #{order?.orderNo}
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
                                  Status
                                </Typography>
                              </TableCell>
                              <TableCell>{rowStatusChip(order?.status)}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell sx={{ width: '50%' }}>
                                <Typography
                                  className='data-name'
                                  sx={{
                                    lineHeight: '22px'
                                  }}
                                >
                                  Payment Status
                                </Typography>
                              </TableCell>
                              <TableCell>{rowStatusChip(order?.paymentStatus)}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell sx={{ width: '50%' }}>
                                <Typography
                                  className='data-name'
                                  sx={{
                                    lineHeight: '22px'
                                  }}
                                >
                                  Delivery Status
                                </Typography>
                              </TableCell>
                              <TableCell>{rowStatusChip(order?.deliveryStatus)}</TableCell>
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
                            <ShowAddress data={order?.billingAddress} />
                            <CommonAddress data={customer} />
                          </TableBody>
                        </CommonViewTable>
                      </Grid>
                      <Grid item xs={0} sm={0} md={1.5} xl={3.6} sx={{ display: { xs: 'none', md: 'block' } }}></Grid>
                      <Grid item xs={12} sm={5} md={4} lg={4} xl={3.7}>
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
                            <ShowAddress data={order?.deliveryAddress} />
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
                          {isDesktop ? <TableCell sx={{ width: '10%' }}>Warehouse</TableCell> : null}
                          {isDesktop ? <TableCell sx={{ width: '11%' }}>Rate</TableCell> : null}
                          <TableCell sx={{ width: '18%' }}>Total</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {order?.orderItems?.length > 0 ? (
                          order?.orderItems?.map((orderItem, index) => {
                            const warehouse =
                              warehouses.find(item => item?.warehouseId === orderItem?.warehouseId) || {}
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

                                {isDesktop ? <TableCell>{warehouse?.name}</TableCell> : null}

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
                          {order?.customerNotes ? (
                            <>
                              <Typography
                                sx={{
                                  fontSize: '14px',
                                  fontWeight: 500,
                                  lineHeight: '22px'
                                }}
                              >
                                Customer Notes
                              </Typography>
                              <Typography sx={{ fontSize: '12px', color: '#818181', lineHeight: '22px', mb: 2 }}>
                                <div>
                                  <pre
                                    style={{
                                      fontFamily: 'inherit',
                                      whiteSpace: 'pre-wrap'
                                    }}
                                  >
                                    {order?.customerNotes}
                                  </pre>
                                </div>
                              </Typography>{' '}
                            </>
                          ) : null}
                          {order?.notes ? (
                            <>
                              <Typography
                                sx={{
                                  fontSize: '14px',
                                  fontWeight: 500,
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
                                    {order?.notes}
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
                                  <NumberFormat value={parseFloat(totalQty).toFixed(2)} />
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
                                  <NumberFormat value={parseFloat(subtotal).toFixed(2)} currency={currency} />
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
                                      <NumberFormat value={parseFloat(item.taxValue).toFixed(2)} currency={currency} />
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
                                          value={
                                            item.includingTax
                                              ? parseFloat(item.chargedAmount).toFixed(2)
                                              : parseFloat(item.totalChargeValue).toFixed(2)
                                          }
                                          currency={currency}
                                        />
                                      </Typography>
                                      {item.taxes
                                        .filter(tax => tax.taxValue !== 0)
                                        .map(tax => {
                                          return (
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
                                          )
                                        })}
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
                    <CommonViewTable>
                      <TableBody>
                        {' '}
                        <TableRow>
                          <TableCell sx={{ width: '20%' }}>
                            <Typography
                              className='data-name'
                              sx={{ fontSize: '12px', fontWeight: 400, lineHeight: '22px', pr: '6px' }}
                            >
                              Reference
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ width: '80%' }}>
                            <Typography
                              className='data-value'
                              sx={{ fontSize: '12px', fontWeight: 400, lineHeight: '22px' }}
                            >
                              {order?.reference ? order?.reference : '-'}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </CommonViewTable>
                  </Grid>
                  <Grid item xs={12}>
                    {order?.termsAndConditions ? (
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
                              {order?.termsAndConditions}
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
              <SalesWidgets order={order} />
            </Grid>
          </Grid>
        )}
      </PageWrapper>
      <div style={{ position: 'fixed', top: '100%', left: '100%', transform: 'translate(100%, 100%)' }}>
        <PrintSalesInvoice ref={componentRef} selectedInvoice={selectedInvoice} />
      </div>
      {openIssueInvoicePopup && (
        <IssueTaxInvoicePopUp tenantId={tenantId} open={openIssueInvoicePopup} setOpen={setOpenIssueInvoicePopup} />
      )}
    </React.Fragment>
  )
}
