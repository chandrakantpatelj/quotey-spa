import {
  Alert,
  Dialog,
  DialogContent,
  DialogTitle,
  LinearProgress,
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
import { DateFunction, NumberFormat } from 'src/common-functions/utils/UtilityFunctions'
import useCustomers from 'src/hooks/getData/useCustomers'
import usePackages from 'src/hooks/getData/usePackages'
import useProducts from 'src/hooks/getData/useProducts'
import useSalesOrders from 'src/hooks/getData/useSalesOrders'
import useWarehouses from 'src/hooks/getData/useWarehouses'
import CommonCustomerPopup from './CommonCustomerPopup'
import { CommonPageLayoutForPopup } from './CommonPageLayoutForPopup'
import { CommonAddress, CommonViewTable, RendorSalesItemData } from './CommonPdfDesign'
import CustomCloseButton from './CustomCloseButton'
import StyledButton from './StyledMuiButton'

function CommonSoPackagePopUp({ packageId, open, setOpen }) {
  const theme = useTheme()
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'))

  const tenantId = useSelector(state => state.tenants?.selectedTenant?.tenantId) || ''
  const { fetchPackages, fetchPackage, salesPackagesLoading } = usePackages(tenantId)
  const { products, fetchProducts, productsLoading } = useProducts(tenantId)

  const { fetchSingleCustomer } = useCustomers(tenantId)
  const { warehouses } = useWarehouses(tenantId)

  const { fetchSalesOrders } = useSalesOrders(tenantId)
  const [salesOrders, setSalesOrders] = useState([])
  const [packages, setPackages] = useState([])
  const [selectedPackage, setSelectedPackage] = useState({})
  const [customer, setCustomer] = useState({})
  console.log('customer', customer)
  useEffect(() => {
    const getCustomerObject = async () => {
      const customer = await fetchSingleCustomer(selectedPackage?.customerId)
      if (customer) {
        setCustomer(customer)
      }
    }
    getCustomerObject()
  }, [tenantId, selectedPackage?.customerId])

  const getselectedPackageObject = async () => {
    const response = await fetchPackage(packageId)
    setSelectedPackage(response)
  }

  useEffect(() => {
    if (packageId) {
      getselectedPackageObject()
    }
  }, [tenantId, packageId])

  useEffect(() => {
    const fetchSalesOrder = async () => {
      const packages = await fetchPackages()
      setPackages(packages)
      const salesOrders = await fetchSalesOrders()
      setSalesOrders(salesOrders)
    }
    fetchSalesOrder()
  }, [fetchSalesOrders, fetchPackages])

  const handleClose = () => {
    setOpen(false)
  }
  const [openCustomerDialog, setOpenCustomerDialog] = useState(false)

  const handleCustomerDialoge = () => {
    setOpenCustomerDialog(!openCustomerDialog)
  }

  const order = useMemo(
    () => salesOrders?.find(item => item?.orderId === selectedPackage?.salesOrderId) || {},
    [salesOrders, selectedPackage?.salesOrderId]
  )

  const mergedArray = useMemo(() => {
    if (!order?.orderItems || !selectedPackage?.packageItems) return []
    return selectedPackage.packageItems.map(item => {
      const matchedOrderItem = order?.orderItems?.find(val => val?.itemId === item?.itemId)
      const qty = matchedOrderItem?.qty
      return {
        ...item,
        qty: qty || 0
      }
    })
  }, [order, selectedPackage])

  const getTotal = key => mergedArray?.reduce((total, item) => total + (item[key] || 0), 0)
  const getTotalQty = () => getTotal('qty')
  const getTotalPackedQty = () => getTotal('packedQty')

  return (
    <Dialog
      open={open}
      disableEscapeKeyDown
      maxWidth='md'
      minWidth='fit-content'
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
      <DialogContent sx={{ py: 8 }}>
        <CustomCloseButton onClick={handleClose}>
          <Icon icon='tabler:x' fontSize='1.25rem' />
        </CustomCloseButton>
        {salesPackagesLoading ? (
          <LinearProgress />
        ) : (
          <CommonPageLayoutForPopup
            data={selectedPackage}
            section2={
              <>
                <TableRow>
                  <TableCell sx={{ width: '50%' }}>
                    <Typography className='data-name'>Package No</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      className='data-value'
                      sx={{
                        color: '#4567c6 !important'
                      }}
                    >
                      #{selectedPackage?.packageNo}
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
                      Packing Date
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography className='data-value' sx={{ fontWeight: 400, lineHeight: '22px' }}>
                      {selectedPackage?.packageDate ? DateFunction(selectedPackage?.packageDate) : '-'}
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
                      {selectedPackage?.expectedPackingDate ? DateFunction(selectedPackage?.expectedPackingDate) : '-'}
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
                      Exp. Delivery Date
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography className='data-value' sx={{ fontWeight: 400, lineHeight: '22px' }}>
                      {selectedPackage?.expectedDeliveryDate
                        ? DateFunction(selectedPackage?.expectedDeliveryDate)
                        : '-'}
                    </Typography>
                  </TableCell>
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
                  Customer
                </Typography>
                <CommonViewTable>
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        <StyledButton color='primary' onClick={handleCustomerDialoge}>
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
                    <TableCell sx={{ width: '34%' }}>Item</TableCell>
                    <TableCell sx={{ width: '6%' }}> Qty</TableCell>
                    {isDesktop && mergedArray?.some(item => item?.warehouseId && item?.warehouseId !== '') && (
                      <TableCell sx={{ width: '12%' }}>Warehouse</TableCell>
                    )}
                    {isDesktop ? <TableCell sx={{ width: '13%' }}>Packed Qty</TableCell> : null}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {mergedArray?.length > 0 ? (
                    mergedArray?.map((orderItem, index) => {
                      const item = products?.find(item => item?.itemId === orderItem?.itemId)

                      const warehouse = warehouses.find(item => item?.warehouseId === orderItem?.warehouseId) || {}
                      return (
                        <>
                          <TableRow>
                            <TableCell>
                              <Typography variant='h6' sx={{ fontSize: '11px', fontWeight: 500, lineHeight: '20px' }}>
                                {index + 1}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <RendorSalesItemData index={index} orderItem={orderItem} showData={false} />
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
                                      {orderItem?.itemDimension?.width}
                                      <br />
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
                              {orderItem?.qty} {orderItem?.packedQtyUom}
                            </TableCell>{' '}
                            {isDesktop && mergedArray?.some(item => item?.warehouseId && item?.warehouseId !== '') && (
                              <TableCell>{warehouse?.name}</TableCell>
                            )}
                            {/* {isDesktop ? <TableCell>{orderItem?.unit}</TableCell> : null} */}
                            {isDesktop ? <TableCell>{orderItem?.packedQty}</TableCell> : null}
                          </TableRow>
                        </>
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
            }
            notesSection={
              <>
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
                    </Typography>
                  </>
                ) : null}
              </>
            }
            totalsSection={
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
                      Total Qty:
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: 'inherit', fontWeight: 400 }}>
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
                      <NumberFormat value={getTotalPackedQty()} />
                    </Typography>
                  </TableCell>
                </TableRow>
              </>
            }
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

export default CommonSoPackagePopUp
