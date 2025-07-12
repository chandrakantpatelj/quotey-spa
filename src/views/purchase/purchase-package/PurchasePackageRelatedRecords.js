import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import {
  Box,
  Card,
  CardHeader,
  Typography,
  CardContent,
  IconButton,
  MenuItem,
  LinearProgress,
  Grid
} from '@mui/material'

import TabContext from '@mui/lab/TabContext'
import { TabPanel, TabList } from '@mui/lab'

import { useTheme } from '@mui/material/styles'

import Icon from 'src/@core/components/icon'

import {
  dataTitleStyles,
  DateFunction,
  renderTabs,
  rowStatusChip,
  toTitleCase
} from 'src/common-functions/utils/UtilityFunctions'
import CustomNoRowsOverlay from 'src/common-components/CustomNoRowsOverlay'
import StyledButton from 'src/common-components/StyledMuiButton'
import { fetchData, writeData } from 'src/common-functions/GraphqlOperations'
import CommonStyledMenu from 'src/common-components/CommonStyledMenu'
import { createAlert } from 'src/store/apps/alerts'
import MobileDataGrid from 'src/common-components/MobileDataGrid'
import {
  getPurchaseOrderShipmentsByPurchaseOrderPackageIdQuery,
  undoPurchaseOrderShipmentStageQuery
} from 'src/@core/components/graphql/purchase-order-shipment-queries'
import ShipmentPopup from '../Shipment/ShipmentPopup'
import MovetoNextStagePurchaseShipment from '../Shipment/MovetoNextStagePurchaseShipment'
import { setUpdatePurchaseShipment } from 'src/store/apps/purchase-shipments'
import usePurchaseOrders from 'src/hooks/getData/usePurchaseOrders'
import usePurchasePackages from 'src/hooks/getData/usePurchasePackages'

const tabData = [
  {
    type: 'shipments',
    avatarIcon: 'streamline:shipment-check'
  }
]

const PurchasePackageRelatedRecords = ({ selectedPurchasePackage }) => {
  const theme = useTheme()
  const dispatch = useDispatch()
  const tenantId = useSelector(state => state.tenants?.selectedTenant?.tenantId)

  const { reloadPurchaseOrderInStore } = usePurchaseOrders(tenantId)
  const { reloadPurchasePackageInStore } = usePurchasePackages(tenantId)
  const [value, setValue] = useState('shipments')

  const handleChange = (event, newValue) => {
    setValue(newValue)
  }

  const [loading, setLoading] = useState(true)

  const [shipments, setShipments] = useState([])
  const [reloadShipments, setReloadShipments] = useState(false)

  const getPurchaseShipmentsData = async () => {
    setLoading(true)
    const purchaseOrderPackageId = selectedPurchasePackage?.packageId
    try {
      const response = await fetchData(
        getPurchaseOrderShipmentsByPurchaseOrderPackageIdQuery(tenantId, purchaseOrderPackageId)
      )
      const { getPurchaseOrderShipmentsByPurchaseOrderPackageId = {} } = response || {}
      setShipments(getPurchaseOrderShipmentsByPurchaseOrderPackageId)
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

    const updatedAnchorElMap = { ...shipmentAnchorElMap }
    updatedAnchorElMap[row.shipmentId] = null
    setShipmentAnchorElMap(updatedAnchorElMap)
  }

  const UndoShipmentStage = async data => {
    const updatedAnchorElMap = { ...shipmentAnchorElMap }
    updatedAnchorElMap[data.shipmentId] = null
    setShipmentAnchorElMap(updatedAnchorElMap)
    const { tenantId, shipmentId } = data
    const stageName = data?.currentStage
    try {
      const response = await writeData(undoPurchaseOrderShipmentStageQuery(), { tenantId, shipmentId, stageName })
      if (response.undoPurchaseOrderShipmentStage) {
        dispatch(setUpdatePurchaseShipment(response.undoPurchaseOrderShipmentStage))
        for (const item of response.undoPurchaseOrderShipmentStage.packages) {
          await reloadPurchaseOrderInStore(item.purchaseOrderId)
          await reloadPurchasePackageInStore(item.packageId)
        }
        setReloadShipments(!reloadShipments)
        dispatch(createAlert({ message: 'Moved Shipment to Previous Stage successfully!', type: 'success' }))
      } else {
        const errorMessage = response.errors[0] ? response.errors[0].message : 'Failed to move to previous stage!'
        dispatch(createAlert({ message: errorMessage, type: 'error' }))
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    }
  }

  const shipmentColumns = [
    {
      field: 'shipmentNo',
      headerName: '',
      flex: 1,
      sortable: false,
      renderCell: ({ row }) => {
        return (
          <Box sx={{ width: '100%', p: 2 }}>
            <Grid container spacing={3} sx={{ alignItems: 'center' }}>
              <Grid item xs={11}>
                <Grid container spacing={3} sx={{ alignItems: 'center' }}>
                  <Grid item xs={12} sm={4} lg={3} xl={3}>
                    <StyledButton
                      color='primary'
                      onClick={() => setShipmentPopupState({ open: true, selectedShipmentId: row?.shipmentId })}
                    >
                      #{row.shipmentNoPrefix || ''}
                      {row.shipmentNo}
                    </StyledButton>
                    <Typography sx={{ fontSize: '13px', color: '#696969' }}>
                      <Icon icon='wi:time-4' style={{ verticalAlign: 'middle', marginRight: '5px' }} width={16} />
                      {DateFunction(row?.shipmentDate) || '-'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={2} lg={3} xl={3}>
                    {rowStatusChip(row?.status)}
                    <Typography sx={dataTitleStyles}>Status</Typography>
                  </Grid>
                  <Grid item xs={12} sm={2} lg={3} xl={3}>
                    {rowStatusChip(row?.paymentStatus) || '-'}
                    <Typography sx={dataTitleStyles}>Payment Status</Typography>
                  </Grid>
                  <Grid item xs={12} sm={2} lg={3} xl={3}>
                    {rowStatusChip(row?.deliveryStatus) || '-'}
                    <Typography sx={dataTitleStyles}>Delivery Status</Typography>
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
                  </CommonStyledMenu>
                </Box>
              </Grid>
            </Grid>
          </Box>
        )
      }
    }
  ]

  useEffect(() => {
    if (value === 'shipments') {
      getPurchaseShipmentsData()
    }
  }, [value, selectedPurchasePackage, reloadShipments])

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
                '&:not(:last-child)': { mr: 4 }
              },
              '& .MuiTabs-scroller': {
                paddingTop: '15px'
              },
              mb: 7
            }}
          >
            {renderTabs(value, theme, tabData, selectedPurchasePackage)}
          </TabList>

          <TabPanel value='shipments'>
            <Box sx={{ height: '100%' }}>
              {loading ? (
                <LinearProgress />
              ) : (
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
              )}
            </Box>
          </TabPanel>
        </TabContext>
      </CardContent>

      {shipmentPopupState.open && (
        <ShipmentPopup
          shipmentId={shipmentPopupState.selectedShipmentId}
          open={shipmentPopupState.open}
          onClose={() => setShipmentPopupState({ open: false, selectedShipmentId: null })}
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
    </Card>
  )
}

export default PurchasePackageRelatedRecords
