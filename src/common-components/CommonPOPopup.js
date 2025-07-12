import {
  Alert,
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  LinearProgress,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography
} from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import Icon from 'src/@core/components/icon'
import { divideDecimals } from 'src/common-functions/utils/DecimalUtils'
import {
  DateFunction,
  findObjectByCurrencyId,
  NumberFormat,
  rowStatusChip
} from 'src/common-functions/utils/UtilityFunctions'
import useCurrencies from 'src/hooks/getData/useCurrencies'
import usePurchaseOrders from 'src/hooks/getData/usePurchaseOrders'
import useTaxAuthorities from 'src/hooks/getData/useTaxAuthorities'
import useVendors from 'src/hooks/getData/useVendors'
import useIsDesktop from 'src/hooks/IsDesktop'
import { CommonPageLayoutForPopup } from './CommonPageLayoutForPopup'
import { CommonViewTable, RendorDimensions, RendorItemData, ShowAddress } from './CommonPdfDesign'
import CommonVendorPopup from './CommonVendorPopup'
import CustomCloseButton from './CustomCloseButton'
import StyledButton from './StyledMuiButton'

function CommonPOPopup({ orderId, open, onClose }) {
  const isDesktop = useIsDesktop()

  const tenant = useSelector(state => state.tenants?.selectedTenant)
  const { tenantId = '' } = tenant
  const { fetchPurchaseOrder, purchaseOrdersLoading } = usePurchaseOrders(tenantId)
  const { currencies } = useCurrencies()
  const { vendors, loading: vendorLoading } = useVendors(tenantId)

  const { taxAuthorities, taxAuthorityLoading } = useTaxAuthorities(tenantId)

  const [order, setOrder] = useState(null)
  const loading = purchaseOrdersLoading || vendorLoading || taxAuthorityLoading

  const currency = useMemo(
    () => findObjectByCurrencyId(currencies, order?.currency) || {},
    [currencies, order?.currency]
  )
  const subTotalCurrency = useMemo(
    () => findObjectByCurrencyId(currencies, order?.subtotalCurrency) || {},
    [currencies, order?.subtotalCurrency]
  )
  const totalCurrency = useMemo(
    () => findObjectByCurrencyId(currencies, order?.totalAmountCurrency) || {},
    [currencies, order?.totalAmountCurrency]
  )

  const convSubTotalToLocalPrice = useMemo(
    () => divideDecimals(order?.subtotal || 0, subTotalCurrency?.exchangeRate),
    [order]
  )

  const [vendor, setVendor] = useState({})
  const [openVendorDialog, setOpenVendorDialog] = useState(false)

  const getRowTotal = row => {
    let subTotal = parseFloat(row?.qty) * parseFloat(row?.purchasePrice || 0)
    return subTotal.toFixed(2)
  }

  const handleVendorDialoge = () => {
    setOpenVendorDialog(!openVendorDialog)
  }

  const getPurchaseOrderObject = async () => {
    const order = await fetchPurchaseOrder(orderId)
    if (order) {
      setOrder(order)
    } else {
      setOrder({})
    }
  }

  useEffect(() => {
    if (!order) {
      getPurchaseOrderObject()
    }
  }, [fetchPurchaseOrder, tenantId, orderId])

  useEffect(() => {
    const vendor = vendors?.find(item => item?.vendorId === order?.vendorId) ?? ''
    setVendor(vendor)
  }, [vendors, order?.vendorId])

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
          Purchase Order
        </Alert>{' '}
      </DialogTitle>
      <DialogContent sx={{ py: 8 }}>
        <CustomCloseButton onClick={onClose}>
          <Icon icon='tabler:x' fontSize='1.25rem' />
        </CustomCloseButton>
        {loading ? (
          <LinearProgress />
        ) : order ? (
          <CommonPageLayoutForPopup
            data={order}
            currency={currency}
            section2={
              <>
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
                    <Typography className='data-value' sx={{ fontSize: '12px', fontWeight: 400, lineHeight: '22px' }}>
                      {DateFunction(order?.dueDate)}
                    </Typography>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ width: '50%' }}>
                    <Typography className='data-name'>Terms</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography className='data-value' sx={{ fontSize: '12px', fontWeight: 400, lineHeight: '22px' }}>
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
              </>
            }
            section3={
              <>
                <Typography
                  sx={{
                    fontSize: '13px',
                    fontWeight: 600,
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
                          {' '}
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

                    <ShowAddress data={vendor?.billingAddress} />
                  </TableBody>
                </CommonViewTable>
              </>
            }
            itemsSection={
              <>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: '3%' }}>#</TableCell>
                    <TableCell sx={{ width: '47%' }}>Item</TableCell>
                    <TableCell sx={{ width: '10%' }}>Total Qty</TableCell>
                    {isDesktop ? <TableCell sx={{ width: '18%' }}>Rate</TableCell> : null}
                    <TableCell sx={{ width: '18%' }}>Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {order?.orderItems?.length > 0 ? (
                    order?.orderItems?.map((orderItem, index) => {
                      return (
                        <TableRow key={orderItem?.itemId}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>
                            <RendorItemData index={index} orderItem={orderItem} currency={currency} showData={true} />
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
                            <NumberFormat value={getRowTotal(orderItem)} currency={currency} />
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
              </>
            }
            notesSection={
              order?.vendorNotes ? (
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
                        {order?.vendorNotes}
                      </pre>
                    </div>
                  </Typography>
                </>
              ) : null
            }
            totalsSection={
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
                              <span style={{ fontSize: '11px', color: '#8c96a1' }}>
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
                      <NumberFormat value={parseFloat(order?.subtotal)?.toFixed(2)} currency={subTotalCurrency} />
                    </Typography>
                    {subTotalCurrency?.currencyId !== currency?.currencyId && (
                      <Typography sx={{ fontSize: 'inherit', fontWeight: 400 }}>
                        <NumberFormat value={parseFloat(convSubTotalToLocalPrice)?.toFixed(2)} currency={currency} />
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
                              <span style={{ fontSize: '11px', color: '#8c96a1' }}>
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
                  const taxAuthority = taxAuthorities?.find(val => val?.taxAuthorityId === item?.taxAuthorityId)
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
                          </span>{' '}
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
                              <span style={{ fontSize: '11px', color: '#8c96a1' }}>
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
                              {item?.eligibleForTaxCredit ? `${item?.expenseName}(Exl. Tax)` : item?.expenseName}
                              <br />
                              <span style={{ fontSize: '11px', color: '#8c96a1' }}>
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
                              <span style={{ fontSize: '11px', color: '#8c96a1' }}>
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
                      <NumberFormat value={parseFloat(order?.totalAmount)?.toFixed(2)} currency={totalCurrency} />
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            }
            lastSection={
              <>
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
              </>
            }
          />
        ) : (
          <Typography variant='h4' textAlign={'center'}>
            Order is not available.
          </Typography>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default CommonPOPopup
