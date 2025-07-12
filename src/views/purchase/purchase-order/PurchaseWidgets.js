import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import {
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Grid,
  IconButton,
  LinearProgress,
  MenuItem,
  Typography
} from '@mui/material'

import { TabList, TabPanel } from '@mui/lab'
import TabContext from '@mui/lab/TabContext'

import { useTheme } from '@mui/material/styles'

import Icon from 'src/@core/components/icon'

import { AddOutlined, MoreVert } from '@mui/icons-material'
import {
  getPurchaseOrderPackagesByPurchaseOrderQuery,
  undoPurchaseOrderPackageStageQuery
} from 'src/@core/components/graphql/purchase-order-packages-queries'
import { GetPurchaseOrderPayablesRelatedToOrderQuery } from 'src/@core/components/graphql/purchase-order-queries'
import {
  getPurchaseOrderShipmentsByPurchaseOrderIdQuery,
  undoPurchaseOrderShipmentStageQuery
} from 'src/@core/components/graphql/purchase-order-shipment-queries'
import {
  getPurchaseOrderPaymentsData,
  undoPaymentClearingForPurchaseOrderPayableQuery
} from 'src/@core/components/graphql/purchases-payment-queries'
import CommonPoPackagePopUp from 'src/common-components/CommonPoPackagePopUp'
import CommonPoPaymentsPopUp from 'src/common-components/CommonPoPaymentsPopUp'
import CommonStyledMenu from 'src/common-components/CommonStyledMenu'
import CommonVendorPopup from 'src/common-components/CommonVendorPopup'
import CustomNoRowsOverlay from 'src/common-components/CustomNoRowsOverlay'
import MobileDataGrid from 'src/common-components/MobileDataGrid'
import StyledButton from 'src/common-components/StyledMuiButton'
import { fetchData, writeData } from 'src/common-functions/GraphqlOperations'
import {
  DELETE_PURCHASE_PACKAGE,
  DELETE_PURCHASE_PAYMENT,
  DELETE_PURCHASE_SHIPMENT,
  EDIT_PURCHASE_PACKAGE,
  EDIT_PURCHASE_PAYMENT,
  EDIT_PURCHASE_SHIPMENT,
  MANAGE_PURCHASE_PAYMENT,
  PURCHASE_ORDER_PDF,
  STATUS_CLEARED,
  STATUS_DRAFT,
  STATUS_PENDING
} from 'src/common-functions/utils/Constants'
import {
  dataTextStyles,
  dataTitleStyles,
  DateFunction,
  hasPermission,
  NumberFormat,
  renderTabs,
  rowStatusChip,
  toTitleCase
} from 'src/common-functions/utils/UtilityFunctions'
import useCurrencies from 'src/hooks/getData/useCurrencies'
import usePurchaseOrders from 'src/hooks/getData/usePurchaseOrders'
import usePurchasePackages from 'src/hooks/getData/usePurchasePackages'
import useTaxAuthorities from 'src/hooks/getData/useTaxAuthorities'
import useVendors from 'src/hooks/getData/useVendors'
import { createAlert } from 'src/store/apps/alerts'
import { setSelectedPurchasePackage, setUpdatePurchasePackage } from 'src/store/apps/purchase-packages'
import { setSelectedPurchaseShipment, setUpdatePurchaseShipment } from 'src/store/apps/purchase-shipments'
import { setActionPayment } from 'src/store/apps/purchases-payment'
import ClearPOPayment from '../Payment/ClearPOPayment'
import DeletePurchasePayments from '../Payment/DeletePayment'
import EditPurchasePaymentDrawer from '../Payment/EditPurchasePaymentDrawer'
import NewPurchasePaymentDrawer from '../Payment/NewPurchasePaymentDrawer'
import DeletePurchasePackage from '../purchase-package/DeletePurchasePackage'
import EditPurchasePackageDrawer from '../purchase-package/EditPurchasePackageDrawer'
import MovetoNextStagePurchasePackage from '../purchase-package/MovetoNextStagePurchasePackage'
import NewPurchasePackageDrawer from '../purchase-package/NewPurchasePackageDrawer'
import DeleteShipment from '../Shipment/DeleteShipment'
import EditShipmentDrawer from '../Shipment/EditShipmentDrawer'
import MovetoNextStagePurchaseShipment from '../Shipment/MovetoNextStagePurchaseShipment'
import NewShipmentDrawer from '../Shipment/NewShipmentDrawer'
import ShipmentPopup from '../Shipment/ShipmentPopup'
import AttachmentTab from './AttachmentTab'

const tabData = [
  {
    type: 'packages',
    avatarIcon: 'oui:package'
  },
  {
    type: 'shipments',
    avatarIcon: 'streamline:shipment-check'
  },
  {
    type: 'payments',
    avatarIcon: 'fluent:payment-20-regular'
  },
  {
    type: 'payables',
    avatarIcon: 'material-symbols-light:table-outline'
  },

  {
    type: 'attachments',
    avatarIcon: 'carbon:document-attachment'
  }
]

const PurchaseWidgets = ({ order }) => {
  const theme = useTheme()
  const dispatch = useDispatch()
  const tenantId = useSelector(state => state.tenants?.selectedTenant?.tenantId)
  const userProfile = useSelector(state => state.userProfile)
  const { reloadPurchaseOrderInStore } = usePurchaseOrders(tenantId)
  const { reloadPurchasePackageInStore } = usePurchasePackages(tenantId)
  const reloadPurchasePackage = useSelector(state => state.purchasePackage?.reloadPurchasePackage)

  const [value, setValue] = useState('packages')
  const [purchasePackageDialogState, setPurchasePackageDialogState] = useState({
    open: false,
    selectedPackageId: null
  })

  const handleChange = (event, newValue) => {
    setValue(newValue)
  }
  const [openNewPackageDrawer, setOpenNewPackageDrawer] = useState(false)
  const [openEditPackageDrawer, setOpenEditPackageDrawer] = useState(false)

  const [openNewShipmentDrawer, setOpenNewShipmentDrawer] = useState(false)
  const [openNewPaymentDrawer, setOpenNewPaymentDrawer] = useState(false)
  const [openEditPaymentDrawer, setOpenEditPaymentDrawer] = useState(false)

  const { currencies } = useCurrencies()
  const { vendors } = useVendors(tenantId)
  const { taxAuthorities } = useTaxAuthorities(tenantId)
  const localCurrency = useSelector(state => state?.currencies?.selectedCurrency) || {}
  const [loading, setLoading] = useState(true)

  const [anchorElMap, setAnchorElMap] = useState({})

  const handleClick = (event, row) => {
    const updatedAnchorElMap = { ...anchorElMap }
    updatedAnchorElMap[row.purchaseOrderPayableId] = event.currentTarget
    setAnchorElMap(updatedAnchorElMap)
  }
  const handleClose = row => {
    const updatedAnchorElMap = { ...anchorElMap }
    updatedAnchorElMap[row.purchaseOrderPayableId] = null
    setAnchorElMap(updatedAnchorElMap)
  }

  const [shipments, setShipments] = useState([])
  const [reloadShipments, setReloadShipments] = useState(false)

  const getPurchaseShipmentsData = async () => {
    setLoading(true)
    const purchaseOrderId = order?.orderId
    try {
      const response = await fetchData(getPurchaseOrderShipmentsByPurchaseOrderIdQuery(tenantId, purchaseOrderId))
      const { getPurchaseOrderShipmentsByPurchaseOrderId = {} } = response || {}
      setShipments(getPurchaseOrderShipmentsByPurchaseOrderId)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const [shipmentPopupState, setShipmentPopupState] = useState({
    open: false,
    selectedShipmentId: null
  })

  const [shipmentAnchorElMap, setShipmentAnchorElMap] = useState({})

  const handleShipmentMenuClick = (event, row) => {
    setSelectedShipment(row)
    const updatedAnchorElMap = { ...shipmentAnchorElMap }
    updatedAnchorElMap[row.shipmentId] = event.currentTarget
    setShipmentAnchorElMap(updatedAnchorElMap)
  }

  const handleShipmentMenuClose = row => {
    const updatedAnchorElMap = { ...shipmentAnchorElMap }
    updatedAnchorElMap[row.shipmentId] = null
    setShipmentAnchorElMap(updatedAnchorElMap)
  }

  const [selectedShipment, setSelectedShipment] = useState({})

  const [openMovetoNextStageShipmentDialog, setOpenMovetoNextStageShipmentDialog] = useState(false)

  const MoveShipmentToNextStage = row => {
    setOpenMovetoNextStageShipmentDialog(true)
    setSelectedShipment(row)

    const updatedAnchorElMap = { ...anchorElMap }
    updatedAnchorElMap[row.shipmentId] = null
    setShipmentAnchorElMap(updatedAnchorElMap)
  }

  const UndoShipmentStage = async data => {
    const updatedAnchorElMap = { ...anchorElMap }
    updatedAnchorElMap[data.shipmentId] = null
    setShipmentAnchorElMap(updatedAnchorElMap)
    const { tenantId, shipmentId } = data
    const stageName = data?.currentStage
    try {
      const response = await writeData(undoPurchaseOrderShipmentStageQuery(), { tenantId, shipmentId, stageName })
      if (response.undoPurchaseOrderShipmentStage) {
        dispatch(setUpdatePurchaseShipment(response.undoPurchaseOrderShipmentStage))
        setReloadShipments(!reloadShipments)
        for (const item of response.undoPurchaseOrderShipmentStage.packages) {
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

  const [selectedRow, setSelectedRow] = useState('')

  const [openDialog, setOpenDialog] = useState(false)

  const handleShipmentClose = row => {
    const updatedAnchorElMap = { ...anchorElMap }
    updatedAnchorElMap[row.shipmentId] = null
    setAnchorElMap(updatedAnchorElMap)
  }
  const [vendorDialogState, setVendorDialogState] = useState({
    open: false,
    selectedVendorId: null
  })
  const [openEditShipmentDrawer, setOpenEditShipmentDrawer] = useState(false)

  const handleEditPurchaseShipment = async data => {
    const updatedAnchorElMap = { ...anchorElMap }
    updatedAnchorElMap[data.shipmentId] = null
    setShipmentAnchorElMap(updatedAnchorElMap)
    setOpenEditShipmentDrawer(true)
    dispatch(setSelectedPurchaseShipment(data))
  }
  const handleDelete = row => {
    setSelectedRow(row)
    handleShipmentClose(row)
    setOpenDialog(true)
  }

  const shipmentColumns = [
    {
      field: 'shipmentNo',
      headerName: '',
      flex: 1,
      sortable: false,
      renderCell: ({ row }) => {
        const vendor = vendors?.find(item => item?.vendorId === row?.vendorId) || {}
        const editPermission = hasPermission(userProfile, EDIT_PURCHASE_SHIPMENT)
        const deletePermission = hasPermission(userProfile, DELETE_PURCHASE_SHIPMENT)

        return (
          <Box sx={{ width: '100%', p: 2 }}>
            <Grid container spacing={3} sx={{ alignItems: 'center' }}>
              <Grid item xs={11}>
                <Grid container spacing={3} sx={{ alignItems: 'center' }}>
                  <Grid item xs={12} sm={4} lg={4} xl={3.5}>
                    <StyledButton
                      color='primary'
                      onClick={() => setShipmentPopupState({ open: true, selectedShipmentId: row?.shipmentId })}
                    >
                      #{row.shipmentNoPrefix || ''}
                      {row.shipmentNo}
                    </StyledButton>
                    <Typography sx={{ ...dataTitleStyles, color: '#000' }}>
                      <Icon
                        icon='wi:time-4'
                        width='20px'
                        style={{ verticalAlign: 'middle', color: '#696969', marginRight: '5px' }}
                      />
                      {DateFunction(row?.shipmentDate)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4} lg={4} xl={3.5}>
                    <StyledButton
                      color='primary'
                      onClick={() => {
                        setVendorDialogState({ open: true, selectedVendorId: row?.vendorId })
                      }}
                    >
                      {vendor?.displayName}
                    </StyledButton>
                    <Typography sx={dataTitleStyles}>Vendor</Typography>
                  </Grid>
                  <Grid item xs={4} sm={2} lg={2} xl={2.5}>
                    {rowStatusChip(row?.status)}
                    <Typography sx={dataTitleStyles}>Status</Typography>
                  </Grid>
                  <Grid item xs={4} sm={2} lg={2} xl={2.5}>
                    {rowStatusChip(row?.paymentStatus) || '-'}
                    <Typography sx={dataTitleStyles}>Payment Status</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography sx={{ ...dataTitleStyles, color: '#818181' }}>{row?.notes}</Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={1}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <IconButton
                    onClick={event => {
                      event.stopPropagation()
                      handleShipmentMenuClick(event, row)
                    }}
                  >
                    <Icon icon='iconamoon:menu-kebab-vertical-circle-light' width={27} height={27} />
                  </IconButton>
                  <CommonStyledMenu
                    anchorEl={shipmentAnchorElMap[row.shipmentId]}
                    open={Boolean(shipmentAnchorElMap[row.shipmentId])}
                    onClose={() => handleShipmentMenuClose(row)}
                  >
                    {editPermission && (
                      <MenuItem
                        onClick={() => {
                          handleEditPurchaseShipment(row)
                        }}
                      >
                        <Icon icon='tabler:edit' /> Edit
                      </MenuItem>
                    )}
                    {row?.moveToNextStage && (
                      <MenuItem onClick={() => MoveShipmentToNextStage(row)}>
                        <Icon icon='solar:forward-outline' />
                        Move to {toTitleCase(row?.nextStage)}
                      </MenuItem>
                    )}
                    {row?.undoCurrentStage && (
                      <MenuItem onClick={() => UndoShipmentStage(row)}>
                        <Icon icon='iconamoon:do-undo-light' />
                        Undo Stage {toTitleCase(row?.currentStage)}
                      </MenuItem>
                    )}
                    {deletePermission && row?.status === STATUS_DRAFT && (
                      <MenuItem
                        onClick={event => {
                          event.stopPropagation()
                          handleDelete(row)
                        }}
                        sx={{
                          color: theme => theme?.palette?.error?.main,
                          '&:hover': {
                            color: theme => theme?.palette?.error?.main + ' !important',
                            backgroundColor: theme =>
                              alpha(theme.palette.error.main, theme.palette.action.selectedOpacity) + ' !important'
                          }
                        }}
                      >
                        <Icon icon='mingcute:delete-2-line' color='inherit' />
                        Delete
                      </MenuItem>
                    )}
                  </CommonStyledMenu>
                </Box>
              </Grid>
            </Grid>
          </Box>
        )
      }
    }
  ]

  const [payables, setPayables] = useState([])

  const getPurchasePayablesData = async () => {
    setLoading(true)
    const orderId = order?.orderId
    try {
      const response = await fetchData(GetPurchaseOrderPayablesRelatedToOrderQuery(tenantId, orderId))
      const { getPurchaseOrderPayablesRelatedToOrder = {} } = response || {}
      setPayables(getPurchaseOrderPayablesRelatedToOrder)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const [packages, setPackages] = useState([])
  const [reloadPackages, setReloadPackages] = useState(false)

  const getPurchasePackagesData = async () => {
    setLoading(true)
    const purchaseOrderId = order?.orderId
    try {
      const response = await fetchData(getPurchaseOrderPackagesByPurchaseOrderQuery(tenantId, purchaseOrderId))
      const { getPurchaseOrderPackagesByPurchaseOrder = {} } = response || {}
      setPackages(getPurchaseOrderPackagesByPurchaseOrder)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }
  const [packageAnchorMap, setPackageAnchorMap] = useState({})

  const handlePackageMenuClick = (event, row) => {
    // dispatch(setSelectedPurchasePackage(row))
    const updatedAnchorElMap = { ...anchorElMap }
    updatedAnchorElMap[row?.packageId] = event.currentTarget
    setPackageAnchorMap(updatedAnchorElMap)
  }

  const handlePackageMenuClose = row => {
    const updatedAnchorElMap = { ...anchorElMap }
    updatedAnchorElMap[row?.packageId] = null
    setPackageAnchorMap(updatedAnchorElMap)
  }

  const [openMovetoNextStageDialog, setOpenMovetoNextStageDialog] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState({})

  const MoveToNextStage = row => {
    setOpenMovetoNextStageDialog(true)
    setSelectedPackage(row)
    const updatedAnchorElMap = { ...packageAnchorMap }
    updatedAnchorElMap[row.packageId] = null
    setPackageAnchorMap(updatedAnchorElMap)
  }

  const UndoStage = async data => {
    const updatedAnchorElMap = { ...packageAnchorMap }
    updatedAnchorElMap[data.packageId] = null
    setPackageAnchorMap(updatedAnchorElMap)
    const { tenantId, packageId } = data
    const stageName = data?.currentStage
    try {
      setLoading(false)
      const response = await writeData(undoPurchaseOrderPackageStageQuery(), { tenantId, packageId, stageName })
      if (response.undoPurchaseOrderPackageStage) {
        dispatch(setUpdatePurchasePackage(response.undoPurchaseOrderPackageStage))
        // dispatch(setSelectedPurchasePackage(response.undoPurchaseOrderPackageStage))
        await reloadPurchaseOrderInStore(response?.undoPurchaseOrderPackageStage?.purchaseOrderId)

        setReloadPackages(!reloadPackages)
        dispatch(createAlert({ message: 'Moved Package to Previous Stage successfully!', type: 'success' }))
      } else {
        const errorMessage = response.errors[0] ? response.errors[0].message : 'Failed to move to previous stage!'
        dispatch(createAlert({ message: errorMessage, type: 'error' }))
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    }
  }

  const handleEditPurchasePackage = async data => {
    const updatedAnchorElMap = { ...packageAnchorMap }
    updatedAnchorElMap[data.packageId] = null
    setPackageAnchorMap(updatedAnchorElMap)
    setOpenEditPackageDrawer(true)
    dispatch(setSelectedPurchasePackage(data))
  }

  const [openPackageDeleteDialog, setOpenPackageDeleteDialog] = useState(false)

  const handlePackageDelete = row => {
    setSelectedPackage(row)
    handlePackageMenuClose(row)
    setOpenPackageDeleteDialog(true)
  }

  const packagesColumns = [
    {
      field: 'packageNo',
      headerName: '',
      flex: 1,
      sortable: false,
      renderCell: ({ row }) => {
        const currency = currencies?.find(item => item?.currencyId === row?.currency)
        const editPermission = hasPermission(userProfile, EDIT_PURCHASE_PACKAGE)
        const deletePermission = hasPermission(userProfile, DELETE_PURCHASE_PACKAGE)

        return (
          <Box sx={{ width: '100%', p: 2 }}>
            <Grid container spacing={3} sx={{ alignItems: 'center' }}>
              <Grid item xs={11}>
                <Grid container spacing={3} sx={{ alignItems: 'center' }}>
                  <Grid item xs={12} sm={4} md={4} lg={4}>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '5px', alignItems: 'center' }}>
                      <StyledButton
                        color='primary'
                        onClick={() =>
                          setPurchasePackageDialogState({
                            open: true,
                            selectedPackageId: row?.packageId
                          })
                        }
                      >
                        #{row?.packageNoPrefix && row?.packageNoPrefix}
                        {row?.packageNo}
                      </StyledButton>

                      <Typography sx={{ ...dataTitleStyles, color: '#000' }}>
                        <Icon
                          icon='wi:time-4'
                          width='20px'
                          style={{ verticalAlign: 'middle', color: '#696969', marginRight: '5px' }}
                        />
                        {DateFunction(row?.packageDate) || '-'}
                      </Typography>
                    </Box>

                    <Typography sx={{ ...dataTitleStyles, color: '#818181' }}>{row?.notes}</Typography>
                  </Grid>
                  <Grid item xs={8} sm={5} md={5} lg={5}>
                    <Box sx={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                      <Typography sx={dataTitleStyles}>Total Package Qty</Typography>{' '}
                      <Typography sx={dataTextStyles}>{row?.totalPackageQty || '-'}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                      <Typography sx={dataTitleStyles}>Total Package Value</Typography>
                      {row?.totalPackageValue ? (
                        <Typography sx={dataTextStyles}>
                          <NumberFormat value={row?.totalPackageValue} currency={currency} />{' '}
                        </Typography>
                      ) : (
                        '-'
                      )}
                    </Box>
                  </Grid>
                  <Grid item xs={4} sm={3} md={3} lg={3}>
                    {rowStatusChip(row?.status) || '-'}
                    <Typography sx={dataTitleStyles}>Status</Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={1}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <>
                    <IconButton onClick={event => handlePackageMenuClick(event, row)}>
                      <Icon icon='iconamoon:menu-kebab-vertical-circle-light' width={27} height={27} />
                    </IconButton>
                    <CommonStyledMenu
                      anchorEl={packageAnchorMap[row.packageId]}
                      open={Boolean(packageAnchorMap[row.packageId])}
                      onClose={() => handlePackageMenuClose(row)}
                    >
                      {editPermission && (
                        <MenuItem
                          onClick={() => {
                            handleEditPurchasePackage(row)
                          }}
                        >
                          <Icon icon='tabler:edit' /> Edit
                        </MenuItem>
                      )}
                      {row?.undoCurrentStage && (
                        <MenuItem onClick={() => UndoStage(row)}>
                          <Icon icon='iconamoon:do-undo-light' />
                          Undo Stage {toTitleCase(row?.currentStage)}
                        </MenuItem>
                      )}

                      {row?.moveToNextStage && (
                        <MenuItem onClick={() => MoveToNextStage(row)}>
                          <Icon icon='solar:forward-outline' />
                          Move to {toTitleCase(row?.nextStage)}
                        </MenuItem>
                      )}
                      {deletePermission && row?.status === STATUS_DRAFT && (
                        <MenuItem
                          onClick={event => {
                            event.stopPropagation()
                            handlePackageDelete(row)
                          }}
                          sx={{
                            color: theme => theme?.palette?.error?.main,
                            '&:hover': {
                              color: theme => theme?.palette?.error?.main + ' !important',
                              backgroundColor: theme =>
                                alpha(theme.palette.error.main, theme.palette.action.selectedOpacity) + ' !important'
                            }
                          }}
                        >
                          <Icon icon='mingcute:delete-2-line' color='inherit' />
                          Delete
                        </MenuItem>
                      )}
                    </CommonStyledMenu>
                  </>
                </Box>
              </Grid>
            </Grid>
          </Box>
        )
      }
    }
  ]

  const getPurchaseOrderPayments = async () => {
    setLoading(true)
    const orderId = order?.orderId
    try {
      const response = await fetchData(getPurchaseOrderPaymentsData(tenantId, orderId))
      const { getPurchaseOrderPaymentsForPurchaseOrder = {} } = response || {}
      setPurchasePayments(getPurchaseOrderPaymentsForPurchaseOrder)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const UndoStatus = async data => {
    const updatedAnchorElMap = { ...anchorElMap }
    updatedAnchorElMap[data.purchaseOrderPayableId] = null
    setAnchorElMap(updatedAnchorElMap)
    const { purchaseOrderPayableId } = data
    try {
      const response = await writeData(undoPaymentClearingForPurchaseOrderPayableQuery(), {
        tenantId,
        purchaseOrderPayableId
      })
      if (response && response.undoPaymentClearingForPurchaseOrderPayable) {
        getPurchasePayablesData()
        dispatch(createAlert({ message: 'Status changed successfully!', type: 'success' }))
      } else {
        dispatch(createAlert({ message: 'Failed to change the status!', type: 'error' }))
      }
    } catch (error) {
      console.error(error)
    }
  }

  const [purchasePayments, setPurchasePayments] = useState([])
  const [reloadPayment, setReloadPayment] = useState(false)

  const [dialogState, setDialogState] = useState({
    open: false,
    selectedPaymentId: null
  })

  const [anchorElPaymentMap, setAnchorPaymentMap] = useState({})

  const handlePaymentMenuClick = (event, row) => {
    const updatedAnchorElMap = { ...anchorElPaymentMap }
    updatedAnchorElMap[row.paymentId] = event.currentTarget
    setAnchorPaymentMap(updatedAnchorElMap)
  }
  const handlePaymentMenuClose = row => {
    const updatedAnchorElMap = { ...anchorElPaymentMap }
    updatedAnchorElMap[row.paymentId] = null
    setAnchorPaymentMap(updatedAnchorElMap)
  }

  const handleEditPurchasePayment = async data => {
    const updatedAnchorElMap = { ...anchorElMap }
    updatedAnchorElMap[data.paymentId] = null
    setAnchorPaymentMap(updatedAnchorElMap)
    dispatch(setActionPayment(data))
    setOpenEditPaymentDrawer(true)
  }

  const [openPaymentClearDialog, setOpenPaymentClearDialog] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState({})
  const [openDeletePaymentDialog, setOpenDeletePaymentDialog] = useState(false)

  const clearPayment = row => {
    setSelectedPayment(row)
    setOpenPaymentClearDialog(true)
    handlePaymentMenuClose(row)
  }
  const handleDeletePayment = row => {
    setSelectedPayment(row)
    handlePaymentMenuClose(row)
    setOpenDeletePaymentDialog(true)
  }

  const paymentcolumns = [
    {
      field: 'paymentNo',
      headerName: '',
      flex: 1,
      sortable: false,
      renderCell: ({ row }) => {
        const currency = currencies?.find(c => c.currencyId === row?.currency) || {}
        const paidCurrency = currencies?.find(c => c.currencyId === row?.paidCurrency) || {}
        const managePermission = hasPermission(userProfile, MANAGE_PURCHASE_PAYMENT)
        const editPermission = hasPermission(userProfile, EDIT_PURCHASE_PAYMENT)
        const deletePermission = hasPermission(userProfile, DELETE_PURCHASE_PAYMENT)

        return (
          <Box sx={{ width: '100%', p: 2 }}>
            <Grid container spacing={3} sx={{ alignItems: { xs: 'flex-start', md: 'center' } }}>
              <Grid item xs={11}>
                <Grid container spacing={3} sx={{ alignItems: 'center' }}>
                  <Grid item xs={12} sm={2.5}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <StyledButton
                        color='primary'
                        onClick={() => setDialogState({ open: true, selectedPaymentId: row.paymentId })}
                      >
                        {row.paymentNoPrefix || ''}
                        {row.paymentNo}
                      </StyledButton>
                    </Box>
                    <Typography sx={{ ...dataTitleStyles, color: '#000' }}>
                      <Icon
                        icon='wi:time-4'
                        width='20px'
                        style={{ verticalAlign: 'middle', color: '#696969', marginRight: '5px' }}
                      />
                      {DateFunction(row?.paymentDate)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      {row?.paidCurrency !== currency?.currencyId && (
                        <Typography sx={{ fontSize: '13px', color: '#000' }}>
                          <span style={{ color: '#818181' }}>Invoice Amount:</span>{' '}
                          <NumberFormat value={row?.amount} currency={currency} />
                        </Typography>
                      )}
                      <Typography sx={{ fontSize: '13px', color: '#000' }}>
                        {row?.paidCurrency !== currency?.currencyId && (
                          <span style={{ color: '#818181' }}>Paid Amount:</span>
                        )}
                        <NumberFormat value={row?.paidAmount} currency={paidCurrency} />
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={5.5}>
                    <table>
                      <tbody>
                        <tr>
                          <td>
                            <Typography sx={{ fontSize: '12px', color: '#818181' }}>Status</Typography>
                          </td>
                          <td>{rowStatusChip(row?.status)}</td>
                        </tr>
                        <tr>
                          <td>
                            <Typography sx={{ fontSize: '12px', color: '#818181' }}> Reconciliation Status </Typography>
                          </td>
                          <td>{rowStatusChip(row?.reconciliationStatus)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={1}>
                <IconButton
                  aria-label='more'
                  onClick={event => handlePaymentMenuClick(event, row)}
                  disabled={row?.payableStatus === STATUS_PENDING}
                >
                  <MoreVert />
                </IconButton>

                <CommonStyledMenu
                  anchorEl={anchorElPaymentMap[row?.paymentId]}
                  open={Boolean(anchorElPaymentMap[row?.paymentId])}
                  onClose={() => handlePaymentMenuClose(row)}
                >
                  {editPermission && (
                    <MenuItem
                      onClick={() => {
                        handleEditPurchasePayment(row)
                      }}
                    >
                      <Icon icon='tabler:edit' /> Edit
                    </MenuItem>
                  )}
                  {managePermission && row.status !== STATUS_CLEARED && (
                    <MenuItem onClick={() => clearPayment(row)}>
                      <Icon icon='material-symbols:done' /> Clear Payment
                    </MenuItem>
                  )}
                  {deletePermission && row.status !== STATUS_CLEARED && (
                    <MenuItem
                      onClick={event => {
                        event.stopPropagation()
                        handleDeletePayment(row)
                      }}
                      sx={{
                        color: theme => theme?.palette?.error?.main,
                        '&:hover': {
                          color: theme => theme?.palette?.error?.main + ' !important',
                          backgroundColor: theme =>
                            alpha(theme.palette.error.main, theme.palette.action.selectedOpacity) + ' !important'
                        }
                      }}
                    >
                      <Icon icon='mingcute:delete-2-line' /> Delete
                    </MenuItem>
                  )}
                </CommonStyledMenu>
              </Grid>
            </Grid>
          </Box>
        )
      }
    }
  ]
  const payablecolumns = [
    {
      field: 'payableId',
      headerName: '',
      flex: 1,
      sortable: false,
      renderCell: ({ row }) => {
        const vendor = vendors?.find(item => item?.vendorId === row?.vendorId)
        const taxAuthority = taxAuthorities?.find(item => item?.taxAuthorityId === row?.taxAuthorityId)
        const currency = currencies?.find(c => c.currencyId === row?.payableCurrency) || {}

        return (
          <Box sx={{ width: '100%', p: 2 }}>
            <Grid container spacing={3} sx={{ alignItems: 'flex-start' }}>
              <Grid item xs={11}>
                <Grid container spacing={3} sx={{ alignItems: 'center' }}>
                  <Grid item xs={12} sm={3}>
                    {row?.vendorId && (
                      <StyledButton
                        color='primary'
                        onClick={() => {
                          setVendorDialogState({ open: true, selectedVendorId: row?.vendorId })
                        }}
                      >
                        {vendor?.displayName}
                      </StyledButton>
                    )}
                    {row?.taxAuthorityId && (
                      <Typography sx={{ fontSize: '13px', color: '#4567C6' }}>
                        {taxAuthority?.taxAuthorityName}
                      </Typography>
                    )}
                    <Typography sx={{ ...dataTitleStyles, color: '#000' }}>
                      <Icon
                        icon='wi:time-4'
                        width='20px'
                        style={{ verticalAlign: 'middle', color: '#696969', marginRight: '5px' }}
                      />
                      {DateFunction(row?.payableDate)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={3.5}>
                    <table style={{ width: '100%' }}>
                      <tbody>
                        <tr>
                          <td style={{ fontSize: '11.5px', textAlign: 'left' }}>
                            <span style={{ color: '#818181' }}>Payable Amount:</span>
                          </td>
                          <td style={{ fontSize: '11.5px' }}>
                            <NumberFormat value={row?.payableAmount} currency={currency} />
                          </td>
                        </tr>
                        <tr>
                          <td style={{ fontSize: '11.5px', textAlign: 'left' }}>
                            <span style={{ color: '#818181' }}>Tax Amount:</span>
                          </td>
                          <td style={{ fontSize: '11.5px' }}>
                            <NumberFormat value={row?.payableTaxAmount} currency={currency} />
                          </td>
                        </tr>
                        <tr>
                          <td style={{ fontSize: '11.5px', textAlign: 'left' }}>
                            <span style={{ color: '#818181' }}>Total Amount:</span>
                          </td>
                          <td style={{ fontSize: '11.5px' }}>
                            <NumberFormat value={row?.totalPayableAmount} currency={currency} />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </Grid>

                  <Grid item xs={6} sm={3.5}>
                    <Box sx={{ display: 'flex', gap: 0.5, flexDirection: 'column' }}>
                      <Typography sx={{ fontSize: '12px' }}>
                        <NumberFormat value={row?.clearedPayableAmount} currency={currency} />
                      </Typography>
                      {row?.payableCurrency !== localCurrency?.currencyId && (
                        <Typography sx={{ fontSize: '12px' }}>
                          <NumberFormat value={row?.clearedPayableAmountInLocalCurrency} currency={localCurrency} />
                        </Typography>
                      )}
                    </Box>
                    <Typography sx={{ fontSize: '12px', color: '#818181' }}>Cleared Amount</Typography>
                  </Grid>
                  <Grid item xs={6} sm={2}>
                    {rowStatusChip(row?.payableStatus)}
                    <Typography sx={{ fontSize: '12px', color: '#818181' }}>Status</Typography>
                  </Grid>
                  <Grid item xs={12} sm={12}>
                    <Typography sx={{ fontWeight: 500, fontSize: '13px', mb: 1 }}>Clearings:</Typography>
                    {row?.purchaseOrderClearings?.map(item => {
                      const clearingCurrency =
                        currencies?.find(currency => currency.currencyId === item?.currency) || {}
                      return (
                        <Box
                          key={item?.purchaseOrderPayableId}
                          // sx={{ display: 'flex', gap: 1, flexDirection: 'column', mb: 1 }}
                        >
                          <StyledButton
                            color='primary'
                            onClick={() =>
                              setDialogState({ open: true, selectedPaymentId: item.purchaseOrderPaymentId })
                            }
                          >
                            {item.purchaseOrderPaymentId
                              ? `#${item.purchaseOrderPaymentNoPrefix || ''} ${item.purchaseOrderPaymentNo}`
                              : ''}
                            {item.taxStatementId ? `#${item.taxStatementNoPrefix || ''} ${item.taxStatementNo}` : ''}
                          </StyledButton>
                          <Typography sx={{ fontSize: '12px' }}>
                            <NumberFormat value={item?.amount} currency={clearingCurrency} />
                          </Typography>
                          {item?.currency !== localCurrency?.currencyId && (
                            <Typography sx={{ fontSize: '12px' }}>
                              <NumberFormat value={item?.amountInLocalCurrency} currency={localCurrency} />
                            </Typography>
                          )}
                        </Box>
                      )
                    })}
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={1}>
                <IconButton
                  aria-label='more'
                  onClick={event => handleClick(event, row)}
                  disabled={row?.payableStatus === STATUS_PENDING}
                >
                  <MoreVert />
                </IconButton>

                <CommonStyledMenu
                  anchorEl={anchorElMap[row.purchaseOrderPayableId]}
                  open={Boolean(anchorElMap[row.purchaseOrderPayableId])}
                  onClose={() => handleClose(row)}
                >
                  <MenuItem
                    onClick={() => {
                      UndoStatus(row)
                    }}
                  >
                    <Icon icon={'iconamoon:do-undo-light'} />
                    Undo Payment
                  </MenuItem>
                </CommonStyledMenu>
              </Grid>
            </Grid>
          </Box>
        )
      }
    }
  ]
  useEffect(() => {
    if (value === 'payables') {
      getPurchasePayablesData()
    }
  }, [value])

  useEffect(() => {
    if (value === 'packages') {
      getPurchasePackagesData()
    }
  }, [value, order, reloadPackages, reloadPurchasePackage])

  useEffect(() => {
    if (value === 'shipments') {
      getPurchaseShipmentsData()
    }
  }, [value, order, reloadShipments])

  useEffect(() => {
    if (value === 'payments') {
      getPurchaseOrderPayments()
    }
  }, [value, order, reloadPayment])

  return (
    <Card>
      <CardHeader title='Related Records' />
      <CardContent sx={{ '& .MuiTabPanel-root': { p: 0 } }}>
        <TabContext value={value}>
          <TabList
            variant='scrollable'
            scrollButtons='auto'
            onChange={handleChange}
            aria-label='earning report tabs'
            sx={{
              border: '0 !important',
              '& .MuiTabs-indicator': { display: 'none' },
              '& .MuiTab-root': {
                p: 0,
                minWidth: 0,
                overflow: 'visible',
                borderRadius: '10px',
                paddingTop: '15px',
                '&:not(:last-child)': { mr: 4 }
              },
              '& .MuiTabs-scroller': {
                paddingTop: '15px'
              },
              mb: 7
            }}
          >
            {renderTabs(value, theme, tabData, order)}
          </TabList>

          <TabPanel value='packages'>
            <Box sx={{ height: '100%' }}>
              {loading ? (
                <LinearProgress />
              ) : (
                <>
                  {/* {order?.status !== STATUS_DRAFT && ( */}
                  <Box display='flex' justifyContent='flex-end' mb={2}>
                    <Button
                      size='small'
                      variant='contained'
                      startIcon={<AddOutlined />}
                      onClick={() => setOpenNewPackageDrawer(true)}
                    >
                      add New
                    </Button>
                  </Box>
                  {/* )} */}

                  <MobileDataGrid
                    hideFooter
                    columns={packagesColumns}
                    rows={packages || []}
                    getRowId={row => row?.packageId}
                    initialState={{
                      sorting: {
                        sortModel: [{ field: 'packageNo', sort: 'desc' }]
                      }
                    }}
                    slots={{
                      columnHeaders: () => null,
                      noRowsOverlay: CustomNoRowsOverlay
                    }}
                    slotProps={{
                      noRowsOverlay: {
                        mainText: 'Empty Purchase Packages'
                      }
                    }}
                  />
                </>
              )}
            </Box>
          </TabPanel>
          <TabPanel value='shipments'>
            <Box sx={{ height: '100%' }}>
              {loading ? (
                <LinearProgress />
              ) : (
                <>
                  <Box display='flex' justifyContent='flex-end' mb={2}>
                    <Button
                      size='small'
                      variant='contained'
                      startIcon={<AddOutlined />}
                      onClick={() => setOpenNewShipmentDrawer(true)}
                    >
                      add New
                    </Button>
                  </Box>

                  <MobileDataGrid
                    hideFooter
                    columns={shipmentColumns}
                    rows={shipments || []}
                    getRowId={row => row?.shipmentId}
                    initialState={{
                      sorting: {
                        sortModel: [{ field: 'shipmentNo', sort: 'desc' }]
                      }
                    }}
                    slots={{
                      columnHeaders: () => null,
                      noRowsOverlay: CustomNoRowsOverlay
                    }}
                    slotProps={{
                      noRowsOverlay: {
                        mainText: 'Empty Purchase Shipments'
                      }
                    }}
                  />
                </>
              )}
            </Box>
          </TabPanel>
          <TabPanel value='payments'>
            <Box sx={{ height: '100%' }}>
              {loading ? (
                <LinearProgress />
              ) : (
                <>
                  <Box display='flex' justifyContent='flex-end' mb={2}>
                    <Button
                      size='small'
                      variant='contained'
                      startIcon={<AddOutlined />}
                      onClick={() => setOpenNewPaymentDrawer(true)}
                    >
                      add New
                    </Button>
                  </Box>
                  <MobileDataGrid
                    hideFooter
                    columns={paymentcolumns}
                    rows={purchasePayments || []}
                    getRowId={row => row?.paymentId}
                    initialState={{
                      sorting: {
                        sortModel: [{ field: 'paymentNo', sort: 'desc' }]
                      }
                    }}
                    slots={{
                      columnHeaders: () => null,
                      noRowsOverlay: CustomNoRowsOverlay
                    }}
                    slotProps={{
                      noRowsOverlay: {
                        mainText: 'Empty Payments'
                      }
                    }}
                  />
                </>
              )}
            </Box>
          </TabPanel>
          <TabPanel value='payables'>
            <Box sx={{ height: '100%' }}>
              {loading ? (
                <LinearProgress />
              ) : (
                <MobileDataGrid
                  hideFooter
                  columns={payablecolumns}
                  rows={payables || []}
                  getRowId={row => row?.purchaseOrderPayableId}
                  initialState={{
                    sorting: {
                      sortModel: [{ field: 'purchaseOrderNo', sort: 'desc' }]
                    }
                  }}
                  slots={{
                    columnHeaders: () => null,
                    noRowsOverlay: CustomNoRowsOverlay
                  }}
                  slotProps={{
                    noRowsOverlay: {
                      mainText: 'Empty Purchase Order Payables'
                    }
                  }}
                />
              )}
            </Box>
          </TabPanel>
          <TabPanel value='attachments'>
            <AttachmentTab order={order} folderName={PURCHASE_ORDER_PDF} />
          </TabPanel>
        </TabContext>
      </CardContent>

      {vendorDialogState?.open && (
        <CommonVendorPopup
          vendorId={vendorDialogState?.selectedVendorId}
          openVendorDialog={vendorDialogState?.open}
          setOpenVendorDialog={() => setVendorDialogState({ open: false, selectedVendorId: null })}
        />
      )}
      {dialogState.open && (
        <CommonPoPaymentsPopUp
          paymentId={dialogState.selectedPaymentId}
          open={dialogState.open}
          onClose={() => setDialogState({ open: false, selectedPaymentId: null })}
        />
      )}
      {purchasePackageDialogState?.open && (
        <CommonPoPackagePopUp
          packageId={purchasePackageDialogState?.selectedPackageId}
          open={purchasePackageDialogState?.open}
          setOpen={() => setPurchasePackageDialogState({ open: false, selectedPackageId: null })}
        />
      )}

      {shipmentPopupState.open && (
        <ShipmentPopup
          shipmentId={shipmentPopupState.selectedShipmentId}
          open={shipmentPopupState.open}
          onClose={() => setShipmentPopupState({ open: false, selectedShipmentId: null })}
        />
      )}
      {openMovetoNextStageDialog && (
        <MovetoNextStagePurchasePackage
          tenantId={tenantId}
          selectedPackage={selectedPackage}
          open={openMovetoNextStageDialog}
          setOpen={setOpenMovetoNextStageDialog}
          reloadPackages={reloadPackages}
          setReloadPackages={setReloadPackages}
        />
      )}

      {openMovetoNextStageShipmentDialog && (
        <MovetoNextStagePurchaseShipment
          tenantId={tenantId}
          selectedShipment={selectedShipment}
          open={openMovetoNextStageShipmentDialog}
          setOpen={setOpenMovetoNextStageShipmentDialog}
          reloadShipments={reloadShipments}
          setReloadShipments={setReloadShipments}
        />
      )}

      {openDialog && (
        <DeleteShipment
          tenantId={tenantId}
          shipmentId={selectedRow?.shipmentId}
          openDialog={openDialog}
          setOpenDialog={setOpenDialog}
        />
      )}
      {openNewPackageDrawer && (
        <NewPurchasePackageDrawer
          openDrawer={openNewPackageDrawer}
          setOpenDrawer={setOpenNewPackageDrawer}
          reloadPackages={reloadPackages}
          setReloadPackages={setReloadPackages}
          order={order}
        />
      )}
      {openEditPackageDrawer && (
        <EditPurchasePackageDrawer
          openDrawer={openEditPackageDrawer}
          setOpenDrawer={setOpenEditPackageDrawer}
          reloadPackages={reloadPackages}
          setReloadPackages={setReloadPackages}
        />
      )}

      {openPackageDeleteDialog && (
        <DeletePurchasePackage
          tenantId={tenantId}
          packageId={selectedPackage?.packageId}
          openDialog={openPackageDeleteDialog}
          setOpenDialog={setOpenPackageDeleteDialog}
        />
      )}
      {openNewShipmentDrawer && (
        <NewShipmentDrawer
          openDrawer={openNewShipmentDrawer}
          setOpenDrawer={setOpenNewShipmentDrawer}
          reloadShipments={reloadShipments}
          setReloadShipments={setReloadShipments}
          order={order}
        />
      )}

      {openEditShipmentDrawer && (
        <EditShipmentDrawer
          openDrawer={openEditShipmentDrawer}
          setOpenDrawer={setOpenEditShipmentDrawer}
          reloadShipments={reloadShipments}
          setReloadShipments={setReloadShipments}
        />
      )}

      {openNewPaymentDrawer && (
        <NewPurchasePaymentDrawer
          openDrawer={openNewPaymentDrawer}
          setOpenDrawer={setOpenNewPaymentDrawer}
          reloadPayment={reloadPayment}
          setReloadPayment={setReloadPayment}
          order={order}
        />
      )}
      {openEditPaymentDrawer && (
        <EditPurchasePaymentDrawer
          openDrawer={openEditPaymentDrawer}
          setOpenDrawer={setOpenEditPaymentDrawer}
          reloadPayment={reloadPayment}
          setReloadPayment={setReloadPayment}
        />
      )}
      {openPaymentClearDialog && (
        <ClearPOPayment
          tenantId={tenantId}
          paymentId={selectedPayment?.paymentId}
          openDialog={openPaymentClearDialog}
          setOpenDialog={setOpenPaymentClearDialog}
        />
      )}
      {openDeletePaymentDialog && (
        <DeletePurchasePayments
          tenantId={tenantId}
          paymentId={selectedPayment?.paymentId}
          openDialog={openDeletePaymentDialog}
          setOpenDialog={setOpenDeletePaymentDialog}
        />
      )}
    </Card>
  )
}

export default PurchaseWidgets
