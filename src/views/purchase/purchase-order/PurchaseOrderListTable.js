// ** Next Import
import Link from 'next/link'
import Router from 'next/router'
import { useDispatch, useSelector } from 'react-redux'
import {
  Box,
  IconButton,
  MenuItem,
  Divider,
  Button,
  Popover,
  Typography,
  Tooltip,
  Grid,
  alpha,
  LinearProgress
} from '@mui/material'
import Icon from 'src/@core/components/icon'
import DeleteDialog from './DeleteDialog'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  resetPurchaseOrder,
  resetPurchaseOrderFilters,
  setActionPurchaseOrder,
  setLoading,
  setPurchaseOrderFilters,
  setUpdatePurchaseOrder
} from 'src/store/apps/purchaseorder'
import CustomNoRowsOverlay from 'src/common-components/CustomNoRowsOverlay'
import {
  dataTextStyles,
  dataTitleStyles,
  DateFunction,
  findObjectByCurrencyId,
  hasPermission,
  lastMonthDate,
  NumberFormat,
  rowStatusChip,
  toTitleCase
} from 'src/common-functions/utils/UtilityFunctions'
import CommonStyledMenu from 'src/common-components/CommonStyledMenu'
import { useIsLaptop, useIsMobile } from 'src/hooks/IsDesktop'
import {
  DELETE_PURCHASE_ORDER,
  STATUS_DRAFT,
  MANAGE_PURCHASE_ORDER,
  EDIT_PURCHASE_ORDER,
  VIEW_PURCHASE_ORDER
} from 'src/common-functions/utils/Constants'
import {
  getPurchaseOrdersByDateRangeQuery,
  UndoPurchaseOrderStageQuery
} from 'src/@core/components/graphql/purchase-order-queries'
import { fetchData, writeData } from 'src/common-functions/GraphqlOperations'
import SendCopyDrawer from './SendCopyDrawer'
import { PrintPurchaseOrder } from './PrintPurchaseOrder'
import { useReactToPrint } from 'react-to-print'
import FilterDateRange from 'src/common-components/FilterDateRange'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import CustomTextField from 'src/@core/components/mui/text-field'
import CommonVendorPopup from 'src/common-components/CommonVendorPopup'
import useCurrencies from 'src/hooks/getData/useCurrencies'
import { createAlert } from 'src/store/apps/alerts'
import RefreshIcon from '@mui/icons-material/Refresh'
import MovetoNextStategePopup from './MovetoNextStategePopup'
import MobileDataGrid from 'src/common-components/MobileDataGrid'
import StyledButton from 'src/common-components/StyledMuiButton'
import { Close } from '@mui/icons-material'
import CustomChip from 'src/@core/components/mui/chip'

const PurchaseOrderListTable = ({ tenantId, purchaseOrderData, loading }) => {
  const router = Router
  const dispatch = useDispatch()
  const isMobileView = useIsMobile()
  const isLaptop = useIsLaptop()
  const moduleFilterDateDuration = useSelector(
    state => state.otherSettings?.data?.moduleFilterDateDuration || undefined
  )
  const {
    startDate: rawStartDate,
    endDate: rawEndDate,
    status,
    selectedVendor
  } = useSelector(state => state.purchaseOrder?.filters ?? {})

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
    selectedVendor: Boolean(selectedVendor),
    status: Boolean(status)
  }

  const anyFilterActive = Object.values(filters).some(Boolean)

  // State for active filters
  const [isFilterActive, setFilterActive] = useState({
    filterActive: anyFilterActive,
    ...filters
  })

  const componentRef = useRef(null)
  const [openDialog, setOpenDialog] = useState(false)
  const { currencies } = useCurrencies()
  const [selectedPurchaseOrder, setSelectedPurchaseOrder] = useState('')
  const [openSendCopyDrawer, setOpenSendCopyDrawer] = useState(false)
  const { vendors = [], purchaseOrders = [] } = purchaseOrderData || {}
  const userProfile = useSelector(state => state.userProfile)

  const order = useSelector(state => state.purchaseOrder?.selectedPurchaseOrder) || {}
  const [anchorElMap, setAnchorElMap] = useState({})
  const [openVendorDialog, setOpenVendorDialog] = useState(false)
  const [vendorForDialog, setVendorForDialog] = useState({})
  const handlePrint = useReactToPrint({
    content: () => componentRef.current
  })
  const [filteredPO, setFilteredPO] = useState([])
  const [temporaryFilterData, setTemporaryFilterData] = useState([])

  const [searchedPO, setSearchedPO] = useState(null)
  const tenant = useSelector(state => state.tenants?.selectedTenant)
  const PurchaseStatuses = [...new Set(purchaseOrders?.map(item => item.status))]

  const handleClick = (event, row) => {
    dispatch(setActionPurchaseOrder(row))
    const updatedAnchorElMap = { ...anchorElMap }
    updatedAnchorElMap[row.orderId] = event.currentTarget
    setAnchorElMap(updatedAnchorElMap)
  }

  const handleClose = row => {
    const updatedAnchorElMap = { ...anchorElMap }
    updatedAnchorElMap[row.orderId] = null
    setAnchorElMap(updatedAnchorElMap)
  }

  const handleDelete = row => {
    setSelectedPurchaseOrder(row)
    handleClose(row)
    setOpenDialog(true)
  }

  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)

  const handleFilterClick = event => {
    setAnchorEl(event.currentTarget)
  }

  const handleFilterClose = () => {
    const {
      status: isStatusActive,
      selectedVendor: isVendorActive,
      startDate: isStartDateActive,
      endDate: isEndDateActive
    } = isFilterActive
    updateFilter('status', isStatusActive ? status : null)
    updateFilter('selectedVendor', isVendorActive ? selectedVendor : null)
    updateFilter('startDate', isStartDateActive ? startDate : null)
    updateFilter('endDate', isEndDateActive ? endDate : null)
    setAnchorEl(null)
  }

  const [openMovetoNextStageDialog, setOpenMovetoNextStageDialog] = useState(false)

  const UndoStage = async data => {
    const updatedAnchorElMap = { ...anchorElMap }
    updatedAnchorElMap[data.orderId] = null
    setAnchorElMap(updatedAnchorElMap)
    const { tenantId, orderId } = data
    const stageName = data?.currentStage
    dispatch(setLoading(true))
    try {
      const response = await writeData(UndoPurchaseOrderStageQuery(), { tenantId, orderId, stageName })
      if (response.undoPurchaseOrderStage) {
        dispatch(setUpdatePurchaseOrder(response.undoPurchaseOrderStage))
        dispatch(createAlert({ message: 'Moved Order to Previous Stage successfully!', type: 'success' }))
      } else {
        const errorMessage = response?.errors?.[0] ? response.errors[0].message : 'Failed to move to previous stage!'
        dispatch(createAlert({ message: errorMessage, type: 'error' }))
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      dispatch(setLoading(false))
    }
  }
  const MoveToNextStage = row => {
    setOpenMovetoNextStageDialog(true)
    setSelectedPurchaseOrder(row)

    const updatedAnchorElMap = { ...anchorElMap }
    updatedAnchorElMap[row.orderId] = null
    setAnchorElMap(updatedAnchorElMap)
  }

  const OpenSendCopyDrawer = row => {
    setOpenSendCopyDrawer(true)

    const updatedAnchorElMap = { ...anchorElMap }
    updatedAnchorElMap[row.orderId] = null
    setAnchorElMap(updatedAnchorElMap)
  }

  useEffect(() => {
    handleDateRange(startDate, endDate)
  }, [purchaseOrders])

  const handleDateRange = async (startDate, endDate, overrides = {}) => {
    let purchaseOrderFilter = purchaseOrders
    const { selectedVendor: vendorOverride = selectedVendor, status: statusOverride = status } = overrides
    const isStartDate = startDate.toDateString() !== oneMonthAgoDate.toDateString()
    const isEndDate = endDate.toDateString() !== todayDate.toDateString()
    const isFilterVendor = Boolean(vendorOverride)
    const isFilterStatus = Boolean(statusOverride)
    const anyFilterActive = isStartDate || isEndDate || isFilterVendor || isFilterStatus

    try {
      if (isStartDate || isEndDate) {
        const response = await fetchData(
          getPurchaseOrdersByDateRangeQuery(tenantId, DateFunction(startDate), DateFunction(endDate))
        )

        purchaseOrderFilter = response?.getPurchaseOrdersByDateRange
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
          selectedVendor: isFilterVendor,
          status: isFilterStatus
        })
        if (anyFilterActive) {
          setTemporaryFilterData(filteredData)
          setFilteredPO(filteredData)
        } else {
          setTemporaryFilterData([])
          setFilteredPO([])
        }
        setSearchedPO('')
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
    dispatch(setPurchaseOrderFilters({ [key]: value }))
  }

  const handleReset = async () => {
    setAnchorEl(null)
    dispatch(resetPurchaseOrderFilters())
    setFilterActive({
      filterActive: false,
      startDate: false,
      endDate: false,
      selectedVendor: false,
      status: false
    })
    setFilteredPO([])
    setTemporaryFilterData([])
    setSearchedPO('')
  }

  const mobileColumns = [
    {
      field: 'orderNo',
      headerName: '',
      flex: 1,
      sortable: false,
      renderCell: ({ row }) => {
        const vendor = vendors?.find(item => item?.vendorId === row?.vendorId) || {}
        return (
          <Box sx={{ width: '100%', p: 2 }}>
            <Grid container spacing={3} sx={{ alignItems: { xs: 'flex-start', lg: 'center' } }}>
              <Grid item xs={11}>
                <Grid container spacing={3} sx={{ alignItems: 'center' }}>
                  <Grid item xs={12} sm={12} md={4} lg={4} sx={{ pl: 3 }}>
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
                      <span style={{ verticalAlign: 'middle', marginRight: '5px' }}>#</span>
                      {row.orderNoPrefix}
                      {row.orderNo}{' '}
                    </Typography>
                    {/* </Box> */}
                    <Typography sx={{ ...dataTitleStyles, color: '#818181' }}>{row?.notes}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3} md={2} lg={2}>
                    <Typography sx={dataTextStyles}>{DateFunction(row?.orderDate) || '-'}</Typography>
                    <Typography sx={dataTitleStyles}>Date</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3} md={2} lg={2}>
                    {rowStatusChip(row?.status) || '-'}
                    <Typography sx={dataTitleStyles}>Status</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3} md={2} lg={2}>
                    {rowStatusChip(row?.paymentStatus) || '-'}
                    <Typography sx={dataTitleStyles}>Payment Status</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3} md={2} lg={2}>
                    {row?.totalAmount ? (
                      <NumberFormat
                        value={row?.totalAmount}
                        currency={findObjectByCurrencyId(currencies, row?.totalAmountCurrency)}
                      />
                    ) : (
                      '-'
                    )}
                    <Typography sx={dataTitleStyles}>Amount</Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={1}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  {isLaptop && (
                    <>
                      {hasPermission(userProfile, VIEW_PURCHASE_ORDER) && (
                        <IconButton
                          component={Link}
                          href={`/purchases/purchase-order/view/${row?.orderId}`}
                          onClick={event => dispatch(setActionPurchaseOrder(row))}
                        >
                          <Icon icon='tabler:eye' />
                        </IconButton>
                      )}
                      {hasPermission(userProfile, EDIT_PURCHASE_ORDER) && (
                        <IconButton
                          component={Link}
                          href={`/purchases/purchase-order/edit/${row?.orderId}`}
                          onClick={event => dispatch(setActionPurchaseOrder(row))}
                        >
                          <Icon icon='tabler:edit' />
                        </IconButton>
                      )}
                    </>
                  )}
                  <IconButton onClick={event => handleClick(event, row)}>
                    <Icon
                      icon='iconamoon:menu-kebab-vertical-circle-light'
                      width={!isMobileView ? 25 : 27}
                      height={!isMobileView ? 25 : 27}
                    />
                  </IconButton>
                </Box>
                <CommonStyledMenu
                  anchorEl={anchorElMap[row.orderId]}
                  open={Boolean(anchorElMap[row.orderId])}
                  onClose={() => handleClose(row)}
                >
                  {hasPermission(userProfile, VIEW_PURCHASE_ORDER) && !isLaptop && (
                    <MenuItem component={Link} href={`/purchases/purchase-order/view/${row?.orderId}`}>
                      <Icon icon='tabler:eye' /> View
                    </MenuItem>
                  )}
                  {hasPermission(userProfile, EDIT_PURCHASE_ORDER) && !isLaptop && (
                    <MenuItem component={Link} href={`/purchases/purchase-order/edit/${row?.orderId}`}>
                      <Icon icon='tabler:edit' /> Edit
                    </MenuItem>
                  )}
                  {hasPermission(userProfile, MANAGE_PURCHASE_ORDER) && row?.undoCurrentStage && (
                    <MenuItem onClick={() => UndoStage(row)}>
                      <Icon icon='iconamoon:do-undo-light' />
                      Undo Stage {toTitleCase(row?.currentStage)}
                    </MenuItem>
                  )}
                  {hasPermission(userProfile, MANAGE_PURCHASE_ORDER) && row?.moveToNextStage && (
                    <MenuItem onClick={() => MoveToNextStage(row)}>
                      <Icon icon='solar:forward-outline' />
                      Move to {toTitleCase(row?.nextStage)}
                    </MenuItem>
                  )}
                  {hasPermission(userProfile, MANAGE_PURCHASE_ORDER) && (
                    <MenuItem onClick={() => OpenSendCopyDrawer(row)}>
                      <Icon icon='iconoir:send' /> Send Order
                    </MenuItem>
                  )}
                  {hasPermission(userProfile, MANAGE_PURCHASE_ORDER) && row?.status !== STATUS_DRAFT && (
                    <MenuItem onClick={() => handlePrint()}>
                      <Icon icon='ion:print-outline' /> Print Order
                    </MenuItem>
                  )}

                  {hasPermission(userProfile, DELETE_PURCHASE_ORDER) && row?.status === STATUS_DRAFT && (
                    <MenuItem
                      onClick={() => handleDelete(row)}
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

  const handleSearchChange = (event, newValue) => {
    const searchValue = newValue ? newValue.toLowerCase() : ''
    console.log('searchValue', searchValue)

    if (searchValue) {
      const matchedPO = purchaseOrders.filter(order => {
        const vendor = vendors.find(vend => vend.vendorId === order.vendorId)
        const vendorName = vendor ? vendor.displayName.toLowerCase() : ''
        const totalAmount = order.totalAmount ? order.totalAmount.toString().toLowerCase() : ''

        return (
          order.orderNo.toLowerCase().includes(searchValue) ||
          vendorName.includes(searchValue) ||
          totalAmount.includes(searchValue)
        )
      })

      setFilteredPO(matchedPO.length > 0 ? matchedPO : temporaryFilterData)
    } else {
      setFilteredPO(temporaryFilterData)
      setSearchedPO(null)
    }
  }
  return (
    <>
      <Grid container spacing={2} sx={{ justifyContent: 'space-between', mb: 3 }}>
        <Grid item xs={7} sm={4} md={4} lg={4} xl={4}>
          <CustomAutocomplete
            options={filteredPO.length > 0 || isFilterActive.filterActive ? filteredPO : purchaseOrders}
            getOptionLabel={option => {
              if (!option) return ''

              const vendor = vendors.find(cust => cust.vendorId === option.vendorId)

              // const vendorName = vendor ? vendor.vendorName : ''
              const displayName = vendor?.displayName || ''

              // const displayNameText = displayName && displayName !== vendorName ? ` (${displayName})` : ''

              const currencyObj = currencies.find(cur => cur.currencyId === option.currency)
              const currencySymbol = currencyObj ? currencyObj.symbol : ''

              const formattedAmount =
                option.totalAmount && currencySymbol ? `-${currencySymbol} ${option.totalAmount.toLocaleString()}` : ''

              return `${displayName} - ${tenant.displayName} - ${option.orderNo} ${formattedAmount}`.trim()
            }}
            filterOptions={options => options}
            value={purchaseOrders?.find(option => option.orderId === searchedPO?.orderId) || null}
            onChange={(event, newValue) => {
              setFilteredPO(newValue ? [newValue] : temporaryFilterData)
              setSearchedPO(newValue)
            }}
            onInputChange={(event, newValue) => {
              if (newValue && newValue.trim() !== '') {
                handleSearchChange(event, newValue)
              }
            }}
            disableClearable={false}
            renderInput={params => <CustomTextField {...params} fullWidth label='Purchase Orders' />}
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
                  dispatch(resetPurchaseOrder())
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
                  <Button type='button' onClick={() => updateFilter('status', null)}>
                    Reset
                  </Button>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 4, mb: 2 }}>
                  <CustomAutocomplete
                    fullWidth
                    options={PurchaseStatuses}
                    value={status ? toTitleCase(status) : status}
                    onChange={(event, newValue) => updateFilter('status', newValue)}
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
                  <Button type='button' onClick={() => updateFilter('selectedVendor', null)}>
                    Reset
                  </Button>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 4, mb: 2 }}>
                  <CustomAutocomplete
                    fullWidth
                    options={vendors}
                    value={selectedVendor}
                    onChange={(event, newValue) => {
                      updateFilter('selectedVendor', newValue)
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
        {(isFilterActive.selectedVendor ||
          isFilterActive.status ||
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
                {selectedVendor && isFilterActive.selectedVendor && (
                  <CustomChip
                    label={`Vendor: ${selectedVendor.displayName}`}
                    onDelete={() => {
                      updateFilter('selectedVendor', null)
                      handleFilters({ selectedVendor: null })
                    }}
                    deleteIcon={<Close sx={{ color: theme => theme.palette.primary.main }} />}
                    skin='light'
                    color='primary'
                  />
                )}
                {status && isFilterActive.status && (
                  <CustomChip
                    label={`Status: ${toTitleCase(status)}`}
                    onDelete={() => {
                      updateFilter('status', null)
                      handleFilters({ status: null })
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
          rows={filteredPO.length > 0 || isFilterActive.filterActive ? filteredPO : purchaseOrders}
          columns={mobileColumns}
          getRowId={row => row?.orderId}
          initialState={{
            sorting: {
              sortModel: [{ field: 'orderNo', sort: 'desc' }]
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
            if (event.target.closest('.MuiIconButton-root')) {
              event.defaultMuiPrevented = true
              return
            }
            dispatch(setActionPurchaseOrder(params.row))
            router.push(`/purchases/purchase-order/view/${params?.row?.orderId}`)
          }}
          slots={{
            columnHeaders: () => null,
            noRowsOverlay: CustomNoRowsOverlay
          }}
          slotProps={{
            noRowsOverlay: {
              mainText: 'Empty Purchase Orders',
              subText: 'No purchase order available here. Click "Add New" button above to get started.'
            }
          }}
        />
      )}

      <div style={{ position: 'fixed', top: '100%', left: '100%', transform: 'translate(100%, 100%)' }}>
        <PrintPurchaseOrder ref={componentRef} data={purchaseOrderData} />
      </div>
      {openSendCopyDrawer && (
        <SendCopyDrawer
          order={order}
          setOpenSendCopyDrawer={setOpenSendCopyDrawer}
          openSendCopyDrawer={openSendCopyDrawer}
        />
      )}
      {openDialog && (
        <DeleteDialog
          tenantId={tenantId}
          orderId={selectedPurchaseOrder?.orderId}
          openDialog={openDialog}
          setOpenDialog={setOpenDialog}
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
        <MovetoNextStategePopup
          tenantId={tenantId}
          selectedPurchaseOrder={selectedPurchaseOrder}
          open={openMovetoNextStageDialog}
          setOpen={setOpenMovetoNextStageDialog}
        />
      )}
    </>
  )
}

export default PurchaseOrderListTable
