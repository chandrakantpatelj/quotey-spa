// ** Next Import
import Link from 'next/link'
import Router from 'next/router'
import React, { useState, useMemo, useEffect } from 'react'
import PageHeader from 'src/@core/components/page-header'
import PageWrapper from 'src/@core/layouts/PageWrapper'
import {
  Box,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
  Grid,
  TableHead,
  TableContainer,
  LinearProgress,
  Tooltip
} from '@mui/material'
import Icon from 'src/@core/components/icon'
import { ArrowDownward, ArrowUpward, Close } from '@mui/icons-material'
import RefreshIcon from '@mui/icons-material/Refresh'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import { alpha } from '@mui/material/styles'
import { useDispatch, useSelector } from 'react-redux'
import { setSelectedProduct } from 'src/store/apps/products'
import {
  findObjectByCurrencyId,
  DateFunction,
  NumberFormat,
  lastMonthDate,
  rowStatusChip,
  hasPermission,
  dataTextStyles,
  dataTitleStyles
} from 'src/common-functions/utils/UtilityFunctions'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import {
  getAllItemTransactionsQuery,
  GetItemLedgerBalanceByItemIdQuery
} from 'src/@core/components/graphql/item-queries'
import { fetchData } from 'src/common-functions/GraphqlOperations'
import CustomNoRowsOverlay from 'src/common-components/CustomNoRowsOverlay'
import { parseISO } from 'date-fns'
import StyledButton from 'src/common-components/StyledMuiButton'
import { setSelectedCustomer } from 'src/store/apps/customers'
import { setSelectedVendor } from 'src/store/apps/vendors'
import CommonSoPopup from 'src/common-components/CommonSoPopup'
import CommonCustomerPopup from 'src/common-components/CommonCustomerPopup'
import CommonVendorPopup from 'src/common-components/CommonVendorPopup'
import CommonPOPopup from 'src/common-components/CommonPOPopup'
import { CREATE_ITEM, EDIT_ITEM, STATUS_PARTLY_CLEARED } from 'src/common-functions/utils/Constants'
import CommonDateRangeFilter from 'src/common-components/CommonDateRangeFilter'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import CustomTextField from 'src/@core/components/mui/text-field'
import AttachmentTabProduct from 'src/views/sales/SalesOrder/AttachmentTabProduct'
import useWarehouses from 'src/hooks/getData/useWarehouses'
import MobileDataGrid from 'src/common-components/MobileDataGrid'
import useProducts from 'src/hooks/getData/useProducts'

export default function ViewItem({ productsData, loading, tenantId }) {
  const route = Router
  const dispatch = useDispatch()
  const userProfile = useSelector(state => state.userProfile)
  const { warehouses } = useWarehouses(tenantId)
  const { reloadProductInStore } = useProducts(tenantId)

  const {
    products = [],
    vendors = [],
    currencies = [],
    customers = [],
    salesOrders = [],
    purchaseOrders = []
  } = productsData
  const item = useSelector(state => state.products?.selectedProduct) || {}

  const [stockLoading, setStockLoading] = useState(true)
  const [lastClosingBal, setLastClosingBal] = useState('')
  const [lastRunningBal, setLastRunningBal] = useState('')
  const [transactions, setTransactions] = useState([])
  const [transactionsLoading, setTransactionsLoading] = useState(true)
  const [tab, setTab] = useState('overview')
  const [openCustomerDialog, setOpenCustomerDialog] = useState(false)
  const [customerForDialog, setCustomerForDialog] = useState({})
  const [openVendorDialog, setOpenVendorDialog] = useState(false)
  const [vendorForDialog, setVendorForDialog] = useState({})
  const [dialogState, setDialogState] = useState({
    open: false,
    selectedOrderId: null
  })
  const [salesOrderDialogState, setSalesOrderDialogState] = useState({
    open: false,
    selectedSalesOrderId: null
  })
  const moduleFilterDateDuration = useSelector(
    state => state.otherSettings?.data?.moduleFilterDateDuration || undefined
  )
  const [startDate, setStartDate] = useState(lastMonthDate(moduleFilterDateDuration))
  const [endDate, setEndDate] = useState(new Date())

  useEffect(() => {
    if (Object.keys(item).length === 0) {
      route.push('/inventory/products/')
    }
  }, [item, tenantId])

  const columns = [
    {
      flex: 0.25,
      minWidth: 100,
      field: 'transactionDate',
      headerName: 'Date',
      type: 'date',
      valueGetter: ({ row }) => (row?.transactionDate ? parseISO(row?.transactionDate) : null),
      renderCell: ({ row }) => {
        const currency = findObjectByCurrencyId(currencies, row?.currency)
        let porder = null
        let sorder = null
        const customer = customers?.find(item => item?.customerId === row?.customerId) || null

        const vendor = vendors?.find(item => item?.vendorId === row?.vendorId) || null

        if (row.salesOrderId != null) {
          sorder = salesOrders?.find(item => item?.orderId === row?.salesOrderId) || null
        } else if (row.purchaseOrderId != null) {
          porder = purchaseOrders?.find(item => item?.orderId === row?.purchaseOrderId) || null
        }
        return (
          <Grid container spacing={2} sx={{ alignItems: 'center' }}>
            <Grid item xs={6} md={6} lg={3} xl={4}>
              <Box sx={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <Box
                  component='span'
                  sx={{
                    width: '24px',
                    height: '24px',
                    background: theme =>
                      row?.stockMovement === 'INWARD'
                        ? `${alpha(theme.palette.success.main, 0.08)} !important`
                        : row?.stockMovement === 'OUTWARD'
                        ? `${alpha(theme.palette.error.main, 0.08)} !important`
                        : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    '& >svg': {
                      fontSize: '16px',
                      color: theme =>
                        row?.stockMovement === 'INWARD'
                          ? `${alpha(theme.palette.success.main, 1)} !important`
                          : row?.stockMovement === 'OUTWARD'
                          ? `${alpha(theme.palette.error.main, 1)} !important`
                          : 'initial'
                    },
                    borderRadius: '50%'
                  }}
                >
                  {row?.stockMovement === 'INWARD' ? (
                    <ArrowUpward />
                  ) : row?.stockMovement === 'OUTWARD' ? (
                    <ArrowDownward />
                  ) : null}
                </Box>
                <div>
                  <Typography sx={{ ...dataTextStyles, lineHeight: '28px' }}>
                    {DateFunction(row?.transactionDate)} {rowStatusChip(row?.status)}
                  </Typography>
                  {row?.status === STATUS_PARTLY_CLEARED && (
                    <Typography sx={dataTitleStyles}>(Cleared Qty : {row?.clearedQty} ) </Typography>
                  )}

                  <div>
                    <pre
                      style={{
                        fontFamily: 'inherit',
                        whiteSpace: 'pre-wrap'
                      }}
                    >
                      {row?.description}
                    </pre>
                  </div>
                </div>
              </Box>
            </Grid>
            <Grid item xs={6} md={6} lg={2} xl={2}>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ fontSize: '12px', color: '#959595' }}>
                  {customer !== null ? (
                    <>
                      Customer:{' '}
                      <StyledButton
                        color='primary'
                        onClick={() => {
                          dispatch(setSelectedCustomer(customer))
                          setCustomerForDialog(customer)
                          setOpenCustomerDialog(true)
                        }}
                      >
                        {customer?.displayName}
                      </StyledButton>
                    </>
                  ) : vendor !== null ? (
                    <>
                      Vendor:{' '}
                      <StyledButton
                        color='primary'
                        onClick={() => {
                          dispatch(setSelectedVendor(vendor))
                          setVendorForDialog(vendor)
                          setOpenVendorDialog(true)
                          // route.push(`/purchases/vendors/view/${vendor.vendorId}`)
                        }}
                      >
                        {vendor?.displayName}
                      </StyledButton>
                    </>
                  ) : null}
                </Box>
                {row.salesOrderId !== null && sorder !== null ? (
                  <Box sx={{ color: '#959595' }}>
                    Order:{'  '}
                    <StyledButton
                      color='primary'
                      onClick={() => setSalesOrderDialogState({ open: true, selectedSalesOrderId: row.salesOrderId })}
                    >
                      #{sorder?.orderNoPrefix}
                      {sorder?.orderNo}
                    </StyledButton>
                  </Box>
                ) : row.purchaseOrderId && porder ? (
                  <Box sx={{ color: '#959595' }}>
                    Order:{'  '}
                    <StyledButton
                      color='primary'
                      onClick={() => setDialogState({ open: true, selectedOrderId: row?.purchaseOrderId })}
                    >
                      #{porder?.orderNoPrefix}
                      {porder?.orderNo}
                    </StyledButton>
                  </Box>
                ) : row?.transactionType === 'STOCK_ADJUSTMENT' ? (
                  `#${row?.transactionRef}`
                ) : null}
              </Box>
              {/* <Typography sx={dataTitleStyles}>Reference</Typography> */}
            </Grid>
            <Grid item xs={6} md={3} lg={1.5} xl={1.5}>
              <Typography sx={dataTextStyles}>
                {row?.inwardQty} {row?.inwardQtyUom}
              </Typography>
              <Typography sx={dataTitleStyles}>Inward Qty</Typography>
            </Grid>
            <Grid item xs={6} md={3} lg={1.5} xl={1.5}>
              <Typography sx={dataTextStyles}>
                {row?.outwardQty} {row?.outwardQtyUom}
              </Typography>
              <Typography sx={dataTitleStyles}>Outward Qty</Typography>
            </Grid>
            <Grid item xs={6} md={3} lg={2} xl={1.5}>
              <table>
                <tbody>
                  <tr>
                    <td>
                      <Typography sx={dataTitleStyles}> Total Price </Typography>
                    </td>
                    <td>
                      <Typography sx={dataTextStyles}>
                        <NumberFormat value={row?.totalPrice} currency={currency} />
                      </Typography>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <Typography sx={dataTitleStyles}> Price Per Unit</Typography>
                    </td>

                    <td>
                      <Typography sx={dataTextStyles}>
                        <NumberFormat value={row?.pricePerUnit} currency={currency} />
                      </Typography>
                    </td>
                  </tr>
                </tbody>
              </table>
            </Grid>
            <Grid item xs={6} md={3} lg={2} xl={1.5}>
              <table>
                <tbody>
                  <tr>
                    <td>
                      <Typography sx={dataTitleStyles}> Total TaxValue </Typography>
                    </td>
                    <td>
                      <Typography sx={dataTextStyles}>
                        <NumberFormat value={row?.totalTaxValue} currency={currency} />
                      </Typography>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <Typography sx={dataTitleStyles}> Price Per Unit</Typography>
                    </td>

                    <td>
                      <Typography sx={dataTextStyles}>
                        <NumberFormat value={row?.taxValuePerUnit} currency={currency} />
                      </Typography>
                    </td>
                  </tr>
                </tbody>
              </table>
            </Grid>
          </Grid>
        )
      }
    }
  ]

  const sellingCurrency = useMemo(
    () => findObjectByCurrencyId(currencies, item?.sellingPriceCurrency),
    [currencies, item?.sellingPriceCurrency]
  )

  const costCurrency = useMemo(
    () => findObjectByCurrencyId(currencies, item?.costPriceCurrency),
    [currencies, item?.costPriceCurrency]
  )

  const purchaseCurrency = useMemo(
    () => findObjectByCurrencyId(currencies, item?.purchasePriceCurrency),
    [currencies, item?.purchasePriceCurrency]
  )

  const [groupedData, setGroupedData] = useState([])
  const [totalAvlQty, setTotalAvlQty] = useState(0)

  // let itemId = item?.itemId
  const itemId = item?.itemId

  const getAvailableQty = async () => {
    setStockLoading(true)
    try {
      const response = await fetchData(GetItemLedgerBalanceByItemIdQuery(tenantId, itemId))
      const state = response?.getItemLedgerBalanceByItemId || []
      setGroupedData(state)
      const totalAvailableQty = state.reduce((acc, index) => {
        return acc + index.availableQty
      }, 0)

      setTotalAvlQty(totalAvailableQty)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setStockLoading(false)
    }
  }

  useEffect(() => {
    getAvailableQty()
  }, [itemId, tenantId])

  const handleDateRange = async (startDate, endDate) => {
    setStartDate(startDate)
    setEndDate(endDate)
    try {
      setTransactionsLoading(true)
      const itemTransactions = await fetchData(getAllItemTransactionsQuery(tenantId, itemId, startDate, endDate))
      const { getItemLedgerTransactionsByDateRange } = itemTransactions

      getItemLedgerTransactionsByDateRange?.sort((a, b) => new Date(b.createdDateTime) - new Date(a.createdDateTime))
      if (getItemLedgerTransactionsByDateRange) {
        setLastClosingBal(getItemLedgerTransactionsByDateRange[0]?.closingBalance)
        setLastRunningBal(getItemLedgerTransactionsByDateRange[0]?.runningBalance)
      }

      setTransactions(getItemLedgerTransactionsByDateRange)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setTransactionsLoading(false)
      console.log('Fetched data by date range successfully')
    }
  }

  useEffect(() => {
    handleDateRange(startDate, endDate)
  }, [item?.itemId, tenantId])

  const handleTabChange = (event, newValue) => {
    setTab(newValue)
    if (newValue === 'transactions') {
      const startDate = lastMonthDate(moduleFilterDateDuration)
      handleDateRange(startDate, endDate)
    } else if (newValue === 'stock') {
      getAvailableQty()
    }
  }

  return (
    <React.Fragment>
      <PageHeader
        title={
          <Typography
            sx={{
              fontSize: { xs: '16px', md: '18px' },
              fontWeight: '500'
            }}
          >
            View Product - {item?.itemCode}
          </Typography>
        }
        button={
          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
            {hasPermission(userProfile, CREATE_ITEM) && (
              <Button
                variant='contained'
                color='primary'
                sx={{ display: { xs: 'none', sm: 'flex' } }}
                startIcon={<AddOutlinedIcon />}
                component={Link}
                scroll={true}
                href={`/inventory/products/add-product`}
              >
                Add New
              </Button>
            )}
            {hasPermission(userProfile, EDIT_ITEM) && (
              <IconButton
                component={Link}
                scroll={true}
                href={`/inventory/products/edit/${item.itemId}`}
                onClick={() => dispatch(setSelectedProduct(item))}
              >
                {' '}
                <Icon icon='tabler:edit' />
              </IconButton>
            )}
            <IconButton component={Link} scroll={true} href='/inventory/products/'>
              <Close sx={{ color: theme => theme.palette.primary.main }} />
            </IconButton>
          </Box>
        }
      />
      <PageWrapper>
        {openCustomerDialog && (
          <CommonCustomerPopup
            customerId={customerForDialog?.customerId}
            open={openCustomerDialog}
            setOpen={setOpenCustomerDialog}
          />
        )}
        {openVendorDialog && (
          <CommonVendorPopup
            vendorId={vendorForDialog?.vendorId}
            openVendorDialog={openVendorDialog}
            setOpenVendorDialog={setOpenVendorDialog}
          />
        )}
        {/* {openPODialog && <CommonPOPopup openPODialog={openPODialog} setOpenPODialog={setOpenPODialog} />} */}
        {dialogState.open && (
          <CommonPOPopup
            orderId={dialogState.selectedOrderId}
            open={dialogState.open}
            onClose={() => setDialogState({ open: false, selectedOrderId: null })}
          />
        )}

        {salesOrderDialogState.open && (
          <CommonSoPopup
            orderId={salesOrderDialogState.selectedSalesOrderId}
            open={salesOrderDialogState.open}
            onClose={() => setSalesOrderDialogState({ open: false, selectedSalesOrderId: null })}
          />
        )}

        <div>
          <Grid container spacing={{ xs: 5, xl: 10 }}>
            <Grid item xs={12}>
              <Grid item xs={12} sm={6} md={6} lg={4} xl={4}>
                <CustomAutocomplete
                  options={products || []}
                  value={products.find(option => option.itemId === item.itemId) || null}
                  getOptionLabel={option => option?.itemName}
                  isOptionEqualToValue={(option, value) => option?.itemId === value?.itemId}
                  renderOption={(props, option) => {
                    return (
                      <li {...props} key={option?.itemId}>
                        {option?.itemCode}-{option?.itemName || ''}
                      </li>
                    )
                  }}
                  onChange={(e, newValue) => {
                    dispatch(setSelectedProduct(newValue))
                  }}
                  disableClearable
                  disabled={loading}
                  renderInput={params => <CustomTextField {...params} fullWidth label='Products' />}
                />
              </Grid>
            </Grid>

            <Grid item xs={12} md={12}>
              <TabContext value={tab}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid #ccc', // Full-width divider line
                    width: '100%',
                    mb: 2 // Optional: margin below the line
                  }}
                >
                  <TabList
                    textColor='inherit'
                    onChange={handleTabChange}
                    aria-label='lab API tabs example'
                    sx={{
                      borderBottom: '0px !important',
                      '& .MuiTab-root': {
                        padding: '4px 14px!important',
                        borderBottom: '0px !important'
                      }
                    }}
                  >
                    <Tab label='Overview' value='overview' />
                    <Tab label='Transactions' value='transactions' />
                    <Tab label='Stock' value='stock' />
                    <Tab label='Attachments' value='attachments' />
                  </TabList>
                  <Tooltip title='Reload' placement='top'>
                    <IconButton
                      color='default'
                      onClick={async () => {
                        await reloadProductInStore(item?.itemId)
                        // dispatch(resetProducts())
                      }}
                    >
                      <RefreshIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
                {loading ? (
                  <LinearProgress />
                ) : (
                  <>
                    <TabPanel
                      value='overview'
                      sx={{
                        p: { xs: '10px  !important', md: '15px !important' }
                      }}
                    >
                      <Grid
                        container
                        spacing={{ xs: 3, md: 5 }}
                        sx={{ display: 'flex', justifyContent: 'space-between' }}
                      >
                        <Grid item xs={12} sm={6} md={6.5}>
                          <Grid container spacing={{ xs: 3, md: 5 }}>
                            <Grid item xs={12}>
                              <Table
                                sx={{
                                  width: '100%',
                                  border: 0,
                                  '& .MuiTableCell-root': {
                                    border: 0,
                                    textAlign: 'left',
                                    padding: '0px !important',
                                    verticalAlign: 'top !important'
                                  },
                                  '& .MuiTableCell-root .data-name': {
                                    fontSize: '12px',
                                    color: '#818181',
                                    lineHeight: '25px'
                                  },
                                  '& .MuiTableCell-root .data-value': {
                                    fontSize: '12px',
                                    color: '#000',
                                    fontWeight: 500,
                                    lineHeight: '25px'
                                  }
                                }}
                              >
                                <TableBody>
                                  <TableRow>
                                    <TableCell sx={{ width: '40%' }}>
                                      <Typography className='data-name'>Name</Typography>
                                    </TableCell>
                                    <TableCell>
                                      <Typography className='data-value' sx={{ wordBreak: 'break-all' }}>
                                        {item?.itemName}
                                      </Typography>
                                    </TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell sx={{ width: '40%' }}>
                                      <Typography className='data-name'>Item Group</Typography>
                                    </TableCell>
                                    <TableCell>
                                      <Typography className='data-value'>{item?.itemGroup}</Typography>
                                    </TableCell>
                                  </TableRow>

                                  <TableRow>
                                    <TableCell sx={{ width: '40%' }}>
                                      <Typography className='data-name'>Uom</Typography>
                                    </TableCell>
                                    <TableCell>
                                      <Typography className='data-value'>{item?.uom}</Typography>
                                    </TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell colSpan={2}>
                                      <Typography className='data-name'>Item Description</Typography>
                                      <div>
                                        <pre
                                          style={{
                                            fontFamily: 'inherit',
                                            whiteSpace: 'pre-wrap'
                                          }}
                                        >
                                          {item?.itemDescription}
                                        </pre>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                </TableBody>
                              </Table>
                            </Grid>
                            {/* Check if enablePackingUnit is true */}
                            {item?.enablePackingUnit && (
                              <Grid item xs={12}>
                                <Grid container spacing={6} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <Grid item xs={12} sm={12} md={12} lg={12}>
                                    <Typography sx={{ fontSize: '14px', fontWeight: 500, lineHeight: '22px', mb: 2 }}>
                                      Packing Units:
                                    </Typography>
                                    <TableContainer>
                                      <Table
                                        size='small'
                                        sx={{
                                          '& .MuiTableCell-root': {
                                            fontSize: '12px',
                                            padding: '8px !important',
                                            textAlign: 'right'
                                          },
                                          '& .MuiTableCell-root:first-of-type': {
                                            textAlign: 'left !important'
                                          }
                                        }}
                                      >
                                        <TableHead sx={{ bgcolor: 'rgba(248, 250, 254, 1)' }}>
                                          <TableRow>
                                            <TableCell style={{ width: '20%' }}>Unit</TableCell>
                                            <TableCell style={{ width: '40%' }}>Qty Per Unit</TableCell>
                                            <TableCell style={{ width: '40%' }}>Description</TableCell>
                                          </TableRow>
                                        </TableHead>
                                        <TableBody>
                                          {item?.packingUnits?.length > 0 ? (
                                            item?.packingUnits?.map((packingUnit, index) => (
                                              <TableRow key={index}>
                                                <TableCell align='left'>{packingUnit?.unit}</TableCell>
                                                <TableCell align='left'>{packingUnit?.qtyPerUnit}</TableCell>
                                                <TableCell align='left'>{packingUnit?.description}</TableCell>
                                              </TableRow>
                                            ))
                                          ) : (
                                            <TableRow>
                                              <TableCell colSpan={3}>
                                                <Box
                                                  sx={{
                                                    width: '100%',
                                                    height: '100%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    p: '15px 10px'
                                                  }}
                                                >
                                                  <Typography variant='p' align='center' display='block'>
                                                    No data
                                                  </Typography>
                                                </Box>
                                              </TableCell>
                                            </TableRow>
                                          )}
                                        </TableBody>
                                      </Table>
                                    </TableContainer>
                                  </Grid>
                                </Grid>
                              </Grid>
                            )}
                            {/* Check if enableDimension is true */}
                            {item?.enableDimension && (
                              <Grid item xs={12}>
                                <Grid container spacing={6} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <Grid item xs={12} sm={12} md={12} lg={12}>
                                    <Typography sx={{ fontSize: '14px', fontWeight: 500, lineHeight: '22px', mb: 2 }}>
                                      Dimensions:
                                    </Typography>
                                    <TableContainer>
                                      <Table
                                        size='small'
                                        sx={{
                                          '& .MuiTableCell-root': {
                                            fontSize: '12px',
                                            padding: '8px !important',
                                            textAlign: 'right'
                                          },
                                          '& .MuiTableCell-root:first-of-type': {
                                            textAlign: 'left'
                                          }
                                        }}
                                      >
                                        <TableHead sx={{ bgcolor: 'rgba(248, 250, 254, 1)' }}>
                                          <TableRow>
                                            <TableCell style={{ width: '20%' }}>Dimension</TableCell>
                                            <TableCell style={{ width: '40%' }}>Default Value</TableCell>
                                            <TableCell style={{ width: '40%' }}>Minimum Value</TableCell>
                                          </TableRow>
                                        </TableHead>
                                        <TableBody>
                                          {item?.dimensions?.length && (
                                            <TableRow>
                                              <TableCell align='left'>Length</TableCell>
                                              <TableCell align='left'>
                                                {item?.dimensions?.length?.defaultValue}
                                              </TableCell>
                                              <TableCell align='left'>
                                                {item?.dimensions?.length?.minimumValue}
                                              </TableCell>
                                            </TableRow>
                                          )}
                                          {item?.dimensions?.width && (
                                            <TableRow>
                                              <TableCell align='left'>Width</TableCell>
                                              <TableCell align='left'>
                                                {item?.dimensions?.width?.defaultValue}
                                              </TableCell>
                                              <TableCell align='left'>
                                                {item?.dimensions?.width?.minimumValue}
                                              </TableCell>
                                            </TableRow>
                                          )}

                                          {item?.dimensions?.height && (
                                            <TableRow>
                                              <TableCell align='left'>Height</TableCell>
                                              <TableCell align='left'>
                                                {item?.dimensions?.height?.defaultValue}
                                              </TableCell>
                                              <TableCell align='left'>
                                                {item?.dimensions?.height?.minimumValue}
                                              </TableCell>
                                            </TableRow>
                                          )}
                                        </TableBody>
                                      </Table>
                                    </TableContainer>
                                  </Grid>
                                </Grid>
                              </Grid>
                            )}
                          </Grid>
                        </Grid>
                        <Grid item xs={12} sm={6} md={5}>
                          {' '}
                          <Grid container spacing={{ xs: 3, md: 5 }}>
                            {' '}
                            <Grid item xs={12}>
                              <Table
                                sx={{
                                  width: '100%',
                                  border: 0,
                                  '& .MuiTableCell-root': {
                                    border: 0,
                                    textAlign: 'left !important',
                                    padding: '0px !important',
                                    verticalAlign: 'top !important'
                                  },
                                  '& .MuiTableCell-root .data-name': {
                                    fontSize: '12px',
                                    color: '#818181',
                                    lineHeight: '25px'
                                  },
                                  '& .MuiTableCell-root .data-value': {
                                    fontSize: '12px',
                                    fontWeight: 500,
                                    color: '#000',
                                    lineHeight: '25px'
                                  }
                                }}
                              >
                                <TableBody>
                                  <TableRow>
                                    {' '}
                                    <TableCell>
                                      <Typography
                                        sx={{
                                          fontSize: '14px',
                                          fontWeight: 600,
                                          lineHeight: '22px',
                                          mb: 2
                                        }}
                                      >
                                        Selling Information
                                      </Typography>
                                      <Table
                                        sx={{
                                          width: '100%',
                                          border: 0,
                                          '& .MuiTableCell-root': {
                                            border: 0,
                                            padding: '0px !important'
                                          }
                                        }}
                                      >
                                        <TableBody>
                                          <TableRow>
                                            <TableCell sx={{ width: '40%' }}>
                                              <Typography className='data-name'>Selling Price</Typography>
                                            </TableCell>
                                            <TableCell>
                                              <Typography className='data-value'>
                                                {item?.sellingPrice ? (
                                                  <NumberFormat value={item?.sellingPrice} currency={sellingCurrency} />
                                                ) : (
                                                  '-'
                                                )}
                                              </Typography>
                                            </TableCell>
                                          </TableRow>
                                          <TableRow>
                                            <TableCell sx={{ width: '40%' }}>
                                              <Typography className='data-name'>Cost Price</Typography>
                                            </TableCell>
                                            <TableCell>
                                              <Typography className='data-value'>
                                                {item?.costPrice ? (
                                                  <NumberFormat value={item?.costPrice} currency={costCurrency} />
                                                ) : (
                                                  '-'
                                                )}
                                              </Typography>
                                            </TableCell>
                                          </TableRow>
                                          <TableRow>
                                            <TableCell sx={{ width: '40%' }}>
                                              <Typography className='data-name'>
                                                {item?.sellingPriceTaxInclusive
                                                  ? 'Inclusive of Tax'
                                                  : 'Exclusive of Tax'}
                                              </Typography>
                                            </TableCell>

                                            <TableCell>
                                              <Typography className='data-value'>
                                                {item?.sellingPriceTaxInclusive ? 'Yes' : 'No'}{' '}
                                              </Typography>
                                            </TableCell>
                                          </TableRow>

                                          <TableRow>
                                            <TableCell sx={{ width: '40%' }}>
                                              <Typography className='data-name'>Available Qty</Typography>
                                            </TableCell>
                                            <TableCell>
                                              <Typography className='data-value'>{totalAvlQty}</Typography>
                                            </TableCell>
                                          </TableRow>
                                        </TableBody>
                                      </Table>
                                    </TableCell>
                                  </TableRow>
                                </TableBody>
                              </Table>
                            </Grid>
                            <Grid item xs={12}>
                              <Table
                                sx={{
                                  width: '100%',
                                  border: 0,

                                  '& .MuiTableCell-root': {
                                    border: 0,
                                    textAlign: 'left !important',

                                    padding: '0px !important',
                                    verticalAlign: 'top !important'
                                  },
                                  '& .MuiTableCell-root .data-name': {
                                    fontSize: '12px',
                                    color: '#818181',
                                    lineHeight: '25px'
                                  },
                                  '& .MuiTableCell-root .data-value': {
                                    fontSize: '12px',
                                    fontWeight: 500,
                                    color: '#000',
                                    lineHeight: '25px'
                                  }
                                }}
                              >
                                <TableBody>
                                  <TableRow>
                                    {' '}
                                    <TableCell>
                                      <Typography
                                        sx={{
                                          fontSize: '14px',
                                          fontWeight: 600,
                                          lineHeight: '22px',
                                          mb: 2
                                        }}
                                      >
                                        Purchase Information
                                      </Typography>
                                      <Table
                                        sx={{
                                          width: '100%',
                                          border: 0,
                                          '& .MuiTableCell-root': {
                                            border: 0,
                                            padding: '0px !important'
                                          }
                                        }}
                                      >
                                        <TableBody>
                                          <TableRow>
                                            <TableCell sx={{ width: '40%' }}>
                                              <Typography className='data-name'>Purchase Price</Typography>
                                            </TableCell>
                                            <TableCell>
                                              <Typography className='data-value'>
                                                {item?.purchasePrice ? (
                                                  <NumberFormat
                                                    value={item?.purchasePrice}
                                                    currency={purchaseCurrency}
                                                  />
                                                ) : (
                                                  '-'
                                                )}
                                              </Typography>
                                            </TableCell>
                                          </TableRow>
                                        </TableBody>
                                      </Table>
                                    </TableCell>
                                  </TableRow>
                                </TableBody>
                              </Table>
                            </Grid>
                            <Grid item xs={12}>
                              <Table
                                sx={{
                                  width: '100%',
                                  border: 0,

                                  '& .MuiTableCell-root': {
                                    border: 0,
                                    textAlign: 'left !important',

                                    padding: '0px !important',
                                    verticalAlign: 'top !important'
                                  },
                                  '& .MuiTableCell-root .data-name': {
                                    fontSize: '12px',
                                    color: '#818181',
                                    lineHeight: '25px'
                                  },
                                  '& .MuiTableCell-root .data-value': {
                                    fontSize: '12px',
                                    fontWeight: 500,
                                    color: '#000',
                                    lineHeight: '25px'
                                  }
                                }}
                              >
                                <TableBody>
                                  <TableRow>
                                    {' '}
                                    <TableCell>
                                      <Typography
                                        sx={{
                                          fontSize: '14px',
                                          fontWeight: 600,
                                          lineHeight: '22px',
                                          mb: 2
                                        }}
                                      >
                                        Stock
                                      </Typography>
                                      <Table
                                        sx={{
                                          width: '100%',
                                          border: 0,
                                          '& .MuiTableCell-root': {
                                            border: 0,
                                            padding: '0px !important'
                                          }
                                        }}
                                      >
                                        <TableBody>
                                          <TableRow>
                                            <TableCell sx={{ width: '40%' }}>
                                              <Typography className='data-name'>Low Stock Threshold</Typography>
                                            </TableCell>
                                            <TableCell>
                                              <Typography className='data-value'>
                                                {item?.lowStockThreshold ? (
                                                  <NumberFormat value={item?.lowStockThreshold} />
                                                ) : (
                                                  '-'
                                                )}
                                              </Typography>
                                            </TableCell>
                                          </TableRow>
                                        </TableBody>
                                      </Table>
                                    </TableCell>
                                  </TableRow>
                                </TableBody>
                              </Table>
                            </Grid>
                            <Grid item xs={12}>
                              <Table
                                sx={{
                                  width: '100%',
                                  border: 0,

                                  '& .MuiTableCell-root': {
                                    border: 0,
                                    textAlign: 'left !important',
                                    padding: '0px !important',
                                    verticalAlign: 'top !important'
                                  },
                                  '& .MuiTableCell-root .data-name': {
                                    fontSize: '12px',
                                    color: '#818181',
                                    lineHeight: '25px'
                                  },
                                  '& .MuiTableCell-root .data-value': {
                                    fontSize: '12px',
                                    fontWeight: 500,
                                    color: '#000',
                                    lineHeight: '25px'
                                  }
                                }}
                              >
                                <TableBody>
                                  <TableRow>
                                    {' '}
                                    <TableCell>
                                      <Typography
                                        sx={{
                                          fontSize: '14px',
                                          fontWeight: 600,
                                          lineHeight: '22px',
                                          mb: 2
                                        }}
                                      >
                                        Organize
                                      </Typography>
                                      <Table
                                        sx={{
                                          width: '100%',
                                          border: 0,
                                          '& .MuiTableCell-root': {
                                            border: 0,
                                            padding: '0px !important'
                                          }
                                        }}
                                      >
                                        <TableBody>
                                          <TableRow>
                                            <TableCell sx={{ width: '40%' }}>
                                              <Typography className='data-name'>Manufacturer</Typography>
                                            </TableCell>
                                            <TableCell>
                                              <Typography className='data-value'>
                                                {item?.manufacturer ? item?.manufacturer : '-'}
                                              </Typography>
                                            </TableCell>
                                          </TableRow>
                                          <TableRow>
                                            <TableCell sx={{ width: '40%' }}>
                                              <Typography className='data-name'>Brand</Typography>
                                            </TableCell>
                                            <TableCell>
                                              <Typography className='data-value'>
                                                {item?.brand ? item?.brand : '-'}
                                              </Typography>
                                            </TableCell>
                                          </TableRow>

                                          <TableRow>
                                            <TableCell sx={{ width: '40%' }}>
                                              <Typography className='data-name'>Tags</Typography>
                                            </TableCell>
                                            <TableCell>
                                              <Typography className='data-value'>
                                                {item?.tags?.map(tag => {
                                                  return <>{tag}, </>
                                                })}
                                              </Typography>
                                            </TableCell>
                                          </TableRow>
                                          <TableRow>
                                            <TableCell sx={{ width: '40%' }}>
                                              <Typography className='data-name'>Product Category</Typography>
                                            </TableCell>
                                            <TableCell>
                                              <Typography className='data-value'>
                                                {item?.productCategory ? item?.productCategory : '-'}
                                              </Typography>
                                            </TableCell>
                                          </TableRow>
                                          <TableRow>
                                            <TableCell sx={{ width: '40%' }}>
                                              <Typography className='data-name'>Product class</Typography>
                                            </TableCell>
                                            <TableCell>
                                              <Typography className='data-value'>
                                                {item?.productClass ? item?.productClass : '-'}
                                              </Typography>
                                            </TableCell>
                                          </TableRow>
                                        </TableBody>
                                      </Table>
                                    </TableCell>
                                  </TableRow>
                                </TableBody>
                              </Table>
                            </Grid>
                          </Grid>
                        </Grid>
                      </Grid>
                    </TabPanel>

                    <TabPanel
                      value='transactions'
                      sx={{
                        p: { xs: '10px !important', md: '15px !important' }
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-end',
                          gap: 3,
                          mb: 3
                        }}
                      >
                        <IconButton
                          onClick={() => {
                            const startDate = lastMonthDate(moduleFilterDateDuration)
                            handleDateRange(startDate, endDate)
                          }}
                        >
                          <RefreshIcon />
                        </IconButton>
                        <CommonDateRangeFilter
                          anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'right'
                          }}
                          transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right'
                          }}
                          getData={handleDateRange}
                        />
                      </Box>
                      {/* <Card sx={{ p: 3 }}> */}
                      {transactionsLoading ? (
                        <LinearProgress sx={{ height: '5px' }} />
                      ) : (
                        <>
                          <Typography sx={{ fontSize: '14px', fontWeight: 500, textAlign: 'right', mb: 3 }}>
                            <span style={{ fontSize: '13px', color: '#959595' }}>Balance:</span> {lastRunningBal}
                          </Typography>
                          <Box sx={{ width: '100%' }}>
                            <MobileDataGrid
                              columns={columns}
                              rows={transactions || []}
                              disableColumnMenu={true}
                              disableRowSelectionOnClick
                              getRowId={row => row?.transactionId}
                              sortModel={[{ field: 'transactionDate', sort: 'desc' }]}
                              slots={{
                                columnHeaders: () => null,
                                noRowsOverlay: CustomNoRowsOverlay
                              }}
                              slotProps={{
                                noRowsOverlay: {
                                  mainText: 'Empty Transactions',
                                  subText: 'No Transactions found for given date range'
                                }
                              }}
                            />
                          </Box>

                          <Typography sx={{ fontSize: '14px', fontWeight: 500, textAlign: 'right' }}>
                            <span style={{ fontSize: '13px', color: '#959595' }}>Closing Balance:</span>{' '}
                            {lastClosingBal}
                          </Typography>
                        </>
                      )}
                      {/* </Card> */}
                    </TabPanel>

                    <TabPanel
                      value='stock'
                      sx={{
                        p: { xs: '10px !important', md: '15px !important' }
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'end'
                        }}
                      >
                        {tab === 'stock' ? (
                          <IconButton onClick={() => getAvailableQty()}>
                            <RefreshIcon />
                          </IconButton>
                        ) : null}
                      </Box>
                      {stockLoading ? (
                        <LinearProgress />
                      ) : (
                        <Grid container>
                          <Grid item xs={12} lg={12}>
                            <TableContainer>
                              {' '}
                              <Table
                                sx={{
                                  width: '100%',
                                  marginBottom: '30px'
                                }}
                              >
                                <TableHead>
                                  <TableRow>
                                    <TableCell>#</TableCell>
                                    <TableCell>warehouse</TableCell>
                                    <TableCell>Available Qty </TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {groupedData?.length > 0 ? (
                                    groupedData?.map((stock, index) => {
                                      const warehouse = warehouses?.find(
                                        item => item?.warehouseId === stock?.warehouseId
                                      )

                                      return (
                                        <>
                                          <TableRow>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>{warehouse?.name}</TableCell>
                                            <TableCell>{stock?.availableQty}</TableCell>
                                          </TableRow>
                                        </>
                                      )
                                    })
                                  ) : (
                                    <TableRow>
                                      <TableCell colSpan={3}>
                                        <Box
                                          sx={{
                                            width: '100%',
                                            height: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            p: '30px 10px'
                                          }}
                                        >
                                          <Typography variant='h5' align='center' display='block'>
                                            No Data Available
                                          </Typography>
                                        </Box>
                                      </TableCell>
                                    </TableRow>
                                  )}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          </Grid>
                        </Grid>
                      )}
                    </TabPanel>
                    <TabPanel
                      value='attachments'
                      sx={{
                        p: { xs: '10px !important', md: '15px !important' }
                      }}
                    >
                      <AttachmentTabProduct product={item} folderName={'ITEM_PDF'} />
                    </TabPanel>
                  </>
                )}
              </TabContext>
            </Grid>
          </Grid>
        </div>
      </PageWrapper>
    </React.Fragment>
  )
}
