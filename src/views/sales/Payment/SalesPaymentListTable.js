// ** Next Import
import Link from 'next/link'
import Router from 'next/router'
import { useMemo, useState } from 'react'
import { IconButton, Box, MenuItem, alpha, Divider, Typography, Grid, LinearProgress } from '@mui/material'
import Icon from 'src/@core/components/icon'
import { useDispatch, useSelector } from 'react-redux'
import CustomNoRowsOverlay from 'src/common-components/CustomNoRowsOverlay'
import {
  DateFunction,
  rowStatusChip,
  NumberFormat,
  hasPermission,
  lastMonthDate,
  dataTitleStyles,
  dataTextStyles
} from 'src/common-functions/utils/UtilityFunctions'
import {
  EDIT_SALES_PAYMENT,
  STATUS_AWAITING_RECONCILIATION,
  STATUS_CLEARED,
  STATUS_PENDING_CLEARANCE,
  VIEW_SALES_PAYMENT
} from 'src/common-functions/utils/Constants'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import CommonStyledMenu from 'src/common-components/CommonStyledMenu'
import { useIsLaptop } from 'src/hooks/IsDesktop'
import { fetchData } from 'src/common-functions/GraphqlOperations'
import { setActionPayment, setSalesPaymentFilters } from 'src/store/apps/payments'
import { getSalesInvoicePaymentsByDateRangeQuery } from 'src/@core/components/graphql/sales-payment-queries'
import DeletePayments from './DeletePayment'
import CustomTextField from 'src/@core/components/mui/text-field'
import StyledButton from 'src/common-components/StyledMuiButton'
import { DELETE_SALES_PAYMENT } from 'src/common-functions/utils/Constants'
import CommonCustomerPopup from 'src/common-components/CommonCustomerPopup'
import ClearSOPayment from './ClearSOPayment'
import MobileDataGrid from 'src/common-components/MobileDataGrid'
import SalesPaymentFilter from './SalesPaymentFilter'

export default function SalesPaymentListTable({ tenantId, paymentData, loading }) {
  const router = Router

  const dispatch = useDispatch()
  const isLaptop = useIsLaptop()
  const moduleFilterDateDuration = useSelector(
    state => state.otherSettings?.data?.moduleFilterDateDuration || undefined
  )
  const {
    startDate: rawStartDate,
    endDate: rawEndDate,
    status,
    filterCustomer
  } = useSelector(state => state.salesPayments?.filters ?? {})

  const oneMonthAgoDate = useMemo(() => lastMonthDate(moduleFilterDateDuration), [moduleFilterDateDuration])
  const todayDate = useMemo(() => new Date(), [])

  const startDate = new Date(rawStartDate ?? oneMonthAgoDate)
  const endDate = new Date(rawEndDate ?? todayDate)

  // State for active filters
  const [isFilterActive, setFilterActive] = useState({})

  const userProfile = useSelector(state => state.userProfile)
  const [filteredSOPayments, setFiltereSOPayments] = useState([])
  const [temporaryFilterData, setTemporaryFilterData] = useState([])
  const [searchedSOPayments, setSearchedSOPayments] = useState(null)
  const [openDialog, setOpenDialog] = useState(false)
  const { salesPayments = [], currencies = [], paymentMethods = [], customers = [] } = paymentData || {}

  const [selecedPayment, setSelecedPayment] = useState('')
  const [anchorElMap, setAnchorElMap] = useState({})

  const [customerDialogState, setCustomerDialogState] = useState({
    open: false,
    selectedCustomerId: null
  })
  const [paymentToClear, setPaymentToClear] = useState({})
  const [openPaymentClearDialog, setOpenPaymentClearDialog] = useState(false)

  const updateFilter = (key, value) => {
    dispatch(setSalesPaymentFilters({ [key]: value }))
  }

  const clearPayment = row => {
    setPaymentToClear(row)
    setOpenPaymentClearDialog(true)
    handleClose(row)
  }

  const handleClick = (event, row) => {
    dispatch(setActionPayment(row))
    const updatedAnchorElMap = { ...anchorElMap }
    updatedAnchorElMap[row?.paymentId] = event.currentTarget
    setAnchorElMap(updatedAnchorElMap)
  }

  const handleClose = row => {
    const updatedAnchorElMap = { ...anchorElMap }
    updatedAnchorElMap[row.paymentId] = null
    setAnchorElMap(updatedAnchorElMap)
  }

  const handleDelete = row => {
    setSelecedPayment(row)
    handleClose(row)
    setOpenDialog(true)
  }

  const handleDateRange = async (startDate, endDate, overrides = {}) => {
    let salesPaymentFilter = salesPayments
    const { filterCustomer: customerOverride = filterCustomer, status: statusOverride = status } = overrides
    try {
      const isStartDateChanged = startDate.toDateString() !== lastMonthDate(moduleFilterDateDuration).toDateString()
      const isEndDateChanged = endDate.toDateString() !== todayDate.toDateString()
      const isFilterCustomer = Boolean(customerOverride)
      const isFilterStatus = Boolean(statusOverride)
      const anyFilterActive = isStartDateChanged || isEndDateChanged || isFilterCustomer || isFilterStatus

      if (isStartDateChanged || isEndDateChanged) {
        const response = await fetchData(
          getSalesInvoicePaymentsByDateRangeQuery(tenantId, DateFunction(startDate), DateFunction(endDate))
        )
        salesPaymentFilter = response?.getSalesInvoicePaymentsByDateRange || []
        console.log('fetched data successfully')
      }

      if (salesPaymentFilter) {
        const filteredData = salesPaymentFilter.filter(item => {
          const statusMatches = statusOverride ? item?.status === statusOverride : true
          const customerMatches = customerOverride?.customerId ? item?.customerId === customerOverride.customerId : true
          return statusMatches && customerMatches
        })

        setFilterActive({
          filterActive: anyFilterActive,
          startDate: isStartDateChanged,
          endDate: isEndDateChanged,
          filterCustomer: isFilterCustomer,
          status: isFilterStatus
        })
        setTemporaryFilterData(anyFilterActive ? filteredData : [])
        setFiltereSOPayments(anyFilterActive ? filteredData : [])
        setSearchedSOPayments(null)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    }
  }

  const columns = [
    {
      flex: 1,
      field: 'paymentNo',
      headerName: 'No',
      renderCell: params => {
        const { row } = params
        const customer = customers?.find(item => item?.customerId == row?.customerId) || {}
        const paymentMethod = paymentMethods?.find(method => method.paymentMethodId === row?.paymentMethod) || {}
        const currency = currencies?.find(item => item?.currencyId === row?.currency)

        const deletePermission = hasPermission(userProfile, DELETE_SALES_PAYMENT)
        const viewPermission = hasPermission(userProfile, VIEW_SALES_PAYMENT)
        const editPermission = hasPermission(userProfile, EDIT_SALES_PAYMENT)

        return (
          <Box sx={{ width: '100%', p: 2 }}>
            <Grid container spacing={3} sx={{ alignItems: { xs: 'flex-start', md: 'center' } }}>
              <Grid item xs={11} md={10.5} lg={10.5}>
                <Grid container spacing={3} sx={{ alignItems: 'center' }}>
                  <Grid item xs={12} sm={12} lg={3.5}>
                    <StyledButton
                      color='primary'
                      onClick={event => {
                        event.stopPropagation()
                        setCustomerDialogState({ open: true, selectedCustomerId: customer?.customerId })
                      }}
                    >
                      {customer?.customerName}
                    </StyledButton>

                    <Box
                      sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: '5px', md: '15px' }, alignItems: 'center' }}
                    >
                      <Typography sx={{ ...dataTitleStyles, color: '#000' }}>
                        <span style={{ verticalAlign: 'middle', marginRight: '5px' }}>#</span> {row.paymentNoPrefix}
                        {row.paymentNo}{' '}
                      </Typography>
                    </Box>
                    <Typography sx={{ ...dataTitleStyles, color: '#818181' }}>{row?.notes}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={2} lg={1.5}>
                    <Typography sx={dataTextStyles}>
                      <span> {DateFunction(row?.paymentDate) || '-'}</span>
                    </Typography>
                    <Typography sx={dataTitleStyles}>Date</Typography>
                  </Grid>
                  <Grid item xs={6} sm={2} lg={1.5}>
                    <Typography sx={dataTextStyles}>{paymentMethod?.paymentMethod || '-'}</Typography>
                    <Typography sx={dataTitleStyles}>Payment Method</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3} lg={2}>
                    {rowStatusChip(row?.status) || '-'}
                    <Typography sx={dataTitleStyles}>Status</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3} lg={2}>
                    {rowStatusChip(row?.reconciliationStatus) || '-'}
                    <Typography sx={dataTitleStyles}>Reconciliation Status</Typography>
                  </Grid>
                  <Grid item xs={6} sm={2} lg={1.5}>
                    {row?.amount ? (
                      <Typography sx={dataTextStyles}>
                        <NumberFormat value={row.amount} currency={currency} />
                      </Typography>
                    ) : (
                      '-'
                    )}
                    <Typography sx={{ ...dataTitleStyles, display: { xs: 'block', md: 'none' } }}>Total</Typography>
                    <Typography sx={{ ...dataTitleStyles, display: { xs: 'none', md: 'block' } }}>
                      Total Amount
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={1} md={1.5}>
                {isLaptop ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                    {viewPermission && (
                      <IconButton
                        component={Link}
                        scroll={true}
                        href={`/sales/payments/view/${row?.paymentId}`}
                        onClick={event => {
                          event.stopPropagation()
                          dispatch(setActionPayment(row))
                        }}
                      >
                        <Icon icon='tabler:eye' />
                      </IconButton>
                    )}
                    {editPermission && row?.reconciliationStatus === STATUS_AWAITING_RECONCILIATION && (
                      <IconButton
                        component={Link}
                        scroll={true}
                        href={`/sales/payments/edit/${row?.paymentId}`}
                        onClick={event => {
                          event.stopPropagation()
                          dispatch(setActionPayment(row))
                        }}
                      >
                        <Icon icon='tabler:edit' />
                      </IconButton>
                    )}

                    <>
                      {row?.status !== STATUS_CLEARED && (
                        <>
                          <IconButton
                            aria-label='more'
                            id='long-button'
                            aria-haspopup='true'
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
                          <CommonStyledMenu
                            anchorEl={anchorElMap[row.paymentId]}
                            open={Boolean(anchorElMap[row.paymentId])}
                            onClose={() => handleClose(row)}
                          >
                            <MenuItem
                              onClick={() => clearPayment(row)}
                              sx={{
                                color: theme => theme?.palette?.success?.main,
                                '&:hover': {
                                  color: theme => theme?.palette?.success?.main + ' !important',
                                  backgroundColor: theme =>
                                    alpha(theme.palette.success.main, theme.palette.action.selectedOpacity) +
                                    ' !important'
                                }
                              }}
                            >
                              <Icon icon='material-symbols:done' />
                              Clear Payment
                            </MenuItem>

                            {deletePermission &&
                              row?.reconciliationStatus === STATUS_AWAITING_RECONCILIATION &&
                              (row?.status === STATUS_AWAITING_RECONCILIATION ||
                                row?.status === STATUS_PENDING_CLEARANCE) && (
                                <MenuItem
                                  onClick={() => handleDelete(row)}
                                  sx={{
                                    color: theme => theme?.palette?.error?.main,
                                    '&:hover': {
                                      color: theme => theme?.palette?.error?.main + ' !important',
                                      backgroundColor: theme =>
                                        alpha(theme.palette.error.main, theme.palette.action.selectedOpacity) +
                                        ' !important'
                                    }
                                  }}
                                >
                                  <Icon icon='mingcute:delete-2-line' color='inherit' />
                                  Delete
                                </MenuItem>
                              )}
                          </CommonStyledMenu>{' '}
                        </>
                      )}
                    </>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                    {(viewPermission || deletePermission) && (
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
                    )}
                    <CommonStyledMenu
                      anchorEl={anchorElMap[row.paymentId]}
                      open={Boolean(anchorElMap[row.paymentId])}
                      onClose={() => handleClose(row)}
                    >
                      {viewPermission && (
                        <MenuItem
                          component={Link}
                          scroll={true}
                          href={`/sales/payments/view/${row.paymentId}`}
                          onClick={() => dispatch(setActionPayment(row))}
                        >
                          <Icon icon='tabler:eye' />
                          view
                        </MenuItem>
                      )}
                      {editPermission && row?.reconciliationStatus === STATUS_AWAITING_RECONCILIATION && (
                        <MenuItem
                          component={Link}
                          scroll={true}
                          href={`/sales/payments/edit/${row.paymentId}`}
                          onClick={() => dispatch(setActionPayment(row))}
                        >
                          <Icon icon='tabler:edit' />
                          Edit
                        </MenuItem>
                      )}

                      <MenuItem
                        onClick={() => clearPayment(row)}
                        sx={{
                          color: theme => theme?.palette?.success?.main,
                          '&:hover': {
                            color: theme => theme?.palette?.success?.main + ' !important',
                            backgroundColor: theme =>
                              alpha(theme.palette.success.main, theme.palette.action.selectedOpacity) + ' !important'
                          }
                        }}
                      >
                        <Icon icon='material-symbols:done' />
                        Clear Payment
                      </MenuItem>
                      {deletePermission &&
                        row?.reconciliationStatus === STATUS_AWAITING_RECONCILIATION &&
                        (row?.status === STATUS_AWAITING_RECONCILIATION ||
                          row?.status === STATUS_PENDING_CLEARANCE) && <Divider sx={{ my: 1 }} />}
                      {deletePermission &&
                        row?.reconciliationStatus === STATUS_AWAITING_RECONCILIATION &&
                        (row?.status === STATUS_AWAITING_RECONCILIATION ||
                          row?.status === STATUS_PENDING_CLEARANCE) && (
                          <MenuItem
                            sx={{
                              color: theme => theme?.palette?.error?.main,
                              '&:hover': {
                                color: theme => theme?.palette?.error?.main + ' !important',
                                backgroundColor: theme =>
                                  alpha(theme.palette.error.main, theme.palette.action.selectedOpacity) + ' !important'
                              }
                            }}
                            onClick={() => handleDelete(row)}
                          >
                            <Icon icon='mingcute:delete-2-line' color='inherit' />
                            Delete
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

  const handleSearchChange = (event, newValue) => {
    const searchValue = newValue ? newValue.toLowerCase() : ''

    if (searchValue) {
      const matchedSOPayments = salesPayments.filter(payment => {
        const customer = customers.find(cust => cust.customerId === payment.customerId)
        const customerName = customer ? customer.customerName.toLowerCase() : ''
        const amount = payment.amount ? payment.amount.toString().toLowerCase() : ''

        return (
          payment.paymentNo.toLowerCase().includes(searchValue) ||
          customerName.includes(searchValue) ||
          amount.includes(searchValue)
        )
      })

      setFiltereSOPayments(matchedSOPayments.length > 0 ? matchedSOPayments : temporaryFilterData)
    } else {
      setFiltereSOPayments(temporaryFilterData)
      setSearchedSOPayments('')
    }
  }
  return (
    <>
      <Grid container spacing={2} sx={{ justifyContent: 'space-between', mb: 3 }}>
        <Grid item xs={7} sm={4} md={4} lg={4} xl={4}>
          <CustomAutocomplete
            options={filteredSOPayments.length > 0 || isFilterActive.filterActive ? filteredSOPayments : salesPayments}
            getOptionLabel={option => {
              if (!option) return ''

              const customer = customers.find(cust => cust.customerId === option.customerId)
              const customerName = customer ? customer.customerName : ''
              const displayName = customer?.displayName || ''

              const displayNameText = displayName && displayName !== customerName ? ` (${displayName})` : ''
              const displayCompName = customer?.companyName ? `-${customer.companyName}` : ''

              const currencyObj = currencies.find(cur => cur.currencyId === option.currency)
              const currencySymbol = currencyObj ? currencyObj.symbol : ''

              const formattedAmount =
                option.amount && currencySymbol ? `-${currencySymbol} ${option.amount.toLocaleString()}` : ''

              return `${customerName}${displayNameText}${displayCompName} - ${option.paymentNo} ${formattedAmount}`.trim()
            }}
            filterOptions={options => options}
            value={salesPayments?.find(option => option.paymentId === searchedSOPayments?.paymentId) || null}
            onChange={(event, newValue) => {
              setFiltereSOPayments(newValue ? [newValue] : temporaryFilterData)
              setSearchedSOPayments(newValue)
            }}
            onInputChange={(event, newValue) => {
              if (newValue && newValue.trim() !== '') {
                handleSearchChange(event, newValue)
              }
            }}
            disableClearable={false}
            renderInput={params => <CustomTextField {...params} fullWidth label='Payments' />}
          />
        </Grid>
        <SalesPaymentFilter
          salesPayments={salesPayments}
          setFiltereSOPayments={setFiltereSOPayments}
          setTemporaryFilterData={setTemporaryFilterData}
          setSearchedSOPayments={setSearchedSOPayments}
          isFilterActive={isFilterActive}
          setFilterActive={setFilterActive}
        />
      </Grid>
      {loading ? (
        <LinearProgress />
      ) : (
        <MobileDataGrid
          columns={columns}
          rows={filteredSOPayments.length > 0 || isFilterActive.filterActive ? filteredSOPayments : salesPayments}
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
            if (event.target.closest('.MuiButton-root')) {
              event.defaultMuiPrevented = true
              return
            }
            dispatch(setActionPayment(params.row))
            router.push(`/sales/payments/view/${params?.row?.paymentId}`)
          }}
          slots={{
            columnHeaders: () => null,
            noRowsOverlay: CustomNoRowsOverlay
          }}
          slotProps={{
            noRowsOverlay: {
              mainText: 'Empty Payments',
              subText: 'No payment available here. Click "New" button above to get started.'
            }
          }}
        />
      )}
      {openDialog && (
        <DeletePayments
          tenantId={tenantId}
          paymentId={selecedPayment?.paymentId}
          openDialog={openDialog}
          setOpenDialog={setOpenDialog}
        />
      )}
      {customerDialogState?.open && (
        <CommonCustomerPopup
          customerId={customerDialogState?.selectedCustomerId}
          open={customerDialogState?.open}
          setOpen={() => setCustomerDialogState({ open: false, selectedCustomerId: null })}
        />
      )}
      {openPaymentClearDialog && (
        <ClearSOPayment
          tenantId={tenantId}
          paymentId={paymentToClear?.paymentId}
          openDialog={openPaymentClearDialog}
          setOpenDialog={setOpenPaymentClearDialog}
          handleDateRange={handleDateRange}
          startDate={startDate}
          endDate={endDate}
        />
      )}
    </>
  )
}
