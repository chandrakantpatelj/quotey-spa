import { Box, Grid, IconButton, LinearProgress, MenuItem, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import Link from 'next/link'
import Router from 'next/router'
import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useReactToPrint } from 'react-to-print'
import {
  undoSalesOrderConfirmationQuery,
  undoTaxInvoiceForSalesOrderQuery
} from 'src/@core/components/graphql/sales-order-queries'
import Icon from 'src/@core/components/icon'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import CustomTextField from 'src/@core/components/mui/text-field'
import CommonCustomerPopup from 'src/common-components/CommonCustomerPopup'
import CommonStyledMenu from 'src/common-components/CommonStyledMenu'
import CustomNoRowsOverlay from 'src/common-components/CustomNoRowsOverlay'
import MobileDataGrid from 'src/common-components/MobileDataGrid'
import StyledButton from 'src/common-components/StyledMuiButton'
import { writeData } from 'src/common-functions/GraphqlOperations'
import {
  CREATE_PACKAGE,
  DELETE_SALES_ORDER,
  EDIT_SALES_ORDER,
  STATUS_CONFIRMED,
  STATUS_DELIVERED,
  STATUS_DRAFT,
  STATUS_INVOICED,
  VIEW_SALES_ORDER
} from 'src/common-functions/utils/Constants'
import {
  dataTextStyles,
  dataTitleStyles,
  DateFunction,
  hasPermission,
  NumberFormat,
  rowStatusChip
} from 'src/common-functions/utils/UtilityFunctions'
import usePackages from 'src/hooks/getData/usePackages'
import useSalesInvoices from 'src/hooks/getData/useSaleInvoices'
import { useIsLaptop } from 'src/hooks/IsDesktop'
import { createAlert } from 'src/store/apps/alerts'
import { resetPackage } from 'src/store/apps/packages'
import { setActionSalesOrder, setUpdateSalesOrder } from 'src/store/apps/sales'
import { resetInvoice } from 'src/store/apps/sales-invoices'
import { PrintSalesInvoice } from '../SalesInvoice/PrintSalesInvoice'
import SendInvoiceCopyDrawer from '../SalesInvoice/SendInvoiceCopyDrawer'
import CreateSalesOrderReturnDrawer from './CreateSalesOrderReturnDrawer'
import DeleteSalesOrder from './DeleteSalesOrder'
import IssueTaxInvoicePopUp from './IssueTaxInvoicePopUp'
import SalesOrderFilter from './SalesOrderFilter'

const SalesOrderListTable = ({ tenantId, salesOrdersObject, loading }) => {
  const router = Router
  const dispatch = useDispatch()
  const isLaptop = useIsLaptop()
  const userProfile = useSelector(state => state.userProfile)
  const { fetchSalesInvoice, fetchSalesInvoices } = useSalesInvoices(tenantId)
  const { fetchPackages } = usePackages(tenantId)

  // State for active filters
  const [isFilterActive, setFilterActive] = useState({})

  const [filteredSO, setFilteredSO] = useState([])
  const [temporaryFilterData, setTemporaryFilterData] = useState([])
  const [searchedSO, setSearchedSO] = useState(null)
  const [selectedSalesInvoice, setSelectedSalesInvoice] = useState()
  const { currencies = [], customers = [], salesOrders = [] } = salesOrdersObject || {}

  const [openDialog, setOpenDialog] = useState(false)
  const [selectedSalesOrder, setSelectedSalesOrder] = useState('')
  const [openSendCopyDrawer, setOpenSendCopyDrawer] = useState(false)
  const [anchorElMap, setAnchorElMap] = useState({})
  const [openCreateReturnDrawer, setOpenCreateReturnDrawer] = useState(false)
  const [customerDialogState, setCustomerDialogState] = useState({
    open: false,
    selectedCustomerId: null
  })
  const componentRef = useRef(null)

  const handlePrint = useReactToPrint({
    content: () => componentRef.current
  })

  const [selectedInvoice, setselectedInvoice] = useState({})

  const handleFetchInvoice = async invoiceId => {
    if (!invoiceId) return
    const invoiceData = await fetchSalesInvoice(invoiceId)
    setselectedInvoice(invoiceData)
  }
  const handleClick = (event, row) => {
    setSelectedSalesOrder(row)
    dispatch(setActionSalesOrder(row))
    const updatedAnchorElMap = { ...anchorElMap }
    updatedAnchorElMap[row?.orderId] = event.currentTarget
    setAnchorElMap(updatedAnchorElMap)
  }

  useEffect(() => {
    if (selectedSalesOrder?.salesInvoiceId) {
      handleFetchInvoice(selectedSalesOrder?.salesInvoiceId)
    }
  }, [tenantId, selectedSalesOrder?.salesInvoiceId])

  const handleClose = row => {
    const updatedAnchorElMap = { ...anchorElMap }
    updatedAnchorElMap[row?.orderId] = null
    setAnchorElMap(updatedAnchorElMap)
  }

  const handleDelete = row => {
    setSelectedSalesOrder(row)
    handleClose(row)
    setOpenDialog(true)
  }

  const [openIssueInvoicePopup, setOpenIssueInvoicePopup] = useState(false)

  const handleIssueTaxInvoiceFromOrder = async row => {
    handleClose(row)
    setOpenIssueInvoicePopup(true)
  }

  const UndoTaxInvoice = async data => {
    const updatedAnchorElMap = { ...anchorElMap }
    updatedAnchorElMap[data.orderId] = null
    setAnchorElMap(updatedAnchorElMap)
    const { tenantId, orderId } = data
    try {
      const response = await writeData(undoTaxInvoiceForSalesOrderQuery(), { tenantId, orderId })
      if (response.undoTaxInvoiceForSalesOrder) {
        dispatch(resetInvoice())
        fetchSalesInvoices()
        dispatch(setUpdateSalesOrder(response.undoTaxInvoiceForSalesOrder))
        dispatch(createAlert({ message: 'Status changed successfully!', type: 'success' }))
      } else {
        const errorMessage = response?.errors?.[0] ? response.errors[0].message : 'Failed to undo TaxInvoice!'
        dispatch(createAlert({ message: errorMessage, type: 'error' }))
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    }
  }

  const UndoConfirmation = async data => {
    const updatedAnchorElMap = { ...anchorElMap }
    updatedAnchorElMap[data.orderId] = null
    setAnchorElMap(updatedAnchorElMap)
    const { tenantId, orderId } = data
    try {
      const response = await writeData(undoSalesOrderConfirmationQuery(), { tenantId, orderId })
      if (response.undoSalesOrderConfirmation) {
        // dispatch(resetSalesOrder())
        dispatch(resetPackage())
        fetchPackages()
        dispatch(setUpdateSalesOrder(response.undoSalesOrderConfirmation))
        dispatch(createAlert({ message: 'Order confirmed successfully!', type: 'success' }))
      } else {
        const errorMessage = response?.errors?.[0] ? response.errors[0].message : 'Failed to undo order confirmation!'
        dispatch(createAlert({ message: errorMessage, type: 'error' }))
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    }
  }

  const handleEditAndView = row => {
    dispatch(setActionSalesOrder(row))
  }

  const columns = [
    {
      field: 'orderDate',
      headerName: '',
      flex: 1,
      sortable: false,
      renderCell: ({ row }) => {
        const viewPermission = hasPermission(userProfile, VIEW_SALES_ORDER)
        const editPermission = hasPermission(userProfile, EDIT_SALES_ORDER)
        const deletePermission = hasPermission(userProfile, DELETE_SALES_ORDER)
        const customer = customers?.find(item => item?.customerId == row?.customerId) || {}
        const currency = currencies?.find(item => item?.currencyId === row?.currency)
        return (
          <Box sx={{ width: '100%', p: 2 }}>
            <Grid container spacing={3} sx={{ alignItems: { xs: 'flex-start', md: 'center' } }}>
              <Grid item xs={11}>
                <Grid container spacing={3} sx={{ alignItems: 'center' }}>
                  <Grid item xs={12} sm={12} md={4} lg={4} xl={5.5} sx={{ pl: 3 }}>
                    {customer?.customerName && (
                      <StyledButton
                        color='primary'
                        onClick={event => {
                          event.stopPropagation()
                          setCustomerDialogState({ open: true, selectedCustomerId: customer?.customerId })
                          // event.stopPropagation()
                        }}
                      >
                        {customer?.customerName}
                      </StyledButton>
                    )}
                    {/* <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: '5px', md: '15px' }, alignItems: 'center' }}> */}
                    <Typography sx={{ ...dataTitleStyles, color: '#000' }}>
                      <span style={{ verticalAlign: 'middle', marginRight: '5px' }}>#</span> {row.invoiceNoPrefix}
                      {row.orderNo}{' '}
                    </Typography>

                    {/* </Box> */}
                    <Typography sx={{ ...dataTitleStyles, color: '#818181' }}>{row?.notes}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={2.4} md={1.5} lg={1.5} xl={1}>
                    <Typography sx={dataTextStyles}>
                      <span> {DateFunction(row?.orderDate) || '-'}</span>
                    </Typography>{' '}
                    <Typography sx={dataTitleStyles}>Date</Typography>
                  </Grid>
                  <Grid item xs={6} sm={2.4} md={1.5} lg={1.5} xl={1}>
                    {rowStatusChip(row?.status) || '-'}
                    <Typography sx={dataTitleStyles}>Status</Typography>
                  </Grid>
                  <Grid item xs={6} sm={2.4} md={1.5} lg={1.5} xl={1.5}>
                    {rowStatusChip(row?.paymentStatus) || '-'}
                    <Typography sx={dataTitleStyles}>Payment Status</Typography>
                  </Grid>
                  <Grid item xs={0} sm={2.4} md={1.5} lg={1.5} xl={1.5} sx={{ display: { xs: 'none', sm: 'block' } }}>
                    {rowStatusChip(row?.deliveryStatus) || '-'}
                    <Typography sx={dataTitleStyles}>Delivery Status</Typography>
                  </Grid>
                  <Grid item xs={6} sm={2.4} md={2} lg={2} xl={1.5}>
                    <Typography sx={dataTextStyles}>
                      <NumberFormat value={row.totalAmount} currency={currency} />
                    </Typography>
                    <Typography sx={{ ...dataTitleStyles, display: { xs: 'block', md: 'none' } }}>Total</Typography>
                    <Typography sx={{ ...dataTitleStyles, display: { xs: 'none', md: 'block' } }}>
                      Total Amount
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={1}>
                {isLaptop ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                    {viewPermission && (
                      <IconButton
                        component={Link}
                        scroll={true}
                        href={`/sales/sales-order/view/${row?.orderId}`}
                        onClick={event => {
                          event.stopPropagation()
                          handleEditAndView(row)
                        }}
                      >
                        <Icon icon='tabler:eye' />
                      </IconButton>
                    )}
                    {editPermission && (
                      <IconButton
                        component={Link}
                        scroll={true}
                        href={`/sales/sales-order/edit/${row?.orderId}`}
                        onClick={event => {
                          event.stopPropagation()
                          handleEditAndView(row)
                        }}
                      >
                        <Icon icon='tabler:edit' />
                      </IconButton>
                    )}
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
                        anchorEl={anchorElMap[row.orderId]}
                        open={Boolean(anchorElMap[row.orderId])}
                        onClose={() => handleClose(row)}
                      >
                        {row?.status === STATUS_CONFIRMED && (
                          <MenuItem
                            onClick={event => {
                              event.stopPropagation()
                              handleIssueTaxInvoiceFromOrder(row)
                            }}
                          >
                            <Icon icon={'iconamoon:invoice-light'} />
                            Issue Tax Invoice
                          </MenuItem>
                        )}
                        {row?.status !== STATUS_DRAFT && (
                          <MenuItem component={Link} scroll={true} href={`/sales/packages/add-package`}>
                            <Icon icon={'ph:package'} />
                            Create Package
                          </MenuItem>
                        )}
                        {row?.status === STATUS_INVOICED && (
                          <MenuItem
                            onClick={() => {
                              setOpenCreateReturnDrawer(true)
                              handleClose(row)
                            }}
                          >
                            <Icon icon='ph:arrow-counter-clockwise' />
                            Create Return
                          </MenuItem>
                        )}

                        {row?.status === STATUS_INVOICED && (
                          <MenuItem
                            onClick={event => {
                              event.stopPropagation()
                              UndoTaxInvoice(row)
                            }}
                          >
                            <Icon icon={'iconamoon:do-undo-light'} />
                            Undo TaxInvoice
                          </MenuItem>
                        )}
                        {row?.status === STATUS_CONFIRMED && (
                          <MenuItem
                            onClick={event => {
                              event.stopPropagation()
                              UndoConfirmation(row)
                            }}
                          >
                            <Icon icon={'iconamoon:do-undo-light'} />
                            Undo Confirmation
                          </MenuItem>
                        )}
                        {row?.status === STATUS_DELIVERED && (
                          <MenuItem
                            variant='outlined'
                            component={Link}
                            scroll={true}
                            href={`/sales/payments/new-payment/`}
                          >
                            <Icon icon={'basil:invoice-outline'} />
                            Make Payment
                          </MenuItem>
                        )}

                        {row.salesInvoiceId && row?.status === STATUS_INVOICED && (
                          <MenuItem
                            onClick={event => {
                              event.stopPropagation()
                              handleClose(row)
                              setOpenSendCopyDrawer(true)
                              setSelectedSalesInvoice(row)
                            }}
                            disableRipple
                          >
                            <Icon icon={'iconoir:send'} />
                            Send Invoice
                          </MenuItem>
                        )}
                        {row.salesInvoiceId && row?.status === STATUS_INVOICED && (
                          <MenuItem
                            onClick={event => {
                              event.stopPropagation()
                              handleClose(row)
                              handlePrint()
                            }}
                            disableRipple
                          >
                            <Icon icon={'ion:print-outline'} />
                            Print Invoice
                          </MenuItem>
                        )}

                        {deletePermission && row?.status === STATUS_DRAFT && (
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
                            <Icon icon='mingcute:delete-2-line' color='inherit' />
                            Delete
                          </MenuItem>
                        )}
                      </CommonStyledMenu>
                    </>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                    <IconButton
                      aria-label='more'
                      id='long-button'
                      aria-haspopup='true'
                      onClick={event => {
                        event.stopPropagation()
                        handleClick(event, row)
                      }}
                    >
                      <Icon icon='iconamoon:menu-kebab-vertical-circle-light' width={27} height={27} />
                    </IconButton>
                    <CommonStyledMenu
                      anchorEl={anchorElMap[row.orderId]}
                      open={Boolean(anchorElMap[row.orderId])}
                      onClose={() => handleClose(row)}
                    >
                      {viewPermission && (
                        <MenuItem component={Link} scroll={true} href={`/sales/sales-order/view/${row.orderId}`}>
                          <Icon icon='tabler:eye' />
                          view
                        </MenuItem>
                      )}
                      {editPermission && (
                        <MenuItem component={Link} scroll={true} href={`/sales/sales-order/edit/${row.orderId}`}>
                          <Icon icon='tabler:edit' />
                          Edit
                        </MenuItem>
                      )}

                      {row?.status === STATUS_CONFIRMED && (
                        <MenuItem onClick={() => handleIssueTaxInvoiceFromOrder(row)}>
                          <Icon icon={'iconamoon:invoice-light'} />
                          Issue Tax Invoice
                        </MenuItem>
                      )}
                      {hasPermission(userProfile, CREATE_PACKAGE) && row?.status !== STATUS_DRAFT && (
                        <MenuItem component={Link} scroll={true} href={`/sales/packages/add-package`}>
                          <Icon icon={'ph:package'} />
                          Create Package
                        </MenuItem>
                      )}
                      {row?.status === STATUS_INVOICED && (
                        <MenuItem
                          onClick={() => {
                            setOpenCreateReturnDrawer(true)
                            handleClose(row)
                          }}
                        >
                          <Icon icon='ph:arrow-counter-clockwise' />
                          Create Return
                        </MenuItem>
                      )}

                      {row?.status === STATUS_INVOICED && (
                        <MenuItem
                          onClick={event => {
                            event.stopPropagation()
                            UndoTaxInvoice(row)
                          }}
                        >
                          <Icon icon={'iconamoon:do-undo-light'} />
                          Undo TaxInvoice
                        </MenuItem>
                      )}
                      {row?.status === STATUS_CONFIRMED && (
                        <MenuItem
                          onClick={event => {
                            event.stopPropagation()
                            UndoConfirmation(row)
                          }}
                        >
                          <Icon icon={'iconamoon:do-undo-light'} />
                          Undo Confirmation
                        </MenuItem>
                      )}

                      {row.salesInvoiceId && row?.status === STATUS_INVOICED && (
                        <MenuItem
                          onClick={() => {
                            handleClose(row)
                            setOpenSendCopyDrawer(true)
                            setSelectedSalesInvoice(row)
                          }}
                          disableRipple
                          sx={{ display: { xs: 'none', sm: 'flex' } }}
                        >
                          <Icon icon={'iconoir:send'} />
                          Send Invoice
                        </MenuItem>
                      )}

                      {row.salesInvoiceId && row?.status === STATUS_INVOICED && (
                        <MenuItem
                          onClick={event => {
                            event.stopPropagation()
                            handleClose(row)
                            // setOpenModal(true)

                            handlePrint()
                          }}
                          disableRipple
                          sx={{ display: { xs: 'none', sm: 'flex' } }}
                        >
                          <Icon icon={'ion:print-outline'} />
                          Print Invoice
                        </MenuItem>
                      )}

                      {hasPermission(userProfile, DELETE_SALES_ORDER) && row?.status === STATUS_DRAFT && (
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
    const searchValue = newValue?.toLowerCase().trim() || ''

    if (searchValue) {
      const matchedSO = salesOrders.filter(order => {
        const customer = customers.find(c => c.customerId === order.customerId) || {}
        const customerName = customer.customerName?.toLowerCase() || ''
        const totalAmount = order.totalAmount?.toString().toLowerCase() || ''
        const notes = order.notes?.toLowerCase() || ''
        const orderNo = order.orderNo?.toLowerCase() || ''

        return (
          orderNo.includes(searchValue) ||
          customerName.includes(searchValue) ||
          totalAmount.includes(searchValue) ||
          notes.includes(searchValue)
        )
      })

      setFilteredSO(matchedSO.length > 0 ? matchedSO : temporaryFilterData)
    } else {
      setFilteredSO(temporaryFilterData)
      setSearchedSO(null)
    }
  }

  return (
    <>
      <Grid container spacing={2} sx={{ justifyContent: 'space-between', mb: 3 }}>
        <Grid item xs={7} sm={4} md={4} lg={4} xl={4}>
          <CustomAutocomplete
            options={filteredSO.length > 0 || isFilterActive.filterActive ? filteredSO : salesOrders}
            getOptionLabel={option => {
              if (!option) return ''

              const customer = customers.find(c => c.customerId === option.customerId) || {}
              const customerName = customer.customerName || ''
              const displayName = customer.displayName || ''
              const displayCompName = customer.companyName ? ` - ${customer.companyName}` : ''
              const displayNameText = displayName && displayName !== customerName ? ` (${displayName})` : ''

              const currency = currencies.find(cur => cur.currencyId === option.currency)
              const currencySymbol = currency?.symbol || ''

              const formattedAmount =
                option.totalAmount && currencySymbol
                  ? ` - ${currencySymbol} ${Number(option.totalAmount).toLocaleString()}`
                  : ''

              const notesText = option.notes ? ` - ${option.notes}` : ''

              return `${customerName}${displayNameText}${displayCompName} - ${option.orderNo}${formattedAmount}${notesText}`.trim()
            }}
            filterOptions={options => options} // Disables built-in filtering
            value={salesOrders.find(option => option.orderId === searchedSO?.orderId) || null}
            onChange={(event, newValue) => {
              setFilteredSO(newValue ? [newValue] : temporaryFilterData)
              setSearchedSO(newValue)
            }}
            onInputChange={(event, newValue) => {
              if (newValue && newValue.trim() !== '') {
                handleSearchChange(event, newValue)
              }
            }}
            disableClearable={false}
            renderInput={params => <CustomTextField {...params} fullWidth label='Sales Orders' />}
          />
        </Grid>
        <SalesOrderFilter
          salesOrders={salesOrders}
          setFilteredSO={setFilteredSO}
          setTemporaryFilterData={setTemporaryFilterData}
          setSearchedSO={setSearchedSO}
          isFilterActive={isFilterActive}
          setFilterActive={setFilterActive}
        />
      </Grid>

      {loading ? (
        <LinearProgress />
      ) : (
        <MobileDataGrid
          rows={filteredSO.length > 0 || isFilterActive.filterActive ? filteredSO : salesOrders}
          columns={columns}
          getRowId={row => row?.orderId}
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
            dispatch(setActionSalesOrder(params.row))
            router.push(`/sales/sales-order/view/${params?.row?.orderId}`)
          }}
          slots={{
            columnHeaders: () => null,
            noRowsOverlay: CustomNoRowsOverlay
          }}
          slotProps={{
            noRowsOverlay: {
              mainText: 'Empty Sales Order',
              subText: 'No sales order available here. Click "Add New" button above to get started.'
            }
          }}
        />
      )}
      <div style={{ position: 'fixed', top: '100%', left: '100%', transform: 'translate(100%, 100%)' }}>
        <PrintSalesInvoice ref={componentRef} selectedInvoice={selectedInvoice} />
      </div>
      {/* <div style={{ position: 'fixed', top: '100%', left: '100%', transform: 'translate(100%, 100%)' }}>
        <PrintSalesInvoice ref={componentRef} invoiceId={selectedSalesOrder?.salesInvoiceId} />
      </div> */}
      {customerDialogState?.open && (
        <CommonCustomerPopup
          customerId={customerDialogState?.selectedCustomerId}
          open={customerDialogState?.open}
          setOpen={() => setCustomerDialogState({ open: false, selectedCustomerId: null })}
        />
      )}
      {openSendCopyDrawer && (
        <SendInvoiceCopyDrawer
          order={selectedSalesInvoice}
          setOpenSendCopyDrawer={setOpenSendCopyDrawer}
          openSendCopyDrawer={openSendCopyDrawer}
        />
      )}
      {/* {openModal && <ResendModal order={order} customer={customer} openModal={openModal} setOpenModal={setOpenModal} />} */}
      {openDialog && (
        <DeleteSalesOrder
          tenantId={selectedSalesOrder?.tenantId}
          orderId={selectedSalesOrder?.orderId}
          openDialog={openDialog}
          setOpenDialog={setOpenDialog}
        />
      )}

      {openIssueInvoicePopup && (
        <IssueTaxInvoicePopUp tenantId={tenantId} open={openIssueInvoicePopup} setOpen={setOpenIssueInvoicePopup} />
      )}
      {openCreateReturnDrawer && (
        <CreateSalesOrderReturnDrawer
          openDrawer={openCreateReturnDrawer}
          setOpenDrawer={setOpenCreateReturnDrawer}
          // reloadPackages={reloadPackages}
          // setReloadPackages={setReloadPackages}
        />
      )}
    </>
  )
}

export default SalesOrderListTable
