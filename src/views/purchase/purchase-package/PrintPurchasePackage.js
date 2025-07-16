import { Box, Grid, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material'
import React from 'react'
import { useSelector } from 'react-redux'
import {
  CommonAddress,
  CommonViewTable,
  CompanyData,
  RendorDimensions,
  RendorPrintItemData,
  ViewItemsTableWrapper
} from 'src/common-components/CommonPdfDesign'
import LogoBox from 'src/common-components/LogoBox'
import { DateFunction, NumberFormat } from 'src/common-functions/utils/UtilityFunctions'

export const PrintPurchasePackage = React.forwardRef(({ data, order }, ref) => {
  const { vendors = [] } = data || {}

  const selectedPackage = useSelector(state => state.purchasePackage?.selectedPurchasePackage) || {}
  const vendor = vendors?.find(item => item?.vendorId === selectedPackage?.vendorId) || {}

  const mergedArray = selectedPackage?.packageItems?.map((item, i) => {
    const matchedOrderItem = order?.orderItems?.find(val => val?.itemId === item?.itemId)
    const qty = matchedOrderItem?.qty
    return {
      ...item,
      qty: qty
    }
  })

  const getTotal = key => mergedArray?.reduce((total, item) => total + (item[key] || 0), 0)

  const getTotalQty = () => getTotal('qty')

  return (
    <>
      <Box component={'div'} ref={ref} sx={{ p: 0 }}>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell colSpan={2} sx={{ border: 0 }}>
                <Grid container spacing={6}>
                  <Grid item xs={6.5}>
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 2
                      }}
                    >
                      <Box>
                        <LogoBox data={selectedPackage} />
                      </Box>

                      <div>
                        <CompanyData data={selectedPackage} />
                      </div>
                    </Box>
                  </Grid>
                  <Grid item xs={0.5}></Grid>

                  <Grid item xs={4.5}>
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
                  </Grid>
                </Grid>
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell colSpan={2} sx={{ border: 0 }}>
                <Grid container spacing={6} sx={{ display: 'flex' }}>
                  <Grid item xs={6.5}>
                    <>
                      <Typography
                        sx={{
                          fontSize: '14px',
                          fontWeight: 600,
                          lineHeight: '22px',
                          mb: 1
                        }}
                      >
                        vendor
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
                  </Grid>
                </Grid>
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell colSpan={2} sx={{ border: 0 }}>
                <ViewItemsTableWrapper>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ width: '3%' }}>#</TableCell>
                      <TableCell sx={{ width: '40%' }}>Item</TableCell>
                      <TableCell sx={{ width: '10%' }}>Ordered Qty</TableCell>
                      <TableCell sx={{ width: '12%' }}>Packed Qty</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mergedArray?.length > 0 ? (
                      mergedArray?.map((orderItem, index) => {
                        return (
                          <TableRow key={index}>
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
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={2} sx={{ border: 0 }}>
                <Grid container spacing={6}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ p: 4 }}>
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
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Table
                      sx={{
                        '& .MuiTableCell-root': {
                          padding: '6px 10px !important',
                          borderBottom: '1px dashed #EBEBEB',
                          textAlign: 'right',
                          fontSize: '12px'
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
                            <Typography sx={{ fontSize: 'inherit', fontWeight: 500 }}>
                              <NumberFormat value={getTotalQty()} />
                            </Typography>
                          </TableCell>
                        </TableRow>
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
                              Total Packed Qty:
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography sx={{ fontSize: 'inherit', fontWeight: 600 }}>
                              <NumberFormat value={selectedPackage?.totalPackageQty} />
                            </Typography>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </Grid>
                </Grid>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={2} sx={{ border: 0 }}>
                {selectedPackage?.termsAndConditions ? (
                  <>
                    <Typography
                      sx={{
                        fontSize: '13px',
                        fontWeight: 600
                      }}
                    >
                      Terms and Conditions
                    </Typography>
                    <Typography sx={{ fontSize: '12px', color: '#818181', lineHeight: '21px' }}>
                      <div>
                        <pre
                          style={{
                            fontFamily: 'inherit',
                            whiteSpace: 'pre-wrap'
                          }}
                        >
                          {selectedPackage?.termsAndConditions}
                        </pre>
                      </div>
                    </Typography>
                  </>
                ) : null}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Box>
    </>
  )
})
