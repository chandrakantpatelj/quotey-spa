import { Box, Button, Divider, Typography, Popover, Grid, Tooltip, IconButton } from '@mui/material'

import { useEffect, useMemo, useState } from 'react'

import { DateFunction, lastMonthDate } from 'src/common-functions/utils/UtilityFunctions'
import FilterDateRange from 'src/common-components/FilterDateRange'
import Icon from 'src/@core/components/icon'
import { useDispatch, useSelector } from 'react-redux'
import { setAccountTransactionFilters } from 'src/store/apps/account-transactions'
import { resetAccountsFilters, setAccountsFilters } from 'src/store/apps/accounts'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import useVendors from 'src/hooks/getData/useVendors'
import CustomTextField from 'src/@core/components/mui/text-field'
import { getAllFinancialAccountTransactionsQuery } from 'src/@core/components/graphql/financial-account-queries'
import { Close } from '@mui/icons-material'
import CustomChip from 'src/@core/components/mui/chip'
import { fetchData } from 'src/common-functions/GraphqlOperations'
import RefreshIcon from '@mui/icons-material/Refresh'
import { filter } from 'lodash'
import useCustomers from 'src/hooks/getData/useCustomers'
import useSalesOrders from 'src/hooks/getData/useSalesOrders'

const AccountsFilter = ({
  fetchAccountTransactions,
  transactions,
  setFilteredTransactions,
  isFilterActive,
  setFilterActive,
  ...props
}) => {
  const dispatch = useDispatch()
  const [anchorEl, setAnchorEl] = useState(null)
  const tenantId = useSelector(state => state.tenants?.selectedTenant?.tenantId)
  const purchaseOrders = useSelector(state => state?.purchaseOrder?.data) || []
  const account = useSelector(state => state.financialAccounts.selectedAccounts) || {}
  const { customers } = useCustomers(tenantId)
  const { salesOrders } = useSalesOrders(tenantId)

  console.log('transactions', transactions)

  const moduleFilterDateDuration = useSelector(
    state => state.otherSettings?.data?.moduleFilterDateDuration || undefined
  )
  const {
    startDate: rawStartDate,
    endDate: rawEndDate,
    filterVendor,
    filterPurchaseOrder,
    filterCustomer,
    filterSalesOrder
  } = useSelector(state => state.accounts?.filters ?? {})

  const oneMonthAgoDate = useMemo(() => lastMonthDate(moduleFilterDateDuration), [moduleFilterDateDuration])
  const todayDate = useMemo(() => new Date(), [])

  const startDate = new Date(rawStartDate ?? oneMonthAgoDate)
  const endDate = new Date(rawEndDate ?? todayDate)

  const { vendors } = useVendors(tenantId)
  const [localFilterObject, setLocalFilterObject] = useState({
    startDate,
    endDate,
    filterVendor,
    filterCustomer,
    filterPurchaseOrder,
    filterSalesOrder
  })
  console.log('localFilterObject', localFilterObject)
  const open = Boolean(anchorEl)

  const handleFilterClick = event => {
    setAnchorEl(event.currentTarget)
  }

  const updateFilter = object => {
    dispatch(setAccountsFilters(object))
  }

  const handleFilterClose = () => {
    setLocalFilterObject({
      filterPurchaseOrder,
      filterCustomer,
      filterSalesOrder,
      filterVendor,
      startDate: rawStartDate,
      endDate: rawEndDate
    })
    setAnchorEl(null)
  }

  const handleDateRange = async (overrides = {}) => {
    console.log('overrides', overrides)
    updateFilter(overrides)
    try {
      let transactionsFilter = transactions

      const {
        filterVendor: vendorOverride = localFilterObject.filterVendor,
        filterPurchaseOrder: purchaseOrderOverride = localFilterObject.filterPurchaseOrder,
        filterCustomer: customerOverride = localFilterObject.filterCustomer,
        filterSalesOrder: salesOrderOverride = localFilterObject.filterSalesOrder,
        startDate: startDateOverride = localFilterObject.startDate,
        endDate: endDateOverride = localFilterObject.endDate
      } = overrides

      const isStartDate = startDateOverride.toDateString() !== oneMonthAgoDate.toDateString()
      const isEndDate = endDateOverride.toDateString() !== todayDate.toDateString()
      const isFilterVendor = Boolean(vendorOverride)
      const isFilterPurchaseOrder = Boolean(purchaseOrderOverride)
      const isFilterCustomer = Boolean(customerOverride)
      const isFilterSalesOrder = Boolean(salesOrderOverride)
      const anyFilterActive =
        isStartDate || isEndDate || isFilterVendor || isFilterCustomer || isFilterPurchaseOrder || isFilterSalesOrder
      if (isStartDate || isEndDate) {
        const accountData = await fetchData(
          getAllFinancialAccountTransactionsQuery(
            account?.tenantId,
            account?.accountId,
            DateFunction(startDate),
            DateFunction(endDate)
          )
        )
        transactionsFilter = accountData?.getAccountTransactionsByDateRange || []
      }
      if (transactionsFilter) {
        const filteredData = transactionsFilter.filter(item => {
          const purchaseOrderMatches = purchaseOrderOverride?.orderId
            ? item?.purchaseOrderId === purchaseOrderOverride.orderId
            : true
          const vendorMatches = vendorOverride?.vendorId ? item?.vendorId === vendorOverride.vendorId : true
          const customerMatches = customerOverride?.customerId ? item?.customerId === customerOverride.customerId : true
          const salesOrderMatches = salesOrderOverride?.orderId
            ? item?.salesOrderId === salesOrderOverride.orderId
            : true
          return purchaseOrderMatches && vendorMatches && customerMatches && salesOrderMatches
        })
        setFilterActive({
          filterActive: anyFilterActive,
          startDate: isStartDate,
          endDate: isEndDate,
          filterVendor: isFilterVendor,
          filterPurchaseOrder: isFilterPurchaseOrder,
          filterCustomer: isFilterCustomer,
          filterSalesOrder: isFilterSalesOrder
        })
        filteredData?.sort((a, b) => new Date(b.createdDateTime) - new Date(a.createdDateTime))
        setFilteredTransactions(anyFilterActive ? filteredData : [])
      }
    } catch (error) {
      console.error('Error', error)
    } finally {
      setAnchorEl(null)
    }
  }

  useEffect(() => {
    handleDateRange()
  }, [transactions])

  const handleFilters = overrides => {
    handleDateRange(overrides)
  }

  const handleReset = async () => {
    setAnchorEl(null)
    dispatch(resetAccountsFilters())
    setFilterActive({
      filterActive: false,
      startDate: false,
      endDate: false,
      filterVendor: false,
      filterPurchaseOrder: false,
      filterCustomer: false,
      filterSalesOrder
    })
    setLocalFilterObject({
      startDate,
      endDate,
      filterVendor,
      filterCustomer,
      filterPurchaseOrder,
      filterSalesOrder
    })
    setFilteredTransactions([])
  }

  return (
    <>
      <Grid item xs={5} sm={6} md={6} lg={6} xl={6}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Tooltip title='Reload' placement='top'>
            <IconButton
              color='default'
              onClick={() => {
                if (account) {
                  fetchAccountTransactions(startDate, endDate)
                }
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
            anchorOrigin={props?.anchorOrigin}
            transformOrigin={props?.transformOrigin}
            sx={{ mt: 2 }}
          >
            <Box sx={{ py: 0 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 4, py: 4, background: '#f1f1f1' }}>
                <Typography sx={{ fontSize: '14px', lineHeight: '23px' }}> Filters</Typography>
              </Box>
              <Divider sx={{ mb: 3, opacity: 0.4 }} color='primary' />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 4, mb: 2 }}>
                <Typography sx={{ fontSize: '13px', lineHeight: '23px' }}> Date Range</Typography>
                <Button
                  type='button'
                  onClick={() => {
                    setLocalFilterObject({ ...localFilterObject, startDate: null, endDate: null })
                  }}
                >
                  Reset
                </Button>
              </Box>
              <Box sx={{ display: 'flex', gap: 4, alignItems: 'center', px: 4 }}>
                <FilterDateRange
                  label='From'
                  date={localFilterObject.startDate}
                  setDate={date => setLocalFilterObject({ ...localFilterObject, startDate: date })}
                />
                <FilterDateRange
                  label='To'
                  date={localFilterObject.endDate}
                  setDate={date => setLocalFilterObject({ ...localFilterObject, endDate: date })}
                />
              </Box>
              <Divider sx={{ my: 3, opacity: 0.4 }} color='primary' />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 4, mb: 2 }}>
                <Typography sx={{ fontSize: '13px', lineHeight: '23px' }}>Vendor</Typography>
                <Button
                  type='button'
                  onClick={() => setLocalFilterObject({ ...localFilterObject, filterVendor: null })}
                >
                  Reset
                </Button>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 4, mb: 2 }}>
                <CustomAutocomplete
                  fullWidth
                  options={vendors}
                  value={localFilterObject.filterVendor}
                  onChange={(event, newValue) => {
                    setLocalFilterObject({ ...localFilterObject, filterVendor: newValue })
                  }}
                  getOptionLabel={option => option?.displayName || ''}
                  renderInput={params => <CustomTextField {...params} />}
                />
              </Box>
              <Divider sx={{ my: 3, opacity: 0.4 }} color='primary' />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 4, mb: 2 }}>
                <Typography sx={{ fontSize: '13px', lineHeight: '23px' }}>Purchase Order</Typography>
                <Button
                  type='button'
                  onClick={() => setLocalFilterObject({ ...localFilterObject, filterPurchaseOrder: null })}
                >
                  Reset
                </Button>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 4, mb: 2 }}>
                <CustomAutocomplete
                  fullWidth
                  options={purchaseOrders}
                  value={localFilterObject.filterPurchaseOrder}
                  onChange={(event, newValue) => {
                    setLocalFilterObject({ ...localFilterObject, filterPurchaseOrder: newValue })
                  }}
                  getOptionLabel={option => `${option?.orderNoPrefix || ''}${option?.orderNo || ''}`}
                  renderInput={params => <CustomTextField {...params} />}
                />
              </Box>
              <Divider sx={{ my: 3, opacity: 0.4 }} color='primary' />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 4, mb: 2 }}>
                <Typography sx={{ fontSize: '13px', lineHeight: '23px' }}>Customer</Typography>
                <Button
                  type='button'
                  onClick={() => setLocalFilterObject({ ...localFilterObject, filterCustomer: null })}
                >
                  Reset
                </Button>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 4, mb: 2 }}>
                <CustomAutocomplete
                  fullWidth
                  options={customers}
                  value={localFilterObject.filterCustomer}
                  onChange={(event, newValue) => {
                    setLocalFilterObject({ ...localFilterObject, filterCustomer: newValue })
                  }}
                  getOptionLabel={option => option?.customerName}
                  renderInput={params => <CustomTextField {...params} />}
                />
              </Box>

              <Divider sx={{ my: 3, opacity: 0.4 }} color='primary' />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 4, mb: 2 }}>
                <Typography sx={{ fontSize: '13px', lineHeight: '23px' }}>Sales Order</Typography>
                <Button
                  type='button'
                  onClick={() => setLocalFilterObject({ ...localFilterObject, filterSalesOrder: null })}
                >
                  Reset
                </Button>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 4, mb: 2 }}>
                <CustomAutocomplete
                  fullWidth
                  options={salesOrders}
                  value={localFilterObject.filterSalesOrder}
                  onChange={(event, newValue) => {
                    setLocalFilterObject({ ...localFilterObject, filterSalesOrder: newValue })
                  }}
                  getOptionLabel={option => `${option?.orderNoPrefix || ''}${option?.orderNo || ''}`}
                  renderInput={params => <CustomTextField {...params} />}
                />
              </Box>
              <Divider sx={{ my: 3, opacity: 0.4 }} color='primary' />
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
                <Button variant='contained' onClick={() => handleFilters(localFilterObject)}>
                  Apply
                </Button>
              </Box>
            </Box>
          </Popover>
        </Box>
      </Grid>

      {(isFilterActive.filterVendor ||
        isFilterActive.filterPurchaseOrder ||
        isFilterActive.filterCustomer ||
        isFilterActive.filterSalesOrder ||
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
                    setLocalFilterObject({ ...localFilterObject, filterVendor: null })
                    handleFilters({ filterVendor: null })
                  }}
                  deleteIcon={<Close sx={{ color: theme => theme.palette.primary.main }} />}
                  skin='light'
                  color='primary'
                />
              )}
              {filterPurchaseOrder && isFilterActive.filterPurchaseOrder && (
                <CustomChip
                  label={`Purchase Order: ${filterPurchaseOrder?.orderNoPrefix || ''}${
                    filterPurchaseOrder?.orderNo || ''
                  }`}
                  onDelete={() => {
                    setLocalFilterObject({ ...localFilterObject, filterPurchaseOrder: null })
                    handleFilters({ filterPurchaseOrder: null })
                  }}
                  deleteIcon={<Close sx={{ color: theme => theme.palette.primary.main }} />}
                  skin='light'
                  color='primary'
                />
              )}
              {filterCustomer && isFilterActive.filterCustomer && (
                <CustomChip
                  label={`Customer: ${filterCustomer?.customerName || ''}`}
                  onDelete={() => {
                    setLocalFilterObject({ ...localFilterObject, filterCustomer: null })

                    handleFilters({ filterCustomer: null })
                  }}
                  deleteIcon={<Close sx={{ color: theme => theme.palette.primary.main }} />}
                  skin='light'
                  color='primary'
                />
              )}
              {filterSalesOrder && isFilterActive.filterSalesOrder && (
                <CustomChip
                  label={`Sales Order: ${filterSalesOrder?.orderNoPrefix || ''}${filterSalesOrder?.orderNo || ''}`}
                  onDelete={() => {
                    setLocalFilterObject({ ...localFilterObject, filterSalesOrder: null })

                    handleFilters({ filterSalesOrder: null })
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
                    setLocalFilterObject({ ...localFilterObject, startDate: oneMonthAgoDate, endDate: todayDate })
                    handleFilters({ startDate: oneMonthAgoDate, endDate: todayDate })
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
    </>
  )
}

export default AccountsFilter
