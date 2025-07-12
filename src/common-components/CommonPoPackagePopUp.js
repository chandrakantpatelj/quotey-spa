import {
  Alert,
  Card,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material'
import { Box } from '@mui/system'
import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import Icon from 'src/@core/components/icon'
import { DateFunction, NumberFormat, rowStatusChip } from 'src/common-functions/utils/UtilityFunctions'
import useCurrencies from 'src/hooks/getData/useCurrencies'
import useProducts from 'src/hooks/getData/useProducts'
import usePurchaseOrders from 'src/hooks/getData/usePurchaseOrders'
import usePurchasePackages from 'src/hooks/getData/usePurchasePackages'
import useVendors from 'src/hooks/getData/useVendors'
import useWarehouses from 'src/hooks/getData/useWarehouses'
import { CommonAddress, CommonViewTable, CompanyData, RendorItemData, ViewItemsTableWrapper } from './CommonPdfDesign'
import CommonVendorPopup from './CommonVendorPopup'
import CustomCloseButton from './CustomCloseButton'
import LogoBox from './LogoBox'
import StyledButton from './StyledMuiButton'

function CommonPoPackagePopUp({ packageId, open, setOpen }) {
  const theme = useTheme()
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'))
  const tenantId = useSelector(state => state.tenants?.selectedTenant?.tenantId) || ''
  const { fetchSinglePurchasePackage, purchasePackageLoading } = usePurchasePackages(tenantId)
  const { currencies } = useCurrencies()
  const { products, productsLoading } = useProducts(tenantId)
  const { vendors, loading: vendorLoading } = useVendors(tenantId)
  const { fetchPurchaseOrders, purchaseOrdersLoading } = usePurchaseOrders(tenantId)
  const { warehouses, loading: warehouseLoading } = useWarehouses(tenantId)
  const [purchaseOrders, setPurchaseOrders] = useState([])
  const [selectedPackage, setSelectedPackage] = useState({})
  const loader = purchasePackageLoading && warehouseLoading && vendorLoading && purchaseOrdersLoading && productsLoading
  const vendor = useMemo(
    () => vendors?.find(item => item?.vendorId === selectedPackage?.vendorId) || {},
    [vendors, selectedPackage?.vendorId]
  )
  const currency = useMemo(
    () => currencies?.find(item => item?.currencyId === selectedPackage?.currency),
    [currencies, selectedPackage]
  )

  const getselectedPackageObject = async () => {
    const response = await fetchSinglePurchasePackage(packageId)
    setSelectedPackage(response)
  }

  const getPurchaseOrder = async () => {
    const purchaseOrders = await fetchPurchaseOrders()
    setPurchaseOrders(purchaseOrders)
  }

  useEffect(() => {
    if (packageId) {
      getselectedPackageObject()
    }
    getPurchaseOrder()
  }, [tenantId, fetchPurchaseOrders, packageId])

  const handleClose = () => {
    setOpen(false)
  }
  const [openVendorDialog, setOpenVendorDialog] = useState(false)

  const handleVendorDialoge = () => {
    setOpenVendorDialog(!openVendorDialog)
  }

  const receiveArray = useMemo(() => {
    return selectedPackage?.packageItems || []
  }, [selectedPackage])

  const order = useMemo(
    () => purchaseOrders?.find(item => item?.orderId === selectedPackage?.purchaseOrderId) || {},
    [purchaseOrders, selectedPackage?.purchaseOrderId]
  )

  const orderItems = useMemo(() => order?.orderItems?.map(item => item) || [], [order])

  const mergedArray = useMemo(
    () =>
      selectedPackage?.packageItems?.map((item, i) => {
        const matchedOrderItem = order?.orderItems?.find(val => val?.itemId === item?.itemId)
        const qty = matchedOrderItem?.qty
        return {
          ...item,
          qtyToPack: item?.packedQty || 0,
          qty: qty
        }
      }),
    [(orderItems, receiveArray, selectedPackage)]
  )

  const getTotal = key => mergedArray?.reduce((total, item) => total + (item[key] || 0), 0)

  const getTotalQty = () => getTotal('qty')

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
          handleClose()
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
          Package Details
        </Alert>{' '}
      </DialogTitle>
      {loader ? (
        <LinearProgress />
      ) : (
        <DialogContent sx={{ py: 8 }}>
          <CustomCloseButton onClick={handleClose}>
            <Icon icon='tabler:x' fontSize='1.25rem' />
          </CustomCloseButton>

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
                      <LogoBox data={selectedPackage} />
                      <div>
                        <CompanyData data={selectedPackage} />
                      </div>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={5} md={4} lg={4} xl={3.7}>
                    <CommonViewTable>
                      <TableBody>
                        <TableRow>
                          <TableCell sx={{ width: '50%' }}>
                            <Typography className='data-name'>Package No</Typography>
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
                              #{selectedPackage?.packageNo}
                            </Typography>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ width: '50%' }}>
                            <Typography className='data-name'>Order No </Typography>
                          </TableCell>
                          <TableCell>
                            #{selectedPackage?.purchaseOrderNoPrefix}
                            {selectedPackage?.purchaseOrderNo}
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
                              Package Date
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography className='data-value' sx={{ fontWeight: 400, lineHeight: '22px' }}>
                              {DateFunction(selectedPackage?.packageDate)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ width: '50%' }}>
                            <Typography className='data-name'>Status </Typography>
                          </TableCell>
                          <TableCell>{rowStatusChip(selectedPackage?.status)}</TableCell>
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
                  {/* <Grid item xs={0} sm={0} md={1.5} xl={3.6} sx={{ display: { xs: 'none', md: 'block' } }}></Grid> */}
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <ViewItemsTableWrapper>
                  <>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ width: '3%' }}>#</TableCell>
                        <TableCell sx={{ width: '34%' }}>Item</TableCell>
                        <TableCell sx={{ width: '12%' }}>Ordered Qty</TableCell>
                        {isDesktop && mergedArray?.some(item => item?.warehouseId && item?.warehouseId !== '') && (
                          <TableCell sx={{ width: '12%' }}>Warehouse</TableCell>
                        )}
                        {isDesktop ? <TableCell sx={{ width: '12%' }}>Packed Qty</TableCell> : null}
                        <TableCell sx={{ width: '12%' }}>Purchase Price</TableCell>
                        <TableCell sx={{ width: '12%' }}>Subtotal</TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {mergedArray?.length > 0 ? (
                        mergedArray.map((orderItem, index) => {
                          const item = products?.find(item => item?.itemId === orderItem?.itemId)

                          const warehouse = warehouses.find(item => item?.warehouseId === orderItem?.warehouseId) || {}

                          return (
                            <TableRow key={index}>
                              <TableCell>
                                <Typography variant='h6' sx={{ fontSize: '11px', fontWeight: 500, lineHeight: '20px' }}>
                                  {index + 1}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <RendorItemData index={index} orderItem={orderItem} showData={true} />
                                {item?.enablePackingUnit ? (
                                  <>
                                    {orderItem?.packingUnit?.qtyPerUnit}{' '}
                                    <span style={{ fontSize: '11px' }}>
                                      {' '}
                                      ({orderItem?.packedQtyUom}/{orderItem?.packingUnit?.unit})
                                    </span>
                                    <br />
                                    <span>Qty: {orderItem?.packingUnit?.qty}</span>
                                  </>
                                ) : item?.enableDimension ? (
                                  <>
                                    {item?.dimensions?.length !== null && orderItem?.itemDimension?.length}{' '}
                                    {item?.dimensions?.width !== null && (
                                      <>
                                        <span style={{ color: '#818181' }}>×</span>
                                        {orderItem?.itemDimension?.width}
                                      </>
                                    )}
                                    {item?.dimensions?.height !== null && (
                                      <>
                                        <span style={{ color: '#818181' }}>×</span>
                                        {orderItem?.itemDimension?.height}
                                      </>
                                    )}
                                    <br />
                                    <span>Qty: {orderItem?.itemDimension?.qty}</span>
                                  </>
                                ) : (
                                  <>
                                    {orderItem?.packedQtyUom === 'm2' && (
                                      <>
                                        {orderItem?.itemDimension?.length} <span style={{ color: '#818181' }}>×</span>{' '}
                                        {orderItem?.itemDimension?.width} <br />
                                        <span>Qty: {orderItem?.itemDimension?.qty}</span>
                                      </>
                                    )}
                                    {orderItem?.packedQtyUom === 'm3' && (
                                      <>
                                        {orderItem?.itemDimension?.length} <span style={{ color: '#818181' }}>×</span>{' '}
                                        {orderItem?.itemDimension?.width} <span style={{ color: '#818181' }}>×</span>{' '}
                                        {orderItem?.itemDimension?.height}
                                        <br />
                                        <span>Qty: {orderItem?.itemDimension?.qty}</span>
                                      </>
                                    )}
                                    {orderItem?.packedQtyUom !== 'm2' && orderItem?.packedQtyUom !== 'm3' && (
                                      <> Qty: {orderItem?.itemDimension?.qty} </>
                                    )}
                                  </>
                                )}
                              </TableCell>
                              <TableCell>
                                {orderItem?.qty?.toFixed(2)} {orderItem?.uom}
                              </TableCell>
                              {isDesktop &&
                                mergedArray?.some(item => item?.warehouseId && item?.warehouseId !== '') && (
                                  <TableCell>{warehouse?.name}</TableCell>
                                )}
                              <TableCell>{orderItem?.packedQty?.toFixed(2)}</TableCell>
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
                          <TableCell colSpan={7}>
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
                      {selectedPackage?.notes ? (
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
                                {selectedPackage?.notes}
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
                              <NumberFormat value={parseFloat(getTotalQty()).toFixed(2)} currency={currency} />
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
                              <NumberFormat value={selectedPackage?.totalPackageQty} currency={currency} />
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
                              Total Packed Value:
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography sx={{ fontSize: 'inherit', fontWeight: 600 }}>
                              <NumberFormat value={selectedPackage?.totalPackageValue} currency={currency} />
                            </Typography>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Card>
        </DialogContent>
      )}
    </Dialog>
  )
}

export default CommonPoPackagePopUp
