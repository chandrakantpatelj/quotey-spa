import { Box, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material'
import React from 'react'
import { useSelector } from 'react-redux'
import {
  CommonAddress,
  CommonViewTable,
  PrintPdfLayout,
  RendorDimensions,
  RendorPrintItemData
} from 'src/common-components/CommonPdfDesign'
import {
  DateFunction,
  findObjectByCurrencyId,
  NumberFormat,
  rowStatusChip
} from 'src/common-functions/utils/UtilityFunctions'
import useCurrencies from 'src/hooks/getData/useCurrencies'

export const PrintPurchaseOrder = React.forwardRef(({ data }, ref) => {
  const order = useSelector(state => state.purchaseOrder?.selectedPurchaseOrder) || []
  const { vendors = [] } = data || {}
  const { currencies } = useCurrencies()
  const currency = findObjectByCurrencyId(currencies, order?.currency) || {}
  const subTotalCurrency = findObjectByCurrencyId(currencies, order?.subtotalCurrency) || {}
  const totalCurrency = findObjectByCurrencyId(currencies, order?.totalAmountCurrency) || {}

  const vendor = vendors.find(item => item?.vendorId === order?.vendorId) || {}

  return (
    <>
      <Box component={'div'} ref={ref} sx={{ p: 0 }}>
        <PrintPdfLayout
          data={order}
          currency={currency}
          section2={
            <>
              <TableRow>
                <TableCell sx={{ width: '40%' }}>
                  <Typography
                    className='data-name'
                    sx={{
                      fontSize: '12px',
                      textAlign: 'left'
                    }}
                  >
                    Order Date
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography className='data-value' sx={{ fontSize: '12px', fontWeight: 400 }}>
                    {DateFunction(order?.orderDate)}
                  </Typography>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ width: '40%' }}>
                  <Typography
                    className='data-name'
                    sx={{
                      fontSize: '12px',
                      textAlign: 'left'
                    }}
                  >
                    Due Date
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography className='data-value' sx={{ fontSize: '12px', fontWeight: 400 }}>
                    {DateFunction(order?.dueDate)}
                  </Typography>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ width: '40%' }}>
                  <Typography
                    className='data-name'
                    sx={{
                      fontSize: '12px',
                      textAlign: 'left'
                    }}
                  >
                    Terms
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography className='data-value' sx={{ fontSize: '12px', fontWeight: 400 }}>
                    {order?.paymentTerms ? order?.paymentTerms : '-'}
                  </Typography>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ width: '40%' }}>
                  <Typography
                    className='data-name'
                    sx={{
                      fontSize: '12px',
                      textAlign: 'left'
                    }}
                  >
                    Order No
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography
                    className='data-value'
                    sx={{ fontSize: '12px', fontWeight: 400, color: '#4567c6 !important' }}
                  >
                    #{order?.orderNo}
                  </Typography>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ width: '40%' }}>
                  <Typography
                    className='data-name'
                    sx={{
                      fontSize: '12px',
                      textAlign: 'left'
                    }}
                  >
                    Payment Status
                  </Typography>
                </TableCell>
                <TableCell>{rowStatusChip(order?.paymentStatus)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ width: '40%' }}>
                  <Typography
                    className='data-name'
                    sx={{
                      fontSize: '12px',
                      textAlign: 'left'
                    }}
                  >
                    Status
                  </Typography>
                </TableCell>
                <TableCell>{rowStatusChip(order?.status)}</TableCell>
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
                Vendor
              </Typography>
              <CommonViewTable>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <Typography className='data-name'>{vendor?.displayName}</Typography>
                    </TableCell>
                  </TableRow>
                  <CommonAddress data={vendor} />
                </TableBody>
              </CommonViewTable>
            </>
          }
          itemsSection={
            <>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: '3%' }}>#</TableCell>
                  <TableCell sx={{ width: '42%' }}>Item</TableCell>
                  <TableCell sx={{ width: '8%' }}>Qty</TableCell>
                  <TableCell sx={{ width: '18%' }}>Rate</TableCell>
                  <TableCell sx={{ width: '16%' }}>Total</TableCell>
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
                          <RendorPrintItemData orderItem={orderItem} />
                          <RendorDimensions orderItem={orderItem} />
                        </TableCell>

                        <TableCell>
                          {orderItem?.qty} {orderItem?.uom}
                        </TableCell>
                        <TableCell>
                          <NumberFormat value={orderItem?.purchasePrice} currency={currency} />
                        </TableCell>

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
            </>
          }
          notesSection={
            <>
              {order?.vendorNotes ? (
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
                        {order?.vendorNotes}
                      </pre>
                    </div>
                  </Typography>
                </>
              ) : null}
            </>
          }
          totalsSection={
            <>
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
                            {item?.expenseName}
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
                </TableCell>
              </TableRow>

              {order?.expenses
                ?.filter(a => a.paidToMainVendor === false && a.accountableForOrderTaxes === true)
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
                            {item?.expenseName}
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
                        {item?.taxName}
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
                            {`${item?.expenseName}(Tax)`}
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
                    Total:
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography sx={{ fontSize: 'inherit', fontWeight: 600 }}>
                    <NumberFormat value={parseFloat(order?.totalAmount)?.toFixed(2)} currency={totalCurrency} />
                  </Typography>
                </TableCell>
              </TableRow>
            </>
          }
        />
      </Box>
    </>
  )
})
