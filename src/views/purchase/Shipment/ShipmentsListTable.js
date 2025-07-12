// ** Next Import
import Link from 'next/link'
import Router from 'next/router'

import { alpha } from '@mui/material/styles'
import { useDispatch, useSelector } from 'react-redux'
import {
  Box,
  IconButton,
  MenuItem,
  Typography,
  Tooltip,
  Grid,
  Divider,
  Popover,
  Button,
  LinearProgress
} from '@mui/material'
import Icon from 'src/@core/components/icon'
import { useEffect, useMemo, useState } from 'react'
import CustomNoRowsOverlay from 'src/common-components/CustomNoRowsOverlay'
import {
  dataTextStyles,
  dataTitleStyles,
  DateFunction,
  hasPermission,
  lastMonthDate,
  rowStatusChip,
  toTitleCase
} from 'src/common-functions/utils/UtilityFunctions'
import CommonStyledMenu from 'src/common-components/CommonStyledMenu'
import { useIsLaptop } from 'src/hooks/IsDesktop'
import {
  VIEW_PURCHASE_SHIPMENT,
  EDIT_PURCHASE_SHIPMENT,
  DELETE_PURCHASE_SHIPMENT,
  STATUS_DRAFT
} from 'src/common-functions/utils/Constants'
import RefreshIcon from '@mui/icons-material/Refresh'
import DeleteShipment from './DeleteShipment'
import MobileDataGrid from 'src/common-components/MobileDataGrid'
import {
  resetPurchaseShipment,
  setSelectedPurchaseShipment,
  setLoading,
  setUpdatePurchaseShipment,
  setPurchaseOrderShipmentFilters,
  resetPurchaseOrderShipmentFilters
} from 'src/store/apps/purchase-shipments'
import {
  getPurchaseOrderShipmentsByDateRangeQuery,
  undoPurchaseOrderShipmentStageQuery
} from 'src/@core/components/graphql/purchase-order-shipment-queries'
import MovetoNextStagePurchaseShipment from './MovetoNextStagePurchaseShipment'
import { fetchData, writeData } from 'src/common-functions/GraphqlOperations'
import { createAlert } from 'src/store/apps/alerts'
import FilterDateRange from 'src/common-components/FilterDateRange'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import CustomTextField from 'src/@core/components/mui/text-field'
import StyledButton from 'src/common-components/StyledMuiButton'
import CommonVendorPopup from 'src/common-components/CommonVendorPopup'
import { Close } from '@mui/icons-material'
import CustomChip from 'src/@core/components/mui/chip'
import usePurchaseOrders from 'src/hooks/getData/usePurchaseOrders'
import usePurchasePackages from 'src/hooks/getData/usePurchasePackages'

const ShipmentsListTable = ({ tenantId, purchaseShipmentData, loading }) => {
  const router = Router
  const dispatch = useDispatch()
  const isLaptop = useIsLaptop()
  const { reloadPurchaseOrderInStore } = usePurchaseOrders(tenantId)
  const { reloadPurchasePackageInStore } = usePurchasePackages(tenantId)
  const userProfile = useSelector(state => state.userProfile)
  const moduleFilterDateDuration = useSelector(
    state => state.otherSettings?.data?.moduleFilterDateDuration || undefined
  )
  const {
    startDate: rawStartDate,
    endDate: rawEndDate,
    filterStatus,
    filterVendor
  } = useSelector(state => state.purchaseShipments?.filters ?? {})

  const oneMonthAgoDate = useMemo(() => lastMonthDate(moduleFilterDateDuration), [moduleFilterDateDuration])
  const todayDate = useMemo(() => new Date(), [])

  const startDate = new Date(rawStartDate ?? oneMonthAgoDate)
  const endDate = new Date(rawEndDate ?? todayDate)

  const isStartDateChanged = startDate.toDateString() !== oneMonthAgoDate.toDateString()
  const isEndDateChanged = endDate.toDateString() !== todayDate.toDateString()

  // Individual filter checks
  const filters = {
    startDate: isStartDateChanged,
    endDate: isEndDateChanged,
    filterVendor: Boolean(filterVendor),
    filterStatus: Boolean(filterStatus)
  }

  const anyFilterActive = Object.values(filters).some(Boolean)

  // State for active filters
  const [isFilterActive, setFilterActive] = useState({
    filterActive: anyFilterActive,
    ...filters
  })

  const [openDialog, setOpenDialog] = useState(false)
  const [selectedRow, setSelectedRow] = useState('')
  const { vendors = [], shipments = [] } = purchaseShipmentData || {}
  const [vendorForDialog, setVendorForDialog] = useState({})
  const [openVendorDialog, setOpenVendorDialog] = useState(false)
  const [openMovetoNextStageDialog, setOpenMovetoNextStageDialog] = useState(false)
  const [anchorElMap, setAnchorElMap] = useState({})
  const [filteredShipments, setFilteredShipments] = useState([])
  const [searchedShipment, setSearchedShipment] = useState(null)
  const [temporaryFilterData, setTemporaryFilterData] = useState([])
  const ShipmentStatuses = [...new Set(shipments?.map(item => item.status))]

  const MoveToNextStage = row => {
    setOpenMovetoNextStageDialog(true)
    setSelectedRow(row)

    const updatedAnchorElMap = { ...anchorElMap }
    updatedAnchorElMap[row.shipmentId] = null
    setAnchorElMap(updatedAnchorElMap)
  }

  const UndoStage = async data => {
    const { tenantId, shipmentId, currentStage: stageName } = data

    // Clear anchor element for the shipment
    setAnchorElMap(prev => ({ ...prev, [shipmentId]: null }))

    try {
      dispatch(setLoading(true))

      const response = await writeData(undoPurchaseOrderShipmentStageQuery(), {
        tenantId,
        shipmentId,
        stageName
      })

      const result = response?.undoPurchaseOrderShipmentStage

      if (result) {
        dispatch(setUpdatePurchaseShipment(result))

        // Await sequential updates for packages
        for (const item of result.packages) {
          await reloadPurchaseOrderInStore(item.purchaseOrderId)
          await reloadPurchasePackageInStore(item.packageId)
        }

        dispatch(
          createAlert({
            message: 'Moved Shipment to Previous Stage successfully!',
            type: 'success'
          })
        )
      } else {
        const errorMessage = response?.errors?.[0]?.message || 'Failed to move to previous stage!'
        dispatch(createAlert({ message: errorMessage, type: 'error' }))
      }
    } catch (error) {
      console.error('Failed to undo stage:', error)
      dispatch(
        createAlert({
          message: 'An unexpected error occurred while undoing the stage.',
          type: 'error'
        })
      )
    }
  }

  const handleClick = (event, row) => {
    dispatch(setSelectedPurchaseShipment(row))
    const updatedAnchorElMap = { ...anchorElMap }
    updatedAnchorElMap[row.shipmentId] = event.currentTarget
    setAnchorElMap(updatedAnchorElMap)
  }

  const handleClose = row => {
    const updatedAnchorElMap = { ...anchorElMap }
    updatedAnchorElMap[row.shipmentId] = null
    setAnchorElMap(updatedAnchorElMap)
  }

  const handleDelete = row => {
    setSelectedRow(row)
    handleClose(row)
    setOpenDialog(true)
  }

  const handleSearchChange = (event, newValue) => {
    const searchValue = newValue ? newValue.toLowerCase() : ''

    if (searchValue) {
      const matchedShipment = shipments.filter(val => {
        const vendor = vendors.find(vend => vend.vendorId === val.vendorId)
        const vendorName = vendor ? vendor.displayName.toLowerCase() : ''

        return val.shipmentNo.toLowerCase().includes(searchValue) || vendorName.includes(searchValue)
      })

      setFilteredShipments(matchedShipment.length > 0 ? matchedShipment : temporaryFilterData)
    } else {
      setFilteredShipments(temporaryFilterData)
      setSearchedShipment('')
    }
  }

  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)

  const handleFilterClick = event => {
    setAnchorEl(event.currentTarget)
  }

  const handleFilterClose = () => {
    const {
      filterStatus: isStatusActive,
      filterVendor: isVendorActive,
      startDate: isStartDateActive,
      endDate: isEndDateActive
    } = isFilterActive
    updateFilter('filterStatus', isStatusActive ? filterStatus : null)
    updateFilter('filterVendor', isVendorActive ? filterVendor : null)
    updateFilter('startDate', isStartDateActive ? startDate : null)
    updateFilter('endDate', isEndDateActive ? endDate : null)
    setAnchorEl(null)
  }

  useEffect(() => {
    handleDateRange(startDate, endDate)
  }, [shipments])

  const handleDateRange = async (startDate, endDate, overrides = {}) => {
    let purchaseOrderFilter = shipments
    const { filterVendor: vendorOverride = filterVendor, filterStatus: statusOverride = filterStatus } = overrides
    const isStartDate = startDate.toDateString() !== oneMonthAgoDate.toDateString()
    const isEndDate = endDate.toDateString() !== todayDate.toDateString()
    const isFilterVendor = Boolean(vendorOverride)
    const isFilterStatus = Boolean(statusOverride)
    const anyFilterActive = isStartDate || isEndDate || isFilterVendor || isFilterStatus

    try {
      if (isStartDate || isEndDate) {
        const response = await fetchData(
          getPurchaseOrderShipmentsByDateRangeQuery(tenantId, DateFunction(startDate), DateFunction(endDate))
        )

        purchaseOrderFilter = response?.getPurchaseOrderShipmentsByDateRange
        console.log('Fetched data by date range successfully')
      }
      if (purchaseOrderFilter) {
        const filteredData = purchaseOrderFilter.filter(item => {
          const statusMatches = statusOverride ? item?.status === statusOverride : true
          const vendorMatches = vendorOverride?.vendorId ? item?.vendorId === vendorOverride.vendorId : true
          return statusMatches && vendorMatches
        })

        setFilterActive({
          filterActive: anyFilterActive,
          startDate: isStartDate,
          endDate: isEndDate,
          filterVendor: isFilterVendor,
          filterStatus: isFilterStatus
        })

        setTemporaryFilterData(anyFilterActive ? filteredData : [])
        setFilteredShipments(anyFilterActive ? filteredData : [])
        setSearchedShipment('')
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setAnchorEl(null)
    }
  }

  const handleFilters = (overrides = {}) => {
    handleDateRange(startDate, endDate, overrides)
  }

  const updateFilter = (key, value) => {
    dispatch(setPurchaseOrderShipmentFilters({ [key]: value }))
  }

  const handleReset = async () => {
    setAnchorEl(null)
    dispatch(resetPurchaseOrderShipmentFilters())

    setFilterActive({
      filterActive: false,
      startDate: false,
      endDate: false,
      filterVendor: false,
      filterStatus: false
    })
    setFilteredShipments([])
    setTemporaryFilterData([])

    setSearchedShipment('')
  }

  const columns = [
    {
      field: 'shipmentNo',
      headerName: '',
      flex: 1,
      sortable: false,
      renderCell: ({ row }) => {
        const vendor = vendors?.find(item => item?.vendorId === row?.vendorId) || {}

        const viewPermission = hasPermission(userProfile, VIEW_PURCHASE_SHIPMENT)
        const editPermission = hasPermission(userProfile, EDIT_PURCHASE_SHIPMENT)
        const deletePermission = hasPermission(userProfile, DELETE_PURCHASE_SHIPMENT)
        return (
          <Box sx={{ width: '100%', p: 2 }}>
            <Grid container spacing={3} sx={{ alignItems: 'center' }}>
              <Grid item xs={11}>
                <Grid container spacing={3} sx={{ alignItems: 'center' }}>
                  <Grid item xs={12} sm={12} lg={4} xl={6}>
                    <StyledButton
                      color='primary'
                      onClick={event => {
                        event.stopPropagation()
                        setVendorForDialog(vendor)
                        setOpenVendorDialog(true)
                      }}
                    >
                      {vendor?.displayName}
                    </StyledButton>
                    <Typography sx={{ ...dataTitleStyles, color: '#000' }}>
                      <span style={{ verticalAlign: 'middle', marginRight: '5px' }}>#</span> {row.shipmentNoPrefix}
                      {row.shipmentNo}
                    </Typography>
                    <Typography sx={{ ...dataTitleStyles, color: '#818181' }}>{row?.notes}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3} lg={2} xl={1.5}>
                    <Typography sx={dataTextStyles}>{DateFunction(row?.shipmentDate) || '-'}</Typography>
                    <Typography sx={dataTitleStyles}>Shipment Date</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3} lg={2} xl={1.5}>
                    {rowStatusChip(row?.status) || '-'}
                    <Typography sx={dataTitleStyles}>Status</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3} lg={2} xl={1.5}>
                    {rowStatusChip(row?.paymentStatus) || '-'}
                    <Typography sx={dataTitleStyles}>Payment Status</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3} lg={2} xl={1.5}>
                    {rowStatusChip(row?.deliveryStatus) || '-'}
                    <Typography sx={dataTitleStyles}>Delivery Status</Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={1} sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }}>
                {isLaptop ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                    {viewPermission && (
                      <IconButton
                        component={Link}
                        scroll={true}
                        href={`/purchases/shipments/view/${row?.shipmentId}`}
                        onClick={event => {
                          event.stopPropagation()
                          dispatch(setSelectedPurchaseShipment(row))
                        }}
                      >
                        <Icon icon='tabler:eye' />
                      </IconButton>
                    )}
                    {editPermission && (
                      <IconButton
                        component={Link}
                        scroll={true}
                        href={`/purchases/shipments/edit/${row?.shipmentId}`}
                        onClick={event => {
                          event.stopPropagation()
                          dispatch(setSelectedPurchaseShipment(row))
                        }}
                      >
                        <Icon icon='tabler:edit' />
                      </IconButton>
                    )}

                    <IconButton
                      aria-label='more'
                      id='long-button'
                      aria-haspopup='true'
                      onClick={event => {
                        event.stopPropagation()
                        handleClick(event, row)
                      }}
                    >
                      <Icon icon='iconamoon:menu-kebab-vertical-circle-light' width={25} height={25} />
                    </IconButton>
                    <CommonStyledMenu
                      anchorEl={anchorElMap[row.shipmentId]}
                      open={Boolean(anchorElMap[row.shipmentId])}
                      onClose={() => handleClose(row)}
                    >
                      {row?.moveToNextStage && (
                        <MenuItem onClick={() => MoveToNextStage(row)}>
                          <Icon icon='solar:forward-outline' />
                          Move to {toTitleCase(row?.nextStage)}
                        </MenuItem>
                      )}
                      {row?.undoCurrentStage && (
                        <MenuItem onClick={() => UndoStage(row)}>
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
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <IconButton
                      onClick={event => {
                        event.stopPropagation()
                        handleClick(event, row)
                      }}
                    >
                      <Icon icon='iconamoon:menu-kebab-vertical-circle-light' width={27} height={27} />
                    </IconButton>
                    <CommonStyledMenu
                      anchorEl={anchorElMap[row.shipmentId]}
                      open={Boolean(anchorElMap[row.shipmentId])}
                      onClose={() => handleClose(row)}
                    >
                      {viewPermission && (
                        <MenuItem
                          component={Link}
                          href={`/purchases/shipments/view/${row?.shipmentId}`}
                          onClick={() => dispatch(setSelectedPurchaseShipment(row))}
                        >
                          <Icon icon='tabler:eye' /> View
                        </MenuItem>
                      )}
                      {editPermission && (
                        <MenuItem
                          component={Link}
                          href={`/purchases/shipments/edit/${row?.shipmentId}`}
                          onClick={() => dispatch(setSelectedPurchaseShipment(row))}
                        >
                          <Icon icon='tabler:edit' /> Edit
                        </MenuItem>
                      )}

                      {row?.moveToNextStage && (
                        <MenuItem onClick={() => MoveToNextStage(row)}>
                          <Icon icon='solar:forward-outline' />
                          Move to {toTitleCase(row?.nextStage)}
                        </MenuItem>
                      )}
                      {row?.undoCurrentStage && (
                        <MenuItem onClick={() => UndoStage(row)}>
                          <Icon icon='iconamoon:do-undo-light' />
                          Undo Stage {toTitleCase(row?.currentStage)}
                        </MenuItem>
                      )}

                      {deletePermission && row?.status === STATUS_DRAFT && (
                        <MenuItem onClick={() => handleDelete(row)} sx={{ color: theme => theme.palette.error.main }}>
                          <Icon icon='mingcute:delete-2-line' /> Delete
                        </MenuItem>
                      )}
                    </CommonStyledMenu>
                  </Box>
                )}
              </Grid>
            </Grid>
          </Box>
        )
      }
    }
  ]

  return (
    <>
      <Grid container spacing={2} sx={{ justifyContent: 'space-between', mb: 3 }}>
        <Grid item xs={7} sm={4} md={4} lg={4} xl={4}>
          <CustomAutocomplete
            options={filteredShipments.length > 0 || isFilterActive.filterActive ? filteredShipments : shipments}
            getOptionLabel={option => {
              if (!option) return ''

              const vendor = vendors.find(cust => cust.vendorId === option.vendorId)
              const displayName = vendor?.displayName || ''
              const displayCompName = vendor?.companyName ? `-${vendor.companyName}` : ''

              return `${displayName}${displayCompName} - ${option.shipmentNo}`.trim()
            }}
            filterOptions={options => options}
            value={shipments?.find(option => option.shipmentId === searchedShipment?.shipmentId) || null}
            onChange={(event, newValue) => {
              setFilteredShipments(newValue ? [newValue] : temporaryFilterData)
              setSearchedShipment(newValue)
            }}
            onInputChange={(event, newValue) => {
              if (newValue && newValue.trim() !== '') {
                handleSearchChange(event, newValue)
              }
            }}
            disableClearable={false}
            renderInput={params => <CustomTextField {...params} fullWidth label='Shipments' />}
          />
        </Grid>
        <Grid item xs={5} sm={6} md={6} lg={6} xl={6}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: 3
            }}
          >
            <Tooltip title='Reload' placement='top'>
              <IconButton
                color='default'
                onClick={() => {
                  dispatch(resetPurchaseShipment())
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Button
              variant='outlined'
              startIcon={<Icon icon='ion:filter' />}
              aria-describedby='filter-popover'
              onClick={handleFilterClick}
            >
              Filter
            </Button>
            <Popover
              id='filter-popover'
              open={open}
              anchorEl={anchorEl}
              onClose={handleFilterClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right'
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right'
              }}
              sx={{ mt: 2 }}
            >
              <Box sx={{ py: 0 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 4, py: 4, background: '#f1f1f1' }}>
                  <Typography sx={{ fontSize: '14px', lineHeight: '23px' }}> Filters</Typography>
                </Box>
                <Divider sx={{ mb: 3, opacity: 0.5 }} color='primary' />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 4, mb: 2 }}>
                  <Typography sx={{ fontSize: '13px', lineHeight: '23px' }}> Date Range</Typography>
                  <Button
                    type='button'
                    onClick={() => {
                      updateFilter('startDate', null)
                      updateFilter('endDate', null)
                    }}
                  >
                    Reset
                  </Button>
                </Box>
                <Box sx={{ display: 'flex', gap: 4, alignItems: 'center', px: 4 }}>
                  <FilterDateRange label='From' date={startDate} setDate={date => updateFilter('startDate', date)} />
                  <FilterDateRange label='To' date={endDate} setDate={date => updateFilter('endDate', date)} />
                </Box>
                <Divider sx={{ my: 3, opacity: 0.5 }} color='primary' />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 4, mb: 2 }}>
                  <Typography sx={{ fontSize: '13px', lineHeight: '23px' }}>Status</Typography>
                  <Button type='button' onClick={() => updateFilter('filterStatus', null)}>
                    Reset
                  </Button>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 4, mb: 2 }}>
                  <CustomAutocomplete
                    fullWidth
                    options={ShipmentStatuses}
                    value={filterStatus ? toTitleCase(filterStatus) : filterStatus}
                    onChange={(event, newValue) => updateFilter('filterStatus', newValue)}
                    getOptionLabel={option => toTitleCase(option)}
                    renderOption={(props, option) => (
                      <li {...props} style={{ textTransform: 'capitalize' }}>
                        {toTitleCase(option)}
                      </li>
                    )}
                    renderInput={params => <CustomTextField {...params} />}
                  />
                </Box>
                <Divider sx={{ my: 3, opacity: 0.5 }} color='primary' />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 4, mb: 2 }}>
                  <Typography sx={{ fontSize: '13px', lineHeight: '23px' }}>Vendor</Typography>
                  <Button type='button' onClick={() => updateFilter('filterVendor', null)}>
                    Reset
                  </Button>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 4, mb: 2 }}>
                  <CustomAutocomplete
                    fullWidth
                    options={vendors}
                    value={filterVendor}
                    onChange={(event, newValue) => {
                      updateFilter('filterVendor', newValue)
                    }}
                    getOptionLabel={option => option?.displayName || ''}
                    renderInput={params => <CustomTextField {...params} />}
                  />
                </Box>
                <Divider sx={{ mt: 3, opacity: 0.5 }} color='primary' />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 4, py: 4 }}>
                  <Button
                    variant='outlined'
                    type='button'
                    onClick={() => {
                      handleReset()
                    }}
                  >
                    Reset All
                  </Button>

                  <Button variant='contained' onClick={handleFilters}>
                    Apply
                  </Button>
                </Box>
              </Box>
            </Popover>
          </Box>
        </Grid>
        {(isFilterActive.filterVendor ||
          isFilterActive.filterStatus ||
          isFilterActive.startDate ||
          isFilterActive.endDate) && (
          <Grid item xs={12}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-end'
              }}
            >
              <Typography
                sx={{
                  fontSize: '14px',
                  lineHeight: '23px',
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                Filtered By:
                {filterVendor && isFilterActive.filterVendor && (
                  <CustomChip
                    label={`Vendor: ${filterVendor.displayName}`}
                    onDelete={() => {
                      updateFilter('filterVendor', null)
                      handleFilters({ filterVendor: null })
                    }}
                    deleteIcon={<Close sx={{ color: theme => theme.palette.primary.main }} />}
                    skin='light'
                    color='primary'
                  />
                )}
                {filterStatus && isFilterActive.filterStatus && (
                  <CustomChip
                    label={`Status: ${filterStatus}`}
                    onDelete={() => {
                      updateFilter('filterStatus', null)
                      handleFilters({ filterStatus: null })
                    }}
                    deleteIcon={<Close sx={{ color: theme => theme.palette.primary.main }} />}
                    skin='light'
                    color='primary'
                  />
                )}
                {(isFilterActive.startDate || isFilterActive.endDate) && (
                  <CustomChip
                    label={`Date Range: ${DateFunction(startDate.toDateString())}-${DateFunction(
                      endDate.toDateString()
                    )}`}
                    onDelete={() => {
                      updateFilter('startDate', null)
                      updateFilter('endDate', null)
                      handleDateRange(oneMonthAgoDate, todayDate)
                    }}
                    deleteIcon={<Close sx={{ color: theme => theme.palette.primary.main }} />}
                    skin='light'
                    color='primary'
                  />
                )}
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>
      {loading ? (
        <LinearProgress />
      ) : (
        <MobileDataGrid
          columns={columns}
          rows={filteredShipments.length > 0 || isFilterActive.filterActive ? filteredShipments : shipments}
          getRowId={row => row?.shipmentId}
          initialState={{
            sorting: {
              sortModel: [{ field: 'shipmentNo', sort: 'desc' }]
            }
          }}
          styles={{
            '& .MuiDataGrid-row:hover': {
              cursor: 'pointer'
            }
          }}
          onCellClick={(params, event) => {
            event.defaultMuiPrevented = false
          }}
          onRowClick={(params, event) => {
            if (event.target.closest('.MuiButton-root')) {
              event.defaultMuiPrevented = true
              return
            }
            dispatch(setSelectedPurchaseShipment(params.row))
            router.push(`/purchases/shipments/view/${params?.row?.shipmentId}`)
          }}
          slots={{
            columnHeaders: () => null,
            noRowsOverlay: CustomNoRowsOverlay
          }}
          slotProps={{
            noRowsOverlay: {
              mainText: 'Empty Purchase Orders Shipment',
              subText: 'No purchase orders shipment available here. Click "Add New" button above to get started.'
            }
          }}
        />
      )}
      {openVendorDialog && (
        <CommonVendorPopup
          vendorId={vendorForDialog?.vendorId}
          openVendorDialog={openVendorDialog}
          setOpenVendorDialog={setOpenVendorDialog}
        />
      )}

      {openMovetoNextStageDialog && (
        <MovetoNextStagePurchaseShipment
          tenantId={tenantId}
          selectedShipment={selectedRow}
          open={openMovetoNextStageDialog}
          setOpen={setOpenMovetoNextStageDialog}
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
    </>
  )
}

export default ShipmentsListTable
