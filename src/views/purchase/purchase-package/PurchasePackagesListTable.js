import { Close } from '@mui/icons-material'
import RefreshIcon from '@mui/icons-material/Refresh'
import {
  alpha,
  Box,
  Button,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  MenuItem,
  Popover,
  Tooltip,
  Typography
} from '@mui/material'
import Link from 'next/link'
import Router from 'next/router'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useReactToPrint } from 'react-to-print'
import {
  getPurchaseOrderPackagesByDateRangeQuery,
  undoPurchaseOrderPackageStageQuery
} from 'src/@core/components/graphql/purchase-order-packages-queries'
import { getPurchaseOrdersByVendorToBePackagedQuery } from 'src/@core/components/graphql/purchase-order-queries'
import Icon from 'src/@core/components/icon'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import CustomChip from 'src/@core/components/mui/chip'
import CustomTextField from 'src/@core/components/mui/text-field'
import CommonPOPopup from 'src/common-components/CommonPOPopup'
import CommonStyledMenu from 'src/common-components/CommonStyledMenu'
import CommonVendorPopup from 'src/common-components/CommonVendorPopup'
import CustomNoRowsOverlay from 'src/common-components/CustomNoRowsOverlay'
import FilterDateRange from 'src/common-components/FilterDateRange'
import MobileDataGrid from 'src/common-components/MobileDataGrid'
import StyledButton from 'src/common-components/StyledMuiButton'
import { fetchData, writeData } from 'src/common-functions/GraphqlOperations'
import {
  DELETE_PURCHASE_PACKAGE,
  EDIT_PURCHASE_PACKAGE,
  STATUS_DRAFT,
  VIEW_PURCHASE_PACKAGE
} from 'src/common-functions/utils/Constants'
import {
  dataTextStyles,
  dataTitleStyles,
  DateFunction,
  hasPermission,
  lastMonthDate,
  NumberFormat,
  rowStatusChip,
  toTitleCase
} from 'src/common-functions/utils/UtilityFunctions'
import usePurchaseOrders from 'src/hooks/getData/usePurchaseOrders'
import { useIsLaptop } from 'src/hooks/IsDesktop'
import { createAlert } from 'src/store/apps/alerts'
import {
  resetPurchaseOrderPackageFilters,
  resetPurchasePackage,
  setLoading,
  setPurchaseOrderPackageFilters,
  setSelectedPurchasePackage,
  setUpdatePurchasePackage
} from 'src/store/apps/purchase-packages'
import DeletePurchasePackage from './DeletePurchasePackage'
import MovetoNextStagePurchasePackage from './MovetoNextStagePurchasePackage'
import { PrintPurchasePackage } from './PrintPurchasePackage'

const PurchasePackagesListTable = ({ tenantId, purchaseData, loading }) => {
  const router = Router
  const dispatch = useDispatch()
  const isLaptop = useIsLaptop()
  const userProfile = useSelector(state => state.userProfile)
  const { reloadPurchaseOrderInStore } = usePurchaseOrders(tenantId)
  const [filteredPackages, setFilteredPackages] = useState([])
  const [searchedPackage, setSearchedPackage] = useState(null)
  const { currencies = [], vendors = [], purchasePackages = [] } = purchaseData || {}
  const moduleFilterDateDuration = useSelector(
    state => state.otherSettings?.data?.moduleFilterDateDuration || undefined
  )
  const {
    startDate: rawStartDate,
    endDate: rawEndDate,
    filterStatus,
    filterVendor
  } = useSelector(state => state.purchasePackage?.filters ?? {})

  const componentRef = useRef(null)
  const handlePrint = useReactToPrint({
    content: () => componentRef.current
  })

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

  const [vendorDialogState, setVendorDialogState] = useState({
    open: false,
    selectedVendorId: null
  })

  const [openDialog, setOpenDialog] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState({})
  const [temporaryFilterData, setTemporaryFilterData] = useState([])

  const [anchorElMap, setAnchorElMap] = useState({})
  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)
  const PackageStatuses = [...new Set(purchasePackages?.map(item => item.status))]

  const handleClick = (event, row) => {
    setSelectedPackage(row)
    dispatch(setSelectedPurchasePackage(row))
    const updatedAnchorElMap = { ...anchorElMap }
    updatedAnchorElMap[row?.packageId] = event.currentTarget
    setAnchorElMap(updatedAnchorElMap)
  }

  const handleClose = row => {
    const updatedAnchorElMap = { ...anchorElMap }
    updatedAnchorElMap[row?.packageId] = null
    setAnchorElMap(updatedAnchorElMap)
  }

  const [purchaseOrders, setPurchaseOrders] = useState([])

  const getPurchaseOrders = async () => {
    const vendorId = selectedPackage?.vendorId
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
  }, [selectedPackage?.purchaseOrderId])

  const purchaseOrder = purchaseOrders.find(order => order.orderId === selectedPackage.purchaseOrderId)

  const handleDelete = row => {
    setSelectedPackage(row)
    handleClose(row)
    setOpenDialog(true)
  }

  const [dialogState, setDialogState] = useState({
    open: false,
    selectedOrderId: null
  })
  const [openMovetoNextStageDialog, setOpenMovetoNextStageDialog] = useState(false)

  const MoveToNextStage = row => {
    setOpenMovetoNextStageDialog(true)
    setSelectedPackage(row)

    const updatedAnchorElMap = { ...anchorElMap }
    updatedAnchorElMap[row.packageId] = null
    setAnchorElMap(updatedAnchorElMap)
  }

  const UndoStage = async data => {
    const updatedAnchorElMap = { ...anchorElMap }
    updatedAnchorElMap[data.packageId] = null
    setAnchorElMap(updatedAnchorElMap)
    const { tenantId, packageId } = data
    const stageName = data?.currentStage
    dispatch(setLoading(true))
    try {
      const response = await writeData(undoPurchaseOrderPackageStageQuery(), { tenantId, packageId, stageName })
      if (response.undoPurchaseOrderPackageStage) {
        dispatch(setUpdatePurchasePackage(response.undoPurchaseOrderPackageStage))
        await reloadPurchaseOrderInStore(response?.undoPurchaseOrderPackageStage?.purchaseOrderId)
        dispatch(createAlert({ message: 'Moved Package to Previous Stage successfully!', type: 'success' }))
      } else {
        const errorMessage = response.errors[0] ? response.errors[0].message : 'Failed to move to previous stage!'
        dispatch(createAlert({ message: errorMessage, type: 'error' }))
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      dispatch(setLoading(false))
    }
  }

  const columns = [
    {
      field: 'packageNo',
      headerName: '',
      flex: 1,
      sortable: false,
      renderCell: ({ row }) => {
        const viewPermission = hasPermission(userProfile, VIEW_PURCHASE_PACKAGE)
        const editPermission = hasPermission(userProfile, EDIT_PURCHASE_PACKAGE)
        const deletePermission = hasPermission(userProfile, DELETE_PURCHASE_PACKAGE)
        const currency = currencies?.find(item => item?.currencyId === row?.currency)
        const vendor = vendors?.find(item => item?.vendorId === row?.vendorId) || {}
        return (
          <Box sx={{ width: '100%', p: 2 }}>
            <Grid container spacing={3} sx={{ alignItems: { xs: 'flex-start', md: 'center' } }}>
              <Grid item xs={11}>
                <Grid container spacing={3} sx={{ alignItems: 'center' }}>
                  <Grid item xs={6} sm={2} md={2} lg={2} xl={4.5}>
                    <StyledButton
                      color='primary'
                      onClick={event => {
                        event.stopPropagation()
                        setVendorDialogState({ open: true, selectedVendorId: row?.vendorId })
                      }}
                    >
                      {vendor?.displayName}
                    </StyledButton>

                    <Typography sx={{ ...dataTitleStyles, color: '#000' }}>
                      <span style={{ verticalAlign: 'middle', marginRight: '5px' }}>#</span> {row.packageNoPrefix}
                      {row.packageNo}
                    </Typography>
                    <Typography sx={{ ...dataTitleStyles, color: '#818181' }}>{row?.notes}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={2} md={2} lg={2} xl={1.5}>
                    <Box sx={{ color: '#959595' }}>
                      Order:{'  '}
                      <StyledButton
                        color='primary'
                        onClick={() => setDialogState({ open: true, selectedOrderId: row?.purchaseOrderId })}
                      >
                        #{row?.purchaseOrderNoPrefix}
                        {row?.purchaseOrderNo}
                      </StyledButton>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={2} md={2} lg={2} xl={1.5}>
                    <Typography sx={dataTextStyles}>{DateFunction(row?.packageDate) || '-'}</Typography>
                    <Typography sx={dataTitleStyles}>Package Date</Typography>
                  </Grid>

                  <Grid item xs={6} sm={3} md={2} lg={2} xl={1.5}>
                    <Typography sx={dataTextStyles}>{row?.totalPackageQty || '-'}</Typography>
                    <Typography sx={dataTitleStyles}>Total Package Qty</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3} md={2} lg={2} xl={1.5}>
                    {row?.totalPackageValue ? (
                      <Typography sx={dataTextStyles}>
                        <NumberFormat value={row?.totalPackageValue} currency={currency} />{' '}
                      </Typography>
                    ) : (
                      '-'
                    )}
                    <Typography sx={dataTitleStyles}>Total Package Value</Typography>
                  </Grid>
                  <Grid item xs={6} sm={2} md={2} lg={2} xl={1.5}>
                    {rowStatusChip(row?.status) || '-'}
                    <Typography sx={dataTitleStyles}>Status</Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={1}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                  {isLaptop && (
                    <>
                      {viewPermission && (
                        <IconButton
                          component={Link}
                          scroll={true}
                          href={`/purchases/packages/view/${row?.packageId}`}
                          onClick={event => {
                            event.stopPropagation()
                            dispatch(setSelectedPurchasePackage(row))
                          }}
                        >
                          <Icon icon='tabler:eye' />
                        </IconButton>
                      )}
                      {editPermission && (
                        <IconButton
                          component={Link}
                          scroll={true}
                          href={`/purchases/packages/edit/${row?.packageId}`}
                          onClick={event => {
                            event.stopPropagation()
                            dispatch(setSelectedPurchasePackage(row))
                          }}
                        >
                          <Icon icon='tabler:edit' />
                        </IconButton>
                      )}
                    </>
                  )}
                  {/* {row?.status !== STATUS_DRAFT && ( */}
                  <>
                    <IconButton
                      aria-label='more'
                      id='long-button'
                      aria-haspopup='true'
                      onClick={event => {
                        event.stopPropagation()
                        handleClick(event, row)
                      }}
                      disabled={!row?.undoCurrentStage && !row?.moveToNextStage && isLaptop}
                    >
                      <Icon icon='iconamoon:menu-kebab-vertical-circle-light' width={25} height={25} />
                    </IconButton>
                    <CommonStyledMenu
                      anchorEl={anchorElMap[row.packageId]}
                      open={Boolean(anchorElMap[row.packageId])}
                      onClose={() => handleClose(row)}
                    >
                      {viewPermission && !isLaptop && (
                        <MenuItem
                          component={Link}
                          href={`/purchases/packages/view/${row?.packageId}`}
                          onClick={() => dispatch(setSelectedPurchasePackage(row))}
                        >
                          <Icon icon='tabler:eye' /> View
                        </MenuItem>
                      )}
                      {editPermission && !isLaptop && (
                        <MenuItem
                          component={Link}
                          href={`/purchases/packages/edit/${row?.packageId}`}
                          onClick={() => dispatch(setSelectedPurchasePackage(row))}
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
                      <MenuItem onClick={() => handlePrint()}>
                        <Icon icon='ion:print-outline' /> Print Order
                      </MenuItem>
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
                  </>
                  {/* )} */}
                </Box>
              </Grid>
            </Grid>
          </Box>
        )
      }
    }
  ]
  const handleFilterClose = () => {
    const filter = {
      status: isFilterActive.status ? status : null,
      filterVendor: isFilterActive.filterVendor ? filterVendor : null,
      startDate: isFilterActive.startDate ? startDate : null,
      endDate: isFilterActive.endDate ? endDate : null
    }
    dispatch(setPurchaseOrderPackageFilters(filter))
    setAnchorEl(null)
  }

  const handleSearchChange = (event, newValue) => {
    const searchValue = newValue ? newValue.toLowerCase() : ''

    if (searchValue) {
      const matchedSO = purchasePackages.filter(pack => {
        const vendor = vendors.find(vend => vend.vendorId === pack.vendorId)
        const vendorName = vendor ? vendor.displayName.toLowerCase() : ''

        return (
          pack.packageNo.toLowerCase().includes(searchValue) ||
          (pack.purchaseOrderNo && pack.purchaseOrderNo.toLowerCase().includes(searchValue)) ||
          vendorName.includes(searchValue)
        )
      })

      setFilteredPackages(matchedSO.length > 0 ? matchedSO : temporaryFilterData)
    } else {
      setFilteredPackages(temporaryFilterData)
      setSearchedPackage('')
    }
  }

  useEffect(() => {
    handleDateRange(startDate, endDate)
  }, [purchasePackages])

  const handleDateRange = async (startDate, endDate, overrides = {}) => {
    let purchaseOrderFilter = purchasePackages
    const { filterVendor: vendorOverride = filterVendor, filterStatus: statusOverride = filterStatus } = overrides

    try {
      const isStartDate = startDate.toDateString() !== oneMonthAgoDate.toDateString()
      const isEndDate = endDate.toDateString() !== todayDate.toDateString()
      const isFilterVendor = Boolean(vendorOverride)
      const isFilterStatus = Boolean(statusOverride)
      const anyFilterActive = isStartDate || isEndDate || isFilterVendor || isFilterStatus

      if (isStartDate || isEndDate) {
        const response = await fetchData(
          getPurchaseOrderPackagesByDateRangeQuery(tenantId, DateFunction(startDate), DateFunction(endDate))
        )
        purchaseOrderFilter = response?.getPurchaseOrderPackagesByDateRange || []
        // purchaseOrderFilter = await fetchSalesOrders(startDate, endDate)
      }

      if (purchaseOrderFilter) {
        const filteredData = purchaseOrderFilter?.filter(item => {
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
        setFilteredPackages(anyFilterActive ? filteredData : [])

        setSearchedPackage('')
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
    dispatch(setPurchaseOrderPackageFilters({ [key]: value }))
  }

  const handleReset = async () => {
    setAnchorEl(null)
    dispatch(resetPurchaseOrderPackageFilters())

    setFilterActive({
      filterActive: false,
      startDate: false,
      endDate: false,
      filterVendor: false,
      filterStatus: false
    })
    setFilteredPackages([])
    setTemporaryFilterData([])
    setSearchedPackage('')
  }

  const handleFilterClick = event => {
    setAnchorEl(event.currentTarget)
  }

  return (
    <>
      <Grid container spacing={2} sx={{ justifyContent: 'space-between', mb: 3 }}>
        <Grid item xs={7} sm={4} md={4} lg={4} xl={4}>
          <CustomAutocomplete
            options={filteredPackages.length > 0 || isFilterActive.filterActive ? filteredPackages : purchasePackages}
            getOptionLabel={option => {
              if (!option) return ''

              const vendor = vendors.find(cust => cust.vendorId === option.vendorId)
              const displayName = vendor?.displayName || ''
              const displayCompName = vendor?.companyName ? `-${vendor.companyName}` : ''

              return `${displayName}${displayCompName} - ${option.packageNo}`.trim()
            }}
            filterOptions={options => options}
            value={purchasePackages?.find(option => option.packageId === searchedPackage?.packageId) || null}
            onChange={(event, newValue) => {
              setFilteredPackages(newValue ? [newValue] : temporaryFilterData)
              setSearchedPackage(newValue)
            }}
            onInputChange={(event, newValue) => {
              if (newValue && newValue.trim() !== '') {
                handleSearchChange(event, newValue)
              }
            }}
            disableClearable={false}
            renderInput={params => <CustomTextField {...params} fullWidth label='Packages' />}
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
                  dispatch(resetPurchasePackage())
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

                <Box sx={{ display: 'flex', gap: 4, alignItems: 'center', justifyContent: 'space-between', px: 4 }}>
                  <FilterDateRange label='From' date={startDate} setDate={date => updateFilter('startDate', date)} />
                  <FilterDateRange label='To' date={endDate} setDate={date => updateFilter('endDate', date)} />
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
                    options={PackageStatuses}
                    value={filterStatus ? toTitleCase(filterStatus) : filterStatus}
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
                      updateFilter('startDate', oneMonthAgoDate)
                      updateFilter('endDate', todayDate)
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
          rows={filteredPackages.length > 0 || isFilterActive.filterActive ? filteredPackages : purchasePackages}
          columns={columns}
          getRowId={row => row?.packageId}
          initialState={{
            sorting: {
              sortModel: [{ field: 'packageNo', sort: 'desc' }]
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
            dispatch(setSelectedPurchasePackage(params.row))
            router.push(`/purchases/packages/view/${params?.row?.packageId}`)
          }}
          slots={{
            columnHeaders: () => null,
            noRowsOverlay: CustomNoRowsOverlay
          }}
          slotProps={{
            noRowsOverlay: {
              mainText: 'Empty Purchase Packages',
              subText: 'No purchase packages available here. Click "Add New" button above to get started.'
            }
          }}
        />
      )}

      {openDialog && (
        <DeletePurchasePackage
          tenantId={tenantId}
          packageId={selectedPackage?.packageId}
          openDialog={openDialog}
          setOpenDialog={setOpenDialog}
        />
      )}

      {dialogState.open && (
        <CommonPOPopup
          orderId={dialogState.selectedOrderId}
          open={dialogState.open}
          onClose={() => setDialogState({ open: false, selectedOrderId: null })}
        />
      )}

      {vendorDialogState?.open && (
        <CommonVendorPopup
          vendorId={vendorDialogState?.selectedVendorId}
          openVendorDialog={vendorDialogState?.open}
          setOpenVendorDialog={() => setVendorDialogState({ open: false, selectedVendorId: null })}
        />
      )}

      {openMovetoNextStageDialog && (
        <MovetoNextStagePurchasePackage
          tenantId={tenantId}
          selectedPackage={selectedPackage}
          open={openMovetoNextStageDialog}
          setOpen={setOpenMovetoNextStageDialog}
        />
      )}
      <div style={{ position: 'fixed', top: '100%', left: '100%', transform: 'translate(100%, 100%)' }}>
        <PrintPurchasePackage ref={componentRef} data={purchaseData} order={purchaseOrder} />
      </div>
    </>
  )
}

export default PurchasePackagesListTable
