// ** MUI Imports

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

import Icon from 'src/@core/components/icon'
import Box from '@mui/material/Box'
import {
  alpha,
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
import { useDispatch, useSelector } from 'react-redux'
import CustomNoRowsOverlay from 'src/common-components/CustomNoRowsOverlay'
import { useIsLaptop } from 'src/hooks/IsDesktop'
import {
  dataTextStyles,
  dataTitleStyles,
  DateFunction,
  formatDateString,
  hasPermission,
  lastMonthDate,
  NumberFormat
} from 'src/common-functions/utils/UtilityFunctions'
import useCurrencies from 'src/hooks/getData/useCurrencies'
import {
  resetAccountTransaction,
  resetAccountTransactionFilters,
  setAccountTransactionFilters,
  setSelectedAccountTransaction
} from 'src/store/apps/account-transactions'
import MobileDataGrid from 'src/common-components/MobileDataGrid'
import CommonStyledMenu from 'src/common-components/CommonStyledMenu'
import { Close, Refresh } from '@mui/icons-material'
import DeleteAccountEntry from './DeleteAccountEntry'
import FilterDateRange from 'src/common-components/FilterDateRange'
import { getAccountEntriesByDateRangeQuery } from 'src/@core/components/graphql/account-transaction-queries'
import { fetchData } from 'src/common-functions/GraphqlOperations'
import { DELETE_ACCOUNT_ENTRY, VIEW_ACCOUNT_ENTRY } from 'src/common-functions/utils/Constants'
import Router from 'next/router'
import CustomChip from 'src/@core/components/mui/chip'

const AccountTransactionsListTable = ({ tenantId, transactionsData, loading }) => {
  const router = Router
  const dispatch = useDispatch()
  const isLaptop = useIsLaptop()
  const userProfile = useSelector(state => state.userProfile)
  const moduleFilterDateDuration = useSelector(
    state => state.otherSettings?.data?.moduleFilterDateDuration || undefined
  )
  const { startDate: rawStartDate, endDate: rawEndDate } = useSelector(
    state => state.accountTransactions?.filters ?? {}
  )

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

  const { currencies } = useCurrencies()
  const { accountTransactions = [] } = transactionsData || {}
  const [anchorElMap, setAnchorElMap] = useState({})
  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)

  const [filteredAccountTransactions, setFilteredAccountTransactions] = useState([])

  const handleFilterClick = event => {
    setAnchorEl(event.currentTarget)
  }

  const handleFilterClose = () => {
    const { startDate: isStartDateActive, endDate: isEndDateActive } = isFilterActive
    updateFilter('startDate', isStartDateActive ? startDate : null)
    updateFilter('endDate', isEndDateActive ? endDate : null)
    setAnchorEl(null)
  }

  const handleClick = (event, row) => {
    dispatch(setSelectedAccountTransaction(row))
    const updatedAnchorElMap = { ...anchorElMap }
    updatedAnchorElMap[row.transactionNo] = event.currentTarget
    setAnchorElMap(updatedAnchorElMap)
  }

  const handleClose = row => {
    const updatedAnchorElMap = { ...anchorElMap }
    updatedAnchorElMap[row.transactionNo] = null
    setAnchorElMap(updatedAnchorElMap)
  }
  const [openDialog, setOpenDialog] = useState(false)

  const handleDelete = row => {
    dispatch(setSelectedAccountTransaction(row))
    handleClose(row)
    setOpenDialog(true)
  }

  useEffect(() => {
    handleDateRange(startDate, endDate)
  }, [accountTransactions])

  const handleDateRange = async (startDate, endDate) => {
    let accountTransactionsFilter = accountTransactions
    const isStartDate = startDate.toDateString() !== oneMonthAgoDate.toDateString()
    const isEndDate = endDate.toDateString() !== todayDate.toDateString()
    try {
      if (isStartDate || isEndDate) {
        const response = await fetchData(
          getAccountEntriesByDateRangeQuery(tenantId, formatDateString(startDate), formatDateString(endDate))
        )
        console.log('Fetched data by date range successfully')
        accountTransactionsFilter = response.getAccountEntriesByDateRange
      }
      if (accountTransactionsFilter) {
        setFilterActive({
          filterActive: isStartDate || isEndDate,
          startDate: isStartDate,
          endDate: isEndDate
        })
        if (isStartDate || isEndDate) {
          setFilteredAccountTransactions(accountTransactionsFilter)
        } else {
          setFilteredAccountTransactions([])
        }
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setAnchorEl(null)
    }
  }

  const handleFilters = () => {
    handleDateRange(startDate, endDate)
  }

  const updateFilter = (key, value) => {
    dispatch(setAccountTransactionFilters({ [key]: value }))
  }

  const handleReset = async () => {
    setAnchorEl(null)
    dispatch(resetAccountTransactionFilters())
    setFilterActive({
      filterActive: false,
      startDate: false,
      endDate: false
    })
    setFilteredAccountTransactions([])
  }

  const columns = [
    {
      field: 'transactionNo',
      headerName: '',
      flex: 1,
      sortable: false,
      renderCell: ({ row }) => {
        const viewPermission = hasPermission(userProfile, VIEW_ACCOUNT_ENTRY)
        const deletePermission = hasPermission(userProfile, DELETE_ACCOUNT_ENTRY)

        const currency = currencies?.find(val => val?.currencyId === row?.currency)
        return (
          <Box sx={{ width: '100%', p: 2 }}>
            <Grid container spacing={3} sx={{ alignItems: { xs: 'flex-start', md: 'center' } }}>
              <Grid item xs={11}>
                <Grid container spacing={3} sx={{ alignItems: 'center' }}>
                  <Grid item xs={12} sm={3} lg={6}>
                    <Box
                      sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: '5px', md: '15px' }, alignItems: 'center' }}
                    >
                      <Typography sx={{ ...dataTitleStyles, color: '#818181' }}>
                        <span style={{ verticalAlign: 'middle', marginRight: '5px', color: '#696969' }}>#</span>{' '}
                        {row.transactionNoPrefix}
                        {row.transactionNo || ''}{' '}
                      </Typography>
                    </Box>
                    <Typography sx={{ ...dataTitleStyles, color: '#818181' }}>{row?.notes || ''}</Typography>
                  </Grid>
                  <Grid item xs={4} sm={3} lg={2}>
                    <Typography sx={dataTextStyles}>{DateFunction(row?.transactionDate) || '-'}</Typography>
                    <Typography sx={dataTitleStyles}>Date</Typography>
                  </Grid>
                  <Grid item xs={4} sm={3} lg={2}>
                    <Typography sx={dataTextStyles}>{row?.reference || '-'}</Typography>
                    <Typography sx={dataTitleStyles}>Reference</Typography>
                  </Grid>
                  <Grid item xs={4} sm={3} lg={2}>
                    {row?.amount ? (
                      <Typography sx={dataTextStyles}>
                        <NumberFormat value={row.amount} currency={currency} />
                      </Typography>
                    ) : (
                      '-'
                    )}
                    <Typography sx={dataTitleStyles}>Amount</Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={1}>
                {isLaptop ? (
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    {viewPermission && (
                      <IconButton
                        component={Link}
                        scroll={true}
                        href={`/accounting/transactions/view/${row?.transactionId}`}
                        onClick={() => dispatch(setSelectedAccountTransaction(row))}
                      >
                        <Icon icon='tabler:eye' />
                      </IconButton>
                    )}

                    {deletePermission && (
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
                          <Icon icon='iconamoon:menu-kebab-vertical-circle-light' width={25} height={25} />
                        </IconButton>

                        <CommonStyledMenu
                          anchorEl={anchorElMap[row.transactionNo]}
                          open={Boolean(anchorElMap[row.transactionNo])}
                          onClick={event => {
                            // event.stopPropagation()
                            handleClose(row)
                          }}
                        >
                          <MenuItem
                            // onClick={() => handleDelete(row)}
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
                        </CommonStyledMenu>
                      </>
                    )}
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                    <IconButton
                      aria-label='more'
                      id='long-button'
                      onClick={event => {
                        event.stopPropagation()
                        handleClick(event, row)
                      }}
                    >
                      <Icon icon='iconamoon:menu-kebab-vertical-circle-light' width={27} height={27} />
                    </IconButton>
                    <CommonStyledMenu
                      anchorEl={anchorElMap[row.transactionNo]}
                      open={Boolean(anchorElMap[row.transactionNo])}
                      onClose={() => handleClose(row)}
                    >
                      {viewPermission && (
                        <MenuItem
                          component={Link}
                          scroll={true}
                          href={`/accounting/transactions/view/${row.transactionId}`}
                        >
                          <Icon icon='tabler:eye' />
                          view
                        </MenuItem>
                      )}

                      {deletePermission && (
                        <MenuItem
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
              dispatch(resetAccountTransaction())
            }}
          >
            <Refresh />
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

              <Button variant='contained' onClick={handleFilters}>
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
                  updateFilter('startDate', null)
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
          columns={columns}
          rows={
            filteredAccountTransactions.length > 0 || isFilterActive.filterActive
              ? filteredAccountTransactions
              : accountTransactions
          }
          getRowId={row => row?.transactionNo}
          initialState={{
            sorting: {
              sortModel: [{ field: 'transactionNo', sort: 'desc' }]
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
            dispatch(setSelectedAccountTransaction(params.row))
            router.push(`/accounting/transactions/view/${params?.row?.transactionId}`)
          }}
          slots={{
            columnHeaders: () => null,
            noRowsOverlay: CustomNoRowsOverlay
          }}
          slotProps={{
            noRowsOverlay: {
              mainText: 'Empty Transactions',
              subText: 'No transactions available here. Click "New" button above to get started.'
            }
          }}
        />
      )}

      {openDialog && (
        <DeleteAccountEntry
          tenantId={tenantId}
          statementId={selectedTaxStatement?.statementId}
          openDialog={openDialog}
          setOpenDialog={setOpenDialog}
        />
      )}
    </>
  )
}

export default AccountTransactionsListTable
