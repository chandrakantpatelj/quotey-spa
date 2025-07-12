// ** Next Import
import { Close } from '@mui/icons-material'
import RefreshIcon from '@mui/icons-material/Refresh'
import {
  alpha,
  Box,
  Button,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  LinearProgress,
  MenuItem,
  Popover,
  Radio,
  RadioGroup,
  Tooltip,
  Typography
} from '@mui/material'
import Link from 'next/link'
import Router from 'next/router'
import { useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  getSalesOrderPackagesByDateRangeQuery,
  markSalesOrderPackageAsDeliveredMutation,
  undoSalesOrderPackageConfirmationMutation,
  undoSalesOrderPackageFulfillmentMutation
} from 'src/@core/components/graphql/sales-order-package-queries'
import Icon from 'src/@core/components/icon'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import CustomChip from 'src/@core/components/mui/chip'
import CustomTextField from 'src/@core/components/mui/text-field'
import CommonCustomerPopup from 'src/common-components/CommonCustomerPopup'
import CommonSoPopup from 'src/common-components/CommonSoPopup'
import CommonStyledMenu from 'src/common-components/CommonStyledMenu'
import CustomNoRowsOverlay from 'src/common-components/CustomNoRowsOverlay'
import FilterDateRange from 'src/common-components/FilterDateRange'
import MobileDataGrid from 'src/common-components/MobileDataGrid'
import StyledButton from 'src/common-components/StyledMuiButton'
import { fetchData, writeData } from 'src/common-functions/GraphqlOperations'
import {
  DELETE_PACKAGE,
  EDIT_PACKAGE,
  STATUS_CONFIRMED,
  STATUS_DELIVERED,
  STATUS_DRAFT,
  STATUS_FULFILLED,
  STATUS_PARTLY_FULFILLED,
  VIEW_PACKAGE
} from 'src/common-functions/utils/Constants'
import {
  dataTextStyles,
  dataTitleStyles,
  DateFunction,
  hasPermission,
  lastMonthDate,
  rowStatusChip
} from 'src/common-functions/utils/UtilityFunctions'
import useSalesOrders from 'src/hooks/getData/useSalesOrders'
import { useIsLaptop, useIsMobile } from 'src/hooks/IsDesktop'
import { createAlert } from 'src/store/apps/alerts'
import {
  resetPackage,
  resetSalesPackageFilters,
  setSalesPackageFilters,
  setSelectedPackages,
  setUpdatePackage
} from 'src/store/apps/packages'
import CustomDatePicker from 'src/views/forms/form-elements/pickers/CustomDatePicker'
import AssigntoUserPopup from './AssigntoUserPopup'
import DeletePackage from './DeletePackage'
import FullfillPackagePopup from './FullfillPackagePopup'
import ProcessAsDelivered from './ProcessAsDelivered'

// import { co } from '@fullcalendar/core/internal-common'

export default function PackagesListTable({ tenantId, packagesObject, loading }) {
  const router = Router
  const dispatch = useDispatch()
  const isLaptop = useIsLaptop()
  const isMobile = useIsMobile()
  const moduleFilterDateDuration = useSelector(
    state => state.otherSettings?.data?.moduleFilterDateDuration || undefined
  )
  const { reloadSalesOrderInStore } = useSalesOrders(tenantId)
  const {
    startDate: rawStartDate,
    endDate: rawEndDate,
    isAssignToMe,
    filterCustomer,
    filterUser,
    filterExpPackDate,
    filterExpDeliveryDate
  } = useSelector(state => state.packages?.filters ?? {})

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
    isAssignToMe: Boolean(isAssignToMe),
    filterCustomer: Boolean(filterCustomer),
    filterUser: Boolean(filterUser),
    filterExpPackDate: Boolean(filterExpPackDate),
    filterExpDeliveryDate: Boolean(filterExpDeliveryDate)
  }

  const anyFilterActive = Object.values(filters).some(Boolean)

  // State for active filters
  const [isFilterActive, setFilterActive] = useState({
    filterActive: anyFilterActive,
    ...filters
  })

  const userProfile = useSelector(state => state.userProfile)
  const userName = userProfile?.data?.username
  const [openCustomerDialog, setOpenCustomerDialog] = useState(false)
  const [customerForDialog, setCustomerForDialog] = useState({})
  const { packages = [], customers = [], userAccounts = [] } = packagesObject || {}
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState({})
  const [salesOrderDialogState, setSalesOrderDialogState] = useState({
    open: false,
    selectedSalesOrderId: null
  })
  const [anchorElMap, setAnchorElMap] = useState({})

  const [filteredPackages, setFilteredPackages] = useState([])
  const [temporaryFilterData, setTemporaryFilterData] = useState([])

  const [searchedPackage, setSearchedPackage] = useState(null)
  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)

  const handleMenuClick = (event, row) => {
    dispatch(setSelectedPackages(row))
    const updatedAnchorElMap = { ...anchorElMap }
    updatedAnchorElMap[row.packageId] = event.currentTarget
    setAnchorElMap(updatedAnchorElMap)
  }

  const handleClose = row => {
    const updatedAnchorElMap = { ...anchorElMap }
    updatedAnchorElMap[row.packageId] = null
    setAnchorElMap(updatedAnchorElMap)
  }
  const handleDelete = row => {
    setSelectedPackage(row)
    handleClose(row)
    setOpenDialog(true)
  }

  const handleFilterClick = event => {
    setAnchorEl(event.currentTarget)
  }

  const handleFilterClose = () => {
    const filter = {
      isAssignToMe: isFilterActive.isAssignToMe ? isAssignToMe : null,
      filterCustomer: isFilterActive.filterCustomer ? filterCustomer : null,
      filterUser: isFilterActive.filterUser ? filterUser : null,
      filterExpPackDate: isFilterActive.filterExpPackDate ? filterExpPackDate : null,
      filterExpDeliveryDate: isFilterActive.filterExpDeliveryDate ? filterExpDeliveryDate : null,
      startDate: isFilterActive.startDate ? startDate : null,
      endDate: isFilterActive.endDate ? endDate : null
    }
    dispatch(setSalesPackageFilters(filter))
    setAnchorEl(null)
  }

  const formatDate = date => {
    if (!date) return null
    const d = new Date(date)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }

  const handleDateRange = async (startDate, endDate, overrides = {}) => {
    try {
      let salesPackageFilter = packages
      const {
        filterCustomer: customerOverride = filterCustomer,
        filterUser: userOverride = filterUser,
        filterExpPackDate: expPackDateOverride = filterExpPackDate,
        filterExpDeliveryDate: expDeliveryDateOverride = filterExpDeliveryDate,
        isAssignToMe: isAssigntomeOverride = isAssignToMe
      } = overrides

      let userMatches = false
      const isStartDate = startDate.toDateString() !== oneMonthAgoDate.toDateString()
      const isEndDate = endDate.toDateString() !== todayDate.toDateString()
      const isFilterCustomer = Boolean(customerOverride)
      const isFilterUser = Boolean(userOverride)
      const isFilterExpPackDate = Boolean(expPackDateOverride)
      const isFilterExpDeliveryDate = Boolean(expDeliveryDateOverride)

      if (isStartDate || isEndDate) {
        const response = await fetchData(
          getSalesOrderPackagesByDateRangeQuery(tenantId, DateFunction(startDate), DateFunction(endDate))
        )
        salesPackageFilter = response?.getSalesOrderPackagesByDateRange
      }
      if (salesPackageFilter) {
        const filteredData = salesPackageFilter.filter(item => {
          const packDateMatches = expPackDateOverride
            ? formatDate(item?.expectedPackingDate) === formatDate(expPackDateOverride)
            : true

          const deliveryDateMatches = expDeliveryDateOverride
            ? formatDate(item?.expectedDeliveryDate) === formatDate(expDeliveryDateOverride)
            : true

          const customerMatches = customerOverride?.customerId ? item?.customerId === customerOverride.customerId : true

          if (userOverride) {
            userMatches = userOverride?.username ? item?.assignedTo === userOverride.username : true
          } else {
            userMatches = isAssigntomeOverride === 'assignToMe' ? item?.assignedTo === userName : true
          }

          return customerMatches && userMatches && packDateMatches && deliveryDateMatches
        })
        const isFilterAssigntome = Boolean(userMatches)

        setFilterActive({
          filterActive:
            isStartDate ||
            isEndDate ||
            isFilterCustomer ||
            isFilterUser ||
            isFilterAssigntome ||
            isFilterExpPackDate ||
            isFilterExpDeliveryDate,
          startDate: isStartDate,
          endDate: isEndDate,
          filterCustomer: isFilterCustomer,
          filterUser: isFilterUser,
          isAssignToMe: isFilterAssigntome,
          filterExpPackDate: isFilterExpPackDate,
          filterExpDeliveryDate: isFilterExpDeliveryDate
        })

        if (
          isStartDate ||
          isEndDate ||
          isFilterCustomer ||
          isFilterUser ||
          isFilterAssigntome ||
          isFilterExpPackDate ||
          isFilterExpDeliveryDate
        ) {
          setTemporaryFilterData(filteredData)
          setFilteredPackages(filteredData)
        } else {
          setTemporaryFilterData([])
          setFilteredPackages([])
        }
        setSearchedPackage('')
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setAnchorEl(null)
      console.log('Fetched data successfully')
    }
  }

  const handleFilters = (overrides = {}) => {
    handleDateRange(startDate, endDate, overrides)
  }

  const updateFilter = (key, value) => {
    dispatch(setSalesPackageFilters({ [key]: value }))
  }

  const handleReset = async () => {
    setAnchorEl(null)
    dispatch(resetSalesPackageFilters())
    setFilterActive({
      filterActive: false,
      startDate: false,
      endDate: false,
      isAssignToMe: false,
      filterUser: false,
      filterExpPackDate: false,
      filterExpDeliveryDate: false,
      filterCustomer: false
    })
    setTemporaryFilterData([])
    setFilteredPackages([])
    setSearchedPackage('')
  }

  const [assigntoUserPopup, setAssigntoUserPopup] = useState(false)

  const handleAssigntoUser = row => {
    handleClose(row)
    setAssigntoUserPopup(true)
  }

  const [openfullfillPackageDialog, setOpenfullfillPackageDialog] = useState(false)

  const handlefullfillpackage = row => {
    handleClose(row)
    setOpenfullfillPackageDialog(true)
  }

  const [openProcessAsDeliverdDialog, setOpenProcessAsDeliverdDialog] = useState(false)

  const handleprocessAsDelivered = row => {
    handleClose(row)
    setOpenProcessAsDeliverdDialog(true)
  }

  const undoPackageConfirmation = async data => {
    const { tenantId, packageId } = data
    handleClose(data)
    try {
      const response = await writeData(undoSalesOrderPackageConfirmationMutation(), {
        tenantId,
        packageId
      })
      const { undoSalesOrderPackageConfirmation } = response
      if (undoSalesOrderPackageConfirmation) {
        dispatch(setUpdatePackage(undoSalesOrderPackageConfirmation))
        dispatch(createAlert({ message: 'Undo Confirmation successfully!', type: 'success' }))
      } else {
        dispatch(createAlert({ message: 'Undo confirmation Failed!', type: 'error' }))
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    }
  }
  const undoPackageFullfilled = async data => {
    const { tenantId, packageId } = data
    handleClose(data)
    try {
      const response = await writeData(undoSalesOrderPackageFulfillmentMutation(), {
        tenantId,
        packageId
      })
      const { undoSalesOrderPackageFulfillment } = response
      if (undoSalesOrderPackageFulfillment) {
        reloadSalesOrderInStore(undoSalesOrderPackageFulfillment.salesOrderId)
        dispatch(setUpdatePackage(undoSalesOrderPackageFulfillment))
        dispatch(createAlert({ message: 'Undo Fulfillment successfully!', type: 'success' }))
      } else {
        dispatch(createAlert({ message: 'Undo Fulfillment Failed!', type: 'error' }))
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    }
  }

  const MarkStatus = async data => {
    const updatedAnchorElMap = { ...anchorElMap }
    updatedAnchorElMap[data.packageId] = null
    setAnchorElMap(updatedAnchorElMap)
    const { tenantId, packageId, deliveredByUsername, deliveryDate } = data
    try {
      const response = await writeData(markSalesOrderPackageAsDeliveredMutation(), {
        tenantId,
        packageId,
        deliveredByUsername,
        deliveryDate
      })
      const result = response?.markSalesOrderPackageAsDelivered
      if (result) {
        dispatch(setUpdatePackage(result))

        reloadSalesOrderInStore(result.salesOrderId)

        dispatch(createAlert({ message: 'Status changed successfully!', type: 'success' }))
      } else {
        dispatch(createAlert({ message: 'Package is not fulfilled!', type: 'error' }))
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    }
  }
  const columns = [
    {
      field: 'packageNo',
      headerName: '',
      flex: 1,
      sortable: false,
      renderCell: ({ row }) => {
        const date = DateFunction(row?.packageDate) || '-'
        const expectedPackingDate = DateFunction(row?.expectedPackingDate) || '-'
        const expectedDeliveryDate = DateFunction(row?.expectedDeliveryDate) || '-'
        const editPermission = hasPermission(userProfile, EDIT_PACKAGE)
        const viewPermission = hasPermission(userProfile, VIEW_PACKAGE)
        const deletePermission = hasPermission(userProfile, DELETE_PACKAGE)
        const user = userAccounts?.find(val => val?.username === row?.assignedTo)
        const deliveredBy = userAccounts?.find(val => val?.username === row?.deliveredBy)
        const customer = customers?.find(item => item?.customerId == row?.customerId) || {}
        const handleClick = () => {
          if (customer) {
            setCustomerForDialog(customer)
            setOpenCustomerDialog(true)
          }
        }

        return (
          <Box sx={{ width: '100%', p: 2 }}>
            <Grid container spacing={2} sx={{ alignItems: { xs: 'flex-start', lg: 'center' } }}>
              <Grid item xs={11} lg={10.5} xl={11}>
                <Grid container spacing={2} sx={{ alignItems: 'center' }}>
                  <Grid item xs={12} md={4} lg={2}>
                    {customer?.customerName ? (
                      <StyledButton color='primary' onClick={handleClick}>
                        {customer?.customerName}
                      </StyledButton>
                    ) : (
                      ''
                    )}
                    <Typography sx={{ ...dataTitleStyles, color: '#000' }}>
                      <span style={{ verticalAlign: 'middle', marginRight: '5px' }}>#</span> {row.packageNoPrefix}
                      {row.packageNo}
                    </Typography>
                    <Typography sx={dataTitleStyles}>
                      Order:{' '}
                      {row?.salesOrderNo ? (
                        <StyledButton
                          color='primary'
                          onClick={() =>
                            setSalesOrderDialogState({ open: true, selectedSalesOrderId: row.salesOrderId })
                          }
                        >
                          #{row?.salesOrderNoPrefix} {row?.salesOrderNo}
                        </StyledButton>
                      ) : (
                        ''
                      )}
                    </Typography>
                    <Typography sx={{ ...dataTitleStyles, color: '#818181' }}>{row?.notes}</Typography>
                  </Grid>
                  <Grid item xs={6} md={2} lg={1.5}>
                    <Typography sx={dataTextStyles}>{date}</Typography>
                    <Typography sx={dataTitleStyles}>Package Date</Typography>
                  </Grid>
                  {!isMobile && (
                    <Grid item xs={2} md={3} lg={1.5}>
                      <Typography sx={dataTextStyles}>{expectedPackingDate}</Typography>
                      <Typography sx={dataTitleStyles}>Expected Packing Date</Typography>
                    </Grid>
                  )}
                  {!isMobile && (
                    <Grid item xs={2} md={3} lg={1.5}>
                      <Typography sx={dataTextStyles}>{expectedDeliveryDate}</Typography>
                      <Typography sx={dataTitleStyles}>Expected Delivery Date</Typography>
                    </Grid>
                  )}
                  <Grid item xs={6} md={4} lg={1.5}>
                    <Typography sx={{ ...dataTextStyles, fontSize: '11px', lineHeight: '15px' }}>
                      {row?.deliveryAddress?.addressLine1 || '-'}, {row?.deliveryAddress?.addressLine2 || '-'}
                    </Typography>
                    <Typography sx={dataTitleStyles}>Delivery Address</Typography>
                  </Grid>
                  <Grid item xs={4} md={3} lg={1.5}>
                    <Typography sx={dataTextStyles}>{user?.name || '-'}</Typography>
                    <Typography sx={dataTitleStyles}>Assigned To</Typography>
                  </Grid>
                  <Grid item xs={4} md={3} lg={1.5}>
                    <Typography sx={dataTextStyles}>{deliveredBy?.name || '-'}</Typography>
                    <Typography sx={dataTitleStyles}>Delivered By</Typography>
                  </Grid>
                  <Grid item xs={4} md={2} lg={1}>
                    {rowStatusChip(row?.status) || '-'}
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={1} lg={1.5} xl={1}>
                {isLaptop ? (
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    {viewPermission && (
                      <IconButton
                        variant='outlined'
                        component={Link}
                        href={`/sales/packages/view/${row?.packageId}`}
                        onClick={e => {
                          e.stopPropagation()
                          dispatch(setSelectedPackages(row))
                        }}
                      >
                        <Icon icon='tabler:eye' />
                      </IconButton>
                    )}
                    {editPermission && (
                      <IconButton
                        variant='outlined'
                        component={Link}
                        href={`/sales/packages/edit/${row?.packageId}`}
                        onClick={e => {
                          e.stopPropagation()
                          dispatch(setSelectedPackages(row))
                        }}
                      >
                        <Icon icon='tabler:edit' />
                      </IconButton>
                    )}
                    <>
                      <IconButton
                        onClick={event => {
                          event.stopPropagation()
                          handleMenuClick(event, row)
                        }}
                      >
                        <Icon icon='iconamoon:menu-kebab-vertical-circle-light' width={25} height={25} />
                      </IconButton>
                      <CommonStyledMenu
                        anchorEl={anchorElMap[row.packageId]}
                        open={Boolean(anchorElMap[row.packageId])}
                        onClose={() => handleClose(row)}
                      >
                        <MenuItem onClick={() => handleAssigntoUser(row)}>
                          <Icon icon={'clarity:assign-user-line'} />
                          Asssign to User
                        </MenuItem>

                        {row?.status === STATUS_CONFIRMED && (
                          <MenuItem onClick={() => undoPackageConfirmation(row)}>
                            <Icon icon={'iconamoon:do-undo-light'} />
                            Undo confirmation
                          </MenuItem>
                        )}
                        {(row?.status === STATUS_CONFIRMED || row?.status === STATUS_PARTLY_FULFILLED) && (
                          <MenuItem onClick={() => handlefullfillpackage(row)}>
                            <Icon icon={'hugeicons:package-process'} />
                            Fulfill Package
                          </MenuItem>
                        )}
                        {(row?.status === STATUS_FULFILLED ||
                          row?.status === STATUS_PARTLY_FULFILLED ||
                          row?.status === STATUS_DELIVERED) && (
                          <MenuItem onClick={() => undoPackageFullfilled(row)}>
                            <Icon icon={'iconamoon:do-undo-light'} />
                            Undo fulfilled
                          </MenuItem>
                        )}
                        {row?.status === STATUS_CONFIRMED && (
                          <MenuItem onClick={() => handleprocessAsDelivered(row)}>
                            <Icon icon={'hugeicons:package-process'} />
                            Process as delivered
                          </MenuItem>
                        )}
                        {row?.status === STATUS_FULFILLED && (
                          <MenuItem onClick={() => MarkStatus(row)}>
                            <Icon icon={'teenyicons:file-tick-outline'} />
                            Mark as delivered
                          </MenuItem>
                        )}
                        {deletePermission && row?.status === STATUS_DRAFT && (
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
                            <Icon icon='mingcute:delete-2-line' />
                            Delete
                          </MenuItem>
                        )}
                      </CommonStyledMenu>
                    </>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                    <>
                      <IconButton
                        aria-label='more'
                        onClick={event => {
                          event.stopPropagation()
                          handleMenuClick(event, row)
                        }}
                      >
                        <Icon icon='iconamoon:menu-kebab-vertical-circle-light' width={25} height={25} />
                      </IconButton>
                      <CommonStyledMenu
                        anchorEl={anchorElMap[row.packageId]}
                        open={Boolean(anchorElMap[row.packageId])}
                        onClose={() => handleClose(row)}
                      >
                        {viewPermission && (
                          <MenuItem component={Link} scroll={true} href={`/sales/packages/view/${row.packageId}`}>
                            <Icon icon='tabler:eye' />
                            View
                          </MenuItem>
                        )}
                        {editPermission && (
                          <MenuItem component={Link} scroll={true} href={`/sales/packages/edit/${row.packageId}`}>
                            <Icon icon='tabler:edit' />
                            Edit
                          </MenuItem>
                        )}
                        <MenuItem onClick={() => handleAssigntoUser(row)}>
                          <Icon icon={'clarity:assign-user-line'} />
                          Asssign to User
                        </MenuItem>
                        {row?.status === STATUS_CONFIRMED && (
                          <MenuItem onClick={() => undoPackageConfirmation(row)}>
                            <Icon icon='iconamoon:do-undo-light' />
                            Undo confirmation
                          </MenuItem>
                        )}
                        {(row?.status === STATUS_CONFIRMED || row?.status === STATUS_PARTLY_FULFILLED) && (
                          <MenuItem onClick={() => handlefullfillpackage(row)}>
                            <Icon icon={'hugeicons:package-process'} />
                            Fulfill Package
                          </MenuItem>
                        )}
                        {(row?.status === STATUS_FULFILLED ||
                          row?.status === STATUS_PARTLY_FULFILLED ||
                          row?.status === STATUS_DELIVERED) && (
                          <MenuItem onClick={() => undoPackageFullfilled(row)}>
                            <Icon icon={'iconamoon:do-undo-light'} />
                            Undo fulfilled
                          </MenuItem>
                        )}
                        {row?.status === STATUS_CONFIRMED && (
                          <MenuItem onClick={() => handleprocessAsDelivered(row)}>
                            <Icon icon={'hugeicons:package-process'} />
                            Process as delivered
                          </MenuItem>
                        )}
                        {row?.status === STATUS_FULFILLED && (
                          <MenuItem onClick={() => MarkStatus(row)}>
                            <Icon icon={'teenyicons:file-tick-outline'} />
                            Mark as delivered
                          </MenuItem>
                        )}
                        {deletePermission && row?.status === STATUS_DRAFT && (
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
                            <Icon icon='mingcute:delete-2-line' />
                            Delete
                          </MenuItem>
                        )}
                      </CommonStyledMenu>
                    </>
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
      const matchedSO = packages.filter(pack => {
        const customer = customers.find(cust => cust.customerId === pack.customerId)
        const customerName = customer ? customer.customerName.toLowerCase() : ''

        // Extract and convert delivery address fields to lowercase
        const deliveryAddress = pack.deliveryAddress || {}
        const addressFields = [
          deliveryAddress.addressLine1,
          deliveryAddress.addressLine2,
          deliveryAddress.cityOrTown,
          deliveryAddress.state,
          deliveryAddress.postcode,
          deliveryAddress.country
        ]
          .filter(Boolean) // Remove null/undefined values
          .map(field => field.toLowerCase())

        return (
          pack.packageNo.toLowerCase().includes(searchValue) ||
          (pack.salesOrderNo && pack.salesOrderNo.toLowerCase().includes(searchValue)) ||
          customerName.includes(searchValue) ||
          addressFields.some(field => field.includes(searchValue))
        )
      })

      setFilteredPackages(matchedSO.length > 0 ? matchedSO : temporaryFilterData)
    } else {
      setFilteredPackages(temporaryFilterData)
      setSearchedPackage('')
    }
  }

  return (
    <>
      <Grid container spacing={2} sx={{ justifyContent: 'space-between', mb: 3 }}>
        <Grid item xs={7} sm={4} md={4} lg={4} xl={4}>
          <CustomAutocomplete
            options={filteredPackages.length > 0 || isFilterActive.filterActive ? filteredPackages : packages}
            getOptionLabel={option => {
              if (!option) return ''

              const customer = customers.find(cust => cust.customerId === option.customerId)
              const customerName = customer ? customer.customerName : ''
              const displayName = customer?.displayName || ''
              const displayCompName = customer?.companyName ? `-${customer.companyName}` : ''

              const displayNameText = displayName && displayName !== customerName ? ` (${displayName})` : ''

              const assignedToText = option.assignedTo ? ` - ${option.assignedTo}` : ''

              return `${customerName}${displayNameText}${displayCompName} - ${option.packageNo}${assignedToText}`.trim()
            }}
            filterOptions={options => options}
            value={packages?.find(option => option.packageId === searchedPackage?.packageId) || null}
            onChange={(event, newValue) => {
              setFilteredPackages(newValue ? [newValue] : temporaryFilterData)
              setSearchedPackage(newValue)
            }}
            onInputChange={(event, newValue) => {
              if (newValue && newValue.trim() !== '') {
                handleSearchChange(event, newValue)
              }
            }}
            disableClearable={false}
            renderInput={params => <CustomTextField {...params} fullWidth label='Packages' />}
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
                  dispatch(resetPackage())
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

                <Box sx={{ display: 'flex', gap: 4, alignItems: 'center', justifyContent: 'space-between', px: 4 }}>
                  <FilterDateRange label='From' date={startDate} setDate={date => updateFilter('startDate', date)} />
                  <FilterDateRange label='To' date={endDate} setDate={date => updateFilter('endDate', date)} />
                </Box>
                <Divider sx={{ my: 3, opacity: 0.5 }} color='primary' />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 4, mb: 2 }}>
                  <Button
                    type='button'
                    onClick={() => {
                      updateFilter('filterExpPackDate', null)
                    }}
                  >
                    Reset
                  </Button>
                  <Button
                    type='button'
                    onClick={() => {
                      updateFilter('filterExpDeliveryDate', null)
                    }}
                  >
                    Reset
                  </Button>
                </Box>
                <Box sx={{ display: 'flex', gap: 4, alignItems: 'center', justifyContent: 'space-between', px: 4 }}>
                  <CustomDatePicker
                    label={'Expected Packing Date'}
                    fullWidth={true}
                    date={filterExpPackDate}
                    onChange={date => {
                      updateFilter('filterExpPackDate', date)
                    }}
                  />
                  <CustomDatePicker
                    label={'Expected Delivery Date'}
                    fullWidth={true}
                    date={filterExpDeliveryDate}
                    onChange={date => {
                      updateFilter('filterExpDeliveryDate', date)
                    }}
                  />
                </Box>
                <Divider sx={{ my: 3, opacity: 0.5 }} color='primary' />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 4, mb: 2 }}>
                  <Typography sx={{ fontSize: '13px', lineHeight: '23px' }}>User</Typography>
                  <Button
                    type='button'
                    onClick={() => {
                      updateFilter('isAssignToMe', 'assignto_all')
                      updateFilter('filterUser', null)
                    }}
                  >
                    Reset
                  </Button>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 4, mb: 2 }}>
                  <CustomAutocomplete
                    fullWidth
                    options={userAccounts}
                    value={filterUser}
                    onChange={(event, newValue) => {
                      updateFilter('filterUser', newValue)
                    }}
                    getOptionLabel={option => option?.name || ''}
                    renderInput={params => <CustomTextField {...params} />}
                  />
                </Box>

                <Box sx={{ px: 4, mb: 2 }}>
                  <RadioGroup
                    row
                    value={isAssignToMe}
                    onChange={e => {
                      updateFilter('isAssignToMe', e.target.value)
                    }}
                    sx={{ justifyContent: 'space-between' }}
                  >
                    <FormControlLabel
                      sx={{
                        '& .MuiTypography-root': {
                          fontSize: '13px'
                        }
                      }}
                      value='assignToMe'
                      control={<Radio />}
                      label='Assigned to me'
                    />
                    <FormControlLabel
                      sx={{
                        '& .MuiTypography-root': {
                          fontSize: '13px'
                        }
                      }}
                      value='assignto_all'
                      control={<Radio />}
                      label='Assigned to all'
                    />
                  </RadioGroup>
                </Box>
                <Divider sx={{ my: 3, opacity: 0.5 }} color='primary' />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 4, mb: 2 }}>
                  <Typography sx={{ fontSize: '13px', lineHeight: '23px' }}>Customer</Typography>
                  <Button type='button' onClick={() => updateFilter('filterCustomer', null)}>
                    Reset
                  </Button>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 4, mb: 2 }}>
                  <CustomAutocomplete
                    fullWidth
                    options={customers}
                    value={filterCustomer}
                    onChange={(event, newValue) => {
                      updateFilter('filterCustomer', newValue)
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
        </Grid>
        {(isFilterActive.filterUser ||
          isFilterActive.filterExpDeliveryDate ||
          isFilterActive.filterExpPackDate ||
          isFilterActive.isAssignToMe ||
          isFilterActive.filterCustomer ||
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
                {filterCustomer && isFilterActive.filterCustomer && (
                  <CustomChip
                    label={`Customer: ${filterCustomer.customerName}`}
                    onDelete={() => {
                      updateFilter('filterCustomer', null)
                      handleFilters({ filterCustomer: null })
                    }}
                    deleteIcon={<Close sx={{ color: theme => theme.palette.primary.main }} />}
                    skin='light'
                    color='primary'
                  />
                )}
                {filterUser && isFilterActive.filterUser && (
                  <CustomChip
                    label={`User: ${filterUser.username}`}
                    onDelete={() => {
                      updateFilter('filterCustomer', null)
                      handleFilters({ filterUser: null })
                    }}
                    deleteIcon={<Close sx={{ color: theme => theme.palette.primary.main }} />}
                    skin='light'
                    color='primary'
                  />
                )}
                {Boolean(isAssignToMe) && isFilterActive.isAssignToMe && (
                  <CustomChip
                    label={`AssignTo: ${isAssignToMe}`}
                    onDelete={() => {
                      updateFilter('isAssignToMe', null)
                      updateFilter('filterUser', null)
                      handleFilters({ isAssignToMe: null, filterUser: null })
                    }}
                    deleteIcon={<Close sx={{ color: theme => theme.palette.primary.main }} />}
                    skin='light'
                    color='primary'
                  />
                )}
                {filterExpPackDate && isFilterActive.filterExpPackDate && (
                  <CustomChip
                    label={`ExpPackDate: ${DateFunction(filterExpPackDate.toDateString())}`}
                    onDelete={() => {
                      updateFilter('filterExpPackDate', null)
                      handleFilters({ filterExpPackDate: null })
                    }}
                    deleteIcon={<Close sx={{ color: theme => theme.palette.primary.main }} />}
                    skin='light'
                    color='primary'
                  />
                )}
                {filterExpDeliveryDate && isFilterActive.filterExpDeliveryDate && (
                  <CustomChip
                    label={`ExpDeliveryDate: ${DateFunction(filterExpDeliveryDate.toDateString())}`}
                    onDelete={() => {
                      updateFilter('filterExpDeliveryDate', null)
                      handleFilters({ filterExpDeliveryDate: null })
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
          rows={filteredPackages.length > 0 || isFilterActive.filterActive ? filteredPackages : packages}
          columns={columns}
          getRowId={row => row.packageId}
          initialState={{
            sorting: {
              sortModel: [{ field: 'packageNo', sort: 'desc' }]
            }
          }}
          styles={{
            '& .MuiDataGrid-row:hover': {
              cursor: 'pointer'
            }
          }}
          slots={{
            columnHeaders: () => null,
            noRowsOverlay: CustomNoRowsOverlay
          }}
          slotProps={{
            noRowsOverlay: {
              mainText: 'Empty Packages',
              subText: ' No package available here. Click "Add New" button above to get started.'
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
            dispatch(setSelectedPackages(params?.row))
            router.push(`/sales/packages/view/${params?.row.packageId}`)
          }}
        />
      )}
      {openDialog && (
        <DeletePackage
          tenantId={tenantId}
          packageId={selectedPackage?.packageId}
          openDialog={openDialog}
          setOpenDialog={setOpenDialog}
        />
      )}
      {openCustomerDialog && (
        <CommonCustomerPopup
          customerId={customerForDialog?.customerId}
          open={openCustomerDialog}
          setOpen={setOpenCustomerDialog}
        />
      )}
      {assigntoUserPopup && (
        <AssigntoUserPopup tenantId={tenantId} open={assigntoUserPopup} setOpen={setAssigntoUserPopup} />
      )}
      {openfullfillPackageDialog && (
        <FullfillPackagePopup
          tenantId={tenantId}
          open={openfullfillPackageDialog}
          setOpen={setOpenfullfillPackageDialog}
        />
      )}

      {openProcessAsDeliverdDialog && (
        <ProcessAsDelivered
          tenantId={tenantId}
          open={openProcessAsDeliverdDialog}
          setOpen={setOpenProcessAsDeliverdDialog}
        />
      )}
      {salesOrderDialogState.open && (
        <CommonSoPopup
          orderId={salesOrderDialogState.selectedSalesOrderId}
          open={salesOrderDialogState.open}
          onClose={() => setSalesOrderDialogState({ open: false, selectedSalesOrderId: null })}
        />
      )}
    </>
  )
}
