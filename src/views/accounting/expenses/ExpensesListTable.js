import Link from 'next/link'
// ** MUI Imports
import Box from '@mui/material/Box'
import {
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
import { useEffect, useMemo, useState } from 'react'
import DeleteExpense from './DeleteExpense'
import { resetExpenseFilters, resetExpenses, setExpenseFilters, setSelectedExpense } from 'src/store/apps/expenses'
import { useDispatch, useSelector } from 'react-redux'
import Icon from 'src/@core/components/icon'
import CustomNoRowsOverlay from 'src/common-components/CustomNoRowsOverlay'
import CommonStyledMenu from 'src/common-components/CommonStyledMenu'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import useIsDesktop from 'src/hooks/IsDesktop'
import {
  dataTextStyles,
  dataTitleStyles,
  DateFunction,
  findObjectByCurrencyId,
  hasPermission,
  lastMonthDate
} from 'src/common-functions/utils/UtilityFunctions'
import CommonDateRangeFilter from 'src/common-components/CommonDateRangeFilter'
import { DELETE_EXPENSE, EDIT_EXPENSE, VIEW_EXPENSE } from 'src/common-functions/utils/Constants'
import useCurrencies from 'src/hooks/getData/useCurrencies'
import { fetchData } from 'src/common-functions/GraphqlOperations'
import { getGeneralExpensesByDateRangeQuery } from 'src/@core/components/graphql/general-expense-queries'
import RefreshIcon from '@mui/icons-material/Refresh'
import MobileDataGrid from 'src/common-components/MobileDataGrid'
import Router from 'next/router'
import FilterDateRange from 'src/common-components/FilterDateRange'
import CustomChip from 'src/@core/components/mui/chip'
import { Close } from '@mui/icons-material'

export const MOBILE_COLUMNS = {
  expenseRef: false,
  description: false
}
export const ALL_COLUMNS = { createdDateTime: false }

const ExpenseListTable = ({ tenantId, expenseData, loader }) => {
  const dispatch = useDispatch()
  const router = Router

  const isDesktop = useIsDesktop()

  const moduleFilterDateDuration = useSelector(
    state => state.otherSettings?.data?.moduleFilterDateDuration || undefined
  )
  const { startDate: rawStartDate, endDate: rawEndDate } = useSelector(state => state.expenses?.filters ?? {})

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

  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)
  const selectedExpense = useSelector(state => state.expenses?.selectedExpense)
  const { currencies } = useCurrencies()
  const [openDialog, setOpenDialog] = useState(false)
  const { expenses = [], generalExpenseTypes } = expenseData || {}
  const userProfile = useSelector(state => state.userProfile)
  const [filteredExpenses, setFilteredExpenses] = useState([])
  const [anchorElMap, setAnchorElMap] = useState({})

  const handleClick = (event, row) => {
    dispatch(setSelectedExpense(row))
    const updatedAnchorElMap = { ...anchorElMap }
    updatedAnchorElMap[row.expenseId] = event.currentTarget
    setAnchorElMap(updatedAnchorElMap)
  }

  const handleClose = row => {
    const updatedAnchorElMap = { ...anchorElMap }
    updatedAnchorElMap[row.expenseId] = null
    setAnchorElMap(updatedAnchorElMap)
  }

  const handleDelete = row => {
    setSelectedExpense(row)
    handleClose(row)
    setOpenDialog(true)
  }

  const [columnVisible, setColumnVisible] = useState(ALL_COLUMNS)
  useEffect(() => {
    const newColumns = isDesktop ? ALL_COLUMNS : MOBILE_COLUMNS
    setColumnVisible(newColumns)
  }, [isDesktop])

  const handleFilterClick = event => {
    setAnchorEl(event.currentTarget)
  }

  const handleFilterClose = () => {
    const { startDate: isStartDateActive, endDate: isEndDateActive } = isFilterActive
    updateFilter('startDate', isStartDateActive ? startDate : null)
    updateFilter('endDate', isEndDateActive ? endDate : null)
    setAnchorEl(null)
  }

  useEffect(() => {
    handleDateRange(startDate, endDate)
  }, [expenses])

  const handleDateRange = async (startDate, endDate) => {
    let expensesFilter = expenses
    const isStartDate = startDate.toDateString() !== oneMonthAgoDate.toDateString()
    const isEndDate = endDate.toDateString() !== todayDate.toDateString()
    try {
      if (isStartDate || isEndDate) {
        const response = await fetchData(getGeneralExpensesByDateRangeQuery(tenantId, startDate, endDate))
        expensesFilter = response.getGeneralExpensesByDateRange
      }

      if (expensesFilter) {
        setFilterActive({
          filterActive: isStartDate || isEndDate,
          startDate: isStartDate,
          endDate: isEndDate
        })
        if (isStartDate || isEndDate) {
          setFilteredExpenses(expensesFilter)
        } else {
          setFilteredExpenses([])
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setAnchorEl(null)
    }
  }

  const updateFilter = (key, value) => {
    dispatch(setExpenseFilters({ [key]: value }))
  }

  const handleReset = async () => {
    dispatch(resetExpenseFilters())
    setFilterActive({
      filterActive: false,
      startDate: false,
      endDate: false
    })
    setFilteredExpenses([])
    setAnchorEl(null)
  }

  const mobileColumns = [
    {
      field: 'expenseNo',
      headerName: '',
      flex: 1,
      sortable: false,
      renderCell: ({ row }) => {
        const viewPermission = hasPermission(userProfile, VIEW_EXPENSE)
        const editPermission = hasPermission(userProfile, EDIT_EXPENSE)
        const deletePermission = hasPermission(userProfile, DELETE_EXPENSE)
        const amtcurrency = findObjectByCurrencyId(currencies, row?.currency)
        const expenseType = generalExpenseTypes?.find(item => item?.expenseTypeId === row?.expenseType) || {}

        return (
          <Box sx={{ width: '100%', p: 2 }}>
            <Grid container spacing={3} sx={{ alignItems: 'center' }}>
              <Grid item xs={10.5}>
                <Grid container spacing={3} sx={{ alignItems: 'center' }}>
                  <Grid item xs={12} sm={6} md={4} lg={4} xl={4}>
                    <Typography sx={{ ...dataTextStyles, fontSize: '14px', fontWeight: 500, lineHeight: '28px' }}>
                      {row.expenseNoPrefix}
                      {row.expenseNo || ''}
                    </Typography>
                    <Typography sx={{ ...dataTitleStyles, color: '#818181' }}>
                      Type: {expenseType?.expenseType || '-'}
                    </Typography>
                  </Grid>

                  <Grid item xs={6} sm={6} md={4} lg={2} xl={2}>
                    <Typography sx={dataTextStyles}>{DateFunction(row?.expenseDate) || '-'}</Typography>
                    <Typography sx={dataTitleStyles}>Expense Date</Typography>
                  </Grid>
                  <Grid item xs={8} sm={6} md={4} lg={4} xl={4}>
                    <Typography sx={dataTextStyles}>{row.description || '-'}</Typography>
                    <Typography sx={dataTitleStyles}>Description</Typography>
                  </Grid>
                  <Grid item xs={4} sm={6} md={4} lg={2} xl={2}>
                    {row?.currency && (
                      <>
                        <Typography sx={dataTextStyles}>
                          {amtcurrency?.symbol} {row?.amount || '-'}
                        </Typography>
                        <Typography sx={dataTitleStyles}>Amount</Typography>
                      </>
                    )}
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={1.5} sx={{ alignSelf: 'flex-start' }}>
                {isDesktop ? (
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', minWidth: '100px' }}>
                    {viewPermission && (
                      <IconButton
                        component={Link}
                        href={`/accounting/expenses/view/${row?.expenseId}`}
                        onClick={event => {
                          event.stopPropagation()
                          dispatch(setSelectedExpense(row))
                        }}
                      >
                        <Icon icon='tabler:eye' />
                      </IconButton>
                    )}
                    {editPermission && (
                      <IconButton
                        component={Link}
                        href={`/accounting/expenses/edit/${row?.expenseId}`}
                        onClick={event => {
                          event.stopPropagation()
                          dispatch(setSelectedExpense(row))
                        }}
                      >
                        <Icon icon='tabler:edit' />
                      </IconButton>
                    )}
                    <IconButton
                      aria-label='more'
                      aria-haspopup='true'
                      onClick={event => {
                        event.stopPropagation()
                        handleClick(event, row)
                      }}
                    >
                      <Icon icon='iconamoon:menu-kebab-vertical-circle-light' width={25} height={25} />
                    </IconButton>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                    <IconButton
                      aria-label='more'
                      aria-haspopup='true'
                      onClick={event => {
                        event.stopPropagation()
                        handleClick(event, row)
                      }}
                    >
                      <Icon icon='iconamoon:menu-kebab-vertical-circle-light' width={27} height={27} />
                    </IconButton>
                  </Box>
                )}
                <CommonStyledMenu
                  anchorEl={anchorElMap[row.expenseId]}
                  open={Boolean(anchorElMap[row.expenseId])}
                  onClose={() => handleClose(row)}
                >
                  {!isDesktop && viewPermission && (
                    <MenuItem component={Link} scroll={true} href={`/accounting/expenses/view/${row.expenseId}`}>
                      <Icon icon='tabler:eye' /> View
                    </MenuItem>
                  )}
                  {!isDesktop && editPermission && (
                    <MenuItem component={Link} scroll={true} href={`/accounting/expenses/edit/${row.expenseId}`}>
                      <Icon icon='tabler:edit' /> Edit
                    </MenuItem>
                  )}
                  {deletePermission && (
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
            sx={{ fontSize: '21px' }}
            onClick={() => {
              dispatch(resetExpenses())
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
      {loader ? (
        <LinearProgress />
      ) : (
        <MobileDataGrid
          columns={mobileColumns}
          rows={filteredExpenses.length > 0 || isFilterActive.filterActive ? filteredExpenses : expenses}
          getRowId={row => row?.expenseId}
          initialState={{
            sorting: {
              sortModel: [{ field: 'expenseNo', sort: 'desc' }]
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
            dispatch(setSelectedExpense(params.row))
            router.push(`/accounting/expenses/view/${params?.row?.expenseId}`)
          }}
          slots={{
            columnHeaders: () => null,
            noRowsOverlay: CustomNoRowsOverlay
          }}
          slotProps={{
            noRowsOverlay: {
              mainText: 'Empty Expenses',
              subText: 'No expense available here. Click "Add New" button above to get started.'
            }
          }}
        />
      )}

      {openDialog && (
        <DeleteExpense
          tenantId={tenantId}
          expenseId={selectedExpense?.expenseId}
          openDialog={openDialog}
          setOpenDialog={setOpenDialog}
        />
      )}
    </>
  )
}

export default ExpenseListTable
