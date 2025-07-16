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
import { useDispatch, useSelector } from 'react-redux'
import { useReactToPrint } from 'react-to-print'
import { UndoPurchaseOrderStageQuery } from 'src/@core/components/graphql/purchase-order-queries'
import Icon from 'src/@core/components/icon'
import PageHeader from 'src/@core/components/page-header'
import PageWrapper from 'src/@core/layouts/PageWrapper'
import {
  CommonAddress,
  CommonViewTable,
  CompanyData,
  RendorDimensions,
  RendorItemData,
  ShowAddress,
  ViewItemsTableWrapper
} from 'src/common-components/CommonPdfDesign'
import CommonStyledMenu from 'src/common-components/CommonStyledMenu'
import CommonVendorPopup from 'src/common-components/CommonVendorPopup'
import LogoBox from 'src/common-components/LogoBox'
import StyledButton from 'src/common-components/StyledMuiButton'
import { writeData } from 'src/common-functions/GraphqlOperations'
import {
  CREATE_PURCHASE_ORDER,
  EDIT_PURCHASE_ORDER,
  MANAGE_PURCHASE_ORDER,
  STATUS_DRAFT
} from 'src/common-functions/utils/Constants'
import { divideDecimals } from 'src/common-functions/utils/DecimalUtils'
import {
  DateFunction,
  findObjectByCurrencyId,
  hasPermission,
  NumberFormat,
  rowStatusChip,
  toTitleCase
} from 'src/common-functions/utils/UtilityFunctions'
import useIsDesktop from 'src/hooks/IsDesktop'
import { createAlert } from 'src/store/apps/alerts'
import { setActionPurchaseOrder, setLoading, setUpdatePurchaseOrder } from 'src/store/apps/purchaseorder'
import MovetoNextStategePopup from './MovetoNextStategePopup'
import { PrintPurchaseOrder } from './PrintPurchaseOrder'
import PurchaseWidgets from './PurchaseWidgets'
import SendCopyDrawer from './SendCopyDrawer'

export default function ViewPurchaseOrder({ loading, purchaseOrderData }) {
  const route = Router
  const dispatch = useDispatch()
  const isDesktop = useIsDesktop()
  const [anchorEl, setAnchorEl] = React.useState(null)
  const [openSendCopyDrawer, setOpenSendCopyDrawer] = React.useState(false)
  const userProfile = useSelector(state => state.userProfile)
  const order = useSelector(state => state?.purchaseOrder?.selectedPurchaseOrder)
  const { vendors = [], currencies = [], taxAuthorities = [] } = purchaseOrderData || {}
  const tenantId = useSelector(state => state.tenants?.selectedTenant.tenantId)

  const componentRef = useRef(null)
  const handlePrint = useReactToPrint({
    content: () => componentRef.current
  })
  useEffect(() => {
    if (Object.keys(order).length === 0) {
      route.push('/purchases/purchase-order/')
    }
  }, [order, tenantId])

  const open = Boolean(anchorEl)
  const handleClick = event => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }

  const [vendor, setVendor] = useState({})

  useEffect(() => {
    const vendor = vendors?.find(item => item?.vendorId === order?.vendorId) || {}
    setVendor(vendor)
  }, [vendors, order?.vendorId])
  // const localCurrency = useSelector(state => state?.currencies?.selectedCurrency)

  const currency = findObjectByCurrencyId(currencies, order?.currency) || {}
  const subTotalCurrency = findObjectByCurrencyId(currencies, order?.subtotalCurrency) || {}

  const convSubTotalToLocalPrice = useMemo(
    () => divideDecimals(order?.subtotal || 0, subTotalCurrency?.exchangeRate),
    [order]
  )
  const totalCurrency = findObjectByCurrencyId(currencies, order?.totalAmountCurrency) || {}

  const [openVendorDialog, setOpenVendorDialog] = useState(false)

  const handleVendorDialoge = () => {
    setOpenVendorDialog(!openVendorDialog)
  }
  const [openMovetoNextStageDialog, setOpenMovetoNextStageDialog] = useState(false)

  const UndoStage = async data => {
    setAnchorEl(null)
    const { tenantId, orderId } = data
    const stageName = data?.currentStage
    try {
      dispatch(setLoading(true))
      const response = await writeData(UndoPurchaseOrderStageQuery(), { tenantId, orderId, stageName })
      if (response.undoPurchaseOrderStage) {
        dispatch(setUpdatePurchaseOrder(response.undoPurchaseOrderStage))
        dispatch(setActionPurchaseOrder(response.undoPurchaseOrderStage))

        dispatch(createAlert({ message: 'Moved Order to Previous Stage successfully!', type: 'success' }))
      } else {
        const errorMessage = response?.errors?.[0] ? response.errors[0].message : 'Failed to move to previous stage!'
        dispatch(createAlert({ message: errorMessage, type: 'error' }))
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    }
  }
  const MoveToNextStage = () => {
    setAnchorEl(null)
    setOpenMovetoNextStageDialog(true)
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
            {hasPermission(userProfile, CREATE_PURCHASE_ORDER) && (
              <Button
                variant='contained'
                color='primary'
                sx={{ display: { xs: 'none', sm: 'flex' } }}
                startIcon={<AddOutlinedIcon />}
                component={Link}
                scroll={true}
                href={`/purchases/purchase-order/add-purchaseorder`}
              >
                Add New
              </Button>
            )}

            {hasPermission(userProfile, EDIT_PURCHASE_ORDER) && (
              <IconButton
                variant='outlined'
                component={Link}
                scroll={true}
                href={`/purchases/purchase-order/edit/${order?.orderId}`}
                onClick={() => dispatch(setActionPurchaseOrder(order))}
              >
                <Icon icon='tabler:edit' />
              </IconButton>
            )}

            <IconButton
              variant='outlined'
              color='default'
              component={Link}
              scroll={true}
              href='/purchases/purchase-order/'
            >
              <Close sx={{ color: theme => theme.palette.primary.main }} />
            </IconButton>
            <div>
              <IconButton
                color='default'
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
                {hasPermission(userProfile, MANAGE_PURCHASE_ORDER) && order?.undoCurrentStage && (
                  <MenuItem onClick={() => UndoStage(order)}>
                    <Icon icon='iconamoon:do-undo-light' />
                    Undo Stage {toTitleCase(order?.currentStage)}
                  </MenuItem>
                )}
                {hasPermission(userProfile, MANAGE_PURCHASE_ORDER) && order?.moveToNextStage && (
                  <MenuItem onClick={() => MoveToNextStage()}>
                    <Icon icon='solar:forward-outline' />
                    Move to {toTitleCase(order?.nextStage)}
                  </MenuItem>
                )}
                {hasPermission(userProfile, MANAGE_PURCHASE_ORDER) && (
                  <MenuItem
                    onClick={() => {
                      setAnchorEl(null)
                      setOpenSendCopyDrawer(true)
                    }}
                    disableRipple
                  >
                    <Icon icon={'iconoir:send'} />
                    Send Order
                  </MenuItem>
                )}
                {order?.status !== STATUS_DRAFT && (
                  <MenuItem
                    variant='outlined'
                    onClick={() => {
                      setAnchorEl(null)
                      handlePrint()
                    }}
                  >
                    <Icon icon={'ion:print-outline'} fontSize={24} />
                    Print Order
                  </MenuItem>
                )}
              </CommonStyledMenu>
            </div>
            <div style={{ position: 'fixed', top: '100%', left: '100%', transform: 'translate(100%, 100%)' }}>
              <PrintPurchaseOrder ref={componentRef} data={purchaseOrderData} />
            </div>
            {openSendCopyDrawer && (
              <SendCopyDrawer
                order={order}
                setOpenSendCopyDrawer={setOpenSendCopyDrawer}
                openSendCopyDrawer={openSendCopyDrawer}
              />
            )}
            {openMovetoNextStageDialog && (
              <MovetoNextStategePopup
                tenantId={tenantId}
                selectedPurchaseOrder={order}
                open={openMovetoNextStageDialog}
                setOpen={setOpenMovetoNextStageDialog}
              />
            )}
          </Box>
        }
      />

      <PageWrapper>
        {loading ? (
          <LinearProgress />
        ) : (
          <Grid container spacing={{ xs: 5, lg: 6, xl: 8 }}>
            <Grid item xs={12} md={12} lg={12} xl={6}>
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
                            flexDirection: { xs: 'column', md: 'row', lg: 'column', xl: 'row' },
                            flexWrap: { xs: 'wrap', md: 'nowrap', lg: 'wrap', xl: 'nowrap' },
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
                        <Table
                          sx={{
                            border: 0,
                            '& .MuiTableCell-root': {
                              border: 0,
                              // verticalAlign: 'top !important',
                              padding: '0px !important'
                            },
                            '& .MuiTableCell-root .data-name': {
                              fontSize: '12px',
                              color: '#818181',
                              lineHeight: '23px'
                            },
                            '& .MuiTableCell-root .data-value': {
                              fontSize: '12px',
                              fontWeight: 500,
                              color: '#000',
                              lineHeight: '23px'
                            }
                          }}
                        >
                          <TableBody>
                            {' '}
                            <TableRow>
                              <TableCell sx={{ width: '50%' }}>
                                <Typography className='data-name'>Order Date</Typography>
                              </TableCell>
                              <TableCell>
                                <Typography className='data-value'>{DateFunction(order?.orderDate)}</Typography>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell sx={{ width: '50%' }}>
                                <Typography className='data-name'>Due Date</Typography>
                              </TableCell>
                              <TableCell>
                                <Typography
                                  className='data-value'
                                  sx={{ fontSize: '12px', fontWeight: 400, lineHeight: '22px' }}
                                >
                                  {DateFunction(order?.dueDate)}
                                </Typography>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell sx={{ width: '50%' }}>
                                <Typography className='data-name'>Terms</Typography>
                              </TableCell>
                              <TableCell>
                                <Typography
                                  className='data-value'
                                  sx={{ fontSize: '12px', fontWeight: 400, lineHeight: '22px' }}
                                >
                                  {order?.paymentTerms ? order?.paymentTerms : '-'}
                                </Typography>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell sx={{ width: '50%' }}>
                                <Typography className='data-name'>Order No</Typography>
                              </TableCell>
                              <TableCell>
                                <Typography
                                  className='data-value'
                                  sx={{
                                    fontSize: '12px',
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
                                <Typography className='data-name'>Status </Typography>
                              </TableCell>
                              <TableCell>{rowStatusChip(order?.status)}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell sx={{ width: '50%' }}>
                                <Typography className='data-name'>Payment Status </Typography>
                              </TableCell>
                              <TableCell>{rowStatusChip(order?.paymentStatus)}</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
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
                      <Grid item xs={12} sm={6} md={5.5} xl={5.5}>
                        <Typography
                          sx={{
                            fontSize: '13px',
                            fontWeight: 500,
                            lineHeight: '24px'
                          }}
                        >
                          Vendor
                        </Typography>
                        <CommonViewTable>
                          <TableBody>
                            <TableRow>
                              <TableCell>
                                <StyledButton color='primary' onClick={handleVendorDialoge}>
                                  {vendor?.displayName}
                                </StyledButton>
                                {openVendorDialog && (
                                  <CommonVendorPopup
                                    vendorId={vendor?.vendorId}
                                    openVendorDialog={openVendorDialog}
                                    setOpenVendorDialog={setOpenVendorDialog}
                                  />
                                )}
                              </TableCell>
                            </TableRow>

                            <CommonAddress data={vendor} />
                          </TableBody>
                        </CommonViewTable>
                      </Grid>
                      <Grid item xs={0} sm={0} md={1} xl={1.6} sx={{ display: { xs: 'none', md: 'block' } }}></Grid>
                      <Grid item xs={12} sm={6} md={5} lg={4} xl={3.7}>
                        <Typography
                          sx={{
                            fontSize: '13px',
                            fontWeight: 500,
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
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Typography
                        sx={{
                          fontSize: '13px',
                          fontWeight: 500,
                          lineHeight: '24px'
                        }}
                      >
                        <span> Exchange Rate: </span>
                        {order?.currencyExchangeRate}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <ViewItemsTableWrapper>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ width: '3%' }}>#</TableCell>
                          <TableCell sx={{ width: '45%' }}>Item</TableCell>
                          <TableCell sx={{ width: '13%' }}>Total Qty</TableCell>
                          {isDesktop ? <TableCell sx={{ width: '13%' }}>Rate</TableCell> : null}
                          <TableCell sx={{ width: '17%' }}>Total</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {order?.orderItems?.length > 0 ? (
                          order?.orderItems?.map((orderItem, index) => {
                            return (
                              <TableRow key={orderItem?.itemId}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>
                                  <RendorItemData
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
                                    <NumberFormat value={orderItem?.purchasePrice} currency={currency} />
                                  </TableCell>
                                ) : null}
                                <TableCell>
                                  <NumberFormat value={orderItem?.subtotal} currency={currency} />
                                </TableCell>
                              </TableRow>
                            )
                          })
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5}>
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
                          {order?.vendorNotes ? (
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
                                    {order?.vendorNotes}
                                  </pre>
                                </div>
                              </Typography>
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
                            {order?.expenses
                              ?.filter(val => val?.paidToMainVendor)
                              .map(item => {
                                const expenseCurrency = findObjectByCurrencyId(currencies, item?.expenseValueCurrency)
                                return (
                                  <>
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
                                          {item?.expenseName} <br />
                                          <span style={{ fontSize: '13px', color: '#8c96a1' }}>
                                            ({vendor?.displayName || 'none'})
                                          </span>
                                        </Typography>
                                      </TableCell>
                                      <TableCell className='data-value'>
                                        <Typography sx={{ fontSize: 'inherit', fontWeight: 400 }}>
                                          <NumberFormat value={item?.expenseValue} currency={expenseCurrency} />
                                        </Typography>
                                      </TableCell>
                                    </TableRow>
                                  </>
                                )
                              })}
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
                              <TableCell className='data-value'>
                                <Typography sx={{ fontSize: 'inherit', fontWeight: 400 }}>{order?.totalQty}</Typography>
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
                                  SubTotal:
                                </Typography>
                              </TableCell>
                              <TableCell className='data-value'>
                                <Typography sx={{ fontSize: 'inherit', fontWeight: 400 }}>
                                  <NumberFormat
                                    value={parseFloat(order?.subtotal)?.toFixed(2)}
                                    currency={subTotalCurrency}
                                  />
                                </Typography>
                                {subTotalCurrency?.currencyId !== currency?.currencyId && (
                                  <Typography sx={{ fontSize: 'inherit', fontWeight: 400 }}>
                                    <NumberFormat
                                      value={parseFloat(convSubTotalToLocalPrice)?.toFixed(2)}
                                      currency={currency}
                                    />
                                  </Typography>
                                )}
                              </TableCell>
                            </TableRow>

                            {order?.expenses
                              ?.filter(a => a.paidToMainVendor === false && a.accountableForOrderTaxes === true)
                              .map(item => {
                                const vendor = vendors?.find(val => val?.vendorId === item?.vendorId)
                                const expenseCurrency = findObjectByCurrencyId(currencies, item?.expenseValueCurrency)
                                return (
                                  <>
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
                                          {item?.expenseName}
                                          <br />
                                          <span style={{ fontSize: '13px', color: '#8c96a1' }}>
                                            ({vendor?.displayName || 'none'})
                                          </span>
                                        </Typography>
                                      </TableCell>
                                      <TableCell className='data-value'>
                                        <Typography sx={{ fontSize: 'inherit', fontWeight: 400 }}>
                                          <NumberFormat value={item?.expenseValue} currency={expenseCurrency} />
                                        </Typography>
                                      </TableCell>
                                    </TableRow>
                                  </>
                                )
                              })}

                            {order?.taxes?.map((item, i) => {
                              const vendor = vendors?.find(val => val?.vendorId === item?.vendorId)
                              const taxAuthority = taxAuthorities?.find(
                                val => val?.taxAuthorityId === item?.taxAuthorityId
                              )
                              const taxCurrency = findObjectByCurrencyId(currencies, item?.taxValueCurrency)
                              return (
                                <TableRow key={item?.taxId}>
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
                                      {item?.taxName} <br />
                                      <span style={{ fontSize: '11px', color: '#8c96a1' }}>
                                        (
                                        {item?.vendorId
                                          ? vendor?.displayName || 'none'
                                          : item?.taxAuthorityId
                                          ? taxAuthority?.taxAuthorityName
                                          : 'none'}
                                        )
                                      </span>
                                    </Typography>
                                  </TableCell>
                                  <TableCell className='data-value'>
                                    <Typography sx={{ fontSize: 'inherit', fontWeight: 400 }}>
                                      <NumberFormat value={item?.taxValue} currency={taxCurrency} />
                                    </Typography>
                                  </TableCell>
                                </TableRow>
                              )
                            })}
                            {order?.expenses
                              ?.filter(
                                a =>
                                  a.paidToMainVendor === false &&
                                  a.accountableForOrderTaxes === false &&
                                  a.eligibleForTaxCredit === false
                              )
                              .map(item => {
                                const vendor = vendors?.find(val => val?.vendorId === item?.vendorId)
                                const expenseCurrency = findObjectByCurrencyId(currencies, item?.expenseValueCurrency)
                                return (
                                  <>
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
                                          {item?.expenseName} <br />
                                          <span style={{ fontSize: '13px', color: '#8c96a1' }}>
                                            ({vendor?.displayName || 'none'})
                                          </span>
                                        </Typography>
                                      </TableCell>
                                      <TableCell className='data-value'>
                                        <Typography sx={{ fontSize: 'inherit', fontWeight: 400 }}>
                                          <NumberFormat value={item?.expenseValue} currency={expenseCurrency} />
                                        </Typography>
                                      </TableCell>
                                    </TableRow>
                                  </>
                                )
                              })}
                            {order?.expenses
                              ?.filter(a => a.accountableForOrderTaxes === false && a.eligibleForTaxCredit === true)
                              ?.map(item => {
                                const vendor = vendors?.find(val => val?.vendorId === item?.vendorId)
                                const expenseCurrency = findObjectByCurrencyId(currencies, item?.expenseValueCurrency)
                                return (
                                  <>
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
                                          {item?.eligibleForTaxCredit
                                            ? `${item?.expenseName}(Exl. Tax)`
                                            : item?.expenseName}
                                          <br />
                                          <span style={{ fontSize: '13px', color: '#8c96a1' }}>
                                            ({vendor?.displayName || 'none'})
                                          </span>
                                        </Typography>
                                      </TableCell>
                                      <TableCell className='data-value'>
                                        <Typography sx={{ fontSize: 'inherit', fontWeight: 400 }}>
                                          <NumberFormat value={item?.expenseValue} currency={expenseCurrency} />
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
                                          {`${item?.expenseName}(Tax)`} <br />
                                          <span style={{ fontSize: '13px', color: '#8c96a1' }}>
                                            ({vendor?.displayName || 'none'})
                                          </span>
                                        </Typography>
                                      </TableCell>
                                      <TableCell className='data-value'>
                                        <Typography sx={{ fontSize: 'inherit', fontWeight: 400 }}>
                                          <NumberFormat value={item?.taxValue} currency={expenseCurrency} />
                                        </Typography>
                                      </TableCell>
                                    </TableRow>
                                  </>
                                )
                              })}

                            <TableRow>
                              <TableCell>
                                <Typography
                                  sx={{
                                    fontFamily: 'Kanit',
                                    fontSize: '14px',
                                    fontWeight: 500,
                                    color: '#667380',
                                    textAlign: 'right'
                                  }}
                                >
                                  Total:
                                </Typography>
                              </TableCell>
                              <TableCell className='data-value'>
                                <Typography sx={{ fontSize: 'inherit', fontWeight: 500 }}>
                                  <NumberFormat
                                    value={parseFloat(order?.totalAmount)?.toFixed(2)}
                                    currency={totalCurrency}
                                  />
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
                        <TableRow>
                          <TableCell sx={{ width: '25%' }}>
                            <Typography className='data-name' sx={{ pr: '6px' }}>
                              Reference
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography className='data-value' sx={{ lineHeight: '22px' }}>
                              {order?.reference ? order?.reference : '-'}
                            </Typography>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <Typography className='data-name' sx={{ pr: '6px' }}>
                              Shipment Preference
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography className='data-value' sx={{ lineHeight: '22px' }}>
                              {order?.shippingPreference ? order?.shippingPreference : '-'}
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
                            fontWeight: 500
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
            <Grid item xs={12} md={12} lg={12} xl={6}>
              <PurchaseWidgets order={order} />
            </Grid>
          </Grid>
        )}
      </PageWrapper>
    </React.Fragment>
  )
}
