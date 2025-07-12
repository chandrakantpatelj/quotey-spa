import { Box, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material'
import React, { useMemo } from 'react'
import { useSelector } from 'react-redux'
import {
  CommonAddress,
  CommonViewTable,
  PrintPdfLayout,
  RendorDimensions,
  RendorPrintItemData
} from 'src/common-components/CommonPdfDesign'
import { DateFunction } from 'src/common-functions/utils/UtilityFunctions'

export const PrintPackage = React.forwardRef(({ data }, ref) => {
  const { customers = [], salesOrders = [] } = data || {}
  const selectedPackage = useSelector(state => state?.packages?.selectedPackages) || {}

  const order = useMemo(
    () => salesOrders?.find(item => item?.orderId === selectedPackage?.salesOrderId) || {},
    [salesOrders, selectedPackage]
  )

  const customer = useMemo(
    () => customers?.find(item => item?.customerId === selectedPackage?.customerId) || {},
    [customers, selectedPackage]
  )

  const orderItems = useMemo(() => order?.orderItems?.map(item => item) || [], [order])
  const receiveArray = selectedPackage?.packageItems || []
  const mergedArray = useMemo(
    () =>
      selectedPackage?.packageItems?.map((item, i) => {
        const matchedOrderItem = order?.orderItems?.find(val => val?.itemId === item?.itemId)
        const qty = matchedOrderItem?.qty
        return {
          ...item,
          packedQty: 0,
          // qtyToPack: item?.packedQty || 0,
          qty: qty
        }
      }),
    [(orderItems, receiveArray)]
  )

  const getTotal = key => mergedArray?.reduce((total, item) => total + (item[key] || 0), 0)

  const getTotalQty = () => getTotal('qty')
  const getTotalQtyToPack = () => getTotal('qtyToPack')

  return (
    <>
      <Box component={'div'} ref={ref} sx={{ p: 0 }}>
        <PrintPdfLayout
          data={selectedPackage}
          section2={
            <>
              <CommonViewTable>
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
                      {DateFunction(selectedPackage?.date)}
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
                      Package No
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      className='data-value'
                      sx={{ fontSize: '12px', fontWeight: 400, color: '#4567c6 !important' }}
                    >
                      #{selectedPackage?.packageNo}
                    </Typography>
                  </TableCell>
                </TableRow>
              </CommonViewTable>
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
                  <TableCell sx={{ width: '40%' }}>Item</TableCell>
                  <TableCell sx={{ width: '5%' }}>Qty</TableCell>
                  <TableCell sx={{ width: '12%' }}>Packed Qty</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mergedArray?.length > 0 ? (
                  mergedArray?.map((orderItem, index) => {
                    return (
                      <>
                        <TableRow>
                          <TableCell>
                            <Typography variant='h6' sx={{ fontSize: '11px', fontWeight: 500, lineHeight: '20px' }}>
                              {index + 1}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <RendorPrintItemData orderItem={orderItem} />
                            <RendorDimensions orderItem={orderItem} />
                          </TableCell>
                          <TableCell>
                            {orderItem?.qty} {orderItem?.packedQtyUom}
                          </TableCell>
                          <TableCell>{orderItem?.packedQty}</TableCell>
                        </TableRow>
                      </>
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
              {selectedPackage?.notes ? (
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
                    {selectedPackage?.notes}
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
                      color: '#667380',
                      textAlign: 'right'
                    }}
                  >
                    Total Qty:
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography sx={{ fontSize: 'inherit', fontWeight: 400 }}>{getTotalQty()}</Typography>
                </TableCell>
              </TableRow>
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
                    Total Packed Qty:
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography sx={{ fontSize: 'inherit', fontWeight: 500 }}>{getTotalQtyToPack()}</Typography>
                </TableCell>
              </TableRow>
            </>
          }
        />
      </Box>
    </>
  )
})
