// ** Next Import
import Link from 'next/link'
import Router from 'next/router'

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
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useReactToPrint } from 'react-to-print'
import { undoPurchaseOrderPackageStageQuery } from 'src/@core/components/graphql/purchase-order-packages-queries'
import { getPurchaseOrdersByVendorToBePackagedQuery } from 'src/@core/components/graphql/purchase-order-queries'
import Icon from 'src/@core/components/icon'
import PageHeader from 'src/@core/components/page-header'
import PageWrapper from 'src/@core/layouts/PageWrapper'
import {
  CommonAddress,
  CommonViewTable,
  CompanyData,
  RendorItemData,
  ViewItemsTableWrapper
} from 'src/common-components/CommonPdfDesign'
import CommonStyledMenu from 'src/common-components/CommonStyledMenu'
import CommonVendorPopup from 'src/common-components/CommonVendorPopup'
import LogoBox from 'src/common-components/LogoBox'
import StyledButton from 'src/common-components/StyledMuiButton'
import { fetchData, writeData } from 'src/common-functions/GraphqlOperations'
import { CREATE_PACKAGE, EDIT_PACKAGE, STATUS_DRAFT } from 'src/common-functions/utils/Constants'
import {
  DateFunction,
  hasPermission,
  NumberFormat,
  rowStatusChip,
  toTitleCase
} from 'src/common-functions/utils/UtilityFunctions'
import usePurchaseOrders from 'src/hooks/getData/usePurchaseOrders'
import { createAlert } from 'src/store/apps/alerts'
import { setLoading, setSelectedPurchasePackage, setUpdatePurchasePackage } from 'src/store/apps/purchase-packages'
import MovetoNextStagePurchasePackage from './MovetoNextStagePurchasePackage'
import { PrintPurchasePackage } from './PrintPurchasePackage'
import PurchasePackageRelatedRecords from './PurchasePackageRelatedRecords'

export default function ViewPurchasePackage({ packagesObject, loading }) {
  const route = Router
  const dispatch = useDispatch()
  const theme = useTheme()
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'))
  const tenantId = useSelector(state => state.tenants?.selectedTenant.tenantId)
  const userProfile = useSelector(state => state.userProfile)
  const componentRef = useRef(null)

  const { reloadPurchaseOrderInStore } = usePurchaseOrders(tenantId)

  const { products = [], vendors = [], warehouses = [], currencies = [] } = packagesObject || {}

  const selectedPurchasePackage = useSelector(state => state.purchasePackage?.selectedPurchasePackage) || {}
  const currency = currencies?.find(item => item?.currencyId === selectedPurchasePackage?.currency)

  useEffect(() => {
    if (Object.keys(selectedPurchasePackage).length === 0) {
      route.push('/purchases/packages/')
    }
  }, [selectedPurchasePackage, tenantId])

  const handlePrint = useReactToPrint({
    content: () => componentRef.current
  })

  const [purchaseOrders, setPurchaseOrders] = useState([])

  const getPurchaseOrders = async () => {
    const vendorId = selectedPurchasePackage?.vendorId
    try {
      const response = await fetchData(getPurchaseOrdersByVendorToBePackagedQuery(tenantId, vendorId))
      const { getPurchaseOrdersByVendorToBePackaged = [] } = response || {}
      setPurchaseOrders(getPurchaseOrdersByVendorToBePackaged)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    getPurchaseOrders()
  }, [selectedPurchasePackage?.purchaseOrderId])

  const purchaseOrder = purchaseOrders.find(order => order.orderId === selectedPurchasePackage.purchaseOrderId)

  const vendor = useMemo(
    () => vendors?.find(item => item?.vendorId === selectedPurchasePackage?.vendorId) || {},
    [vendors, selectedPurchasePackage?.vendorId]
  )
  const [anchorEl, setAnchorEl] = useState(null)

  const open = Boolean(anchorEl)

  const handleClick = event => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }

  const mergedArray = selectedPurchasePackage?.packageItems?.map((item, i) => {
    const matchedOrderItem = purchaseOrder?.orderItems?.find(val => val?.itemId === item?.itemId)

    const qty = matchedOrderItem?.qty

    return {
      ...item,
      qty: qty
    }
  })

  const getTotal = key => mergedArray?.reduce((total, item) => total + (item[key] || 0), 0)

  const getTotalQty = () => getTotal('qty')

  const [openVendorDialog, setOpenVendorDialog] = useState(false)

  const handleVendorDialoge = () => {
    setOpenVendorDialog(!openVendorDialog)
  }

  const [openMovetoNextStageDialog, setOpenMovetoNextStageDialog] = useState(false)

  const MoveToNextStage = () => {
    setOpenMovetoNextStageDialog(true)
    setAnchorEl(null)
  }

  const UndoStage = async data => {
    setAnchorEl(null)

    const { tenantId, packageId } = data
    const stageName = data?.currentStage
    try {
      dispatch(setLoading(false))
      const response = await writeData(undoPurchaseOrderPackageStageQuery(), { tenantId, packageId, stageName })
      if (response.undoPurchaseOrderPackageStage) {
        dispatch(setUpdatePurchasePackage(response.undoPurchaseOrderPackageStage))
        dispatch(setSelectedPurchasePackage(response.undoPurchaseOrderPackageStage))
        await reloadPurchaseOrderInStore(response?.undoPurchaseOrderPackageStage?.purchaseOrderId)

        dispatch(createAlert({ message: 'Moved Package to Previous Stage successfully!', type: 'success' }))
      } else {
        const errorMessage = response.errors[0] ? response.errors[0].message : 'Failed to move to previous stage!'
        dispatch(createAlert({ message: errorMessage, type: 'error' }))
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    }
  }

  return (
    <div>
      <PageHeader
        title={
          <Typography
            sx={{
              fontSize: { xs: '16px', md: '18px' },
              fontWeight: '500'
            }}
          >
            View Package - {selectedPurchasePackage?.packageNo}
          </Typography>
        }
        button={
          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
            {hasPermission(userProfile, CREATE_PACKAGE) && (
              <Button
                variant='contained'
                color='primary'
                sx={{ display: { xs: 'none', sm: 'flex' } }}
                startIcon={<AddOutlinedIcon />}
                component={Link}
                scroll={true}
                href={`/purchases/packages/add-package`}
              >
                Add New
              </Button>
            )}
            {hasPermission(userProfile, EDIT_PACKAGE) && selectedPurchasePackage?.status === STATUS_DRAFT && (
              <IconButton
                component={Link}
                scroll={true}
                href={`/purchases/packages/edit/${selectedPurchasePackage?.packageId}`}
                onClick={() => dispatch(setSelectedPurchasePackage(selectedPurchasePackage))}
              >
                <Icon icon='tabler:edit' />
              </IconButton>
            )}

            <IconButton color='default' component={Link} scroll={true} href='/purchases/packages/'>
              <Close sx={{ color: theme => theme.palette.primary.main }} />
            </IconButton>

            <>
              <IconButton
                aria-label='more'
                id='long-button'
                aria-haspopup='true'
                onClick={event => {
                  handleClick(event)
                }}
              >
                <Icon icon='iconamoon:menu-kebab-vertical-circle' width={23} height={23} />
              </IconButton>

              <CommonStyledMenu anchorEl={anchorEl} open={open} onClose={handleClose}>
                {selectedPurchasePackage?.undoCurrentStage && (
                  <MenuItem onClick={() => UndoStage(selectedPurchasePackage)}>
                    <Icon icon='iconamoon:do-undo-light' />
                    Undo Stage {toTitleCase(selectedPurchasePackage?.currentStage)}
                  </MenuItem>
                )}

                {selectedPurchasePackage?.moveToNextStage && (
                  <MenuItem onClick={() => MoveToNextStage(selectedPurchasePackage)}>
                    <Icon icon='solar:forward-outline' />
                    Move to {toTitleCase(selectedPurchasePackage?.nextStage)}
                  </MenuItem>
                )}
                {selectedPurchasePackage?.status !== STATUS_DRAFT && (
                  <MenuItem
                    onClick={() => {
                      setAnchorEl(null)
                      handlePrint()
                    }}
                  >
                    <Icon icon={'ion:print-outline'} fontSize={24} />
                    Print Package
                  </MenuItem>
                )}
              </CommonStyledMenu>
              <div style={{ position: 'fixed', top: '100%', left: '100%', transform: 'translate(100%, 100%)' }}>
                <PrintPurchasePackage ref={componentRef} data={packagesObject} order={purchaseOrder} />
              </div>
            </>
          </Box>
        }
      />
      <PageWrapper>
        {loading ? (
          <LinearProgress />
        ) : (
          <Grid container spacing={{ xs: 5, xl: 10 }}>
            <Grid item xs={12} md={12} lg={6} xl={7}>
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
                          <LogoBox data={selectedPurchasePackage} />
                          <div>
                            <CompanyData data={selectedPurchasePackage} />
                          </div>
                        </Box>
                      </Grid>

                      <Grid item xs={12} sm={5} md={4} lg={4} xl={3.7}>
                        <CommonViewTable>
                          <TableBody>
                            {' '}
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
                                  #{selectedPurchasePackage?.packageNo}
                                </Typography>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell sx={{ width: '50%' }}>
                                <Typography className='data-name'>Order No </Typography>
                              </TableCell>
                              <TableCell>
                                #{selectedPurchasePackage?.purchaseOrderNoPrefix}
                                {selectedPurchasePackage?.purchaseOrderNo}
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
                                  {DateFunction(selectedPurchasePackage?.packageDate)}
                                </Typography>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell sx={{ width: '50%' }}>
                                <Typography className='data-name'>Status </Typography>
                              </TableCell>
                              <TableCell>{rowStatusChip(selectedPurchasePackage?.status)}</TableCell>
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
                            {isDesktop ? <TableCell sx={{ width: '12%' }}>Ordered Qty</TableCell> : null}
                            {isDesktop && mergedArray?.some(item => item?.warehouseId && item?.warehouseId !== '') && (
                              <TableCell sx={{ width: '12%' }}>Warehouse</TableCell>
                            )}
                            <TableCell sx={{ textAlign: 'center', width: '12%' }}>Packed Qty</TableCell>
                            {isDesktop ? <TableCell sx={{ width: '12%' }}>Purchase Price</TableCell> : null}
                            <TableCell sx={{ width: '12%' }}>Subtotal</TableCell>
                          </TableRow>
                        </TableHead>

                        <TableBody>
                          {mergedArray?.length > 0 ? (
                            mergedArray.map((orderItem, index) => {
                              const item = products?.find(item => item?.itemId === orderItem?.itemId)

                              const warehouse =
                                warehouses.find(item => item?.warehouseId === orderItem?.warehouseId) || {}

                              return (
                                <TableRow key={index}>
                                  <TableCell>
                                    <Typography
                                      variant='h6'
                                      sx={{ fontSize: '11px', fontWeight: 500, lineHeight: '20px' }}
                                    >
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
                                            {orderItem?.itemDimension?.length}{' '}
                                            <span style={{ color: '#818181' }}>×</span>{' '}
                                            {orderItem?.itemDimension?.width} <br />
                                            <span>Qty: {orderItem?.itemDimension?.qty}</span>
                                          </>
                                        )}
                                        {orderItem?.packedQtyUom === 'm3' && (
                                          <>
                                            {orderItem?.itemDimension?.length}{' '}
                                            <span style={{ color: '#818181' }}>×</span>{' '}
                                            {orderItem?.itemDimension?.width}{' '}
                                            <span style={{ color: '#818181' }}>×</span>{' '}
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

                                  {isDesktop ? (
                                    <TableCell>
                                      {orderItem?.qty?.toFixed(2)} {orderItem?.packedQtyUom}
                                    </TableCell>
                                  ) : null}
                                  {isDesktop &&
                                    mergedArray?.some(item => item?.warehouseId && item?.warehouseId !== '') && (
                                      <TableCell>{warehouse?.name}</TableCell>
                                    )}
                                  <TableCell sx={{ textAlign: 'center' }}>{orderItem?.packedQty?.toFixed(2)}</TableCell>
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
                          {selectedPurchasePackage?.notes ? (
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
                                    {selectedPurchasePackage?.notes}
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
                                  <NumberFormat value={selectedPurchasePackage?.totalPackageQty} />
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
                                  <NumberFormat
                                    value={selectedPurchasePackage?.totalPackageValue}
                                    currency={currency}
                                  />
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
            </Grid>
            <Grid item xs={12} md={12} lg={6} xl={5}>
              <PurchasePackageRelatedRecords selectedPurchasePackage={selectedPurchasePackage} />
            </Grid>
          </Grid>
        )}
      </PageWrapper>
      {openMovetoNextStageDialog && (
        <MovetoNextStagePurchasePackage
          tenantId={tenantId}
          selectedPackage={selectedPurchasePackage}
          open={openMovetoNextStageDialog}
          setOpen={setOpenMovetoNextStageDialog}
        />
      )}
    </div>
  )
}
