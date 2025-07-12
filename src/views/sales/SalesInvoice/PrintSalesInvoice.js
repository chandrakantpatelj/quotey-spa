import React, { useEffect, useMemo, useState } from 'react'
import { Box, TableBody, TableCell, TableRow, Typography, TableHead } from '@mui/material'
import { useSelector } from 'react-redux'
import { NumericFormat } from 'react-number-format'
import {
  calculateTaxValue,
  DateFunction,
  findObjectByCurrencyId,
  NumberFormat
} from 'src/common-functions/utils/UtilityFunctions'
import {
  CommonAddress,
  CommonViewTable,
  PrintEmailPdfLayout,
  RendorPrintSalesItemData,
  ShowAddress
} from 'src/common-components/CommonPdfDesign'
import useCurrencies from 'src/hooks/getData/useCurrencies'
import useSalesOrders from 'src/hooks/getData/useSalesOrders'

export const PrintSalesInvoice = React.forwardRef((props, ref) => {
  const { selectedInvoice } = props
  const tenant = useSelector(state => state.tenants?.selectedTenant) || ''
  const { tenantId = '' } = tenant

  const customers = useSelector(state => state.customers.data)

  const { totalAmount = 0, subtotal = 0, totalQty = 0, taxes = [], otherCharges = [] } = selectedInvoice || {}
  const { fetchSalesOrder } = useSalesOrders(tenantId)
  const [order, setOrder] = useState({})
  const { currencies } = useCurrencies()

  useEffect(() => {
    const getSalesOrder = async () => {
      if (!selectedInvoice?.salesOrderId) return
      const salesOrders = await fetchSalesOrder(selectedInvoice?.salesOrderId)
      setOrder(salesOrders)
    }
    getSalesOrder()
  }, [fetchSalesOrder])

  const currency = useMemo(
    () => findObjectByCurrencyId(currencies, selectedInvoice?.currency),
    [currencies, selectedInvoice]
  )
  const customer = useMemo(
    () => customers?.find(item => item?.customerId === selectedInvoice?.customerId) || {},
    [customers, selectedInvoice?.customerId]
  )

  const discountType =
    currencies?.find(currency => currency.currencyId === selectedInvoice?.discountType)?.symbol ||
    selectedInvoice?.discountType

  const getRowTotal = row => {
    const { qty, sellingPrice, gst } = row
    const { discountValue, discountType } = selectedInvoice
    const { taxValue } = calculateTaxValue(sellingPrice * qty, discountValue, discountType, gst)
    let total = qty * sellingPrice + taxValue
    return total.toFixed(2)
  }

  return (
    <Box component={'div'} ref={ref} sx={{ p: 0 }}>
      <PrintEmailPdfLayout
        data={selectedInvoice}
        currency={currency}
        section2={
          <>
            <TableRow>
              <TableCell colSpan={3} sx={{ padding: '3px', borderBottom: '0px' }}>
                <Typography
                  sx={{
                    fontSize: '13px',
                    fontWeight: 400,
                    lineHeight: '15px'
                  }}
                >
                  Invoice No: {selectedInvoice?.invoiceNo}{' '}
                  <span style={{ color: '#818181' }}>
                    {' '}
                    (Order #{selectedInvoice?.salesOrderNo} Placed on {DateFunction(order?.orderDate)})
                  </span>
                </Typography>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ padding: '3px', borderBottom: '0px', width: '33.33%' }}>
                <Box
                  sx={{
                    fontSize: '13px',
                    backgroundColor: '#d2d5de',
                    color: '#202e5b',
                    textAlign: 'center',
                    padding: '10px',
                    height: '60px'
                  }}
                >
                  DATE
                  <br />
                  <span style={{ fontSize: '12px' }}>{DateFunction(selectedInvoice?.invoiceDate)}</span>
                </Box>
              </TableCell>
              <TableCell sx={{ padding: '3px', borderBottom: '0px', width: '33.33%' }}>
                <Box
                  sx={{
                    fontSize: '13px',
                    backgroundColor: '#202e5b',
                    color: '#FFF',
                    textAlign: 'center',
                    padding: '10px',
                    height: '60px'
                  }}
                >
                  BALANCE
                  <br />
                  <span style={{ fontSize: '12px' }}>
                    <NumberFormat value={selectedInvoice?.totalOutstandingAmount} currency={currency} />
                  </span>
                </Box>
              </TableCell>
              <TableCell sx={{ padding: '3px', borderBottom: '0px', width: '33.33%' }}>
                {selectedInvoice?.totalOutstandingAmount > 0 ? (
                  <>
                    <Box
                      sx={{
                        fontSize: '13px',
                        backgroundColor: '#d2d5de',
                        color: '#202e5b',
                        textAlign: 'center',
                        padding: '10px',
                        height: '60px'
                      }}
                    >
                      DUE DATE
                      <br />
                      <span style={{ fontSize: '12px' }}> {DateFunction(selectedInvoice?.dueDate)} </span>
                    </Box>
                  </>
                ) : (
                  <>
                    <Box
                      sx={{
                        fontSize: '13px',
                        backgroundColor: theme => theme?.palette?.success?.main,
                        color: '#FFF',
                        textAlign: 'center',
                        padding: '20px',
                        height: '60px'
                      }}
                    >
                      PAID
                    </Box>
                  </>
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={3} sx={{ padding: '3px', borderBottom: '0px' }}>
                <Typography
                  sx={{
                    fontSize: '13px',
                    fontWeight: 400,
                    lineHeight: '15px'
                  }}
                >
                  PaymentTerms:<span style={{ color: '#818181' }}> {selectedInvoice?.paymentTerms}</span>
                </Typography>
              </TableCell>
            </TableRow>
          </>
        }
        section3={
          <>
            <Typography
              sx={{
                fontSize: '14px',
                fontWeight: 600,
                lineHeight: '22px',
                mb: 1
              }}
            >
              Invoice To
            </Typography>
            <CommonViewTable>
              <TableBody>
                <TableRow>
                  <TableCell>
                    <Typography className='data-name'>{customer?.customerName}</Typography>
                  </TableCell>
                </TableRow>
                <ShowAddress data={order?.billingAddress} />
                <CommonAddress data={customer} />
              </TableBody>
            </CommonViewTable>
          </>
        }
        itemsSection={
          <>
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: '3%' }}>#</TableCell>
                <TableCell sx={{ width: '50%' }}>ITEM</TableCell>
                <TableCell sx={{ width: '8%' }}>QTY</TableCell>
                <TableCell sx={{ width: '18%' }}>RATE</TableCell>
                <TableCell sx={{ width: '16%' }}>TOTAL</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {selectedInvoice?.invoiceItems?.length > 0 ? (
                selectedInvoice?.invoiceItems?.map((orderItem, index) => {
                  return (
                    <TableRow key={orderItem?.itemId}>
                      <TableCell>
                        <Typography variant='h6' sx={{ fontSize: '11px', fontWeight: 500, lineHeight: '20px' }}>
                          {index + 1}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <RendorPrintSalesItemData orderItem={orderItem} />
                      </TableCell>

                      <TableCell>
                        {orderItem?.qty} {orderItem?.uom}
                      </TableCell>
                      <TableCell>
                        <NumberFormat value={orderItem?.sellingPrice} currency={currency} />
                      </TableCell>

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
          <>
            {selectedInvoice?.customerNotes ? (
              <>
                {/* <Typography
                  sx={{
                    fontSize: '13px',
                    fontWeight: 600,
                    lineHeight: '24px'
                  }}
                >

                  Notes
                </Typography> */}

                <Typography sx={{ fontSize: '12px', fontWeight: 400, color: '#818181', lineHeight: '21px' }}>
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
                </Typography>
              </>
            ) : null}
          </>
        }
        totalsSection={
          <>
            <TableRow>
              <TableCell>
                {' '}
                <Typography
                  sx={{
                    fontFamily: 'Kanit',
                    fontSize: '14px',
                    fontWeight: 400,
                    color: '#667380'
                  }}
                >
                  Total Qty:
                </Typography>
              </TableCell>
              <TableCell>
                <Typography sx={{ fontSize: 'inherit', fontWeight: 400, textAlign: 'right' }}>{totalQty}</Typography>
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
                    color: '#667380'
                  }}
                >
                  Sub Total:
                </Typography>
              </TableCell>
              <TableCell>
                <Typography sx={{ fontSize: 'inherit', fontWeight: 400, textAlign: 'right' }}>
                  <NumberFormat value={subtotal} currency={currency} />
                </Typography>
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
                        color: '#667380'
                      }}
                    >
                      {item.taxName}({item.taxRate}%):
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: 'inherit', fontWeight: 400, textAlign: 'right' }}>
                      <NumberFormat value={item.taxValue} currency={currency} />
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            {selectedInvoice?.discountValue > 0 ? (
              <>
                <TableRow>
                  <TableCell>
                    {' '}
                    <Typography
                      sx={{
                        fontFamily: 'Kanit',

                        fontSize: '14px',
                        fontWeight: 400,
                        color: '#667380'
                      }}
                    >
                      Discount:
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {selectedInvoice?.discountValue <= 0 ? (
                      <Typography sx={{ fontSize: 'inherit', fontWeight: 400, textAlign: 'right' }}>0.00</Typography>
                    ) : (
                      <Typography color='error' sx={{ fontSize: 'inherit', fontWeight: 400, textAlign: 'right' }}>
                        -{' '}
                        <NumericFormat
                          value={parseFloat(selectedInvoice?.discountValue || 0).toFixed(2)}
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
              </>
            ) : (
              <></>
            )}

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
                          minWidth: 'max-content'
                        }}
                      >
                        {item.chargeName}
                        {item.includingTax ? '(Inc. Tax)' : '(Exc. Tax)'}:
                      </Typography>
                      {item?.taxes
                        ?.filter(tax => tax.taxValue !== 0)
                        ?.map(tax => (
                          <Typography
                            key={tax.taxName}
                            sx={{
                              fontFamily: 'Kanit',
                              fontSize: '12px',
                              fontWeight: 400,
                              color: '#667380'
                            }}
                          >
                            {tax.taxName}({tax.taxRate}%):
                          </Typography>
                        ))}
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: 'inherit', fontWeight: 400, textAlign: 'right' }}>
                        <NumberFormat
                          value={item.includingTax ? item.chargedAmount : item.totalChargeValue}
                          currency={currency}
                        />
                      </Typography>
                      {item?.taxes
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
                    color: '#667380'
                  }}
                >
                  Total (Inc. Tax):
                </Typography>
              </TableCell>
              <TableCell>
                <Typography sx={{ fontSize: 'inherit', fontWeight: 600, textAlign: 'right' }}>
                  <NumberFormat value={totalAmount} currency={currency} />
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
                    color: '#667380'
                  }}
                >
                  Total Due:
                </Typography>
              </TableCell>
              <TableCell>
                <Typography sx={{ fontSize: 'inherit', fontWeight: 400, textAlign: 'right' }}>
                  <NumberFormat value={selectedInvoice?.totalOutstandingAmount} currency={currency} />
                </Typography>
              </TableCell>
            </TableRow>
          </>
        }
      />
    </Box>
  )
})
