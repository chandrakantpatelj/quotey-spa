import Link from 'next/link'
import { useEffect, useState } from 'react'
import { DataGrid } from '@mui/x-data-grid'
import DeleteQuotation from './DeleteQuotation'
import { alpha } from '@mui/material/styles'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import Icon from 'src/@core/components/icon'
import { useDispatch, useSelector } from 'react-redux'
import { Box, Button, IconButton, MenuItem, Popover, Divider, Typography, Tooltip } from '@mui/material'
import CustomNoRowsOverlay from 'src/common-components/CustomNoRowsOverlay'
import {
  DateFunction,
  formatDateString,
  hasPermission,
  lastMonthDate,
  rowStatusChip,
  toTitleCase
} from 'src/common-functions/utils/UtilityFunctions'
import CommonStyledMenu from 'src/common-components/CommonStyledMenu'
import {
  DELETE_QUOTATION,
  Quotation_Statuses,
  EDIT_QUOTATION,
  CREATE_SALES_ORDER,
  VIEW_QUOTATION
} from 'src/common-functions/utils/Constants'
import useIsDesktop from 'src/hooks/IsDesktop'
import { resetQuotation, setSelectedQuotation } from 'src/store/apps/quotations'
import FilterDateRange from 'src/common-components/FilterDateRange'
import { getQuotationsByDateRangeQuery } from 'src/@core/components/graphql/quotation-queries'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import CustomTextField from 'src/@core/components/mui/text-field'
import { fetchData } from 'src/common-functions/GraphqlOperations'
import { parseISO } from 'date-fns'
import CommonCustomerPopup from 'src/common-components/CommonCustomerPopup'
import StyledButton from 'src/common-components/StyledMuiButton'
import RefreshIcon from '@mui/icons-material/Refresh'

export const MOBILE_COLUMNS = {
  dueDate: false,
  notes: false,
  status: false
}
export const ALL_COLUMNS = {}

const QuotationListTable = ({ tenantId, quotationObject, setQuotationObject }) => {
  const dispatch = useDispatch()
  const isDesktop = useIsDesktop()
  const [status, setStatus] = useState(null)
  const { customers = [], quotations = [] } = quotationObject || {}

  const moduleFilterDateDuration = useSelector(
    state => state.otherSettings?.data?.moduleFilterDateDuration || undefined
  )
  const [startDate, setStartDate] = useState(lastMonthDate(moduleFilterDateDuration))
  const [endDate, setEndDate] = useState(new Date())
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedQuotationState, setSelectedQuotationState] = useState('')
  const [anchorElMap, setAnchorElMap] = useState({})
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const userProfile = useSelector(state => state.userProfile)

  const [openCustomerDialog, setOpenCustomerDialog] = useState(false)
  const [customerForDialog, setCustomerForDialog] = useState({})

  const handleClick = (event, row) => {
    dispatch(setSelectedQuotation(row))
    const updatedAnchorElMap = { ...anchorElMap }
    updatedAnchorElMap[row.quotationId] = event.currentTarget
    setAnchorElMap(updatedAnchorElMap)
  }

  const handleClose = row => {
    const updatedAnchorElMap = { ...anchorElMap }
    updatedAnchorElMap[row.quotationId] = null
    setAnchorElMap(updatedAnchorElMap)
  }

  const handleDelete = row => {
    setSelectedQuotationState(row)
    handleClose(row)
    setOpenDialog(true)
  }

  const [columnVisible, setColumnVisible] = useState(ALL_COLUMNS)
  useEffect(() => {
    const newColumns = isDesktop ? ALL_COLUMNS : MOBILE_COLUMNS
    setColumnVisible(newColumns)
  }, [isDesktop])

  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)
  const handleFilterClick = event => {
    setAnchorEl(event.currentTarget)
  }

  const handleFilterClose = () => {
    setAnchorEl(null)
  }

  const handleDateRange = async (startDate, endDate) => {
    try {
      const response = await fetchData(
        getQuotationsByDateRangeQuery(tenantId, formatDateString(startDate), formatDateString(endDate))
      )
      if (response?.getQuotationsByDateRange) {
        const filteredData = response.getQuotationsByDateRange.filter(item => {
          const statusMatches = status ? item?.status === status : true
          const customerMatches = selectedCustomer?.customerId ? item?.customerId === selectedCustomer.customerId : true
          return statusMatches && customerMatches
        })

        setQuotationObject(prevState => ({
          ...prevState,
          quotations: filteredData
        }))
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setAnchorEl(null)
      console.log('fetched data successfully')
    }
  }

  const handleFilters = () => {
    handleDateRange(startDate, endDate)
  }

  const handleReset = async () => {
    let today = new Date()
    let oneMonthAgo = lastMonthDate(moduleFilterDateDuration)
    setStartDate(oneMonthAgo)
    setEndDate(today)
    setSelectedCustomer(null)
    setStatus(null)
    const formattedStartDate = formatDateString(oneMonthAgo)
    const formattedEndDate = formatDateString(today)
    try {
      const response = await fetchData(getQuotationsByDateRangeQuery(tenantId, formattedStartDate, formattedEndDate))
      const data = response.getQuotationsByDateRange || []
      setQuotationObject(prevState => ({
        ...prevState,
        quotations: data
      }))
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setAnchorEl(null)
      console.log('Fetched data by date range successfully')
    }
  }

  const columns = [
    {
      flex: 0.1,
      minWidth: 100,
      field: 'quotationNo',
      headerName: 'No',
      renderCell: params => {
        const { row } = params
        return (
          <span>
            {row?.quotationNoPrefix && row?.quotationNoPrefix}
            {row?.quotationNo}
          </span>
        )
      }
    },

    {
      flex: 0.15,
      minWidth: 110,
      field: 'quotationDate',
      headerName: 'Date',
      type: 'date',
      valueGetter: ({ row }) => (row?.quotationDate ? parseISO(row?.quotationDate) : null),
      renderCell: ({ row }) => {
        const date = DateFunction(row?.quotationDate)
        return <span> {date}</span>
      }
    },
    {
      flex: 0.14,
      minWidth: 100,
      field: 'customerId',
      headerName: 'Customer',
      renderCell: ({ row }) => {
        const customer = customers?.find(item => item?.customerId === row?.customerId) || {}
        const handleClick = () => {
          if (customer) {
            setCustomerForDialog(customer)
            setOpenCustomerDialog(true)
          }
        }

        return (
          <span>
            {customer?.customerName ? (
              <StyledButton color='primary' style={{ textDecoration: 'none' }} onClick={handleClick}>
                {customer?.customerName}
              </StyledButton>
            ) : (
              'NA'
            )}
          </span>
        )
      }
    },
    {
      flex: 0.4,
      minWidth: 138,
      field: 'notes',
      headerName: 'Notes'
    },
    {
      flex: 0.1,
      minWidth: 100,
      field: 'dueDate',
      headerName: 'Due Date',
      renderCell: params => {
        const { row } = params
        const date = DateFunction(row?.dueDate)
        return <span> {date}</span>
      }
    },
    {
      flex: 0.1,
      minWidth: 100,
      field: 'status',
      headerName: 'Status',
      renderCell: ({ row }) => {
        return rowStatusChip(row?.status)
      }
    },
    {
      field: 'action',
      flex: 0.1,
      minWidth: isDesktop ? 130 : 66,
      headerName: 'Action',
      align: 'right',
      headerAlign: 'right',
      sortable: false,
      renderCell: ({ row }) => {
        const viewPermission = true
        const editPermission = true
        const deletePermission = true
        const createPermission = true
        return (
          <>
            {isDesktop ? (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {viewPermission && (
                  <IconButton
                    size='small'
                    component={Link}
                    scroll={true}
                    href={`/sales/quotation/view/${row?.quotationId}`}
                    onClick={() => dispatch(setSelectedQuotation(row))}
                  >
                    <Icon icon='tabler:eye' />
                  </IconButton>
                )}
                {editPermission && (
                  <IconButton
                    size='small'
                    component={Link}
                    scroll={true}
                    href={`/sales/quotation/edit/${row?.quotationId}`}
                    onClick={() => dispatch(setSelectedQuotation(row))}
                  >
                    {' '}
                    <Icon icon='tabler:edit' />
                  </IconButton>
                )}
                <div>
                  {editPermission === false &&
                    deletePermission === false &&
                    createPermission === false &&
                    row?.status === 'CONFIRMED' && (
                      <>
                        <IconButton
                          aria-label='more'
                          id='long-button'
                          aria-haspopup='true'
                          onClick={event => handleClick(event, row)}
                        >
                          <MoreVertIcon />
                        </IconButton>
                        <CommonStyledMenu
                          anchorEl={anchorElMap[row.quotationId]}
                          open={Boolean(anchorElMap[row.quotationId])}
                          onClose={() => handleClose(row)}
                        >
                          {createPermission && row?.status === 'CONFIRMED' && (
                            <MenuItem component={Link} scroll={true} href={`/sales/sales-order/add-salesorder/`}>
                              <Icon icon={'iconamoon:invoice-light'} />
                              Create Order
                            </MenuItem>
                          )}
                          {row?.status === 'CONFIRMED' && (
                            <>
                              <Divider sx={{ my: 1 }} />{' '}
                            </>
                          )}
                          {deletePermission && (
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
                        </CommonStyledMenu>
                      </>
                    )}
                </div>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                <IconButton
                  aria-label='more'
                  id='long-button'
                  aria-haspopup='true'
                  onClick={event => handleClick(event, row)}
                  disabled={
                    viewPermission === false &&
                    editPermission === false &&
                    deletePermission === false &&
                    createPermission === false
                  }
                >
                  <MoreVertIcon />
                </IconButton>
                <CommonStyledMenu
                  anchorEl={anchorElMap[row.quotationId]}
                  open={Boolean(anchorElMap[row.quotationId])}
                  onClose={() => handleClose(row)}
                >
                  {viewPermission && (
                    <MenuItem component={Link} scroll={true} href={`/sales/quotation/view/${row.quotationId}`}>
                      <Icon icon='tabler:eye' />
                      view
                    </MenuItem>
                  )}
                  {editPermission && (
                    <MenuItem component={Link} scroll={true} href={`/sales/quotation/edit/${row.quotationId}`}>
                      <Icon icon='tabler:edit' />
                      Edit
                    </MenuItem>
                  )}
                  {createPermission && row?.status === 'CONFIRMED' && (
                    <MenuItem component={Link} scroll={true} href={`/sales/sales-order/add-salesorder/`}>
                      <Icon icon={'iconamoon:invoice-light'} />
                      Create Order
                    </MenuItem>
                  )}
                  {deletePermission && (
                    <>
                      <Divider sx={{ my: 1 }} />
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
                        <Icon icon='mingcute:delete-2-line' color='inherit' />
                        Delete
                      </MenuItem>
                    </>
                  )}
                </CommonStyledMenu>
              </Box>
            )}
            {row?.status !== 'CONFIRMED' && (
              <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                <IconButton
                  aria-label='more'
                  id='long-button'
                  aria-haspopup='true'
                  onClick={event => handleClick(event, row)}
                  disabled={
                    viewPermission === false &&
                    editPermission === false &&
                    deletePermission === false &&
                    createPermission === false
                  }
                >
                  <MoreVertIcon />
                </IconButton>
                <CommonStyledMenu
                  anchorEl={anchorElMap[row.quotationId]}
                  open={Boolean(anchorElMap[row.quotationId])}
                  onClose={() => handleClose(row)}
                >
                  {viewPermission && (
                    <MenuItem component={Link} scroll={true} href={`/sales/quotation/view/${row.quotationId}`}>
                      <Icon icon='tabler:eye' />
                      view
                    </MenuItem>
                  )}
                  {editPermission && (
                    <MenuItem component={Link} scroll={true} href={`/sales/quotation/edit/${row.quotationId}`}>
                      <Icon icon='tabler:edit' />
                      Edit
                    </MenuItem>
                  )}
                  {createPermission && row?.status === 'CONFIRMED' && (
                    <MenuItem component={Link} scroll={true} href={`/sales/sales-order/add-salesorder/`}>
                      <Icon icon={'iconamoon:invoice-light'} />
                      Create Order
                    </MenuItem>
                  )}
                  {deletePermission && (
                    <>
                      <Divider sx={{ my: 1 }} />
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
                        <Icon icon='mingcute:delete-2-line' color='inherit' />
                        Delete
                      </MenuItem>
                    </>
                  )}
                </CommonStyledMenu>
              </Box>
            )}
          </>
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
              dispatch(resetQuotation())
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
                  setStartDate(lastMonthDate(moduleFilterDateDuration))
                  setEndDate(new Date())
                }}
              >
                Reset
              </Button>
            </Box>
            <Box sx={{ display: 'flex', gap: 4, alignItems: 'center', px: 4 }}>
              <FilterDateRange label='From' date={new Date(startDate)} setDate={setStartDate} />
              <FilterDateRange label='To' date={new Date(endDate)} setDate={setEndDate} />
            </Box>
            <Divider sx={{ my: 3, opacity: 0.5 }} color='primary' />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 4, mb: 2 }}>
              <Typography sx={{ fontSize: '13px', lineHeight: '23px' }}>Status</Typography>
              <Button type='button' onClick={() => setStatus(null)}>
                Reset
              </Button>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 4, mb: 2 }}>
              <CustomAutocomplete
                fullWidth
                options={Quotation_Statuses}
                value={status ? toTitleCase(status) : status}
                onChange={(event, newValue) => setStatus(newValue)}
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 4, mb: 2 }}>
              <Typography sx={{ fontSize: '13px', lineHeight: '23px' }}>Customers</Typography>
              <Button type='button' onClick={() => setSelectedCustomer(null)}>
                Reset
              </Button>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 4, mb: 2 }}>
              <CustomAutocomplete
                fullWidth
                options={customers}
                value={selectedCustomer}
                onChange={(event, newValue) => {
                  setSelectedCustomer(newValue)
                }}
                getOptionLabel={option => option?.customerName || ''}
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
      <DataGrid
        autoHeight
        disableColumnMenu={true}
        disableRowSelectionOnClick
        columnVisibilityModel={columnVisible}
        columns={columns}
        rows={quotations || []}
        getRowId={row => row?.quotationId}
        initialState={{
          sorting: {
            sortModel: [{ field: 'quotationNo', sort: 'desc' }]
          }
        }}
        slots={{
          noRowsOverlay: CustomNoRowsOverlay
        }}
        slotProps={{
          noRowsOverlay: {
            mainText: 'Empty Sales Quotation',
            subText: ' No sales quotation available here. Click "Add New" button above to get started.'
          }
        }}
      />

      {openDialog && (
        <DeleteQuotation
          tenantId={selectedQuotationState?.tenantId}
          quotationId={selectedQuotationState?.quotationId}
          openDialog={openDialog}
          setOpenDialog={setOpenDialog}
          setQuotationObject={setQuotationObject}
        />
      )}
      {openCustomerDialog && (
        <CommonCustomerPopup
          customerId={customerForDialog?.customerId}
          open={openCustomerDialog}
          setOpen={setOpenCustomerDialog}
        />
      )}
    </>
  )
}

export default QuotationListTable
