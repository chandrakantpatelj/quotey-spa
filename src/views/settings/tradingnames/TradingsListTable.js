// ** Next Import
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import {
  Box,
  Button,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  MenuItem,
  Popover,
  Tooltip,
  Typography,
  alpha
} from '@mui/material'
import Icon from 'src/@core/components/icon'
import { useDispatch, useSelector } from 'react-redux'
import { resetTrading, resetTradingsFilters, setActionTrading, setTradingsFilters } from 'src/store/apps/tradings'
import CustomNoRowsOverlay from 'src/common-components/CustomNoRowsOverlay'
import CommonStyledMenu from 'src/common-components/CommonStyledMenu'
import DeleteTradingProfile from './DeleteTradingProfile'
import { formatPhoneNumberIntl } from 'react-phone-number-input'
import {
  dataTextStyles,
  dataTitleStyles,
  DateFunction,
  hasPermission,
  lastMonthDate
} from 'src/common-functions/utils/UtilityFunctions'
import { fetchData } from 'src/common-functions/GraphqlOperations'
import { getTradingsByDateRangeQuery } from 'src/@core/components/graphql/trading-queries'
import { DELETE_TRADING, EDIT_TRADING, VIEW_TRADING } from 'src/common-functions/utils/Constants'
import RefreshIcon from '@mui/icons-material/Refresh'
import MobileDataGrid from 'src/common-components/MobileDataGrid'
import Router from 'next/router'
import FilterDateRange from 'src/common-components/FilterDateRange'
import CustomChip from 'src/@core/components/mui/chip'
import { Close } from '@mui/icons-material'
import { useIsLaptop } from 'src/hooks/IsDesktop'
import useTradings from 'src/hooks/getData/useTradings'

export const MOBILE_COLUMNS = {
  mobile: false,
  workPhone: false,
  emailAddress: false
}
export const ALL_COLUMNS = {}

const TradingsListTable = ({ tenantId }) => {
  const dispatch = useDispatch()
  const isLaptop = useIsLaptop()
  const userProfile = useSelector(state => state.userProfile)
  const { tradings, tradingLoading } = useTradings(tenantId)
  const router = Router
  const moduleFilterDateDuration = useSelector(
    state => state.otherSettings?.data?.moduleFilterDateDuration || undefined
  )
  const { startDate: rawStartDate, endDate: rawEndDate } = useSelector(state => state.tradings?.filters ?? {})

  const oneMonthAgoDate = useMemo(() => lastMonthDate(moduleFilterDateDuration), [moduleFilterDateDuration])
  const todayDate = useMemo(() => new Date(), [])

  const startDate = new Date(rawStartDate ?? oneMonthAgoDate)
  const endDate = new Date(rawEndDate ?? todayDate)

  const isStartDateChanged = startDate.toDateString() !== oneMonthAgoDate.toDateString()
  const isEndDateChanged = endDate.toDateString() !== todayDate.toDateString()

  // Individual filter checks
  const filters = {
    startDate: isStartDateChanged,
    endDate: isEndDateChanged
  }

  const anyFilterActive = Object.values(filters).some(Boolean)

  // State for active filters
  const [isFilterActive, setFilterActive] = useState({
    filterActive: anyFilterActive,
    ...filters
  })

  const [selecedTrading, setSelecedTrading] = useState('')
  const [openDialog, setOpenDialog] = useState(false)
  const [anchorElMap, setAnchorElMap] = useState({})

  const [filteredTradings, setFilteredTradings] = useState([])

  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)

  const handleFilterClick = event => {
    setAnchorEl(event.currentTarget)
  }

  const handleClick = (event, row) => {
    dispatch(setActionTrading(row))
    const updatedAnchorElMap = { ...anchorElMap }
    updatedAnchorElMap[row.tradingId] = event.currentTarget
    setAnchorElMap(updatedAnchorElMap)
  }

  const handleClose = row => {
    const updatedAnchorElMap = { ...anchorElMap }
    updatedAnchorElMap[row.tradingId] = null
    setAnchorElMap(updatedAnchorElMap)
  }

  const handleDelete = row => {
    setSelecedTrading(row)
    handleClose(row)
    setOpenDialog(true)
  }

  const handleFilterClose = () => {
    const { startDate: isStartDateActive, endDate: isEndDateActive } = isFilterActive
    updateFilter('startDate', isStartDateActive ? startDate : null)
    updateFilter('endDate', isEndDateActive ? endDate : null)
    setAnchorEl(null)
  }

  useEffect(() => {
    handleDateRange(startDate, endDate)
  }, [tradings])

  const handleDateRange = async (startDate, endDate) => {
    let tradingsFiltered = tradings
    const isStartDate = startDate.toDateString() !== oneMonthAgoDate.toDateString()
    const isEndDate = endDate.toDateString() !== todayDate.toDateString()
    try {
      if (isStartDate || isEndDate) {
        const response = await fetchData(getTradingsByDateRangeQuery(tenantId, startDate, endDate))
        tradingsFiltered = response.getTradingsByDateRange
      }
      if (tradingsFiltered) {
        setFilterActive({
          filterActive: isStartDate || isEndDate,
          startDate: isStartDate,
          endDate: isEndDate
        })
        if (isStartDate || isEndDate) {
          setFilteredTradings(tradingsFiltered)
        } else {
          setFilteredTradings([])
        }
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setAnchorEl(null)
    }
  }

  const updateFilter = (key, value) => {
    dispatch(setTradingsFilters({ [key]: value }))
  }

  const handleReset = async () => {
    dispatch(resetTradingsFilters())
    setFilterActive({
      filterActive: false,
      startDate: false,
      endDate: false
    })
    setFilteredTradings([])
    setAnchorEl(null)
  }

  const tradingColumns = [
    {
      field: 'tradingNo',
      headerName: '',
      flex: 1,
      sortable: false,
      renderCell: ({ row }) => {
        const viewPermission = hasPermission(userProfile, VIEW_TRADING)
        const editPermission = hasPermission(userProfile, EDIT_TRADING)
        const deletePermission = hasPermission(userProfile, DELETE_TRADING)

        return (
          <Box sx={{ width: '100%', p: 2 }}>
            <Grid container spacing={3} sx={{ alignItems: { xs: 'flex-start', lg: 'center' } }}>
              <Grid item xs={11}>
                <Grid container spacing={3} sx={{ alignItems: 'center' }}>
                  <Grid item xs={12} sm={4} md={2} lg={2}>
                    <Typography sx={dataTextStyles}>
                      {row?.tradingNoPrefix}
                      {row?.tradingNo || ''}
                    </Typography>
                    <Typography sx={dataTitleStyles}>No</Typography>
                  </Grid>
                  <Grid item xs={6} sm={8} md={3} lg={3}>
                    <Typography sx={dataTextStyles}>{row?.tradingName || '-'}</Typography>
                    <Typography sx={dataTitleStyles}>Trading Name</Typography>
                  </Grid>
                  <Grid item xs={6} sm={4} md={2} lg={2}>
                    <Typography sx={dataTextStyles}>{formatPhoneNumberIntl(`+${row?.workPhone}`) || '-'}</Typography>
                    <Typography sx={dataTitleStyles}>Phone No</Typography>
                  </Grid>
                  <Grid item xs={6} sm={4} md={2} lg={2}>
                    <Typography sx={dataTextStyles}>{formatPhoneNumberIntl(`+${row?.mobile}`) || '-'}</Typography>
                    <Typography sx={dataTitleStyles}>Mobile No</Typography>
                  </Grid>
                  <Grid item xs={6} sm={4} md={3} lg={3}>
                    <Typography sx={dataTextStyles}>{row?.emailAddress || '-'}</Typography>
                    <Typography sx={dataTitleStyles}>Email</Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={1} sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {/* Render View and Edit buttons outside menu for Desktop */}
                  {isLaptop && viewPermission && (
                    <IconButton
                      component={Link}
                      href={`/account-settings/tradings/view/${row.tradingId}`}
                      onClick={() => dispatch(setActionTrading(row))}
                    >
                      <Icon icon='tabler:eye' />
                    </IconButton>
                  )}

                  {isLaptop && editPermission && (
                    <IconButton
                      component={Link}
                      href={`/account-settings/tradings/edit/${row.tradingId}`}
                      onClick={() => dispatch(setActionTrading(row))}
                    >
                      <Icon icon='tabler:edit' />
                    </IconButton>
                  )}

                  {/* Vertical Menu Button */}
                  <IconButton
                    onClick={event => {
                      event.stopPropagation()
                      handleClick(event, row)
                    }}
                  >
                    <Icon
                      icon='iconamoon:menu-kebab-vertical-circle-light'
                      width={isLaptop ? 25 : 27}
                      height={isLaptop ? 25 : 27}
                    />
                  </IconButton>

                  {/* CommonStyledMenu - Show all options inside the menu for mobile */}
                  <CommonStyledMenu
                    anchorEl={anchorElMap[row.tradingId]}
                    open={Boolean(anchorElMap[row.tradingId])}
                    onClose={() => handleClose(row)}
                  >
                    {/* For Mobile View - Show View & Edit inside Menu */}
                    {!isLaptop && viewPermission && (
                      <MenuItem
                        component={Link}
                        href={`/account-settings/tradings/view/${row.tradingId}`}
                        onClick={() => dispatch(setActionTrading(row))}
                      >
                        <Icon icon='tabler:eye' /> View
                      </MenuItem>
                    )}

                    {!isLaptop && editPermission && (
                      <MenuItem
                        component={Link}
                        href={`/account-settings/tradings/edit/${row.tradingId}`}
                        onClick={() => dispatch(setActionTrading(row))}
                      >
                        <Icon icon='tabler:edit' /> Edit
                      </MenuItem>
                    )}

                    {/* Delete Button (Always inside the menu) */}
                    {deletePermission && (
                      <>
                        <MenuItem
                          sx={{
                            color: theme => theme.palette.error.main,
                            '&:hover': {
                              color: theme => theme.palette.error.main + ' !important',
                              backgroundColor: theme =>
                                alpha(theme.palette.error.main, theme.palette.action.selectedOpacity) + ' !important'
                            }
                          }}
                          onClick={() => handleDelete(row)}
                        >
                          <Icon icon='mingcute:delete-2-line' /> Delete
                        </MenuItem>
                      </>
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
        <Tooltip title='Reload' placement='top'>
          <IconButton
            color='default'
            onClick={() => {
              dispatch(resetTrading())
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

              <Button variant='contained' onClick={() => handleDateRange(startDate, endDate)}>
                Apply
              </Button>
            </Box>
          </Box>
        </Popover>
      </Box>
      {(isFilterActive.startDate || isFilterActive.endDate) && (
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
      {tradingLoading ? (
        <LinearProgress />
      ) : (
        <MobileDataGrid
          rows={filteredTradings.length > 0 || isFilterActive.filterActive ? filteredTradings : tradings}
          columns={tradingColumns}
          getRowId={row => row?.tradingId}
          initialState={{
            sorting: {
              sortModel: [{ field: 'tradingNo', sort: 'desc' }]
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
            dispatch(setActionTrading(params.row))
            router.push(`/account-settings/tradings/view/${params?.row?.tradingId}`)
          }}
          slots={{
            columnHeaders: () => null,
            noRowsOverlay: CustomNoRowsOverlay
          }}
          slotProps={{
            noRowsOverlay: {
              mainText: 'Empty Tradings',
              subText: "No Trading available here. Click 'Add New' button above to get started."
            }
          }}
        />
      )}
      {openDialog && (
        <DeleteTradingProfile
          tenantId={selecedTrading?.tenantId}
          tradingId={selecedTrading?.tradingId}
          openDialog={openDialog}
          setOpenDialog={setOpenDialog}
        />
      )}
    </>
  )
}

export default TradingsListTable
