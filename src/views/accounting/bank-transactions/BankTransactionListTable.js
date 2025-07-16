import { useEffect, useMemo, useState } from 'react'
import CustomNoRowsOverlay from 'src/common-components/CustomNoRowsOverlay'
import useIsDesktop from 'src/hooks/IsDesktop'
import {
  dataTextStyles,
  dataTitleStyles,
  DateFunction,
  findObjectByCurrencyId,
  getStatusChip,
  hasPermission,
  lastMonthDate,
  NumberFormat,
  toTitleCase
} from 'src/common-functions/utils/UtilityFunctions'
import { Box, Button, Divider, Grid, IconButton, MenuItem, Popover, Tooltip, Typography, useTheme } from '@mui/material'
import { alpha } from '@mui/material/styles'
import Icon from 'src/@core/components/icon'
import CommonStyledMenu from 'src/common-components/CommonStyledMenu'
import DeleteTransaction from './DeleteTransaction'
import DeleteSelectedTransactions from './DeleteSelectedTransactions'
import TransactionReviewDrawer from './TransactionReviewDrawer'
import TransactionExpenseDrawer from './TransactionExpenseDrawer'
import { useDispatch, useSelector } from 'react-redux'
import {
  BANK_TRANSACTION_ACCOUNT_TRANSACTION,
  BANK_TRANSACTION_EXPENSE_TYPE,
  BANK_TRANSACTION_PO_PAYMENT,
  BANK_TRANSACTION_SO_PAYMENT,
  DELETE_BANK_TRANSACTION,
  MANAGE_BANK_TRANSACTION
} from 'src/common-functions/utils/Constants'
import StyledButton from 'src/common-components/StyledMuiButton'
import CommonCustomerPopup from 'src/common-components/CommonCustomerPopup'
import ViewRecords from './ViewRecords'
import useCustomers from 'src/hooks/getData/useCustomers'
import useVendors from 'src/hooks/getData/useVendors'
import CommonVendorPopup from 'src/common-components/CommonVendorPopup'
import CommonPoPaymentsPopUp from 'src/common-components/CommonPoPaymentsPopUp'
import CommonSoPaymentsPopUp from 'src/common-components/CommonSoPaymentsPopUp'
import useCurrencies from 'src/hooks/getData/useCurrencies'
import CommonExpensePopUp from 'src/common-components/CommonExpensePopUp'
import CommonAccountEntryPopUp from 'src/common-components/CommonAccountEntryPopUp'
import MobileDataGrid from 'src/common-components/MobileDataGrid'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import CustomTextField from 'src/@core/components/mui/text-field'
import FilterDateRange from 'src/common-components/FilterDateRange'
import RefreshIcon from '@mui/icons-material/Refresh'
import { Close } from '@mui/icons-material'
import { resetBankTransactionFilters, setBankTransactionFilters } from 'src/store/apps/bank-transaction'
import CustomChip from 'src/@core/components/mui/chip'
import { fetchData } from 'src/common-functions/GraphqlOperations'
import { getAllBankTransactionsByDateRangeQuery } from 'src/@core/components/graphql/bank-transaction-queries'

// Constants for column visibility based on device type

// Main component for transaction list table
const BankTransactionListTable = ({ transactions, setTransactions, tenantId, getTransactions }) => {
  const dispatch = useDispatch()
  const theme = useTheme()
  const isDesktop = useIsDesktop()
  const [openDialog, setOpenDialog] = useState(false)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [anchorElMap, setAnchorElMap] = useState({})
  const [deleteTransaction, setDeleteTransaction] = useState({})
  const [selectedRows, setSelectedRows] = useState([])
  const [openDrawer, setOpenDrawer] = useState(false) // State to manage drawer open/close
  const [transaction, setTransaction] = useState(null) // State to hold the current row data
  // const [loading, setLoading] = useState(false)
  const { customers, fetchCustomers } = useCustomers(tenantId)
  const { vendors } = useVendors(tenantId)
  const [viewRecords, setViewRecords] = useState(false)
  const [matchedType, setMatchedType] = useState()
  const localCurrency = useSelector(state => state?.currencies?.selectedCurrency || {})
  const { currencies } = useCurrencies()
  const userProfile = useSelector(state => state.userProfile)
  const [temporaryFilterData, setTemporaryFilterData] = useState([])
  const [filteredBankTransactions, setFilteredBankTransactions] = useState([])

  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)
  const statuses = [...new Set(transactions?.map(item => item.status))]

  const moduleFilterDateDuration = useSelector(
    state => state.otherSettings?.data?.moduleFilterDateDuration || undefined
  )
  const {
    startDate: rawStartDate,
    endDate: rawEndDate,
    filterStatus,
    debitFrom,
    debitTo,
    creditFrom,
    creditTo
  } = useSelector(state => state.bankTransactions?.filters ?? {})

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
    debitFrom: debitFrom !== '' && debitFrom != null && debitFrom != 0,
    debitTo: debitTo !== '' && debitTo != null && debitTo != 0,
    creditFrom: creditFrom !== '' && creditFrom != null && creditFrom != 0,
    creditTo: creditTo !== '' && creditTo != null && creditTo != 0,

    filterStatus: Boolean(filterStatus)
  }

  const anyFilterActive = Object.values(filters).some(Boolean)

  // State for active filters
  const [isFilterActive, setFilterActive] = useState({
    filterActive: anyFilterActive,
    ...filters
  })

  // Handle action menu click
  useEffect(() => {
    if (!tenantId) return
    const loadCustomers = async () => {
      await fetchCustomers()
    }

    loadCustomers()
  }, [tenantId, fetchCustomers])

  const handleClick = (event, row) => {
    setDeleteTransaction(row)
    const updatedAnchorElMap = { ...anchorElMap }
    updatedAnchorElMap[row.transactionId] = event.currentTarget
    setAnchorElMap(updatedAnchorElMap)
  }
  const isDebitRangeInvalid =
    debitFrom !== '' && debitTo !== '' && !isNaN(debitFrom) && !isNaN(debitTo) && Number(debitFrom) > Number(debitTo)
  const isCreditRangeInvalid =
    creditFrom !== '' &&
    creditTo !== '' &&
    !isNaN(creditFrom) &&
    !isNaN(creditTo) &&
    Number(creditFrom) > Number(creditTo)

  const handleFilterClose = () => {
    const filter = {
      filterStatus: isFilterActive.filterStatus ? filterStatus : null,
      debitFrom: isFilterActive.debitFrom ? debitFrom : 0,
      debitTo: isFilterActive.debitTo ? debitTo : 0,
      creditFrom: isFilterActive.creditFrom ? creditFrom : 0,
      creditTo: isFilterActive.creditTo ? creditTo : 0,
      startDate: isFilterActive.startDate ? startDate : null,
      endDate: isFilterActive.endDate ? endDate : null
    }
    dispatch(setBankTransactionFilters(filter))
    setAnchorEl(null)
  }

  const [dialogState, setDialogState] = useState({
    open: false,
    openExpense: false,
    openAccountEntry: false,
    selectedPaymentId: null,
    selectedGeneralExpenseId: null,
    selectedAccountTransactionId: null
  })
  const [vendorDialogState, setVendorDialogState] = useState({
    open: false,
    selectedVendorId: null
  })

  const [salesDialogState, setSalesDialogState] = useState({
    open: false,
    selectedSalesPaymentId: null
  })
  const [customerDialogState, setCustomerDialogState] = useState({
    open: false,
    selectedCustomerId: null
  })

  function returnSOSingleRecord(popupKey, records) {
    const customer = customers.find(customer => customer.customerId === records.customerId) || {}
    const currency = findObjectByCurrencyId(currencies, records?.currency)
    return (
      <Box key={popupKey}>
        <Typography sx={{ fontSize: '12px' }}>
          SI Payment:{' '}
          <StyledButton
            color='primary'
            onClick={() => setSalesDialogState({ open: true, selectedSalesPaymentId: records?.salesInvoicePaymentId })}
          >
            {records.transactionRefPrefix}
            {records.transactionRef}
          </StyledButton>
        </Typography>

        <Typography sx={{ fontSize: '12px' }}>
          Customer:{' '}
          <StyledButton
            color='primary'
            onClick={() => setCustomerDialogState({ open: true, selectedCustomerId: records?.customerId })}
          >
            {customer?.customerName || ''}
          </StyledButton>
        </Typography>

        <Typography sx={{ fontSize: '12px' }}>
          {`Amount: `}
          <NumberFormat value={records.amount} currency={currency} />
        </Typography>
      </Box>
    )
  }
  function returnPOSingleRecord(popupKey, records) {
    const vendor = vendors.find(vendor => vendor.vendorId === records.vendorId) || {}
    const currency = findObjectByCurrencyId(currencies, records?.currency)
    return (
      <Box key={popupKey}>
        <Typography sx={{ fontSize: '12px' }}>
          PO Payment:{' '}
          <StyledButton
            color='primary'
            onClick={() => setDialogState({ open: true, selectedPaymentId: records?.purchaseOrderPaymentId })}
          >
            {records.transactionRefPrefix}
            {records.transactionRef}
          </StyledButton>
        </Typography>

        <Typography sx={{ fontSize: '12px' }}>
          Vendor:{' '}
          <StyledButton
            color='primary'
            onClick={() => setVendorDialogState({ open: true, selectedVendorId: records?.vendorId })}
          >
            {vendor?.displayName || ''}
          </StyledButton>
        </Typography>

        <Typography sx={{ fontSize: '12px' }}>
          {`Amount: `}
          <NumberFormat value={records.amount} currency={currency} />
        </Typography>
      </Box>
    )
  }

  function returnExpenseSingleRecord(popupKey, records) {
    const currency = findObjectByCurrencyId(currencies, records?.currency)
    return (
      <Box key={popupKey}>
        <Typography sx={{ fontSize: '12px' }}>
          General Expense:{' '}
          <StyledButton
            color='primary'
            onClick={() => setDialogState({ openExpense: true, selectedGeneralExpenseId: records?.generalExpenseId })}
          >
            {records.transactionRefPrefix}
            {records.transactionRef}
          </StyledButton>
        </Typography>
        <Typography sx={{ fontSize: '12px' }}>
          {`Amount: `}
          <NumberFormat value={records.amount} currency={currency} />
        </Typography>
      </Box>
    )
  }

  function returnAccountEntrySingleRecord(popupKey, records) {
    const currency = findObjectByCurrencyId(currencies, records?.currency)
    return (
      <Box key={popupKey}>
        <Typography sx={{ fontSize: '12px' }}>
          Transaction:
          <StyledButton
            color='primary'
            onClick={() =>
              setDialogState({ openAccountEntry: true, selectedAccountTransactionId: records?.accountTransactionId })
            }
          >
            {records.transactionRefPrefix}
            {records.transactionRef}
          </StyledButton>
        </Typography>
        <Typography sx={{ fontSize: '12px' }}>
          {`Amount: `}
          <NumberFormat value={records.amount} currency={currency} />
        </Typography>
      </Box>
    )
  }
  // Handle action menu close
  const handleClose = row => {
    const updatedAnchorElMap = { ...anchorElMap }
    updatedAnchorElMap[row.transactionId] = null
    setAnchorElMap(updatedAnchorElMap)
  }

  // Handle delete action
  const handleDelete = row => {
    handleClose(row)
    setOpenDialog(true)
  }

  // Handle drawer open
  const openReviewDrawer = row => {
    setTransaction(row) // Set current row data
    handleClose(row)
    setOpenDrawer(true) // Open the drawer
  }

  const openRecordsDrawer = row => {
    setTransaction(row.relatedRecords) // Set current row data
    // handleClose(row.)
    setMatchedType(row.matchType)
    setViewRecords(true) // Open the drawer
  }

  const showActionField =
    hasPermission(userProfile, DELETE_BANK_TRANSACTION) || hasPermission(userProfile, MANAGE_BANK_TRANSACTION)

  // const acceptExpense = async expense => {
  // //   const modifiedExpense = {
  // //     schemaVersion: SCHEMA_VERSION,
  // //     expenseDate: parseDate(expense?.transactionDate),
  // //     expenseType: '66b70ed36fc189a66744a0c6',
  // //     expenseRef: '',
  // //     paymentMethod: '66b710cf6fc189a66744a0c9',
  // //     amount: safeNumber(expense.debit),
  // //     currency: 'AUD',
  // //     exchangeRate: 1,
  // //     amountInLocalCurrency: safeNumber(expense.debit),
  // //     bankTransactionId: expense?.transactionId || null,
  // //     description: expense?.description || '',
  // //     notes: expense?.notes || '',
  // //     files: []
  // //   }

  //   try {
  //     const response = await writeData(createGeneralExpenseMutation(), { tenantId, expense: modifiedExpense })

  //     if (response.createGeneralExpense) {
  //       dispatch(createAlert({ message: 'Expense created successfully!', type: 'success' }))
  //     } else {
  //       dispatch(createAlert({ message: 'Failed to create Expense!', type: 'error' }))
  //     }
  //   } catch (error) {
  //     console.error('Error:', error)
  //     dispatch(createAlert({ message: 'An error occurred while creating Expense.', type: 'error' }))
  //   }
  // }
  // Column definitions for DataGrid
  const getColor = status => {
    switch (status) {
      case 'MATCHED':
        return theme.palette.success.main
      case 'NEW':
        return theme.palette.secondary.main
      default:
        return theme.palette.secondary.main
    }
  }

  const [searchedAccount, setSearchedAccount] = useState(null)

  const handleSearchChange = (event, newValue) => {
    const searchValue = newValue ? newValue.toLowerCase() : ''

    if (searchValue) {
      const matchedAccounts = transactions.filter(val => {
        return (
          val?.credit?.toString().toLowerCase().includes(searchValue) ||
          val?.debit?.toString().toLowerCase().includes(searchValue) ||
          val?.description?.toLowerCase().includes(searchValue)
        )
      })

      setFilteredBankTransactions(matchedAccounts.length > 0 ? matchedAccounts : temporaryFilterData)
    } else {
      setFilteredBankTransactions(temporaryFilterData)
      setSearchedAccount(null)
    }
  }
  useEffect(() => {
    handleDateRange(startDate, endDate)
  }, [transactions])

  const handleDateRange = async (startDate, endDate, overrides = {}) => {
    let transactionsArray = transactions

    const {
      filterStatus: statusOverride = filterStatus,
      debitFrom: debitFromOverride = debitFrom,
      debitTo: debitToOverride = debitTo,
      creditFrom: creditFromOverride = creditFrom,
      creditTo: creditToOverride = creditTo
    } = overrides

    const isStartDateChanged = startDate.toDateString() !== oneMonthAgoDate.toDateString()
    const isEndDateChanged = endDate.toDateString() !== todayDate.toDateString()

    const isFilterStatus = Boolean(statusOverride)
    const isFilterDebitFrom = debitFromOverride !== '' && debitFromOverride != null && debitFromOverride !== 0
    const isFilterDebitTo = debitToOverride !== '' && debitToOverride != null && debitToOverride !== 0
    const isFilterCreditFrom = creditFromOverride !== '' && creditFromOverride != null && creditFromOverride !== 0
    const isFilterCreditTo = creditToOverride !== '' && creditToOverride != null && creditToOverride !== 0

    const anyFilterActive =
      isStartDateChanged ||
      isEndDateChanged ||
      isFilterStatus ||
      isFilterDebitFrom ||
      isFilterDebitTo ||
      isFilterCreditFrom ||
      isFilterCreditTo

    try {
      if (isStartDateChanged || isEndDateChanged) {
        const data = await fetchData(
          getAllBankTransactionsByDateRangeQuery(tenantId, DateFunction(startDate), DateFunction(endDate))
        )
        transactionsArray = data?.getAllBankTransactionsByDateRange || []
        console.log('fetched data successfully')
      }

      if (transactionsArray) {
        const filteredData = transactionsArray.filter(item => {
          const statusMatches = isFilterStatus ? item?.status === statusOverride : true

          const isDebitFilterApplied = isFilterDebitFrom || isFilterDebitTo
          const isCreditFilterApplied = isFilterCreditFrom || isFilterCreditTo

          let amountMatches = isDebitFilterApplied || isCreditFilterApplied ? false : true

          const debit = Number(item?.debit ?? 0)
          const hasDebit = debit > 0
          const credit = Number(item?.credit ?? 0)
          const hasCredit = credit > 0

          if (hasDebit && isDebitFilterApplied) {
            amountMatches =
              (!isFilterDebitFrom || debit >= Number(debitFromOverride)) &&
              (!isFilterDebitTo || debit <= Number(debitToOverride))
          } else if (hasCredit && isCreditFilterApplied) {
            amountMatches =
              (!isFilterCreditFrom || credit >= Number(creditFromOverride)) &&
              (!isFilterCreditTo || credit <= Number(creditToOverride))
          }

          return statusMatches && amountMatches
        })

        setFilterActive({
          filterActive: anyFilterActive,
          startDate: isStartDateChanged,
          endDate: isEndDateChanged,
          filterStatus: isFilterStatus,
          debitFrom: isFilterDebitFrom,
          debitTo: isFilterDebitTo,
          creditFrom: isFilterCreditFrom,
          creditTo: isFilterCreditTo
        })

        setTemporaryFilterData(anyFilterActive ? filteredData : [])
        setFilteredBankTransactions(anyFilterActive ? filteredData : [])
        setSearchedAccount(null)
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
    dispatch(setBankTransactionFilters({ [key]: value }))
  }

  const handleFilterClick = event => {
    setAnchorEl(event.currentTarget)
  }

  const handleReset = async () => {
    dispatch(resetBankTransactionFilters())
    setFilterActive({
      filterActive: false,
      startDate: false,
      endDate: false,
      filterStatus: false,
      debitFrom: false,
      creditFrom: false
    })
    setFilteredBankTransactions([])
    setTemporaryFilterData()
    setAnchorEl(null)
    setSearchedAccount(null)
  }

  const mobileColumns = [
    {
      field: 'transactionDate',
      headerName: '',
      flex: 1,
      sortable: false,
      renderCell: ({ row }) => {
        return (
          <Box sx={{ width: '100%', p: 2 }}>
            <Grid container spacing={3} sx={{ alignItems: { xs: 'flex-start', md: 'center' } }}>
              <Grid item xs={11}>
                <Grid container spacing={3} sx={{ alignItems: 'center' }}>
                  <Grid item xs={12} sm={6} md={3} lg={2}>
                    <Typography sx={{ ...dataTextStyles, fontSize: '14px', fontWeight: 500, lineHeight: '28px' }}>
                      {DateFunction(row?.transactionDate)}
                    </Typography>
                    <Typography sx={{ ...dataTitleStyles, color: '#818181' }}>Transaction Date</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3} md={2} lg={2}>
                    {row?.debit ? <NumberFormat value={row?.debit} currency={localCurrency} /> : '-'}
                    <Typography sx={dataTitleStyles}>Debit</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3} md={2} lg={2}>
                    {row?.credit ? <NumberFormat value={row?.credit} currency={localCurrency} /> : '-'}
                    <Typography sx={dataTitleStyles}>Credit</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3} lg={3}>
                    <Typography sx={dataTextStyles}>{row?.description || '-'}</Typography>
                    <Typography sx={dataTitleStyles}>Description</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={2} lg={2}>
                    {getStatusChip(getColor(row.status), row.status) || '-'}
                    <Typography sx={dataTitleStyles}>Status</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    {row.relatedRecords.length < 2 ? (
                      row.relatedRecords.map((records, nestedRowIndex) => {
                        const popupKey = `${row?.transactionId}-${nestedRowIndex}`
                        if (row.matchType === BANK_TRANSACTION_SO_PAYMENT) {
                          return returnSOSingleRecord(popupKey, records)
                        } else if (row.matchType === BANK_TRANSACTION_PO_PAYMENT) {
                          return returnPOSingleRecord(popupKey, records)
                        } else if (row.matchType === BANK_TRANSACTION_EXPENSE_TYPE) {
                          return returnExpenseSingleRecord(popupKey, records)
                        } else if (row.matchType === BANK_TRANSACTION_ACCOUNT_TRANSACTION) {
                          return returnAccountEntrySingleRecord(popupKey, records)
                        }
                        return null
                      })
                    ) : (
                      <Button variant='outlined' size='small' onClick={() => openRecordsDrawer(row)}>
                        View
                      </Button>
                    )}
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={1} sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'flex-end' }}>
                  {hasPermission(userProfile, MANAGE_BANK_TRANSACTION) && row.status !== 'MATCHED' && (
                    <Button
                      color='info'
                      variant='outlined'
                      size='small'
                      sx={{ minWidth: '80px' }}
                      onClick={() => openReviewDrawer(row)}
                    >
                      Review
                    </Button>
                  )}
                  {hasPermission(userProfile, DELETE_BANK_TRANSACTION) && row.status !== 'MATCHED' && (
                    <>
                      <IconButton sx={{ p: 0.5 }} onClick={event => handleClick(event, row)}>
                        <Icon
                          icon='iconamoon:menu-kebab-vertical-circle-light'
                          width={isDesktop ? 25 : 27}
                          height={isDesktop ? 25 : 27}
                        />
                      </IconButton>
                      <CommonStyledMenu
                        anchorEl={anchorElMap[row.transactionId]}
                        open={Boolean(anchorElMap[row.transactionId])}
                        onClose={() => handleClose(row)}
                      >
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
                      </CommonStyledMenu>
                    </>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Box>
        )
      }
    }
  ]

  // Main return block
  return (
    <Box sx={{ width: '100%', padding: 2 }}>
      <>
        <Grid container spacing={2} sx={{ justifyContent: 'space-between', mb: 3 }}>
          <Grid item xs={7} sm={4} md={4}>
            <CustomAutocomplete
              options={filteredBankTransactions.length > 0 ? filteredBankTransactions : transactions}
              getOptionLabel={option => {
                if (option?.credit) return `${option.credit}(Credit) - ${option.description}`
                else if (option?.debit) return `${option.debit}(Debit) - ${option.description}`
              }}
              filterOptions={options => options}
              value={transactions?.find(option => option.transactionId === searchedAccount?.transactionId) || null}
              onChange={(event, newValue) => {
                setFilteredBankTransactions(newValue ? [newValue] : transactions)
                setSearchedAccount(newValue)
              }}
              onInputChange={(event, newValue) => {
                if (newValue && newValue.trim() !== '') {
                  handleSearchChange(event, newValue)
                }
              }}
              disableClearable={false}
              renderInput={params => <CustomTextField {...params} fullWidth label='Accounts' />}
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
                  sx={{ fontSize: '21px' }}
                  onClick={() => {
                    getTransactions()
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

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 4, mb: 2 }}>
                    <Typography sx={{ fontSize: '13px', lineHeight: '23px' }}>Debit Range</Typography>

                    <Button
                      type='button'
                      onClick={() => {
                        updateFilter('debitFrom', 0)
                        updateFilter('debitTo', 0)
                      }}
                    >
                      Reset
                    </Button>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 4, alignItems: 'center', px: 4 }}>
                    <CustomTextField
                      label='From'
                      value={debitFrom}
                      onChange={event => updateFilter('debitFrom', event.target.value)}
                      type='number'
                      sx={{ width: '140px' }}
                      error={isDebitRangeInvalid}
                      helperText={isDebitRangeInvalid ? 'From must be less than To' : ''}
                    />

                    <CustomTextField
                      label='To'
                      value={debitTo}
                      onChange={event => updateFilter('debitTo', event.target.value)}
                      type='number'
                      sx={{ width: '140px' }}
                      error={isDebitRangeInvalid}
                      helperText={isDebitRangeInvalid ? 'From must be less than To' : ''}
                    />
                  </Box>
                  <Divider sx={{ mt: 3, opacity: 0.5 }} color='primary' />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 4, mb: 2 }}>
                    <Typography sx={{ fontSize: '13px', lineHeight: '23px' }}>Credit Range</Typography>
                    <Button
                      type='button'
                      onClick={() => {
                        updateFilter('creditFrom', 0)
                        updateFilter('creditTo', 0)
                      }}
                    >
                      Reset
                    </Button>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 4, alignItems: 'center', px: 4 }}>
                    <CustomTextField
                      label='Credit From'
                      value={creditFrom}
                      onChange={event => updateFilter('creditFrom', event.target.value)}
                      type='number'
                      sx={{ width: '140px' }}
                      error={isCreditRangeInvalid}
                      helperText={isCreditRangeInvalid ? 'From must be less than To' : ''}
                    />

                    <CustomTextField
                      label='Credit From'
                      value={creditTo}
                      onChange={event => updateFilter('creditTo', event.target.value)}
                      type='number'
                      sx={{ width: '140px' }}
                      error={isCreditRangeInvalid}
                      helperText={isCreditRangeInvalid ? 'From must be less than To' : ''}
                    />
                  </Box>
                  <Divider sx={{ mt: 3, opacity: 0.5 }} color='primary' />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 4, mb: 2 }}>
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
          </Grid>
          {(isFilterActive.filterStatus ||
            isFilterActive.debitFrom ||
            isFilterActive.debitTo ||
            isFilterActive.creditFrom ||
            isFilterActive.creditTo ||
            isFilterActive.startDate ||
            isFilterActive.endDate) && (
            <Grid item xs={12}>
              <Box
                sx={{
                  display: 'flex',
                  // alignItems: 'center',
                  justifyContent: 'flex-end'
                  // gap: 3,
                  // mb: 3
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
                  Filtered By :
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
                  {(isFilterActive.debitFrom || isFilterActive.debitTo) && (
                    <CustomChip
                      label={`Debit Range: ${debitFrom} - ${debitTo}`}
                      onDelete={() => {
                        updateFilter('debitFrom', 0)
                        updateFilter('debitTo', 0)
                        handleFilters({ debitFrom: 0, debitTo: 0 })
                      }}
                      deleteIcon={<Close sx={{ color: theme => theme.palette.primary.main }} />}
                      skin='light'
                      color='primary'
                    />
                  )}
                  {(isFilterActive.creditFrom || isFilterActive.creditTo) && (
                    <CustomChip
                      label={`Credit Range: ${creditFrom} - ${creditTo}`}
                      onDelete={() => {
                        updateFilter('creditFrom', 0)
                        updateFilter('creditTo', 0)
                        handleFilters({ creditFrom: 0, creditTo: 0 })
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

        <MobileDataGrid
          columns={mobileColumns}
          rows={filteredBankTransactions.length > 0 ? filteredBankTransactions : transactions}
          disableColumnMenu={true}
          sortModel={[{ field: 'transactionDate', sort: 'desc' }]} // ✅ This is all you need
          getRowId={row => row?.transactionId}
          onRowSelectionModelChange={newSelection => {
            setSelectedRows(newSelection)
          }}
          slots={{
            columnHeaders: () => null,
            noRowsOverlay: CustomNoRowsOverlay
          }}
          slotProps={{
            noRowsOverlay: {
              mainText: 'Empty Transactions',
              subText: 'No transactions available here. Click "Import" button above to get started.'
            }
          }}
        />

        {openDialog && (
          <DeleteTransaction
            tenantId={tenantId}
            deleteTransaction={deleteTransaction}
            openDialog={openDialog}
            setOpenDialog={setOpenDialog}
            setTransactions={setTransactions}
          />
        )}

        {openDeleteDialog && (
          <DeleteSelectedTransactions
            tenantId={tenantId}
            selectedRows={selectedRows}
            openDialog={openDeleteDialog}
            setOpenDialog={setOpenDeleteDialog}
            setTransactions={setTransactions}
          />
        )}

        {dialogState?.open && (
          <CommonPoPaymentsPopUp
            paymentId={dialogState?.selectedPaymentId}
            open={dialogState.open}
            onClose={() => setDialogState({ open: false, selectedPaymentId: null })}
          />
        )}
        {vendorDialogState?.open && (
          <CommonVendorPopup
            vendorId={vendorDialogState?.selectedVendorId}
            openVendorDialog={vendorDialogState?.open}
            setOpenVendorDialog={() => setVendorDialogState({ open: false, selectedVendorId: null })}
          />
        )}
        {salesDialogState?.open && (
          <CommonSoPaymentsPopUp
            paymentId={salesDialogState?.selectedSalesPaymentId}
            openSoPaymentDialog={salesDialogState?.open}
            setSoPaymentDialog={() => setSalesDialogState({ open: false, selectedSalesPaymentId: null })}
          />
        )}
        {customerDialogState?.open && (
          <CommonCustomerPopup
            customerId={customerDialogState?.selectedCustomerId}
            open={customerDialogState?.open}
            setOpen={() => setCustomerDialogState({ open: false, selectedCustomerId: null })}
          />
        )}
        {dialogState?.openExpense && (
          <CommonExpensePopUp
            expenseId={dialogState?.selectedGeneralExpenseId}
            open={dialogState?.openExpense}
            setClose={() => setDialogState({ openExpense: false, selectedGeneralExpenseId: null })}
          />
        )}
        {dialogState?.openAccountEntry && (
          <CommonAccountEntryPopUp
            transactionId={dialogState?.selectedAccountTransactionId}
            open={dialogState?.openAccountEntry}
            setClose={() => setDialogState({ openAccountEntry: false, selectedAccountTransactionId: null })}
          />
        )}
        <>
          {transaction &&
            !viewRecords &&
            (transaction.debit !== 0 && transaction.credit === 0 ? (
              <TransactionExpenseDrawer
                setOpenDrawer={setOpenDrawer}
                transaction={transaction}
                openDrawer={openDrawer}
                setTransactions={setTransactions}
              />
            ) : (
              <TransactionReviewDrawer
                setOpenDrawer={setOpenDrawer}
                transaction={transaction}
                openDrawer={openDrawer}
                setTransactions={setTransactions}
              />
            ))}
          {viewRecords && (
            <ViewRecords
              setViewRecords={setViewRecords}
              transaction={transaction}
              viewRecords={viewRecords}
              matchedType={matchedType}
              setTransactions={setTransactions}
            />
          )}
        </>
      </>
    </Box>
  )
}

export default BankTransactionListTable
