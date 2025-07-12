// ** Next Import
import Link from 'next/link'
import Router from 'next/router'

import { alpha, Box, Divider, Grid, IconButton, LinearProgress, MenuItem, Typography } from '@mui/material'
import { useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useReactToPrint } from 'react-to-print'
import {
  cancelSalesInvoiceMutation,
  getSalesInvoicesByDateRangeQuery,
  markSalesInvoiceAsIssuedMutation
} from 'src/@core/components/graphql/sales-invoice-queries'
import Icon from 'src/@core/components/icon'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import CustomTextField from 'src/@core/components/mui/text-field'
import CommonCustomerPopup from 'src/common-components/CommonCustomerPopup'
import CommonSoPopup from 'src/common-components/CommonSoPopup'
import CommonStyledMenu from 'src/common-components/CommonStyledMenu'
import CustomNoRowsOverlay from 'src/common-components/CustomNoRowsOverlay'
import MobileDataGrid from 'src/common-components/MobileDataGrid'
import StyledButton from 'src/common-components/StyledMuiButton'
import { fetchData, writeData } from 'src/common-functions/GraphqlOperations'
import {
  DELETE_SALES_INVOICE,
  EDIT_SALES_INVOICE,
  STATUS_DELIVERED,
  STATUS_DRAFT,
  STATUS_ISSUED,
  VIEW_SALES_INVOICE
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
import { useIsLaptop, useIsMobile } from 'src/hooks/IsDesktop'
import { createAlert } from 'src/store/apps/alerts'
import { setSelectedInvoice, setUpdateInvoice } from 'src/store/apps/sales-invoices'
import DeleteSalesInvoice from './DeleteSalesInvoice'
import { PrintSalesInvoice } from './PrintSalesInvoice'
import SalesInvoiceFilter from './SalesInvoiceFilter'
import SendInvoiceCopyDrawer from './SendInvoiceCopyDrawer'

export default function SalesInvoiceListTable({ tenantId, invoiceObject, loading }) {
  const router = Router
  const dispatch = useDispatch()
  const isLaptop = useIsLaptop()
  const isMobile = useIsMobile()
  const userProfile = useSelector(state => state.userProfile)
  const moduleFilterDateDuration = useSelector(
    state => state.otherSettings?.data?.moduleFilterDateDuration || undefined
  )
  const {
    startDate: rawStartDate,
    endDate: rawEndDate,
    status,
    paymentStatus,
    selectedCustomer
  } = useSelector(state => state.salesInvoices?.filters ?? {})

  const oneMonthAgoDate = useMemo(() => lastMonthDate(moduleFilterDateDuration), [moduleFilterDateDuration])
  const todayDate = useMemo(() => new Date(), [])

  const [isFilterActive, setFilterActive] = useState({})

  const [filteredSOInvoices, setFilterSOInvoices] = useState([])
  const [temporaryFilterData, setTemporaryFilterData] = useState([])
  const [searchedSOInvoices, setSearchedSOInvoices] = useState(null)
  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)
  const [openSendCopyDrawer, setOpenSendCopyDrawer] = useState(false)
  const { salesInvoices = [], customers = [], currencies = [] } = invoiceObject || {}
  const [customerDialogState, setCustomerDialogState] = useState({
    open: false,
    selectedCustomerId: null
  })
  const [invoiceForAction, setInvoiceForAction] = useState(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedSalesInvoice, setSelectedSalesInvoice] = useState('')
  const [salesOrderDialogState, setSalesOrderDialogState] = useState({
    open: false,
    selectedSalesOrderId: null
  })
  const [anchorElMap, setAnchorElMap] = useState({})
  const componentRef = useRef(null)
  const handlePrint = useReactToPrint({
    content: () => componentRef.current
  })

  const handleMenuClick = (event, row) => {
    setInvoiceForAction(row)
    dispatch(setSelectedInvoice(row))
    setSelectedSalesInvoice(row)
    const updatedAnchorElMap = { ...anchorElMap }
    updatedAnchorElMap[row.invoiceId] = event.currentTarget
    setAnchorElMap(updatedAnchorElMap)
  }

  const handleClose = row => {
    const updatedAnchorElMap = { ...anchorElMap }
    updatedAnchorElMap[row.invoiceId] = null
    setAnchorElMap(updatedAnchorElMap)
  }
  const handleDelete = row => {
    setSelectedSalesInvoice(row)
    handleClose(row)
    setOpenDialog(true)
  }

  const statuses = [...new Set(salesInvoices?.map(item => item.status))]
  const paymentStatuses = [...new Set(salesInvoices?.map(item => item.paymentStatus))]

  const MarkasIssued = async data => {
    const updatedAnchorElMap = { ...anchorElMap }
    updatedAnchorElMap[data.invoiceId] = null
    setAnchorElMap(updatedAnchorElMap)
    const { tenantId, invoiceId } = data
    try {
      const response = await writeData(markSalesInvoiceAsIssuedMutation(), { tenantId, invoiceId })
      if (response.markSalesInvoiceAsIssued) {
        dispatch(setUpdateInvoice(response.markSalesInvoiceAsIssued))
        dispatch(createAlert({ message: 'Marked sales invoice as issued successfully!', type: 'success' }))
      } else {
        dispatch(createAlert({ message: 'Failed to issue sales invoice!', type: 'error' }))
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    }
  }

  const CancelInvoice = async data => {
    const updatedAnchorElMap = { ...anchorElMap }
    updatedAnchorElMap[data.invoiceId] = null
    setAnchorElMap(updatedAnchorElMap)
    const { tenantId, invoiceId } = data
    try {
      const response = await writeData(cancelSalesInvoiceMutation(), { tenantId, invoiceId })
      if (response.cancelSalesInvoice) {
        dispatch(setUpdateInvoice(response.cancelSalesInvoice))
        dispatch(createAlert({ message: 'Sales Invoice cancelled successfully!', type: 'success' }))
      } else {
        dispatch(createAlert({ message: 'Failed to cancel sales invoice!', type: 'error' }))
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    }
  }

  const columns = [
    {
      field: 'invoiceNo',
      headerName: '',
      flex: 1,
      renderCell: params => {
        const { row } = params
        const date = DateFunction(row?.invoiceDate) || '-'
        const dueDate = DateFunction(row?.dueDate) || '-'
        const editPermission = hasPermission(userProfile, EDIT_SALES_INVOICE)
        const viewPermission = hasPermission(userProfile, VIEW_SALES_INVOICE)
        const deletePermission = hasPermission(userProfile, DELETE_SALES_INVOICE)
        const customer = customers?.find(item => item?.customerId == row?.customerId) || {}
        const currency = currencies?.find(item => item?.currencyId === row?.currency)

        return (
          <Box sx={{ width: '100%', p: 2 }}>
            <Grid container spacing={3} sx={{ alignItems: { xs: 'flex-start', md: 'center' } }}>
              <Grid item xs={11.5}>
                <Grid container spacing={3} sx={{ alignItems: 'center' }}>
                  <Grid item xs={12} sm={12} md={3.5} lg={3.5} xl={4.5} sx={{ pl: 3 }}>
                    {customer?.customerName && (
                      <StyledButton
                        color='primary'
                        onClick={event => {
                          event.stopPropagation()
                          setCustomerDialogState({ open: true, selectedCustomerId: customer?.customerId })
                        }}
                      >
                        {customer?.customerName}
                      </StyledButton>
                    )}
                    <Box
                      sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: '5px', md: '15px' }, alignItems: 'center' }}
                    >
                      <Typography sx={{ ...dataTitleStyles, color: '#000' }}>
                        <span style={{ verticalAlign: 'middle', marginRight: '5px' }}>#</span> {row.invoiceNoPrefix}
                        {row.invoiceNo}
                      </Typography>
                      <Typography sx={dataTitleStyles}>
                        Order:
                        <StyledButton
                          color='primary'
                          style={{ textDecoration: 'none' }}
                          onClick={event => {
                            event.stopPropagation()
                            setSalesOrderDialogState({ open: true, selectedSalesOrderId: row.salesOrderId })
                          }}
                        >
                          #{row?.saleOrderNoPrefix || '-'} {row?.salesOrderNo || '-'}
                        </StyledButton>
                      </Typography>
                    </Box>
                    <Typography sx={{ ...dataTitleStyles, color: '#818181' }}>{row?.customerNotes || '-'}</Typography>
                  </Grid>
                  <Grid item xs={3} sm={2} md={1.4} lg={1.4} xl={1}>
                    <Typography sx={dataTextStyles}>
                      <span> {date}</span>
                    </Typography>{' '}
                    <Typography sx={dataTitleStyles}>Date</Typography>
                  </Grid>
                  <Grid item xs={3} sm={2} md={1.4} lg={1.4} xl={1}>
                    <Typography sx={dataTextStyles}>
                      <span> {dueDate}</span>
                    </Typography>{' '}
                    <Typography sx={dataTitleStyles}>Due Date</Typography>
                  </Grid>
                  <Grid item xs={6} sm={2} md={1.8} lg={1.8} xl={1.5} sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                    {!isMobile && (
                      <>
                        <Typography sx={dataTextStyles}>{row.paymentTerms || '-'}</Typography>{' '}
                        <Typography sx={dataTitleStyles}>Payment Terms</Typography>
                      </>
                    )}
                  </Grid>
                  <Grid item xs={3} sm={2} md={1} lg={1} xl={1}>
                    {rowStatusChip(row?.status) || '-'}
                    <Typography sx={dataTitleStyles}>Status</Typography>
                  </Grid>
                  <Grid item xs={5} sm={2} md={1.4} lg={1.4} xl={1.5} sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                    {rowStatusChip(row?.paymentStatus) || '-'}
                    <Typography sx={dataTitleStyles}>Payment Status</Typography>
                  </Grid>
                  <Grid item xs={4} sm={2} md={1.4} lg={1.4} xl={1.5}>
                    {row?.totalAmount ? (
                      <Typography sx={dataTextStyles}>
                        <NumberFormat value={row.totalAmount} currency={currency} />
                      </Typography>
                    ) : (
                      '-'
                    )}
                    <Typography sx={dataTitleStyles}>Total Amount</Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={0.5}>
                {isLaptop ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                    {viewPermission && (
                      <IconButton
                        variant='outlined'
                        component={Link}
                        scroll={true}
                        href={`/sales/invoice/view/${row?.invoiceId}`}
                        onClick={event => {
                          event.stopPropagation()
                          dispatch(setSelectedInvoice(row))
                        }}
                      >
                        <Icon icon='tabler:eye' />
                      </IconButton>
                    )}
                    {editPermission && row?.status === STATUS_DRAFT && (
                      <IconButton
                        variant='outlined'
                        component={Link}
                        scroll={true}
                        href={`/sales/invoice/edit/${row?.invoiceId}`}
                        onClick={event => {
                          event.stopPropagation()
                          dispatch(setSelectedInvoice(row))
                        }}
                      >
                        <Icon icon='tabler:edit' />
                      </IconButton>
                    )}
                    {/* {deletePermission && ( */}

                    <>
                      <IconButton
                        aria-label='more'
                        id='long-button'
                        aria-haspopup='true'
                        onClick={event => {
                          event.stopPropagation()
                          handleMenuClick(event, row)
                        }}
                      >
                        <Icon icon='iconamoon:menu-kebab-vertical-circle-light' width={25} height={25} />
                      </IconButton>
                      <CommonStyledMenu
                        anchorEl={anchorElMap[row.invoiceId]}
                        open={Boolean(anchorElMap[row.invoiceId])}
                        onClose={() => handleClose(row)}
                      >
                        {row?.status === STATUS_DRAFT && (
                          <MenuItem onClick={() => MarkasIssued(row)} disableRipple>
                            <Icon icon={'teenyicons:file-tick-outline'} />
                            Mark As Issued
                          </MenuItem>
                        )}
                        {row?.status === STATUS_ISSUED && (
                          <MenuItem
                            onClick={() => {
                              handleClose(row)
                              setOpenSendCopyDrawer(true)
                            }}
                            disableRipple
                          >
                            <Icon icon={'iconoir:send'} />
                            Send Invoice
                          </MenuItem>
                        )}

                        {row?.status === STATUS_ISSUED && (
                          <MenuItem onClick={() => CancelInvoice(row)} disableRipple>
                            <Icon icon={'material-symbols:cancel-outline-rounded'} />
                            Cancel Sales Invoice
                          </MenuItem>
                        )}
                        {row?.status === STATUS_ISSUED && (
                          <MenuItem
                            onClick={() => {
                              setInvoiceForAction(row)
                              handleClose(row)
                              handlePrint()
                            }}
                          >
                            <Icon icon={'ion:print-outline'} />
                            Print Invoice
                          </MenuItem>
                        )}
                        {deletePermission && row?.status === STATUS_DRAFT && <Divider sx={{ my: 1 }} />}
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
                            <Icon icon='mingcute:delete-2-line' color='inherit' />
                            Delete
                          </MenuItem>
                        )}
                      </CommonStyledMenu>
                    </>

                    {/* )} */}
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                    {row?.status !== STATUS_DELIVERED && (
                      <>
                        <IconButton
                          aria-label='more'
                          id='long-button'
                          aria-haspopup='true'
                          onClick={event => {
                            event.stopPropagation()
                            handleMenuClick(event, row)
                          }}
                        >
                          <Icon icon='iconamoon:menu-kebab-vertical-circle-light' width={27} height={27} />
                        </IconButton>
                        <CommonStyledMenu
                          anchorEl={anchorElMap[row.invoiceId]}
                          open={Boolean(anchorElMap[row.invoiceId])}
                          onClose={() => handleClose(row)}
                        >
                          {viewPermission && (
                            <MenuItem
                              component={Link}
                              scroll={true}
                              href={`/sales/invoice/view/${row.invoiceId}`}
                              onClick={() => dispatch(setSelectedInvoice(row))}
                            >
                              <Icon icon='tabler:eye' />
                              view
                            </MenuItem>
                          )}
                          {editPermission && row?.status === STATUS_DRAFT && (
                            <MenuItem
                              component={Link}
                              scroll={true}
                              onClick={() => dispatch(setSelectedInvoice(row))}
                              href={`/sales/invoice/edit/${row.invoiceId}`}
                            >
                              <Icon icon='tabler:edit' />
                              Edit
                            </MenuItem>
                          )}
                          {row?.status === STATUS_DRAFT && (
                            <MenuItem onClick={() => MarkasIssued(row)}>
                              <Icon icon={'material-symbols:cancel-outline-rounded'} />
                              Mark As Issued
                            </MenuItem>
                          )}
                          {row?.status === STATUS_ISSUED && (
                            <MenuItem
                              onClick={() => {
                                handleClose(row)
                                setOpenSendCopyDrawer(true)
                              }}
                              disableRipple
                            >
                              <Icon icon={'iconoir:send'} />
                              Send Invoice
                            </MenuItem>
                          )}

                          {row?.status === STATUS_ISSUED && (
                            <MenuItem onClick={() => CancelInvoice(row)} disableRipple>
                              <Icon icon={'material-symbols:cancel-outline-rounded'} />
                              Cancel Sales Invoice
                            </MenuItem>
                          )}
                          {row?.status === STATUS_ISSUED && (
                            <MenuItem
                              onClick={() => {
                                setInvoiceForAction(row)
                                handleClose(row)
                                handlePrint()
                              }}
                            >
                              <Icon icon={'ion:print-outline'} />
                              Print Invoice
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
                  </Box>
                )}
              </Grid>
            </Grid>
          </Box>
        )
      }
    }
  ]

  const handleDateRange = async (startDate, endDate, overrides = {}) => {
    let salesInvoiceFilter = salesInvoices
    const {
      selectedCustomer: customerOverride = selectedCustomer,
      status: statusOverride = status,
      paymentStatus: paymentStatusOverride = paymentStatus
    } = overrides
    const isStartDate = startDate.toDateString() !== oneMonthAgoDate.toDateString()
    const isEndDate = endDate.toDateString() !== todayDate.toDateString()
    const isFilterPurchaseStatus = Boolean(paymentStatusOverride)
    const isFilterCustomer = Boolean(customerOverride)
    const isFilterStatus = Boolean(statusOverride)
    const anyFilterActive = isStartDate || isEndDate || isFilterPurchaseStatus || isFilterStatus || isFilterCustomer
    try {
      if (isStartDate || isEndDate) {
        const response = await fetchData(
          getSalesInvoicesByDateRangeQuery(tenantId, DateFunction(startDate), DateFunction(endDate))
        )
        salesInvoiceFilter = response?.getSalesInvoicesByDateRange
      }
      if (salesInvoiceFilter) {
        const filteredData = salesInvoiceFilter.filter(item => {
          const statusMatches = statusOverride ? item?.status === statusOverride : true
          const paymentStatusMatches = paymentStatusOverride ? item?.paymentStatus === paymentStatusOverride : true

          const customerMatches = customerOverride?.customerId ? item?.customerId === customerOverride.customerId : true
          return statusMatches && paymentStatusMatches && customerMatches
        })
        setSearchedSOInvoices('')

        setFilterActive({
          filterActive: anyFilterActive,
          startDate: isStartDate,
          endDate: isEndDate,
          selectedCustomer: isFilterCustomer,
          status: isFilterStatus,
          paymentStatus: isFilterPurchaseStatus
        })

        setTemporaryFilterData(anyFilterActive ? filteredData : [])
        setFilterSOInvoices(anyFilterActive ? filteredData : [])
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setAnchorEl(null)
      console.log('fetched data successfully')
    }
  }

  const handleSearchChange = (event, newValue) => {
    const searchValue = newValue ? newValue.toLowerCase() : ''

    if (searchValue) {
      const matchedSOInvoices = salesInvoices.filter(invoice => {
        const customer = customers.find(cust => cust.customerId === invoice.customerId)
        const customerName = customer ? customer.customerName.toLowerCase() : ''

        return (
          invoice.invoiceNo.toLowerCase().includes(searchValue) ||
          invoice.totalAmount.toString().includes(searchValue) ||
          customerName.includes(searchValue)
        )
      })

      setFilterSOInvoices(matchedSOInvoices.length > 0 ? matchedSOInvoices : temporaryFilterData)
    } else {
      setFilterSOInvoices(temporaryFilterData)
      setSearchedSOInvoices('')
    }
  }
  return (
    <>
      <Grid container spacing={2} sx={{ justifyContent: 'space-between', mb: 3 }}>
        <Grid item xs={7} sm={4} md={4} lg={4} xl={4}>
          <CustomAutocomplete
            options={filteredSOInvoices.length > 0 || isFilterActive.filterActive ? filteredSOInvoices : salesInvoices}
            getOptionLabel={option => {
              if (!option) return ''

              const customer = customers.find(cust => cust.customerId === option.customerId)
              const customerName = customer ? customer.customerName : ''
              const displayName = customer?.displayName || ''

              const displayCompName = customer?.companyName ? `-${customer.companyName}` : ''

              const displayNameText = displayName && displayName !== customerName ? ` (${displayName})` : ''

              const currencyObj = currencies.find(cur => cur.currencyId === option.currency)
              const currencySymbol = currencyObj ? currencyObj.symbol : ''

              const formattedAmount =
                option.totalAmount && currencySymbol ? `-${currencySymbol} ${option.totalAmount.toLocaleString()}` : ''

              return `${customerName}${displayNameText}${displayCompName} - ${option.invoiceNo} ${formattedAmount}`.trim()
            }}
            filterOptions={options => options}
            value={salesInvoices?.find(option => option.invoiceId === searchedSOInvoices?.invoiceId) || null}
            onChange={(event, newValue) => {
              setFilterSOInvoices(newValue ? [newValue] : temporaryFilterData)
              setSearchedSOInvoices(newValue)
            }}
            onInputChange={(event, newValue) => {
              if (newValue && newValue.trim() !== '') {
                handleSearchChange(event, newValue)
              }
            }}
            disableClearable={false}
            renderInput={params => <CustomTextField {...params} fullWidth label='Invoices' />}
          />
        </Grid>
        <SalesInvoiceFilter
          salesInvoices={salesInvoices}
          setFilterSOInvoices={setFilterSOInvoices}
          setTemporaryFilterData={setTemporaryFilterData}
          setSearchedSOInvoices={setSearchedSOInvoices}
          isFilterActive={isFilterActive}
          setFilterActive={setFilterActive}
        />
      </Grid>
      {loading ? (
        <LinearProgress />
      ) : (
        <MobileDataGrid
          rows={filteredSOInvoices.length > 0 || isFilterActive.filterActive ? filteredSOInvoices : salesInvoices}
          columns={columns}
          getRowId={row => row.invoiceId}
          initialState={{
            sorting: {
              sortModel: [{ field: 'invoiceNo', sort: 'desc' }]
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
            dispatch(setSelectedInvoice(params.row))
            router.push(`/sales/invoice/view/${params?.row?.invoiceId}`)
          }}
          slots={{
            columnHeaders: () => null,
            noRowsOverlay: CustomNoRowsOverlay
          }}
          slotProps={{
            noRowsOverlay: {
              mainText: 'Empty Invoices',
              subText: ' No invoice available here. Click "Add New" button above to get started.'
            }
          }}
        />
      )}
      {customerDialogState?.open && (
        <CommonCustomerPopup
          customerId={customerDialogState?.selectedCustomerId}
          open={customerDialogState?.open}
          setOpen={() => setCustomerDialogState({ open: false, selectedCustomerId: null })}
        />
      )}
      <div style={{ position: 'fixed', top: '100%', left: '100%', transform: 'translate(100%, 100%)' }}>
        <PrintSalesInvoice ref={componentRef} selectedInvoice={invoiceForAction} />
      </div>
      {openDialog && (
        <DeleteSalesInvoice
          tenantId={tenantId}
          invoiceId={selectedSalesInvoice?.invoiceId}
          openDialog={openDialog}
          setOpenDialog={setOpenDialog}
        />
      )}

      {salesOrderDialogState.open && (
        <CommonSoPopup
          orderId={salesOrderDialogState.selectedSalesOrderId}
          open={salesOrderDialogState.open}
          onClose={() => setSalesOrderDialogState({ open: false, selectedSalesOrderId: null })}
        />
      )}
      {openSendCopyDrawer && (
        <SendInvoiceCopyDrawer
          order={selectedSalesInvoice}
          setOpenSendCopyDrawer={setOpenSendCopyDrawer}
          openSendCopyDrawer={openSendCopyDrawer}
        />
      )}
    </>
  )
}
