import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Card,
  Dialog,
  DialogContent,
  DialogTitle,
  Box,
  Grid,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material'
import { useSelector } from 'react-redux'
import Icon from 'src/@core/components/icon'
import useCurrencies from 'src/hooks/getData/useCurrencies'
import CustomCloseButton from 'src/common-components/CustomCloseButton'
import {
  DateFunction,
  findObjectByCurrencyId,
  NumberFormat,
  rowStatusChip
} from 'src/common-functions/utils/UtilityFunctions'
import { CommonAddress, CommonViewTable, ShowAddress } from 'src/common-components/CommonPdfDesign'
import { addDecimals, divideDecimals } from 'src/common-functions/utils/DecimalUtils'
import useShipments from 'src/hooks/getData/useShipments'
import { fetchData } from 'src/common-functions/GraphqlOperations'
import { getPurchaseOrderShipmentQuery } from 'src/@core/components/graphql/purchase-order-shipment-queries'
import useVendors from 'src/hooks/getData/useVendors'
import CommonVendorPopup from 'src/common-components/CommonVendorPopup'
import StyledButton from 'src/common-components/StyledMuiButton'
import CommonPOPopup from 'src/common-components/CommonPOPopup'
import CommonPoPackagePopUp from 'src/common-components/CommonPoPackagePopUp'

function ShipmentPopup({ shipmentId, open, onClose }) {
  const tenant = useSelector(state => state.tenants?.selectedTenant)
  const { tenantId = '' } = tenant

  const { currencies } = useCurrencies()
  const { vendors } = useVendors(tenantId)
  const { fetchSingleShipment, loading: shipmentLoading } = useShipments(tenantId)

  const [shipment, setShipment] = useState(null)
  const loading = shipmentLoading

  const getSelectedObject = async () => {
    if (!shipmentId) return

    const shipment = await fetchSingleShipment(shipmentId)
    if (shipment) {
      setShipment(shipment)
    }
  }

  useEffect(() => {
    if (!shipment) {
      getSelectedObject()
    }
  }, [tenantId, shipmentId])

  const vendor = useMemo(
    () => vendors?.find(item => item?.vendorId === shipment?.vendorId) || {},
    [vendors, shipment?.vendorId]
  )
  const [openVendorDialog, setOpenVendorDialog] = useState(false)

  const handleVendorDialoge = () => {
    setOpenVendorDialog(!openVendorDialog)
  }
  const [purchaseOrderDialogState, setPurchaseOrderDialogState] = useState({
    open: false,
    selectedOrderId: null
  })

  const [purchasePackageDialogState, setPurchasePackageDialogState] = useState({
    open: false,
    selectedPackageId: null
  })
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
          Purchases Shipment
        </Alert>{' '}
      </DialogTitle>
      <DialogContent sx={{ py: 8 }}>
        <CustomCloseButton onClick={onClose}>
          <Icon icon='tabler:x' fontSize='1.25rem' />
        </CustomCloseButton>

        {loading ? (
          <LinearProgress />
        ) : (
          <Card sx={{ p: 6 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={12}>
                <Table
                  sx={{
                    width: '100%',
                    border: 0,
                    '& .MuiTableCell-root': {
                      border: 0,
                      padding: '0px !important',
                      verticalAlign: 'top',
                      width: '50%'
                    },
                    '& .MuiTableCell-root .data-name': {
                      fontSize: '13px',
                      color: '#818181',
                      lineHeight: '28px'
                    },
                    '& .MuiTableCell-root .data-value': {
                      fontSize: '13px',
                      fontWeight: 500,
                      color: '#000',
                      lineHeight: '28px'
                    }
                  }}
                >
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        <Typography
                          sx={{
                            fontSize: '14px',
                            fontWeight: 500,
                            lineHeight: '26px',
                            color: '#4567c6 !important',
                            textAlign: 'left'
                          }}
                        >
                          #{shipment?.shipmentNoPrefix}
                          {shipment?.shipmentNo}
                        </Typography>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Typography className='data-name'>
                          Status:
                          {rowStatusChip(shipment?.status)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Typography className='data-name'>
                          Shipment Date:
                          {DateFunction(shipment?.shipmentDate)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Typography className='data-name'>
                          Payment Status:
                          {rowStatusChip(shipment?.paymentStatus)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Typography className='data-name'>
                          Delivery Status:
                          {rowStatusChip(shipment?.deliveryStatus)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Grid>
              <Grid item xs={12} md={6}>
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
              <Grid item xs={12} md={6}>
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
                    <ShowAddress data={shipment?.deliveryAddress} />
                  </TableBody>
                </CommonViewTable>
              </Grid>

              <Grid item xs={12} sm={12}>
                <Typography sx={{ fontSize: '14px', fontWeight: 500, lineHeight: '22px', mb: 2 }}>Packages</Typography>
                <TableContainer>
                  <Table
                    size='small'
                    sx={{
                      '& .MuiTableHead-root': {
                        textTransform: 'capitalize'
                      },
                      '& .MuiTableCell-root': {
                        borderBottom: '1px dashed #D8D8D8'
                      },
                      '& .MuiTableCell-root:last-of-type': {
                        textAlign: 'right'
                      }
                    }}
                  >
                    <TableHead sx={{ bgcolor: 'rgba(248, 250, 254, 1)' }}>
                      <TableRow>
                        <TableCell>Package</TableCell>
                        <TableCell>Purchase Order</TableCell>
                        <TableCell>Total Value</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {shipment?.packages?.map((item, index) => {
                        const currency = currencies?.find(val => val?.currencyId === item?.currency)
                        const vendor = vendors?.find(val => val?.vendorId === item?.vendorId) || {}

                        return (
                          <TableRow key={index}>
                            <TableCell align='left'>
                              <StyledButton
                                color='primary'
                                onClick={() =>
                                  setPurchasePackageDialogState({
                                    open: true,
                                    selectedPackageId: item?.packageId
                                  })
                                }
                              >
                                {item?.packageNoPrefix}
                                {item?.packageNo}
                              </StyledButton>
                            </TableCell>
                            <TableCell align='left'>
                              <StyledButton
                                color='primary'
                                onClick={() =>
                                  setPurchaseOrderDialogState({
                                    open: true,
                                    selectedOrderId: item?.purchaseOrderId
                                  })
                                }
                              >
                                {item?.purchaseOrderNoPrefix}
                                {item?.purchaseOrderNo}
                              </StyledButton>
                              ({vendor?.displayName})
                            </TableCell>
                            <TableCell align='right'>
                              <NumberFormat value={item?.totalValue} currency={currency} />
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
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
                      {shipment?.notes ? (
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
                                {shipment?.notes}
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
                        {shipment?.expenses
                          ?.filter(a => a.paidToMainVendor)
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

                        {shipment?.taxes?.map((item, i) => {
                          const vendor = vendors?.find(val => val?.vendorId === item?.vendorId)
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
                                  <br />
                                  <span style={{ fontSize: '13px', color: '#8c96a1' }}>
                                    ({vendor?.displayName || 'none'})
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
                        {shipment?.expenses
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
                        {shipment?.expenses
                          ?.filter(a => a.eligibleForTaxCredit === true)
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
                                      {item?.expenseName}(Exl. Tax) <br />
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
                      </TableBody>
                    </Table>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Card>
        )}
        {purchaseOrderDialogState.open && (
          <CommonPOPopup
            orderId={purchaseOrderDialogState.selectedOrderId}
            open={purchaseOrderDialogState.open}
            onClose={() => setPurchaseOrderDialogState({ open: false, selectedOrderId: null })}
          />
        )}
        {purchasePackageDialogState?.open && (
          <CommonPoPackagePopUp
            packageId={purchasePackageDialogState?.selectedPackageId}
            open={purchasePackageDialogState?.open}
            setOpen={() => setPurchasePackageDialogState({ open: false, selectedPackageId: null })}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

export default ShipmentPopup
