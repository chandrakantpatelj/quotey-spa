import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import {
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  MenuItem,
  Typography
} from '@mui/material'

import { TabList, TabPanel } from '@mui/lab'
import TabContext from '@mui/lab/TabContext'

import { useTheme } from '@mui/material/styles'

import Icon from 'src/@core/components/icon'

import { AddOutlined, MoreVert } from '@mui/icons-material'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import Link from 'next/link'
import { useReactToPrint } from 'react-to-print'
import { getSalesInvoicesByOrderQuery } from 'src/@core/components/graphql/sales-invoice-queries'
import {
  getSalesOrderPackagesByOrderQuery,
  markSalesOrderPackageAsDeliveredMutation,
  undoSalesOrderPackageConfirmationMutation,
  undoSalesOrderPackageFulfillmentMutation
} from 'src/@core/components/graphql/sales-order-package-queries'
import { getSalesInvoicePaymentsForSalesInvoiceQuery } from 'src/@core/components/graphql/sales-payment-queries'
import CommonInvoicePopUp from 'src/common-components/CommonInvoicePopUp'
import CommonSoPackagePopUp from 'src/common-components/CommonSoPackagePopUp'
import CommonSoPaymentsPopUp from 'src/common-components/CommonSoPaymentsPopUp'
import CommonStyledMenu from 'src/common-components/CommonStyledMenu'
import CustomNoRowsOverlay from 'src/common-components/CustomNoRowsOverlay'
import MobileDataGrid from 'src/common-components/MobileDataGrid'
import StyledButton from 'src/common-components/StyledMuiButton'
import { fetchData, writeData } from 'src/common-functions/GraphqlOperations'
import {
  DELETE_PACKAGE,
  DELETE_SALES_PAYMENT,
  EDIT_PACKAGE,
  EDIT_SALES_PAYMENT,
  SALES_ORDER_PDF,
  STATUS_AWAITING_RECONCILIATION,
  STATUS_CONFIRMED,
  STATUS_DELIVERED,
  STATUS_DRAFT,
  STATUS_FULFILLED,
  STATUS_INVOICED,
  STATUS_ISSUED,
  STATUS_PAID,
  STATUS_PARTLY_FULFILLED,
  STATUS_PENDING_CLEARANCE,
  VIEW_PACKAGE
} from 'src/common-functions/utils/Constants'
import {
  dataTextStyles,
  dataTitleStyles,
  DateFunction,
  hasPermission,
  NumberFormat,
  renderTabs,
  rowStatusChip
} from 'src/common-functions/utils/UtilityFunctions'
import useCurrencies from 'src/hooks/getData/useCurrencies'
import useCustomers from 'src/hooks/getData/useCustomers'
import usePackages from 'src/hooks/getData/usePackages'
import useSalesOrders from 'src/hooks/getData/useSalesOrders'
import useSalesPayments from 'src/hooks/getData/useSalesPayment'
import useUserAccounts from 'src/hooks/getData/useUserAccounts'
import { createAlert } from 'src/store/apps/alerts'
import { setSelectedPackages, setUpdatePackage } from 'src/store/apps/packages'
import { setActionPayment } from 'src/store/apps/payments'
import { setUpdateInvoice } from 'src/store/apps/sales-invoices'
import AssigntoUserPopup from '../Packages/AssigntoUserPopup'
import DeletePackage from '../Packages/DeletePackage'
import EditSalesPackageDrawer from '../Packages/EditSalesPackageDrawer'
import FullfillPackagePopup from '../Packages/FullfillPackagePopup'
import NewSalesPackageDrawer from '../Packages/NewSalesPackageDrawer'
import ProcessAsDelivered from '../Packages/ProcessAsDelivered'
import DeletePayments from '../Payment/DeletePayment'
import EditSalesPaymentDrawer from '../Payment/EditSalesPaymentDrawer'
import NewSalesPaymentDrawer from '../Payment/NewSalesPaymentDrawer'
import { PrintSalesInvoice } from '../SalesInvoice/PrintSalesInvoice'
import SendInvoiceCopyDrawer from '../SalesInvoice/SendInvoiceCopyDrawer'
import AttachmentTabSO from './AttachmentTabSO'

const tabData = [
  {
    type: 'invoices',
    avatarIcon: 'iconamoon:invoice-thin'
  },
  {
    type: 'packages',
    avatarIcon: 'oui:package'
  },
  {
    type: 'payments',
    avatarIcon: 'fluent:payment-20-regular'
  },

  {
    type: 'attachments',
    avatarIcon: 'carbon:document-attachment'
  }
]

const SalesWidgets = ({ order }) => {
  const theme = useTheme()
  const dispatch = useDispatch()
  const tenantId = useSelector(state => state.tenants?.selectedTenant?.tenantId)
  const { reloadSalesOrderInStore } = useSalesOrders(tenantId)
  const { currencies } = useCurrencies()
  const { userAccounts } = useUserAccounts()
  const { fetchSingleCustomer } = useCustomers(tenantId)
  const { packages: soPackages } = usePackages(tenantId)
  const [salesPayments, setSalesPayments] = useState([])
  const [customer, setCustomer] = useState({})
  const [assignToUserPopup, setAssignToUserPopup] = useState(false)
  const [value, setValue] = useState('invoices')
  const [realoadPayment, setReloadPayment] = useState(false) // State to manage drawer open/close
  const [packages, setPackages] = useState([])
  const [salesInvoices, setSalesInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [salesInvoiceDialogState, setSalesInvoiceDialogState] = useState({
    open: false,
    selectedInvoiceId: null
  })
  const [salesPagckageDialogState, setSalesPagckageDialogState] = useState({
    open: false,
    selectedPackageId: null
  })
  const [salesPaymentDialogState, setSalesPaymentDialogState] = useState({
    open: false,
    selectedPaymentId: null
  })
  const [anchorEl, setAnchorEl] = useState(null)
  const [invoiceForAction, setInvoiceForAction] = useState(null)
  const [openNewPaymentDrawer, setOpenNewPaymentDrawer] = useState(false)
  const [openSendCopyDrawer, setOpenSendCopyDrawer] = useState(false)
  const [reloadPackages, setReloadPackages] = useState(false)
  const [anchorElMap, setAnchorElMap] = useState({})
  const [anchorE2Map, setAnchorE2Map] = useState({})
  const [openDeletePaymentDialog, setOpenDeletePaymentDialog] = useState(false)
  const [openEditPackageDrawer, setOpenEditPackageDrawer] = useState(false)
  const [openNewPackageDrawer, setOpenNewPackageDrawer] = useState(false)
  const [openDialog, setOpenDialog] = useState(false)
  const [selecedPayment, setSelecedPayment] = useState({})
  const [selectedPackage, setSelectedPackage] = useState({})
  const [openDrawer, setOpenDrawer] = useState(false)
  const { reloadSalesPaymentLoader } = useSalesPayments(tenantId)
  const handleChange = (event, newValue) => {
    setValue(newValue)
  }

  const handleAssigntoUser = row => {
    handleClose(row)
    setAssignToUserPopup(true)
  }

  useEffect(() => {
    const getCustomerObject = async () => {
      const customer = await fetchSingleCustomer(order?.customerId)
      // if (customer) {
      setCustomer(customer)
      // }
    }
    // if (!customer) {
    getCustomerObject()
    // }
  }, [tenantId, order?.customerId])

  const getSalesOrderPayments = async () => {
    try {
      setLoading(true)
      const response = await fetchData(
        getSalesInvoicePaymentsForSalesInvoiceQuery(tenantId, order?.salesInvoiceId, order?.orderId)
      )
      if (response.getSalesInvoicePaymentsForSalesInvoice) {
        setSalesPayments(response.getSalesInvoicePaymentsForSalesInvoice)
      } else {
        setSalesPayments([])
      }
    } catch (error) {
      setSalesPayments([])
    } finally {
      setLoading(false)
    }
  }

  const open = Boolean(anchorEl)

  const handleClick = event => {
    setAnchorEl(event.currentTarget)
  }
  const handleCloseStyledMenu = () => {
    setInvoiceForAction(null)
    setAnchorEl(null)
  }

  const componentRef = useRef(null)
  const handlePrint = useReactToPrint({
    content: () => componentRef.current
  })

  const getSalesOrderPackages = async () => {
    try {
      setLoading(true)
      const response = await fetchData(getSalesOrderPackagesByOrderQuery(tenantId, order?.orderId))
      if (response.getSalesOrderPackagesBySalesOrder) {
        setPackages(response.getSalesOrderPackagesBySalesOrder)
      } else {
        setPackages([])
      }
    } catch (error) {
      setPackages([])
    } finally {
      setLoading(false)
    }
  }

  const getSalesOrderInvoices = async () => {
    try {
      setLoading(true)
      const response = await fetchData(getSalesInvoicesByOrderQuery(tenantId, order?.orderId))
      if (response.getSalesInvoicesByOrder) {
        setSalesInvoices(response.getSalesInvoicesByOrder)
        dispatch(setUpdateInvoice(response.getSalesInvoicesByOrder))
      } else {
        setSalesInvoices([])
      }
    } catch (error) {
      setSalesInvoices([])
    } finally {
      setLoading(false)
    }
  }

  const userProfile = useSelector(state => state.userProfile)
  const editPermission = hasPermission(userProfile, EDIT_PACKAGE)
  const viewPermission = hasPermission(userProfile, VIEW_PACKAGE)
  const deletePermission = hasPermission(userProfile, DELETE_PACKAGE)

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

  const handlePaymentMenuClick = (event, row) => {
    dispatch(setSelectedPackages(row))
    const updatedAnchorE2Map = { ...anchorE2Map }
    updatedAnchorE2Map[row.paymentId] = event.currentTarget
    setAnchorE2Map(updatedAnchorE2Map)
  }

  const handlePaymentMenuClose = row => {
    const updatedAnchorE2Map = { ...anchorE2Map }
    updatedAnchorE2Map[row.paymentId] = null
    setAnchorE2Map(updatedAnchorE2Map)
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
        setPackages(prev =>
          prev.map(pkg =>
            pkg.packageId === undoSalesOrderPackageConfirmation.packageId
              ? { ...prev, ...undoSalesOrderPackageConfirmation }
              : pkg
          )
        )
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
        setPackages(prev =>
          prev.map(pkg =>
            pkg.packageId === undoSalesOrderPackageFulfillment.packageId
              ? { ...prev, ...undoSalesOrderPackageFulfillment }
              : pkg
          )
        )
        dispatch(setUpdatePackage(undoSalesOrderPackageFulfillment))
        reloadSalesOrderInStore(undoSalesOrderPackageFulfillment.salesOrderId)

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
      if (response.markSalesOrderPackageAsDelivered) {
        dispatch(setUpdatePackage(response.markSalesOrderPackageAsDelivered))
        reloadSalesOrderInStore(response.markSalesOrderPackageAsDelivered.salesOrderId)

        dispatch(createAlert({ message: 'Status changed successfully!', type: 'success' }))
      } else {
        dispatch(createAlert({ message: 'Package is not fulfilled!', type: 'error' }))
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    }
  }

  const openReviewDrawer = row => {
    dispatch(setActionPayment(row))
    handlePaymentMenuClose(row)
    setOpenDrawer(true)
  }

  const handleDeletePayment = row => {
    handleClose(row)
    setSelecedPayment(row)
    setOpenDeletePaymentDialog(true)
  }

  const handleDelete = row => {
    setSelectedPackage(row)
    handleClose(row)
    setOpenDialog(true)
  }

  const renderTabPanels = (value, order) => {
    const PackageColumns = [
      {
        flex: 0.1,
        minWidth: 100,
        field: 'packageNo',
        headerName: 'No',
        renderCell: params => {
          const { row } = params
          const date = DateFunction(row?.packageDate)
          const user = userAccounts?.find(val => val?.username === row?.assignedTo)
          const deliveredBy = userAccounts?.find(val => val?.username === row?.deliveredBy)

          return (
            <Box sx={{ width: '100%', p: 2 }}>
              <Grid container spacing={3} sx={{ alignItems: 'center' }}>
                <Grid item xs={11} lg={11}>
                  <Grid container spacing={3} sx={{ alignItems: 'center' }}>
                    <Grid item xs={12} sm={3}>
                      <Typography sx={{ ...dataTextStyles }}>
                        {date}
                        <Box sx={{ color: '#959595' }}>
                          <StyledButton
                            color='primary'
                            onClick={() =>
                              setSalesPagckageDialogState({
                                open: true,
                                selectedPackageId: row?.packageId
                              })
                            }
                          >
                            {row?.packageNoPrefix && row?.packageNoPrefix}
                            {row?.packageNo}
                          </StyledButton>
                        </Box>
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      {(row?.deliveryAddress?.addressLine1 || row?.deliveryAddress?.addressLine2) && (
                        <Typography sx={{ ...dataTextStyles, fontSize: '11px', lineHeight: '15px' }}>
                          {row?.deliveryAddress?.addressLine1}
                          {row?.deliveryAddress?.addressLine2 && `, ${row?.deliveryAddress?.addressLine2}`}
                        </Typography>
                      )}

                      {(row?.deliveryAddress?.cityOrTown || row?.deliveryAddress?.state) && (
                        <Typography sx={{ ...dataTextStyles, fontSize: '11px', lineHeight: '15px' }}>
                          {row?.deliveryAddress?.cityOrTown}
                          {row?.deliveryAddress?.cityOrTown && row?.deliveryAddress?.state && `, `}
                          {row?.deliveryAddress?.state}
                        </Typography>
                      )}

                      {(row?.deliveryAddress?.postcode || row?.deliveryAddress?.country) && (
                        <Typography sx={{ ...dataTextStyles, fontSize: '11px', lineHeight: '15px' }}>
                          {row?.deliveryAddress?.postcode}
                          {row?.deliveryAddress?.postcode && row?.deliveryAddress?.country && `, `}
                          {row?.deliveryAddress?.country}
                        </Typography>
                      )}

                      <Typography sx={dataTitleStyles}>Delivery Address</Typography>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      {rowStatusChip(row?.status)}
                    </Grid>
                    <Grid item xs={12}>
                      {user && (
                        <>
                          <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                            <Typography sx={dataTitleStyles}>Assigned to:</Typography>
                            <Typography sx={dataTextStyles}>{user?.name || '-'}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', gap: 2 }}>
                            <Typography sx={dataTitleStyles}>Delivered By</Typography>
                            <Typography sx={dataTextStyles}>{deliveredBy?.name || '-'}</Typography>{' '}
                          </Box>
                        </>
                      )}
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={1} lg={1}>
                  <IconButton aria-label='more' onClick={event => handleMenuClick(event, row)}>
                    <MoreVert />
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
                      <MenuItem
                        scroll={true}
                        onClick={() => {
                          setOpenEditPackageDrawer(true)
                          handleClose(row)
                        }}
                      >
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
                  {openfullfillPackageDialog && (
                    <FullfillPackagePopup
                      tenantId={row?.tenantId}
                      open={openfullfillPackageDialog}
                      setOpen={setOpenfullfillPackageDialog}
                    />
                  )}

                  {openProcessAsDeliverdDialog && (
                    <ProcessAsDelivered
                      tenantId={row?.tenantId}
                      open={openProcessAsDeliverdDialog}
                      setOpen={setOpenProcessAsDeliverdDialog}
                    />
                  )}
                </Grid>
              </Grid>
            </Box>
          )
        }
      }
    ]

    const invoiceColumns = [
      {
        flex: 0.25,
        minWidth: 100,
        field: 'invoiceNo',
        headerName: 'No',
        renderCell: params => {
          const { row } = params
          const date = DateFunction(row?.invoiceDate)
          const paidCurrency = currencies?.find(currency => currency.currencyId === row?.currency) || {}

          return (
            <Box sx={{ width: '100%', p: 2 }}>
              <Grid container spacing={3} sx={{ alignItems: 'center' }}>
                <Grid item xs={10.5} md={11}>
                  <Grid container spacing={3} sx={{ alignItems: 'center' }}>
                    <Grid item xs={4}>
                      <Typography sx={{ ...dataTextStyles }}>{date}</Typography>
                      <Box sx={{ color: '#959595' }}>
                        <StyledButton
                          color='primary'
                          onClick={() => {
                            setInvoiceForAction(row)
                            setSalesInvoiceDialogState({
                              open: true,
                              selectedInvoiceId: row?.invoiceId
                            })
                          }}
                        >
                          {row?.invoiceNoPrefix && row?.invoiceNoPrefix}
                          {row?.invoiceNo}
                        </StyledButton>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography sx={dataTextStyles}>
                        <NumberFormat value={row?.totalAmount} currency={paidCurrency} />
                      </Typography>
                      <Typography sx={{ ...dataTitleStyles, display: { xs: 'block', md: 'none' } }}>Total</Typography>
                      <Typography sx={{ ...dataTitleStyles, display: { xs: 'none', md: 'block' } }}>
                        Total Amount
                      </Typography>
                    </Grid>
                    <Grid item xs={4}>
                      {rowStatusChip(row?.paymentStatus)}
                      <Typography sx={dataTitleStyles}>Payment Status</Typography>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={1.5} md={1}>
                  {row?.status !== STATUS_DRAFT && (
                    <Grid item xs={3} sx={{ textAlign: 'right' }}>
                      <div>
                        <IconButton
                          aria-label='more'
                          id='long-button'
                          aria-controls={open ? 'long-menu' : undefined}
                          aria-expanded={open ? 'true' : undefined}
                          aria-haspopup='true'
                          onClick={e => {
                            setInvoiceForAction(row)
                            handleClick(e)
                          }}
                        >
                          <MoreVertIcon />
                        </IconButton>

                        <CommonStyledMenu anchorEl={anchorEl} open={open} onClose={handleCloseStyledMenu}>
                          {row?.status === STATUS_ISSUED && (
                            <MenuItem
                              onClick={() => {
                                setInvoiceForAction(row)
                                setAnchorEl(null)
                                setOpenSendCopyDrawer(true)
                              }}
                              disableRipple
                            >
                              <Icon icon={'iconoir:send'} />
                              Send Invoice
                            </MenuItem>
                          )}
                          <MenuItem
                            variant='outlined'
                            onClick={() => {
                              setInvoiceForAction(row)
                              setAnchorEl(null)
                              handlePrint()
                            }}
                          >
                            <Icon icon={'ion:print-outline'} fontSize={24} />
                            Print Invoice
                          </MenuItem>
                        </CommonStyledMenu>
                      </div>
                    </Grid>
                  )}
                </Grid>
              </Grid>
            </Box>
          )
        }
      }
    ]

    const paymentcolumns = [
      {
        flex: 0.25,
        minWidth: 100,
        field: 'paymentNo',
        headerName: 'No',
        renderCell: params => {
          const { row } = params
          const date = DateFunction(row?.paymentDate)
          const paidCurrency = currencies?.find(currency => currency.currencyId === row?.currency) || {}

          const deletePermission = hasPermission(userProfile, DELETE_SALES_PAYMENT)
          const editPermission = hasPermission(userProfile, EDIT_SALES_PAYMENT)
          return (
            <Box sx={{ width: '100%', p: 2 }}>
              <Grid container spacing={3} sx={{ alignItems: 'center' }}>
                <Grid item xs={5}>
                  <Typography sx={{ ...dataTextStyles }}>{date}</Typography>
                  <Box sx={{ color: '#959595' }}>
                    <StyledButton
                      color='primary'
                      onClick={() =>
                        setSalesPaymentDialogState({
                          open: true,
                          selectedPaymentId: row?.paymentId
                        })
                      }
                    >
                      {row?.paymentNoPrefix && row?.paymentNoPrefix}
                      {row?.paymentNo}
                    </StyledButton>
                  </Box>
                </Grid>
                <Grid item xs={3}>
                  <Typography sx={dataTextStyles}>
                    <NumberFormat value={row?.amount} currency={paidCurrency} />
                  </Typography>
                  <Typography sx={dataTitleStyles}>Amount</Typography>
                </Grid>
                <Grid item xs={3}>
                  {rowStatusChip(row?.status)}
                </Grid>
                <Grid item xs={1} sx={{ textAlign: 'right' }}>
                  <IconButton aria-label='more' onClick={event => handlePaymentMenuClick(event, row)}>
                    <MoreVert />
                  </IconButton>
                  <CommonStyledMenu
                    anchorEl={anchorE2Map[row.paymentId]}
                    open={Boolean(anchorE2Map[row.paymentId])}
                    onClose={() => handlePaymentMenuClose(row)}
                  >
                    {editPermission && row?.reconciliationStatus === STATUS_AWAITING_RECONCILIATION && (
                      <MenuItem onClick={() => openReviewDrawer(row)}>
                        <Icon icon='tabler:edit' />
                        Edit
                      </MenuItem>
                    )}
                    {/* )} */}
                    {deletePermission &&
                      row?.reconciliationStatus === STATUS_AWAITING_RECONCILIATION &&
                      (row?.status === STATUS_AWAITING_RECONCILIATION || row?.status === STATUS_PENDING_CLEARANCE) && (
                        <Divider sx={{ my: 1 }} />
                      )}
                    {deletePermission &&
                      row?.reconciliationStatus === STATUS_AWAITING_RECONCILIATION &&
                      (row?.status === STATUS_AWAITING_RECONCILIATION || row?.status === STATUS_PENDING_CLEARANCE) && (
                        <MenuItem
                          sx={{
                            color: theme => theme?.palette?.error?.main,
                            '&:hover': {
                              color: theme => theme?.palette?.error?.main + ' !important',
                              backgroundColor: theme =>
                                alpha(theme.palette.error.main, theme.palette.action.selectedOpacity) + ' !important'
                            }
                          }}
                          onClick={() => handleDeletePayment(row)}
                        >
                          <Icon icon='mingcute:delete-2-line' color='inherit' />
                          Delete
                        </MenuItem>
                      )}
                    {/* )} */}
                  </CommonStyledMenu>
                </Grid>
              </Grid>
            </Box>
          )
        }
      }
    ]

    switch (value) {
      case 'invoices':
        return (
          <TabPanel key={value} value={value}>
            {loading ? (
              <LinearProgress />
            ) : (
              <MobileDataGrid
                hideFooter
                columns={invoiceColumns}
                rows={salesInvoices || []}
                getRowId={row => row?.invoiceId}
                initialState={{
                  sorting: {
                    sortModel: [{ field: 'paymentNo', sort: 'desc' }]
                  }
                }}
                slots={{
                  columnHeaders: () => null,
                  noRowsOverlay: CustomNoRowsOverlay
                }}
                slotProps={{
                  noRowsOverlay: {
                    mainText: 'No invoices have been created.'
                  }
                }}
              />
            )}
          </TabPanel>
        )
      case 'payments':
        return (
          <TabPanel key={value} value={value}>
            {order?.status === STATUS_INVOICED && order.paymentStatus === STATUS_PAID ? null : (
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                <Button
                  size='small'
                  variant='contained'
                  color='primary'
                  startIcon={<AddOutlined />}
                  onClick={() => setOpenNewPaymentDrawer(true)}
                >
                  Add New
                </Button>
              </Box>
            )}

            {loading ? (
              <LinearProgress />
            ) : (
              <MobileDataGrid
                hideFooter
                columns={paymentcolumns}
                rows={salesPayments || []}
                getRowId={row => row?.paymentId}
                initialState={{
                  sorting: {
                    sortModel: [{ field: 'paymentNo', sort: 'desc' }]
                  }
                }}
                slots={{
                  columnHeaders: () => null,
                  noRowsOverlay: CustomNoRowsOverlay
                }}
                slotProps={{
                  noRowsOverlay: {
                    mainText: 'No payments have been made.'
                  }
                }}
              />
            )}
          </TabPanel>
        )
      case 'packages':
        return (
          <TabPanel key={value} value={value}>
            {loading ? (
              <LinearProgress />
            ) : (
              <>
                <Box display='flex' justifyContent='flex-end' mb={2}>
                  <Button
                    size='small'
                    variant='contained'
                    startIcon={<AddOutlined />}
                    onClick={() => setOpenNewPackageDrawer(true)}
                  >
                    New
                  </Button>
                </Box>
                <MobileDataGrid
                  hideFooter
                  columns={PackageColumns}
                  rows={packages || []}
                  getRowId={row => row?.packageId}
                  initialState={{
                    sorting: {
                      sortModel: [{ field: 'packageNo', sort: 'desc' }]
                    }
                  }}
                  slots={{
                    columnHeaders: () => null,
                    noRowsOverlay: CustomNoRowsOverlay
                  }}
                  slotProps={{
                    noRowsOverlay: {
                      mainText: 'No Sales Packages available'
                    }
                  }}
                />
              </>
            )}
          </TabPanel>
        )

      case 'attachments':
        return (
          <TabPanel value='attachments'>
            <AttachmentTabSO order={order} folderName={SALES_ORDER_PDF} />
          </TabPanel>
        )
    }
  }

  useEffect(() => {
    if (value === 'packages') {
      getSalesOrderPackages()
    } else if (value === 'invoices') {
      getSalesOrderInvoices()
    }
  }, [order, value, soPackages])
  console.log('reloadSalesPaymentLoader', reloadSalesPaymentLoader)
  useEffect(() => {
    if (value === 'payments') {
      getSalesOrderPayments()
    }
  }, [order, value, realoadPayment, reloadSalesPaymentLoader])

  return (
    <>
      <Card>
        <CardHeader title='Related Records' />
        <CardContent sx={{ '& .MuiTabPanel-root': { p: 0 } }}>
          <TabContext value={value}>
            <TabList
              variant='scrollable'
              scrollButtons='auto'
              onChange={handleChange}
              aria-label='earning report tabs'
              sx={{
                border: '0 !important',
                '& .MuiTabs-indicator': { display: 'none' },
                '& .MuiTab-root': {
                  p: 0,
                  minWidth: 0,
                  overflow: 'visible',
                  borderRadius: '10px',
                  '&:not(:last-child)': { mr: 4 }
                },
                '& .MuiTabs-scroller': {
                  paddingTop: '15px'
                },
                mb: 7
              }}
            >
              {renderTabs(value, theme, tabData, order)}
            </TabList>
            {renderTabPanels(value, order)}
          </TabContext>
        </CardContent>
      </Card>

      {salesInvoiceDialogState?.open && (
        <CommonInvoicePopUp
          invoiceId={salesInvoiceDialogState?.selectedInvoiceId}
          open={salesInvoiceDialogState?.open}
          setOpen={() => setSalesInvoiceDialogState({ open: false, selectedInvoiceId: null })}
        />
      )}
      {salesPagckageDialogState?.open && (
        <CommonSoPackagePopUp
          packageId={salesPagckageDialogState?.selectedPackageId}
          open={salesPagckageDialogState?.open}
          setOpen={() => setSalesPagckageDialogState({ open: false, selectedPackageId: null })}
        />
      )}

      {salesPaymentDialogState?.open && (
        <CommonSoPaymentsPopUp
          paymentId={salesPaymentDialogState?.selectedPaymentId}
          openSoPaymentDialog={salesPaymentDialogState?.open}
          setSoPaymentDialog={() => setSalesPaymentDialogState({ open: false, selectedPaymentId: null })}
        />
      )}

      {openSendCopyDrawer && (
        <SendInvoiceCopyDrawer
          order={invoiceForAction}
          setOpenSendCopyDrawer={setOpenSendCopyDrawer}
          openSendCopyDrawer={openSendCopyDrawer}
        />
      )}

      {openNewPaymentDrawer && (
        <NewSalesPaymentDrawer
          openDrawer={openNewPaymentDrawer}
          setOpenDrawer={setOpenNewPaymentDrawer}
          setReloadPayment={setReloadPayment}
          order={order}
          customer={customer}
        />
      )}

      {openDrawer && (
        <EditSalesPaymentDrawer
          openDrawer={openDrawer}
          setOpenDrawer={setOpenDrawer}
          setReloadPayment={setReloadPayment}
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

      {openDeletePaymentDialog && (
        <DeletePayments
          tenantId={tenantId}
          paymentId={selecedPayment?.paymentId}
          openDialog={openDeletePaymentDialog}
          setOpenDialog={setOpenDeletePaymentDialog}
        />
      )}
      {openEditPackageDrawer && (
        <EditSalesPackageDrawer
          openDrawer={openEditPackageDrawer}
          setOpenDrawer={setOpenEditPackageDrawer}
          reloadPackages={reloadPackages}
          setReloadPackages={setReloadPackages}
        />
      )}
      {openNewPackageDrawer && (
        <NewSalesPackageDrawer
          openDrawer={openNewPackageDrawer}
          setOpenDrawer={setOpenNewPackageDrawer}
          reloadPackages={reloadPackages}
          setReloadPackages={setReloadPackages}
        />
      )}
      {assignToUserPopup && (
        <AssigntoUserPopup tenantId={tenantId} open={assignToUserPopup} setOpen={setAssignToUserPopup} />
      )}
      <div style={{ position: 'fixed', top: '100%', left: '100%', transform: 'translate(100%, 100%)' }}>
        <PrintSalesInvoice ref={componentRef} selectedInvoice={invoiceForAction} />
      </div>
    </>
  )
}

export default SalesWidgets
