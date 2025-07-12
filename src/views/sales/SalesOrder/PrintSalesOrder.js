import React, { useState, useMemo } from 'react'
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
  PrintPdfLayout,
  RendorPrintSalesItemData
} from 'src/common-components/CommonPdfDesign'
import useCurrencies from 'src/hooks/getData/useCurrencies'

export const PrintSalesOrder = React.forwardRef(({ data }, ref) => {
  const order = useSelector(state => state.sales?.selectedSalesOrder) || []
  const { totalAmount = 0, subtotal = 0, totalQty = 0, discountValue = 0, taxes = [], otherCharges = [] } = order || {}

  const customers = useSelector(state => state.customers.data)

  const { currencies } = useCurrencies()

  const currency = useMemo(() => findObjectByCurrencyId(currencies, order?.currency), [currencies, order])
  const customer = useMemo(
    () => customers?.find(item => item?.customerId === order?.customerId) || {},
    [customers, order]
  )

  const discountType =
    currencies?.find(currency => currency.currencyId === order.discountType)?.symbol || order.discountType

  const getRowTotal = row => {
    const { qty, sellingPrice, gst } = row
    const { discountValue, discountType } = order
    const { taxValue } = calculateTaxValue(sellingPrice * qty, discountValue, discountType, gst)
    let total = qty * sellingPrice + taxValue
    return total.toFixed(2)
  }

  return (
    <Box component={'div'} ref={ref} sx={{ p: 0 }}>
      <PrintPdfLayout
        data={order}
        currency={currency}
        section2={
          <>
            <TableRow>
              <TableCell sx={{ padding: '3px', borderBottom: '0px' }}>
                <Box
                  sx={{
                    fontSize: '13px',
                    backgroundColor: '#d2d5de',
                    color: '#202e5b',
                    textAlign: 'center',
                    padding: '10px'
                  }}
                >
                  DATE
                  <br />
                  <span style={{ fontSize: '12px' }}>{DateFunction(order?.orderDate)}</span>
                </Box>
              </TableCell>
              <TableCell sx={{ padding: '3px', borderBottom: '0px' }}>
                <Box
                  sx={{
                    fontSize: '13px',
                    backgroundColor: '#202e5b',
                    color: '#FFF',
                    textAlign: 'center',
                    padding: '10px'
                  }}
                >
                  PLEASE PAY
                  <br />
                  <span style={{ fontSize: '12px' }}>
                    <NumberFormat value={order?.totalAmount} currency={currency} />
                  </span>
                </Box>
              </TableCell>
              <TableCell sx={{ padding: '3px', borderBottom: '0px' }}>
                <Box
                  sx={{
                    fontSize: '13px',
                    backgroundColor: '#d2d5de',
                    color: '#202e5b',
                    textAlign: 'center',
                    padding: '10px'
                  }}
                >
                  DUE DATE
                  <br />
                  <span style={{ fontSize: '12px' }}> {DateFunction(order?.dueDate)} </span>
                </Box>
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
              Customer
            </Typography>
            <CommonViewTable>
              <TableBody>
                <TableRow>
                  <TableCell>
                    <Typography className='data-name'>{customer?.customerName}</Typography>
                  </TableCell>
                </TableRow>
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
                <TableCell sx={{ width: '52%' }}>ITEM</TableCell>
                <TableCell sx={{ width: '8%' }}>QTY</TableCell>
                <TableCell sx={{ width: '18%' }}>RATE</TableCell>
                <TableCell sx={{ width: '16%' }}>TOTAL</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {order?.orderItems?.length > 0 ? (
                order?.orderItems?.map((orderItem, index) => {
                  return (
                    <TableRow key={orderItem?.itemId}>
                      <TableCell>
                        {' '}
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
            {order?.customerNotes ? (
              <>
                <Typography
                  sx={{
                    fontSize: '13px',
                    fontWeight: 600,
                    lineHeight: '24px'
                  }}
                >
                  Notes
                </Typography>

                <Typography sx={{ fontSize: '12px', fontWeight: 400, color: '#818181', lineHeight: '21px' }}>
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
                <Typography sx={{ fontSize: 'inherit', fontWeight: 400 }}>{totalQty}</Typography>
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
                <Typography sx={{ fontSize: 'inherit', fontWeight: 400 }}>
                  <NumberFormat value={subtotal} currency={currency} />
                </Typography>
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
                      color: '#667380'
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
                {order?.discountValue <= 0 ? (
                  <Typography sx={{ fontSize: 'inherit', fontWeight: 400 }}>0.00</Typography>
                ) : (
                  <Typography color='error' sx={{ fontSize: 'inherit', fontWeight: 400 }}>
                    -{' '}
                    <NumericFormat
                      value={parseFloat(order?.discountValue || 0).toFixed(2)}
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

                        minWidth: 'max-content'
                      }}
                    >
                      {item.chargeName}
                      {item.includingTax ? '(Inc. Tax)' : '(Exc. Tax)'}:
                    </Typography>
                    {item?.taxes?.map(tax => (
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
                    <Typography sx={{ fontSize: 'inherit', fontWeight: 400 }}>
                      <NumberFormat
                        value={item.includingTax ? item.chargedAmount : item.totalChargeValue}
                        currency={currency}
                      />
                    </Typography>
                    {item?.taxes?.map(tax => (
                      <Typography
                        key={tax.taxName}
                        sx={{
                          fontFamily: 'Kanit',
                          fontSize: 'inherit',
                          fontWeight: 400,
                          color: '#667380'
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
                <Typography sx={{ fontSize: 'inherit', fontWeight: 600 }}>
                  <NumberFormat value={totalAmount} currency={currency} />
                </Typography>
              </TableCell>
            </TableRow>
          </>
        }
      />
    </Box>
  )
})
