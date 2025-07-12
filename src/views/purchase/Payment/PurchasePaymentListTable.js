// ** Next Import

import Link from 'next/link'
import Router from 'next/router'

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
import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getPurchaseOrderPaymentsByDateRangeQuery } from 'src/@core/components/graphql/purchases-payment-queries'
import Icon from 'src/@core/components/icon'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import CustomChip from 'src/@core/components/mui/chip'
import CustomTextField from 'src/@core/components/mui/text-field'
import CommonStyledMenu from 'src/common-components/CommonStyledMenu'
import CommonVendorPopup from 'src/common-components/CommonVendorPopup'
import CustomNoRowsOverlay from 'src/common-components/CustomNoRowsOverlay'
import FilterDateRange from 'src/common-components/FilterDateRange'
import MobileDataGrid from 'src/common-components/MobileDataGrid'
import StyledButton from 'src/common-components/StyledMuiButton'
import { fetchData } from 'src/common-functions/GraphqlOperations'
import {
  DELETE_PURCHASE_PAYMENT,
  EDIT_PURCHASE_PAYMENT,
  MANAGE_PURCHASE_PAYMENT,
  STATUS_CLEARED,
  VIEW_PURCHASE_PAYMENT
} from 'src/common-functions/utils/Constants'
import {
  dataTextStyles,
  dataTitleStyles,
  DateFunction,
  hasPermission,
  lastMonthDate,
  NumberFormat,
  rowStatusChip
} from 'src/common-functions/utils/UtilityFunctions'
import useCurrencies from 'src/hooks/getData/useCurrencies'
import usePaymentMethods from 'src/hooks/getData/usePaymentMethods'
import { useIsLaptop, useIsMobile } from 'src/hooks/IsDesktop'
import {
  resetPurchaseOrderPaymentFilters,
  resetPurchasePayment,
  setActionPayment,
  setPurchaseOrderPaymentFilters
} from 'src/store/apps/purchases-payment'
import DeletePurchasePayments from 'src/views/purchase/Payment/DeletePayment'
import ClearPOPayment from './ClearPOPayment'

const PurchasePaymentListTable = ({ tenantId, paymentData, loading }) => {
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
    filterPaymentMethod,
    filterVendor
  } = useSelector(state => state.purchasesPayment?.filters ?? {})

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
    filterPaymentMethod: Boolean(filterPaymentMethod)
  }

  const anyFilterActive = Object.values(filters).some(Boolean)

  // State for active filters
  const [isFilterActive, setFilterActive] = useState({
    filterActive: anyFilterActive,
    ...filters
  })

  const userProfile = useSelector(state => state.userProfile)
  const { currencies } = useCurrencies()
  const { payments = [], vendors = [] } = paymentData || {}

  const [filteredPOPayments, setFilterePOPayments] = useState([])
  const [searchedPOPayments, setSearchedPOPayments] = useState(null)
  const [openVendorDialog, setOpenVendorDialog] = useState(false)
  const [vendorForDialog, setVendorForDialog] = useState({})
  const [openDialog, setOpenDialog] = useState(false)
  const [openPaymentClearDialog, setOpenPaymentClearDialog] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState('')
  const { paymentMethods } = usePaymentMethods(tenantId)

  const [anchorElMap, setAnchorElMap] = useState({})
  const [filterAnchor, setFilterAnchor] = useState(null)
  const open = Boolean(filterAnchor)
  const [temporaryFilterData, setTemporaryFilterData] = useState([])

  const handleClick = (event, row) => {
    dispatch(setActionPayment(row))
    const updatedAnchorElMap = { ...anchorElMap }
    updatedAnchorElMap[row.paymentId] = event.currentTarget
    setAnchorElMap(updatedAnchorElMap)
  }

  const handleClose = row => {
    const updatedAnchorElMap = { ...anchorElMap }
    updatedAnchorElMap[row.paymentId] = null
    setAnchorElMap(updatedAnchorElMap)
  }
  const handleDelete = row => {
    setSelectedPayment(row)
    setOpenDialog(true)
  }

  const clearPayment = row => {
    setSelectedPayment(row)
    setOpenPaymentClearDialog(true)
    handleClose(row)
  }

  const handleFilterClick = event => {
    setFilterAnchor(event.currentTarget)
  }

  const handleFilterClose = () => {
    const {
      filterPaymentMethod: isPaymentMethodActive,
      filterVendor: isVendorActive,
      startDate: isStartDateActive,
      endDate: isEndDateActive
    } = isFilterActive
    updateFilter('filterPaymentMethod', isPaymentMethodActive ? filterPaymentMethod : null)
    updateFilter('filterVendor', isVendorActive ? filterVendor : null)
    updateFilter('startDate', isStartDateActive ? startDate : null)
    updateFilter('endDate', isEndDateActive ? endDate : null)
    setFilterAnchor(null)
  }

  useEffect(() => {
    handleDateRange(startDate, endDate)
  }, [payments])

  const handleDateRange = async (startDate, endDate, overrides = {}) => {
    let dataToFilter = payments

    const {
      filterVendor: vendorOverride = filterVendor,
      filterPaymentMethod: paymentMethodOverride = filterPaymentMethod
    } = overrides

    const isStartDateCustom = startDate.toDateString() !== oneMonthAgoDate.toDateString()
    const isEndDateCustom = endDate.toDateString() !== todayDate.toDateString()
    const isFilterVendor = Boolean(vendorOverride?.vendorId)
    const isFilterPaymentMethod = Boolean(paymentMethodOverride?.paymentMethodId)

    const anyFilterActive = isStartDateCustom || isEndDateCustom || isFilterVendor || isFilterPaymentMethod

    try {
      // Fetch only if custom date range is applied
      if (isStartDateCustom || isEndDateCustom) {
        const response = await fetchData(
          getPurchaseOrderPaymentsByDateRangeQuery(tenantId, DateFunction(startDate), DateFunction(endDate))
        )
        dataToFilter = response?.getPurchaseOrderPaymentsByDateRange || []
      }

      const filteredData = dataToFilter.filter(item => {
        const matchesPaymentMethod =
          !isFilterPaymentMethod || item?.paymentMethod === paymentMethodOverride.paymentMethodId
        const matchesVendor = !isFilterVendor || item?.vendorId === vendorOverride.vendorId
        return matchesPaymentMethod && matchesVendor
      })

      setFilterActive({
        filterActive: anyFilterActive,
        startDate: isStartDateCustom,
        endDate: isEndDateCustom,
        filterVendor: isFilterVendor,
        filterPaymentMethod: isFilterPaymentMethod
      })

      setTemporaryFilterData(anyFilterActive ? filteredData : [])
      setFilterePOPayments(anyFilterActive ? filteredData : [])
      setSearchedPOPayments('')
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setFilterAnchor(null)
    }
  }

  const handleFilters = (overrides = {}) => {
    handleDateRange(startDate, endDate, overrides)
  }

  const updateFilter = (key, value) => {
    dispatch(setPurchaseOrderPaymentFilters({ [key]: value }))
  }

  const handleReset = async () => {
    setFilterAnchor(null)
    dispatch(resetPurchaseOrderPaymentFilters())
    setFilterActive({
      filterActive: false,
      startDate: false,
      endDate: false,
      filterVendor: false,
      filterPaymentMethod: false
    })
    setTemporaryFilterData([])
    setFilterePOPayments([])
    setSearchedPOPayments('')
  }

  const mobileColumns = [
    {
      field: 'paymentNo',
      headerName: '',
      flex: 1,
      sortable: false,
      renderCell: ({ row }) => {
        const vendor = vendors?.find(item => item?.vendorId === row?.vendorId) || {}
        const viewPermission = hasPermission(userProfile, VIEW_PURCHASE_PAYMENT)

        const managePermission = hasPermission(userProfile, MANAGE_PURCHASE_PAYMENT)
        const editPermission = hasPermission(userProfile, EDIT_PURCHASE_PAYMENT)
        const deletePermission = hasPermission(userProfile, DELETE_PURCHASE_PAYMENT)
        return (
          <Box sx={{ width: '100%', p: 2 }}>
            <Grid container spacing={3} sx={{ alignItems: { xs: 'flex-start', md: 'center' } }}>
              <Grid item xs={11}>
                <Grid container spacing={3} sx={{ alignItems: 'center' }}>
                  <Grid item xs={12} sm={12} md={3} lg={3} xl={3} sx={{ pl: 3 }}>
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
                      {row?.paymentNoPrefix}
                      {row?.paymentNo}
                    </Typography>
                    {/* </Box> */}
                    <Typography sx={{ ...dataTitleStyles, color: '#818181' }}>{row?.notes}</Typography>
                  </Grid>
                  <Grid item xs={4} sm={4} md={1.5} lg={1.5} xl={1.5}>
                    <Typography sx={dataTextStyles}>{DateFunction(row?.paymentDate) || '-'}</Typography>
                    <Typography sx={dataTitleStyles}>Payment Date</Typography>
                  </Grid>
                  <Grid item xs={4} sm={4} md={1.5} lg={1.5} xl={1.5}>
                    <Typography sx={dataTextStyles}>
                      {paymentMethods?.find(method => method.paymentMethodId === row?.paymentMethod)?.paymentMethod ||
                        '-'}
                    </Typography>
                    <Typography sx={dataTitleStyles}>Payment Method</Typography>
                  </Grid>
                  <Grid item xs={4} sm={4} md={2} lg={2} xl={2}>
                    {row?.paidCurrency !== row?.currency && (
                      <>
                        <Typography sx={{ fontSize: '12px', color: '#818181' }}>Invoice Amount:</Typography>
                        {row?.amount ? (
                          <NumberFormat
                            value={row?.amount}
                            currency={currencies?.find(currency => currency.currencyId === row?.currency)}
                          />
                        ) : (
                          '-'
                        )}
                      </>
                    )}
                    <Typography sx={{ fontSize: '12px', color: '#818181' }}>Paid Amount:</Typography>
                    {row?.paidAmount ? (
                      <NumberFormat
                        value={row?.paidAmount}
                        currency={currencies?.find(currency => currency.currencyId === row?.paidCurrency)}
                      />
                    ) : (
                      '-'
                    )}
                  </Grid>
                  <Grid item xs={6} sm={6} md={2} lg={2} xl={2}>
                    {rowStatusChip(row?.status) || '-'}
                    <Typography sx={dataTitleStyles}>Status</Typography>
                  </Grid>
                  <Grid item xs={6} sm={6} md={2} lg={2} xl={2}>
                    {rowStatusChip(row?.reconciliationStatus) || '-'}
                    <Typography sx={dataTitleStyles}>Reconciliation Status</Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={1}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  {isLaptop && (
                    <>
                      {viewPermission && (
                        <IconButton
                          component={Link}
                          href={`/purchases/payments/view/${row?.paymentId}`}
                          onClick={() => dispatch(setActionPayment(row))}
                        >
                          <Icon icon='tabler:eye' />
                        </IconButton>
                      )}
                      {editPermission && (
                        <IconButton
                          component={Link}
                          href={`/purchases/payments/edit/${row?.paymentId}`}
                          onClick={() => dispatch(setActionPayment(row))}
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

                  <CommonStyledMenu
                    anchorEl={anchorElMap[row.paymentId]}
                    open={Boolean(anchorElMap[row.paymentId])}
                    onClose={() => handleClose(row)}
                  >
                    {viewPermission && !isLaptop && (
                      <MenuItem
                        component={Link}
                        href={`/purchases/payments/view/${row?.paymentId}`}
                        onClick={() => dispatch(setActionPayment(row))}
                      >
                        <Icon icon='tabler:eye' /> View
                      </MenuItem>
                    )}
                    {editPermission && !isLaptop && (
                      <MenuItem
                        component={Link}
                        href={`/purchases/payments/edit/${row?.paymentId}`}
                        onClick={() => dispatch(setActionPayment(row))}
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
                        <Icon icon='mingcute:delete-2-line' /> Delete
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

  const handleSearchChange = (event, newValue) => {
    const searchValue = newValue ? newValue.toLowerCase() : ''

    if (searchValue) {
      const matchedSOPayments = payments.filter(payment => {
        const vendor = vendors.find(vend => vend.vendorId === payment.vendorId)
        const displayName = vendor ? vendor.displayName.toLowerCase() : ''
        const amount = payment.amount ? payment.amount.toString().toLowerCase() : ''

        return (
          payment.paymentNo.toLowerCase().includes(searchValue) ||
          displayName.includes(searchValue) ||
          amount.includes(searchValue)
        )
      })

      setFilterePOPayments(matchedSOPayments.length > 0 ? matchedSOPayments : temporaryFilterData)
    } else {
      setFilterePOPayments(temporaryFilterData)
      setSearchedPOPayments('')
    }
  }
  return (
    <>
      <Grid container spacing={2} sx={{ justifyContent: 'space-between', mb: 3 }}>
        <Grid item xs={7} sm={4} md={4} lg={4} xl={4}>
          <CustomAutocomplete
            options={filteredPOPayments.length > 0 || isFilterActive.filterActive ? filteredPOPayments : payments}
            getOptionLabel={option => {
              if (!option) return ''

              const vendor = vendors.find(vend => vend.vendorId === option.vendorId)
              const currencyObj = currencies.find(cur => cur.currencyId === option.currency)
              const currencySymbol = currencyObj ? currencyObj.symbol : ''

              const formattedAmount =
                option.amount && currencySymbol ? `-${currencySymbol} ${option.amount.toLocaleString()}` : ''
              return `${vendor?.displayName} - ${option.paymentNo} ${formattedAmount}`.trim()
            }}
            filterOptions={options => options}
            value={payments?.find(option => option.paymentId === searchedPOPayments?.paymentId) || null}
            onChange={(event, newValue) => {
              setFilterePOPayments(newValue ? [newValue] : temporaryFilterData)
              setSearchedPOPayments(newValue)
            }}
            onInputChange={(event, newValue) => handleSearchChange(event, newValue)}
            disableClearable={false}
            renderInput={params => <CustomTextField {...params} fullWidth label='Payments' />}
          />
        </Grid>
        <Grid item xs={5} sm={6} md={6} lg={6} xl={6}>
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
                sx={{ fontSize: '21px' }}
                onClick={() => {
                  dispatch(resetPurchasePayment())
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
              anchorEl={filterAnchor}
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
                  <Typography sx={{ fontSize: '13px', lineHeight: '23px' }}>Payment Method</Typography>
                  <Button type='button' onClick={() => updateFilter('filterPaymentMethod', null)}>
                    Reset
                  </Button>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 4, mb: 2 }}>
                  <CustomAutocomplete
                    fullWidth
                    value={filterPaymentMethod}
                    onChange={(event, newValue) => {
                      updateFilter('filterPaymentMethod', newValue)
                    }}
                    options={paymentMethods}
                    getOptionLabel={option => option?.paymentMethod || ''}
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
          isFilterActive.filterPaymentMethod ||
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
                {filterPaymentMethod && isFilterActive.filterPaymentMethod && (
                  <CustomChip
                    label={`Payment Method: ${filterPaymentMethod.paymentMethod}`}
                    onDelete={() => {
                      updateFilter('filterPaymentMethod', null)
                      handleFilters({ filterPaymentMethod: null })
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
          rows={filteredPOPayments.length > 0 || isFilterActive.filterActive ? filteredPOPayments : payments}
          columns={mobileColumns}
          getRowId={row => row?.paymentId}
          initialState={{
            sorting: {
              sortModel: [{ field: 'paymentNo', sort: 'desc' }]
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
            dispatch(setActionPayment(params.row))
            router.push(`/purchases/payments/view/${params?.row?.paymentId}`)
          }}
          slots={{
            columnHeaders: () => null,
            noRowsOverlay: CustomNoRowsOverlay
          }}
          slotProps={{
            noRowsOverlay: {
              mainText: 'Empty Payments',
              subText: "No payments found. Click the 'New' button above to add a payment."
            }
          }}
        />
      )}

      {openDialog && (
        <DeletePurchasePayments
          tenantId={tenantId}
          paymentId={selectedPayment?.paymentId}
          openDialog={openDialog}
          setOpenDialog={setOpenDialog}
        />
      )}
      {openPaymentClearDialog && (
        <ClearPOPayment
          tenantId={tenantId}
          paymentId={selectedPayment?.paymentId}
          openDialog={openPaymentClearDialog}
          setOpenDialog={setOpenPaymentClearDialog}
          handleDateRange={handleDateRange}
          startDate={startDate}
          endDate={endDate}
        />
      )}
      {openVendorDialog && (
        <CommonVendorPopup
          vendorId={vendorForDialog?.vendorId}
          openVendorDialog={openVendorDialog}
          setOpenVendorDialog={setOpenVendorDialog}
        />
      )}
    </>
  )
}

export default PurchasePaymentListTable
