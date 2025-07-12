import Link from 'next/link'
import React, { useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Box,
  Button,
  IconButton,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  Typography,
  Grid,
  Card,
  TableContainer,
  MenuItem,
  LinearProgress
} from '@mui/material'
import { Close } from '@mui/icons-material'
import Icon from 'src/@core/components/icon'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import PageHeader from 'src/@core/components/page-header'
import PageWrapper from 'src/@core/layouts/PageWrapper'
import {
  DateFunction,
  findObjectByCurrencyId,
  hasPermission,
  NumberFormat,
  rowStatusChip,
  toTitleCase
} from 'src/common-functions/utils/UtilityFunctions'
import { CommonAddress, CommonViewTable, ShowAddress } from 'src/common-components/CommonPdfDesign'
import {
  CREATE_PURCHASE_SHIPMENT,
  EDIT_PURCHASE_SHIPMENT,
  STATUS_CONFIRMED
} from 'src/common-functions/utils/Constants'
import CommonStyledMenu from 'src/common-components/CommonStyledMenu'
import MovetoNextStagePurchaseShipment from './MovetoNextStagePurchaseShipment'
import { setUpdatePurchaseShipment, setLoading, setSelectedPurchaseShipment } from 'src/store/apps/purchase-shipments'
import { writeData } from 'src/common-functions/GraphqlOperations'
import { undoPurchaseOrderShipmentStageQuery } from 'src/@core/components/graphql/purchase-order-shipment-queries'
import { createAlert } from 'src/store/apps/alerts'
import ShipmentRelatedRecords from './ShipmentRelatedRecords'
import usePurchaseOrders from 'src/hooks/getData/usePurchaseOrders'
import usePurchasePackages from 'src/hooks/getData/usePurchasePackages'
import CommonPoPackagePopUp from 'src/common-components/CommonPoPackagePopUp'
import StyledButton from 'src/common-components/StyledMuiButton'
import CommonPOPopup from 'src/common-components/CommonPOPopup'
import CommonVendorPopup from 'src/common-components/CommonVendorPopup'

export default function ViewShipment({ tenantId, shipmentData, loading }) {
  const dispatch = useDispatch()
  const { reloadPurchaseOrderInStore } = usePurchaseOrders(tenantId)
  const { reloadPurchasePackageInStore } = usePurchasePackages(tenantId)
  const userProfile = useSelector(state => state.userProfile)

  const selectedPurchaseShipment = useSelector(state => state.purchaseShipments?.selectedPurchaseShipment) || {}
  const { currencies = [], vendors = [] } = shipmentData

  const [anchorEl, setAnchorEl] = useState(null)

  const open = Boolean(anchorEl)

  const handleClick = event => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }

  const vendor = useMemo(
    () => vendors?.find(item => item?.vendorId === selectedPurchaseShipment?.vendorId) || {},
    [vendors, selectedPurchaseShipment?.vendorId]
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

  const [openMovetoNextStageDialog, setOpenMovetoNextStageDialog] = useState(false)

  const MoveToNextStage = () => {
    setOpenMovetoNextStageDialog(true)
    setAnchorEl(null)
  }

  const UndoStage = async data => {
    setAnchorEl(null)
    const { tenantId, shipmentId } = data
    const stageName = data?.currentStage
    try {
      dispatch(setLoading(false))
      const response = await writeData(undoPurchaseOrderShipmentStageQuery(), { tenantId, shipmentId, stageName })
      const result = response?.undoPurchaseOrderShipmentStage

      if (result) {
        dispatch(setSelectedPurchaseShipment(result))
        dispatch(setUpdatePurchaseShipment(result))
        for (const item of result.packages) {
          await reloadPurchaseOrderInStore(item.purchaseOrderId)
          await reloadPurchasePackageInStore(item.packageId)
        }
        dispatch(createAlert({ message: 'Moved Shipment to Previous Stage successfully!', type: 'success' }))
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
      <React.Fragment>
        <PageHeader
          title={
            <Typography
              sx={{
                fontSize: { xs: '16px', md: '18px' },
                fontWeight: '500'
              }}
            >
              View Purchase Shipment - {selectedPurchaseShipment?.shipmentNoPrefix}{' '}
              {selectedPurchaseShipment?.shipmentNo}
            </Typography>
          }
          button={
            <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
              {hasPermission(userProfile, CREATE_PURCHASE_SHIPMENT) && (
                <Button
                  variant='contained'
                  color='primary'
                  sx={{ display: { xs: 'none', sm: 'flex' } }}
                  startIcon={<AddOutlinedIcon />}
                  component={Link}
                  scroll={true}
                  href={`/purchases/shipments/add-new`}
                >
                  Add New
                </Button>
              )}

              {hasPermission(userProfile, EDIT_PURCHASE_SHIPMENT) &&
                selectedPurchaseShipment?.status !== STATUS_CONFIRMED && (
                  <IconButton
                    component={Link}
                    scroll={true}
                    href={`/purchases/shipments/edit/${selectedPurchaseShipment?.shipmentId}`}
                  >
                    <Icon icon='tabler:edit' />
                  </IconButton>
                )}

              <IconButton color='default' component={Link} scroll={true} href='/purchases/shipments/'>
                <Close sx={{ color: theme => theme.palette.primary.main }} />
              </IconButton>
              <IconButton
                aria-label='more'
                id='long-button'
                aria-haspopup='true'
                onClick={event => {
                  handleClick(event)
                }}
              >
                <Icon icon='iconamoon:menu-kebab-vertical-circle-light' width={25} height={25} />
              </IconButton>
              <CommonStyledMenu anchorEl={anchorEl} open={open} onClose={handleClose}>
                {selectedPurchaseShipment?.moveToNextStage && (
                  <MenuItem onClick={() => MoveToNextStage(selectedPurchaseShipment)}>
                    <Icon icon='solar:forward-outline' />
                    Move to {toTitleCase(selectedPurchaseShipment?.nextStage)}
                  </MenuItem>
                )}
                {selectedPurchaseShipment?.undoCurrentStage && (
                  <MenuItem onClick={() => UndoStage(selectedPurchaseShipment)}>
                    <Icon icon='iconamoon:do-undo-light' />
                    Undo Stage {toTitleCase(selectedPurchaseShipment?.currentStage)}
                  </MenuItem>
                )}
              </CommonStyledMenu>
            </Box>
          }
        />
        <PageWrapper>
          {loading ? (
            <LinearProgress />
          ) : (
            <Grid container spacing={{ xs: 5, xl: 10 }}>
              <Grid item xs={12} md={12} lg={6} xl={6}>
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
                                #{selectedPurchaseShipment?.shipmentNoPrefix}
                                {selectedPurchaseShipment?.shipmentNo}
                              </Typography>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <Typography className='data-name'>
                                Status:
                                {rowStatusChip(selectedPurchaseShipment?.status)}
                              </Typography>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <Typography className='data-name'>
                                Shipment Date:
                                {DateFunction(selectedPurchaseShipment?.shipmentDate)}
                              </Typography>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <Typography className='data-name'>
                                Payment Status:
                                {rowStatusChip(selectedPurchaseShipment?.paymentStatus)}
                              </Typography>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <Typography className='data-name'>
                                Delivery Status:
                                {rowStatusChip(selectedPurchaseShipment?.deliveryStatus)}
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
                          <ShowAddress data={selectedPurchaseShipment?.deliveryAddress} />
                        </TableBody>
                      </CommonViewTable>
                    </Grid>
                    <Grid item xs={12} sm={12}>
                      <Typography sx={{ fontSize: '14px', fontWeight: 500, lineHeight: '22px', mb: 2 }}>
                        Packages
                      </Typography>
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
                            {selectedPurchaseShipment?.packages?.map((item, index) => {
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
                            {selectedPurchaseShipment?.notes ? (
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
                                      {selectedPurchaseShipment?.notes}
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
                              {selectedPurchaseShipment?.expenses
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

                              {selectedPurchaseShipment?.taxes?.map((item, i) => {
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
                              {selectedPurchaseShipment?.expenses
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
                              {selectedPurchaseShipment?.expenses
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
              </Grid>
              <Grid item xs={12} md={12} lg={6} xl={6}>
                <ShipmentRelatedRecords shipment={selectedPurchaseShipment} />
              </Grid>
            </Grid>
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

          {openMovetoNextStageDialog && (
            <MovetoNextStagePurchaseShipment
              tenantId={tenantId}
              selectedShipment={selectedPurchaseShipment}
              open={openMovetoNextStageDialog}
              setOpen={setOpenMovetoNextStageDialog}
            />
          )}
        </PageWrapper>
      </React.Fragment>
    </div>
  )
}
