// ** Next Import
import Link from 'next/link'
import Router from 'next/router'

import { useEffect, useMemo, useState } from 'react'
import { alpha } from '@mui/material/styles'
import { useDispatch, useSelector } from 'react-redux'
import {
  Box,
  IconButton,
  MenuItem,
  Divider,
  useTheme,
  Button,
  Popover,
  Typography,
  Tooltip,
  Grid,
  LinearProgress
} from '@mui/material'
import Icon from 'src/@core/components/icon'
import { fetchData } from 'src/common-functions/GraphqlOperations'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import { getPriceListByDateRangeQuery } from 'src/@core/components/graphql/priceList-queries'
import {
  resetPriceList,
  resetPriceListFilters,
  setActionPriceList,
  setPriceListFilters
} from 'src/store/apps/priceLists'
import CustomNoRowsOverlay from 'src/common-components/CustomNoRowsOverlay'
import FilterDateRange from 'src/common-components/FilterDateRange'
import {
  DateFunction,
  getStatusChip,
  lastMonthDate,
  toTitleCase,
  formatDateString,
  hasPermission,
  dataTextStyles,
  dataTitleStyles
} from 'src/common-functions/utils/UtilityFunctions'
import CommonStyledMenu from 'src/common-components/CommonStyledMenu'
import DeletePriceList from './DeletePriceList'
import useIsDesktop from 'src/hooks/IsDesktop'
import {
  DELETE_PRICE_LIST,
  EDIT_PRICE_LIST,
  PriceList_Statuses,
  VIEW_PRICE_LIST
} from 'src/common-functions/utils/Constants'
import CustomTextField from 'src/@core/components/mui/text-field'
import RefreshIcon from '@mui/icons-material/Refresh'
import MobileDataGrid from 'src/common-components/MobileDataGrid'
import CustomChip from 'src/@core/components/mui/chip'
import { Close } from '@mui/icons-material'

const PriceListTable = ({ priceListData, setPriceListData, loading }) => {
  const router = Router
  const theme = useTheme()
  const dispatch = useDispatch()
  const isDesktop = useIsDesktop()

  const tenantId = useSelector(state => state.tenants?.selectedTenant?.tenantId)

  const moduleFilterDateDuration = useSelector(
    state => state.otherSettings?.data?.moduleFilterDateDuration || undefined
  )
  const {
    startDate: rawStartDate,
    endDate: rawEndDate,
    filterStatus
  } = useSelector(state => state.priceLists?.filters ?? {})

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

  const userProfile = useSelector(state => state.userProfile)

  const [anchorEl, setAnchorEl] = useState(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedPriceList, setSelectedPriceList] = useState('')
  const { priceLists = [] } = priceListData || {}
  const [anchorElMap, setAnchorElMap] = useState({})
  const [filteredPriceList, setFilteredPriceList] = useState([])
  const [searchedPriceList, setSearchedPriceList] = useState(null)

  const [temporaryFilterData, setTemporaryFilterData] = useState([])

  const handleClick = (event, row) => {
    dispatch(setActionPriceList(row))
    const updatedAnchorElMap = { ...anchorElMap }
    updatedAnchorElMap[row.priceListId] = event.currentTarget
    setAnchorElMap(updatedAnchorElMap)
  }

  useEffect(() => {
    handleDateRange(startDate, endDate)
  }, [priceLists])

  const handleDateRange = async (startDate, endDate, overrides = {}) => {
    let priceListFilter = priceLists
    const { filterStatus: statusOverride = filterStatus } = overrides

    const isStartDateChanged = startDate.toDateString() !== oneMonthAgoDate.toDateString()
    const isEndDateChanged = endDate.toDateString() !== todayDate.toDateString()
    const isFilterStatus = Boolean(statusOverride)

    const anyFilterActive = isStartDateChanged || isEndDateChanged || isFilterStatus

    try {
      if (isStartDateChanged || isEndDateChanged) {
        const response = await fetchData(
          getPriceListByDateRangeQuery(tenantId, DateFunction(startDate), DateFunction(endDate))
        )
        priceListFilter = response?.getPriceListsByDateRange
      }
      if (priceListFilter) {
        const filteredData = priceListFilter.filter(item => {
          const statusMatches = statusOverride ? item?.status === statusOverride : true
          return statusMatches
        })
        if (filteredData) {
          setFilterActive({
            filterActive: anyFilterActive,
            filterStatus: isFilterStatus,
            startDate: isStartDateChanged,
            endDate: isEndDateChanged
          })

          setFilteredPriceList(anyFilterActive ? filteredData : [])
          setTemporaryFilterData(anyFilterActive ? filteredData : [])
        }
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setAnchorEl(null)
    }
  }

  const handleReset = async () => {
    setAnchorEl(null)
    dispatch(resetPriceListFilters())
    setFilteredPriceList([])
    setTemporaryFilterData([])
  }

  const handleFilters = (overrides = {}) => {
    handleDateRange(startDate, endDate, overrides)
  }

  const updateFilter = (key, value) => {
    dispatch(setPriceListFilters({ [key]: value }))
  }

  const handleClose = row => {
    const updatedAnchorElMap = { ...anchorElMap }
    updatedAnchorElMap[row.priceListId] = null
    setAnchorElMap(updatedAnchorElMap)
  }

  const handleDelete = row => {
    setSelectedPriceList(row)
    handleClose(row)
    setOpenDialog(true)
  }

  const handleFilterClick = event => {
    setAnchorEl(event.currentTarget)
  }

  const handleFilterClose = () => {
    const filter = {
      filterStatus: isFilterActive.filterStatus ? filterStatus : null,
      startDate: isFilterActive.startDate ? startDate : null,
      endDate: isFilterActive.endDate ? endDate : null
    }
    dispatch(setPriceListFilters(filter))
    setAnchorEl(null)
  }

  const open = Boolean(anchorEl)

  const getColor = status => {
    switch (status) {
      case 'active':
        return theme.palette.success.main
      default:
        return theme.palette.error.main
    }
  }

  const priceListColumns = [
    {
      field: 'priceListInfo',
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
                    <Typography sx={dataTextStyles}>{row?.priceListNo}</Typography>
                    <Typography sx={dataTitleStyles}>No</Typography>
                  </Grid>
                  <Grid item xs={6} sm={2} md={2} lg={3} xl={3}>
                    <Typography sx={dataTextStyles}>{row?.priceListName || '-'}</Typography>
                    <Typography sx={dataTitleStyles}>Name</Typography>
                  </Grid>
                  <Grid item xs={6} sm={2} md={2} lg={3} xl={3}>
                    <Typography sx={dataTextStyles}>{row?.validFrom ? DateFunction(row?.validFrom) : '-'}</Typography>
                    <Typography sx={dataTitleStyles}>Valid From</Typography>
                  </Grid>
                  <Grid item xs={6} sm={2} md={2} lg={3} xl={3}>
                    <Typography sx={dataTextStyles}>{row?.validUpto ? DateFunction(row?.validUpto) : '-'}</Typography>
                    <Typography sx={dataTitleStyles}>Valid Upto</Typography>
                  </Grid>
                  <Grid item xs={6} sm={2} md={2} lg={3} xl={3}>
                    {row?.status ? getStatusChip(getColor(row.status), row.status) : '-'}
                    <Typography sx={dataTitleStyles}>Status</Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={1} lg={1.5} sx={{ alignSelf: 'flex-start' }}>
                {isDesktop ? (
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', minWidth: '100px' }}>
                    {hasPermission(userProfile, VIEW_PRICE_LIST) && (
                      <IconButton
                        component={Link}
                        href={`/inventory/price-list/view/${row?.priceListId}`}
                        onClick={() => dispatch(setActionPriceList(row))}
                      >
                        <Icon icon='tabler:eye' />
                      </IconButton>
                    )}
                    {hasPermission(userProfile, EDIT_PRICE_LIST) && (
                      <IconButton
                        component={Link}
                        href={`/inventory/price-list/edit/${row?.priceListId}`}
                        onClick={() => dispatch(setActionPriceList(row))}
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
                  anchorEl={anchorElMap[row.priceListId]}
                  open={Boolean(anchorElMap[row.priceListId])}
                  onClose={() => handleClose(row)}
                >
                  {!isDesktop && hasPermission(userProfile, VIEW_PRICE_LIST) && (
                    <MenuItem
                      component={Link}
                      href={`/inventory/price-list/view/${row?.priceListId}`}
                      onClick={() => dispatch(setActionPriceList(row))}
                    >
                      <Icon icon='tabler:eye' /> View
                    </MenuItem>
                  )}
                  {!isDesktop && hasPermission(userProfile, EDIT_PRICE_LIST) && (
                    <MenuItem
                      component={Link}
                      href={`/inventory/price-list/edit/${row?.priceListId}`}
                      onClick={() => dispatch(setActionPriceList(row))}
                    >
                      <Icon icon='tabler:edit' /> Edit
                    </MenuItem>
                  )}
                  {hasPermission(userProfile, DELETE_PRICE_LIST) && (
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

    if (searchValue) {
      const matchedSO = priceLists.filter(pl => {
        return pl.priceListNo.toLowerCase().includes(searchValue)
      })

      setFilteredPriceList(matchedSO.length > 0 ? matchedSO : temporaryFilterData)
    } else {
      setFilteredPriceList(temporaryFilterData)
      setSearchedPriceList('')
    }
  }

  return (
    <>
      <Grid container spacing={2} sx={{ justifyContent: 'space-between', mb: 3 }}>
        <Grid item xs={7} sm={4} md={4} lg={4} xl={4}>
          <CustomAutocomplete
            options={filteredPriceList.length > 0 || isFilterActive.filterActive ? filteredPriceList : priceLists}
            getOptionLabel={option => {
              if (!option) return ''

              return option.priceListNo
            }}
            filterOptions={options => options}
            value={priceLists?.find(option => option.priceListId === searchedPriceList?.priceListId) || null}
            onChange={(event, newValue) => {
              setFilteredPriceList(newValue ? [newValue] : temporaryFilterData)
              setSearchedPriceList(newValue)
            }}
            onInputChange={(event, newValue) => handleSearchChange(event, newValue)}
            disableClearable={false}
            renderInput={params => <CustomTextField {...params} fullWidth label='Price Lists' />}
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
                  dispatch(resetPriceList())
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
                    options={PriceList_Statuses}
                    value={filterStatus ? toTitleCase(filterStatus) : filterStatus}
                    onChange={(event, newValue) => {
                      updateFilter('filterStatus', newValue)
                    }}
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
        </Grid>
      </Grid>
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
          rows={filteredPriceList.length > 0 || isFilterActive.filterActive ? filteredPriceList : priceLists}
          columns={priceListColumns}
          getRowId={row => row?.priceListNo}
          initialState={{
            sorting: {
              sortModel: [{ field: 'priceListNo', sort: 'desc' }]
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
            dispatch(setActionPriceList(params.row))
            router.push(`/inventory/price-list/view/${params?.row?.priceListId}`)
          }}
          slots={{
            columnHeaders: () => null,
            noRowsOverlay: CustomNoRowsOverlay
          }}
          slotProps={{
            noRowsOverlay: {
              mainText: 'Empty Price List',
              subText: "No Price List available here. Click 'Add New' button above to get started."
            }
          }}
        />
      )}
      {openDialog && (
        <DeletePriceList
          tenantId={tenantId}
          priceListId={selectedPriceList?.priceListId}
          openDialog={openDialog}
          setOpenDialog={setOpenDialog}
          setPriceListData={setPriceListData}
        />
      )}
    </>
  )
}

export default PriceListTable
