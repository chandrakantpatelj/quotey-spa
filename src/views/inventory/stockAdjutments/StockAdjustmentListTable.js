// ** Next Import
import Link from 'next/link'
// ** MUI Imports
import {
  Box,
  Button,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  MenuItem,
  Popover,
  Typography,
  alpha,
  useTheme
} from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import { useEffect, useMemo, useState } from 'react'
import Icon from 'src/@core/components/icon'
import { useDispatch, useSelector } from 'react-redux'
import CustomNoRowsOverlay from 'src/common-components/CustomNoRowsOverlay'
import CommonStyledMenu from 'src/common-components/CommonStyledMenu'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import useIsDesktop from 'src/hooks/IsDesktop'
import {
  dataTextStyles,
  dataTitleStyles,
  DateFunction,
  hasPermission,
  lastMonthDate,
  rowStatusChip,
  toTitleCase
} from 'src/common-functions/utils/UtilityFunctions'
import {
  resetStockFilters,
  setAllStockAdjustments,
  setError,
  setLoading,
  setSelectedStock,
  setStockFilters,
  setUpdateStock
} from 'src/store/apps/stock-adjustments'
import DeleteStock from './DeleteStock'
import { ArrowDownward, ArrowUpward, Close } from '@mui/icons-material'
import {
  DELETE_STOCK,
  EDIT_STOCK,
  MANAGE_STOCK,
  STATUS_CONFIRMED,
  VIEW_STOCK
} from 'src/common-functions/utils/Constants'
import {
  getStockAdjustmentsByDateRangeQuery,
  UndoStockAdjustmentConfirmationQuery
} from 'src/@core/components/graphql/stock-adjustment-queries'
import { fetchData, writeData } from 'src/common-functions/GraphqlOperations'
import { createAlert } from 'src/store/apps/alerts'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import FilterDateRange from 'src/common-components/FilterDateRange'
import useOtherSettings from 'src/hooks/getData/useOtherSettings'
import MobileDataGrid from 'src/common-components/MobileDataGrid'
import Router from 'next/router'
import CustomChip from 'src/@core/components/mui/chip'
import CustomTextField from 'src/@core/components/mui/text-field'

const StockAdjustmentListTable = ({ tenantId, adjutmentsData, loading }) => {
  const theme = useTheme()
  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)
  const router = Router
  const dispatch = useDispatch()
  const isDesktop = useIsDesktop()
  const [openDialog, setOpenDialog] = useState(false)
  const { stockAdjustments = [], warehouses = [] } = adjutmentsData || {}

  const moduleFilterDateDuration = useSelector(
    state => state.otherSettings?.data?.moduleFilterDateDuration || undefined
  )
  const {
    startDate: rawStartDate,
    endDate: rawEndDate,
    filterStatus
  } = useSelector(state => state.stockAdjustments?.filters ?? {})
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
    filterStatus: Boolean(filterStatus)
  }

  const anyFilterActive = Object.values(filters).some(Boolean)

  // State for active filters
  const [isFilterActive, setFilterActive] = useState({
    filterActive: anyFilterActive,
    ...filters
  })

  const [selecedStock, setSelecedStock] = useState('')
  const [anchorElMap, setAnchorElMap] = useState({})
  const userProfile = useSelector(state => state.userProfile)
  const [filteredStockAdjustments, setFilteredStockAdjustments] = useState([])

  const { fetchOtherSettings } = useOtherSettings(tenantId)
  const [otherSettings, setOtherSettings] = useState()
  const statuses = [...new Set(stockAdjustments?.map(item => item.status))]

  useEffect(() => {
    const getOtherSettings = async () => {
      const otherSettings = await fetchOtherSettings()
      setOtherSettings(otherSettings)
    }
    getOtherSettings()
  }, [fetchOtherSettings])

  const handleClick = (event, row) => {
    dispatch(setSelectedStock(row))
    const updatedAnchorElMap = { ...anchorElMap }
    updatedAnchorElMap[row.stockAdjustmentId] = event.currentTarget
    setAnchorElMap(updatedAnchorElMap)
  }

  const handleClose = row => {
    const updatedAnchorElMap = { ...anchorElMap }
    updatedAnchorElMap[row.stockAdjustmentId] = null
    setAnchorElMap(updatedAnchorElMap)
  }

  const handleDelete = row => {
    setSelecedStock(row)
    handleClose(row)
    setOpenDialog(true)
  }

  const UndoStatus = async data => {
    const updatedAnchorElMap = { ...anchorElMap }
    updatedAnchorElMap[data.stockAdjustmentId] = null
    setAnchorElMap(updatedAnchorElMap)
    const { tenantId, stockAdjustmentId } = data
    try {
      // setLoading(true)

      const response = await writeData(UndoStockAdjustmentConfirmationQuery(), { tenantId, stockAdjustmentId })
      if (response && response.undoStockAdjustmentConfirmation) {
        dispatch(setUpdateStock(response.undoStockAdjustmentConfirmation))

        dispatch(createAlert({ message: 'Status changed successfully!', type: 'success' }))
      } else {
        dispatch(createAlert({ message: 'Failed to undo the status', type: 'error' }))
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      // setLoading(false)
    }
  }

  const stockAdjustmentColumns = [
    {
      field: 'stockAdjustmentInfo',
      headerName: '',
      flex: 1,
      sortable: false,
      renderCell: ({ row }) => {
        return (
          <Box sx={{ width: '100%', p: 2 }}>
            <Grid container spacing={3} sx={{ alignItems: 'center', flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
              <Grid item xs={10.5}>
                <Grid container spacing={3} sx={{ alignItems: 'center', flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
                  <Grid item xs={12} sm={2} md={2} lg={2} xl={2}>
                    <Typography sx={dataTextStyles}>
                      {row?.adjustmentNoPrefix || ''}
                      {row?.adjustmentNo || ''}
                    </Typography>
                    <Typography sx={dataTitleStyles}>No</Typography>
                  </Grid>
                  <Grid item xs={6} sm={2} md={2} lg={2} xl={2}>
                    <Typography sx={dataTextStyles}>
                      {row?.adjustmentDate ? DateFunction(row?.adjustmentDate) : '-'}
                    </Typography>
                    <Typography sx={dataTitleStyles}>Date</Typography>
                  </Grid>
                  <Grid item xs={6} sm={2} md={2} lg={2} xl={2}>
                    <Typography sx={dataTextStyles}>
                      {warehouses?.find(item => item?.warehouseId === row?.warehouseId)?.name || '-'}
                    </Typography>
                    <Typography sx={dataTitleStyles}>Warehouse</Typography>
                  </Grid>
                  <Grid item xs={6} sm={2} md={2} lg={2} xl={2}>
                    <Typography sx={dataTextStyles}>{row?.reference || '-'}</Typography>
                    <Typography sx={dataTitleStyles}>Reference</Typography>
                  </Grid>
                  <Grid item xs={6} sm={2} md={2} lg={2} xl={2}>
                    <Typography
                      sx={{
                        display: 'flex',
                        gap: 2,
                        alignItems: 'center',
                        fontSize: '13px',
                        fontWeight: 500,
                        color:
                          row?.stockMovement === 'INWARD'
                            ? `${alpha(theme.palette.success.main, 0.9)} !important`
                            : row?.stockMovement === 'OUTWARD'
                            ? `${alpha(theme.palette.error.main, 0.9)} !important`
                            : 'inherit'
                      }}
                    >
                      <Box
                        component='span'
                        sx={{
                          width: '24px',
                          height: '24px',
                          background:
                            row?.stockMovement === 'INWARD'
                              ? `${alpha(theme.palette.success.main, 0.08)} !important`
                              : row?.stockMovement === 'OUTWARD'
                              ? `${alpha(theme.palette.error.main, 0.08)} !important`
                              : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          '& >svg': { fontSize: '16px' },
                          borderRadius: '50%'
                        }}
                      >
                        {row?.stockMovement === 'INWARD' ? (
                          <ArrowUpward />
                        ) : row?.stockMovement === 'OUTWARD' ? (
                          <ArrowDownward />
                        ) : (
                          '-'
                        )}
                      </Box>
                      {row?.stockMovement ? toTitleCase(row.stockMovement) : '-'}
                    </Typography>
                    <Typography sx={dataTitleStyles}>Stock Movement</Typography>
                  </Grid>
                  <Grid item xs={6} sm={2} md={2} lg={2} xl={2}>
                    <Typography sx={dataTextStyles}>
                      {row?.adjustmentItems?.reduce((total, item) => total + (item?.qty || 0), 0) || '0'}
                    </Typography>
                    <Typography sx={dataTitleStyles}>Qty</Typography>
                  </Grid>
                  <Grid item xs={6} sm={2} md={2} lg={2} xl={2}>
                    {row?.status ? rowStatusChip(row?.status) : '-'}
                    <Typography sx={dataTitleStyles}>Status</Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={1} lg={1.5} sx={{ alignSelf: 'flex-start' }}>
                {isDesktop ? (
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', minWidth: '100px' }}>
                    {hasPermission(userProfile, VIEW_STOCK) && (
                      <IconButton
                        component={Link}
                        href={`/inventory/stock-adjustments/view/${row?.stockAdjustmentId}`}
                        onClick={() => dispatch(setSelectedStock(row))}
                      >
                        <Icon icon='tabler:eye' />
                      </IconButton>
                    )}
                    {hasPermission(userProfile, EDIT_STOCK) && row?.status !== STATUS_CONFIRMED && (
                      <IconButton
                        component={Link}
                        href={`/inventory/stock-adjustments/edit/${row?.stockAdjustmentId}`}
                        onClick={() => dispatch(setSelectedStock(row))}
                      >
                        <Icon icon='tabler:edit' />
                      </IconButton>
                    )}
                    <IconButton onClick={event => handleClick(event, row)}>
                      <Icon icon='iconamoon:menu-kebab-vertical-circle-light' width={25} height={25} />
                    </IconButton>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                    <IconButton onClick={event => handleClick(event, row)}>
                      <Icon icon='iconamoon:menu-kebab-vertical-circle-light' width={27} height={27} />
                    </IconButton>
                  </Box>
                )}
                <CommonStyledMenu
                  anchorEl={anchorElMap[row.stockAdjustmentId]}
                  open={Boolean(anchorElMap[row.stockAdjustmentId])}
                  onClose={() => handleClose(row)}
                >
                  {!isDesktop && hasPermission(userProfile, VIEW_STOCK) && (
                    <MenuItem
                      component={Link}
                      href={`/inventory/stock-adjustments/view/${row.stockAdjustmentId}`}
                      onClick={() => dispatch(setSelectedStock(row))}
                    >
                      <Icon icon='tabler:eye' /> View
                    </MenuItem>
                  )}
                  {!isDesktop && hasPermission(userProfile, EDIT_STOCK) && row?.status !== STATUS_CONFIRMED && (
                    <MenuItem
                      component={Link}
                      href={`/inventory/stock-adjustments/edit/${row.stockAdjustmentId}`}
                      onClick={() => dispatch(setSelectedStock(row))}
                    >
                      <Icon icon='tabler:edit' /> Edit
                    </MenuItem>
                  )}
                  {hasPermission(userProfile, MANAGE_STOCK) && row?.status === STATUS_CONFIRMED && (
                    <MenuItem onClick={() => UndoStatus(row)}>
                      <Icon icon='iconamoon:do-undo-light' /> Undo Confirmation
                    </MenuItem>
                  )}
                  {hasPermission(userProfile, DELETE_STOCK) && row?.status !== STATUS_CONFIRMED && (
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

  useEffect(() => {
    handleDateRange(startDate, endDate)
  }, [stockAdjustments])

  const handleDateRange = async (startDate, endDate, overrides = {}) => {
    let stockAdjustmentsFilter = stockAdjustments
    const { filterStatus: statusOverride = filterStatus } = overrides

    const isStartDateChanged = startDate.toDateString() !== oneMonthAgoDate.toDateString()
    const isEndDateChanged = endDate.toDateString() !== todayDate.toDateString()
    const isFilterStatus = Boolean(statusOverride)
    const anyFilterActive = isStartDateChanged || isEndDateChanged || isFilterStatus

    try {
      if (isStartDateChanged || isEndDateChanged) {
        const response = await fetchData(
          getStockAdjustmentsByDateRangeQuery(tenantId, DateFunction(startDate), DateFunction(endDate))
        )
        stockAdjustmentsFilter = response?.getStockAdjustmentsByDateRange
      }
      if (stockAdjustmentsFilter) {
        const filteredData = stockAdjustmentsFilter.filter(item => {
          const statusMatches = statusOverride ? item?.status === statusOverride : true

          return statusMatches
        })
        setFilterActive({
          filterActive: anyFilterActive,
          startDate: isStartDateChanged,
          filterStatus: isFilterStatus,
          endDate: isEndDateChanged
        })

        setFilteredStockAdjustments(anyFilterActive ? filteredData : [])
      }
    } catch (error) {
      console.error(error)
    } finally {
      setAnchorEl(null)
    }
  }

  const handleReset = () => {
    setAnchorEl(null)
    dispatch(resetStockFilters())
    setFilterActive({
      filterActive: false,
      startDate: false,
      filterStatus: false,
      endDate: false
    })
    setFilteredStockAdjustments([])
  }

  const handleFilters = (overrides = {}) => {
    handleDateRange(startDate, endDate, overrides)
  }

  const updateFilter = (key, value) => {
    dispatch(setStockFilters({ [key]: value }))
  }

  const handleFilterClose = () => {
    const filter = {
      filterStatus: isFilterActive.filterStatus ? filterStatus : null,
      startDate: isFilterActive.startDate ? startDate : null,
      endDate: isFilterActive.endDate ? endDate : null
    }
    dispatch(setStockFilters(filter))
    setAnchorEl(null)
  }

  const handleFilterClick = event => {
    setAnchorEl(event.currentTarget)
  }

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 3,
          mb: 3
        }}
      >
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 4, mt: 4 }}>
              <Typography sx={{ fontSize: '13px', lineHeight: '23px' }}>Status</Typography>
              <Button type='button' onClick={() => updateFilter('filterStatus', null)}>
                Reset
              </Button>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 4, mb: 2 }}>
              <CustomAutocomplete
                fullWidth
                options={statuses}
                value={toTitleCase(filterStatus)}
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
      {(isFilterActive.startDate || isFilterActive.endDate || isFilterActive.filterStatus) && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 3,
            mb: 3
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
            {filterStatus && isFilterActive.filterStatus && (
              <CustomChip
                label={`Status: ${toTitleCase(filterStatus)}`}
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
                label={`Date Range: ${DateFunction(startDate.toDateString())}-${DateFunction(endDate.toDateString())}`}
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
      )}
      {loading ? (
        <LinearProgress />
      ) : (
        <MobileDataGrid
          rows={
            filteredStockAdjustments.length > 0 || isFilterActive.filterActive
              ? filteredStockAdjustments
              : stockAdjustments || []
          }
          columns={stockAdjustmentColumns}
          getRowId={row => row?.stockAdjustmentId}
          initialState={{
            sorting: {
              sortModel: [{ field: 'adjustmentNo', sort: 'desc' }]
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
            dispatch(setSelectedStock(params.row))
            router.push(`/inventory/stock-adjustments/view/${params?.row?.stockAdjustmentId}`)
          }}
          slots={{
            columnHeaders: () => null,
            noRowsOverlay: CustomNoRowsOverlay
          }}
          slotProps={{
            noRowsOverlay: {
              mainText: 'Empty Stock Adjustments',
              subText: "No stock adjustments available here. Click 'Add New' button above to get started."
            }
          }}
        />
      )}
      {openDialog && (
        <DeleteStock
          tenantId={tenantId}
          stockAdjustmentId={selecedStock?.stockAdjustmentId}
          openDialog={openDialog}
          setOpenDialog={setOpenDialog}
        />
      )}
    </>
  )
}

export default StockAdjustmentListTable
