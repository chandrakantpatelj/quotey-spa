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
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useReactToPrint } from 'react-to-print'
import {
  markSalesOrderPackageAsDeliveredMutation,
  undoSalesOrderPackageFulfillmentMutation
} from 'src/@core/components/graphql/sales-order-package-queries'
import Icon from 'src/@core/components/icon'
import PageHeader from 'src/@core/components/page-header'
import PageWrapper from 'src/@core/layouts/PageWrapper'
import CommonCustomerPopup from 'src/common-components/CommonCustomerPopup'
import {
  CommonAddress,
  CommonViewTable,
  CompanyData,
  RendorSalesItemData,
  ShowAddress,
  ViewItemsTableWrapper
} from 'src/common-components/CommonPdfDesign'
import CommonStyledMenu from 'src/common-components/CommonStyledMenu'
import LogoBox from 'src/common-components/LogoBox'
import StyledButton from 'src/common-components/StyledMuiButton'
import { writeData } from 'src/common-functions/GraphqlOperations'
import {
  CREATE_PACKAGE,
  EDIT_PACKAGE,
  STATUS_CONFIRMED,
  STATUS_DELIVERED,
  STATUS_DRAFT,
  STATUS_FULFILLED,
  STATUS_PARTLY_FULFILLED
} from 'src/common-functions/utils/Constants'
import { DateFunction, hasPermission, NumberFormat, rowStatusChip } from 'src/common-functions/utils/UtilityFunctions'
import useCustomers from 'src/hooks/getData/useCustomers'
import useSalesOrders from 'src/hooks/getData/useSalesOrders'
import { createAlert } from 'src/store/apps/alerts'
import { setSelectedPackages, setUpdatePackage } from 'src/store/apps/packages'
import { setActionSalesOrder } from 'src/store/apps/sales'
import AssigntoUserPopup from './AssigntoUserPopup'
import FullfillPackagePopup from './FullfillPackagePopup'
import PackageWidget from './PackageWidget'
import { PrintPackage } from './PrintPackage'
import ProcessAsDelivered from './ProcessAsDelivered'

export default function ViewPackage({ packagesObject, loading }) {
  const route = Router
  const dispatch = useDispatch()
  const theme = useTheme()

  const tenantId = useSelector(state => state.tenants?.selectedTenant.tenantId)
  const userProfile = useSelector(state => state.userProfile)
  const { fetchSingleCustomer } = useCustomers(tenantId)
  const { products = [], salesOrders = [], warehouses = [] } = packagesObject || {}
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'))
  const selectedPackage = useSelector(state => state?.packages?.selectedPackages) || {}
  const [customer, setCustomer] = useState({})
  const componentRef = useRef(null)
  const { reloadSalesOrderInStore } = useSalesOrders(tenantId)

  const handlePrint = useReactToPrint({
    content: () => componentRef.current
  })

  useEffect(() => {
    if (Object.keys(selectedPackage).length === 0) {
      route.push('/sales/packages/')
    }
  }, [selectedPackage, tenantId])

  const order = useMemo(
    () => salesOrders?.find(item => item?.orderId === selectedPackage?.salesOrderId) || {},
    [salesOrders, selectedPackage]
  )

  useEffect(() => {
    const getCustomerObject = async () => {
      const customer = await fetchSingleCustomer(selectedPackage?.customerId)

      if (customer) {
        setCustomer(customer)
      }
    }
    getCustomerObject()
  }, [tenantId, selectedPackage?.customerId, fetchSingleCustomer])

  const mergedArray = useMemo(
    () =>
      selectedPackage?.packageItems?.map((item, i) => {
        const matchedOrderItem = order?.orderItems?.find(val => val?.itemId === item?.itemId)
        const qty = matchedOrderItem?.qty
        return {
          ...item,
          qty: qty
        }
      }),
    [(selectedPackage, order)]
  )

  const getTotal = key => mergedArray?.reduce((total, item) => total + (item[key] || 0), 0)
  const getTotalQty = () => getTotal('qty')
  const getTotalPackedQty = () => getTotal('packedQty')
  const [anchorEl, setAnchorEl] = React.useState(null)
  const open = Boolean(anchorEl)

  const handleClick = event => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }

  const [openCustomerDialog, setOpenCustomerDialog] = useState(false)

  const handleCustomerDialoge = () => {
    setOpenCustomerDialog(!openCustomerDialog)
  }

  const [assignToUserPopup, setAssignToUserPopup] = useState(false)

  const handleAssignToUser = data => {
    handleClose()
    setAssignToUserPopup(true)
  }

  const [openFullFillPackageDialog, setOpenFullFillPackageDialog] = useState(false)

  const handleFullFillPackage = data => {
    handleClose()
    setOpenFullFillPackageDialog(true)
  }

  const [openProcessAsDeliveredDialog, setOpenProcessAsDeliveredDialog] = useState(false)

  const handleProcessAsDelivered = data => {
    handleClose()
    setOpenProcessAsDeliveredDialog(true)
  }

  const undoPackageFullfilled = async data => {
    const { tenantId, packageId } = data
    handleClose()
    try {
      const response = await writeData(undoSalesOrderPackageFulfillmentMutation(), {
        tenantId,
        packageId
      })
      const { undoSalesOrderPackageFulfillment } = response
      if (undoSalesOrderPackageFulfillment) {
        dispatch(setUpdatePackage(undoSalesOrderPackageFulfillment))
        reloadSalesOrderInStore(undoSalesOrderPackageFulfillment.salesOrderId)

        dispatch(createAlert({ message: 'Undo Fulfillment successfully!', type: 'success' }))
      } else {
        dispatch(createAlert({ message: 'Undo Fulfillment Failed!', type: 'error' }))
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    }
  }

  const MarkStatus = async data => {
    handleClose()

    const { tenantId, packageId, deliveredByUsername, deliveryDate } = data
    try {
      const response = await writeData(markSalesOrderPackageAsDeliveredMutation(), {
        tenantId,
        packageId,
        deliveredByUsername,
        deliveryDate
      })
      if (response.markSalesOrderPackageAsDelivered) {
        dispatch(setUpdatePackage(response.markSalesOrderPackageAsDelivered))
        reloadSalesOrderInStore(response.markSalesOrderPackageAsDelivered.salesOrderId)

        dispatch(createAlert({ message: 'Status changed successfully!', type: 'success' }))
      } else {
        dispatch(createAlert({ message: 'Package is not fulfilled!', type: 'error' }))
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    }
  }

  return (
    <React.Fragment>
      <PageHeader
        title={
          <Typography
            sx={{
              fontSize: { xs: '16px', md: '18px' },
              fontWeight: '500'
            }}
          >
            View Package - {selectedPackage?.packageNo}
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
                onClick={() => dispatch(setActionSalesOrder(null))}
                href={`/sales/packages/add-package`}
              >
                Add New
              </Button>
            )}
            {hasPermission(userProfile, EDIT_PACKAGE) && selectedPackage?.status === STATUS_DRAFT && (
              <IconButton
                component={Link}
                scroll={true}
                href={`/sales/packages/edit/${selectedPackage?.packageId}`}
                onClick={() => dispatch(setSelectedPackages(selectedPackage))}
              >
                <Icon icon='tabler:edit' />
              </IconButton>
            )}

            <IconButton color='default' component={Link} scroll={true} href='/sales/packages/'>
              <Close sx={{ color: theme => theme.palette.primary.main }} />
            </IconButton>
            <div>
              <IconButton
                aria-label='more'
                id='long-button'
                aria-controls={open ? 'long-menu' : undefined}
                aria-expanded={open ? 'true' : undefined}
                aria-haspopup='true'
                onClick={handleClick}
              >
                <Icon icon='iconamoon:menu-kebab-vertical-circle' width={23} height={23} />
              </IconButton>

              <CommonStyledMenu anchorEl={anchorEl} open={open} onClose={handleClose}>
                <MenuItem onClick={() => handleAssignToUser(selectedPackage)}>
                  <Icon icon={'clarity:assign-user-line'} />
                  Asssign to User
                </MenuItem>
                {selectedPackage?.status === STATUS_CONFIRMED && (
                  <MenuItem onClick={() => handleFullFillPackage(selectedPackage)}>
                    <Icon icon={'hugeicons:package-process'} />
                    Fulfill Package
                  </MenuItem>
                )}
                {selectedPackage?.status === STATUS_CONFIRMED && (
                  <MenuItem onClick={() => handleProcessAsDelivered(selectedPackage)}>
                    <Icon icon={'hugeicons:package-process'} />
                    Process as delivered
                  </MenuItem>
                )}

                {(selectedPackage?.status === STATUS_FULFILLED ||
                  selectedPackage?.status === STATUS_PARTLY_FULFILLED ||
                  selectedPackage?.status === STATUS_DELIVERED) && (
                  <MenuItem onClick={() => undoPackageFullfilled(selectedPackage)}>
                    <Icon icon={'iconamoon:do-undo-light'} />
                    Undo fulfilled
                  </MenuItem>
                )}
                {selectedPackage?.status === STATUS_FULFILLED && (
                  <MenuItem onClick={() => MarkStatus(selectedPackage)}>
                    <Icon icon={'teenyicons:file-tick-outline'} />
                    Mark as delivered
                  </MenuItem>
                )}
                <MenuItem
                  onClick={() => {
                    setAnchorEl(null)
                    handlePrint()
                  }}
                >
                  <Icon icon={'ion:print-outline'} fontSize={24} />
                  Print Package
                </MenuItem>
              </CommonStyledMenu>
            </div>
            <div style={{ position: 'fixed', top: '100%', left: '100%', transform: 'translate(100%, 100%)' }}>
              <PrintPackage ref={componentRef} data={packagesObject} />
            </div>
          </Box>
        }
      />
      <PageWrapper>
        {loading ? (
          <LinearProgress />
        ) : (
          <Grid container spacing={{ xs: 5, xl: 10 }}>
            <Grid item xs={12} md={12} lg={7.5} xl={7.5}>
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
                            {selectedPackage?.deliveryDate && (
                              <TableRow>
                                <TableCell sx={{ width: '50%' }}>
                                  <Typography className='data-name'>Delivery Date</Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography
                                    className='data-value'
                                    sx={{ fontSize: '12px', fontWeight: 400, lineHeight: '22px' }}
                                  >
                                    {DateFunction(selectedPackage?.deliveryDate)}
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            )}
                            <TableRow>
                              <TableCell sx={{ width: '50%' }}>
                                <Typography className='data-name'>Status </Typography>
                              </TableCell>
                              <TableCell>{rowStatusChip(selectedPackage?.status)}</TableCell>
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
                                  {selectedPackage?.expectedPackingDate
                                    ? DateFunction(selectedPackage?.expectedPackingDate)
                                    : '-'}
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
                          Customer
                        </Typography>
                        <CommonViewTable>
                          <TableBody>
                            <TableRow>
                              <TableCell>
                                <StyledButton color='primary' onClick={handleCustomerDialoge}>
                                  {' '}
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
                      </Grid>
                      <Grid item xs={0} sm={0} md={1.5} xl={3.6} sx={{ display: { xs: 'none', md: 'block' } }}></Grid>
                      <Grid item xs={12} sm={5} md={4} lg={4} xl={3.7}>
                        {' '}
                        <Typography
                          sx={{
                            fontSize: '13px',
                            fontWeight: 600,
                            lineHeight: '24px'
                          }}
                        >
                          Delivery Address
                        </Typography>
                        <CommonViewTable>
                          <TableBody>
                            <ShowAddress data={selectedPackage?.deliveryAddress} />
                          </TableBody>
                        </CommonViewTable>
                      </Grid>{' '}
                    </Grid>
                  </Grid>
                  <Grid item xs={12}>
                    <ViewItemsTableWrapper>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ width: '3%' }}>#</TableCell>
                          <TableCell sx={{ width: '34%' }}>Item</TableCell>
                          <TableCell sx={{ width: '12%' }}>Ordered Qty</TableCell>
                          {isDesktop && mergedArray?.some(item => item?.warehouseId && item?.warehouseId !== '') && (
                            <TableCell sx={{ width: '12%' }}>Warehouse</TableCell>
                          )}
                          {isDesktop ? <TableCell sx={{ width: '12%' }}>Packed Qty</TableCell> : null}
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
                                  {orderItem?.qty?.toFixed(2)} {orderItem?.packedQtyUom}
                                </TableCell>
                                {isDesktop &&
                                  mergedArray?.some(item => item?.warehouseId && item?.warehouseId !== '') && (
                                    <TableCell>{warehouse?.name}</TableCell>
                                  )}
                                <TableCell>{orderItem?.packedQty?.toFixed(2)}</TableCell>
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
                          {selectedPackage?.customerNotes ? (
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
                                    {selectedPackage?.customerNotes}
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
                                <Typography sx={{ fontSize: 'inherit', fontWeight: 400 }}>
                                  <NumberFormat value={getTotalQty()} />
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
                                  Total Packed Qty:
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography sx={{ fontSize: 'inherit', fontWeight: 600 }}>
                                  <NumberFormat value={getTotalPackedQty()} />
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
            <Grid item xs={12} md={12} lg={4.5} xl={4.5}>
              <PackageWidget selectedPackage={selectedPackage} />
            </Grid>
          </Grid>
        )}
      </PageWrapper>

      {assignToUserPopup && (
        <AssigntoUserPopup tenantId={tenantId} open={assignToUserPopup} setOpen={setAssignToUserPopup} />
      )}

      {openFullFillPackageDialog && (
        <FullfillPackagePopup
          tenantId={tenantId}
          open={openFullFillPackageDialog}
          setOpen={setOpenFullFillPackageDialog}
        />
      )}

      {openProcessAsDeliveredDialog && (
        <ProcessAsDelivered
          tenantId={tenantId}
          open={openProcessAsDeliveredDialog}
          setOpen={setOpenProcessAsDeliveredDialog}
        />
      )}
      {/* </Drawer> */}
    </React.Fragment>
  )
}
