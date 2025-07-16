// ** Next Import
import { ArrowDownward, ArrowUpward } from '@mui/icons-material'
import RefreshIcon from '@mui/icons-material/Refresh'
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import {
  Alert,
  alpha,
  Box,
  Button,
  Card,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  Popover,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography
} from '@mui/material'
import Tab from '@mui/material/Tab'
import { parseISO } from 'date-fns'
import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  getAllItemTransactionsQuery,
  GetItemLedgerBalanceByItemIdQuery
} from 'src/@core/components/graphql/item-queries'
import Icon from 'src/@core/components/icon'
import CommonCustomerPopup from 'src/common-components/CommonCustomerPopup'
import CommonPOPopup from 'src/common-components/CommonPOPopup'
import CommonSoPopup from 'src/common-components/CommonSoPopup'
import CommonVendorPopup from 'src/common-components/CommonVendorPopup'
import CustomNoRowsOverlay from 'src/common-components/CustomNoRowsOverlay'
import FilterDateRange from 'src/common-components/FilterDateRange'
import StyledButton from 'src/common-components/StyledMuiButton'
import { fetchData } from 'src/common-functions/GraphqlOperations'
import { STATUS_PARTLY_CLEARED } from 'src/common-functions/utils/Constants'
import {
  dataTextStyles,
  dataTitleStyles,
  DateFunction,
  findObjectByCurrencyId,
  formatDateString,
  lastMonthDate,
  NumberFormat,
  rowStatusChip
} from 'src/common-functions/utils/UtilityFunctions'
import useCurrencies from 'src/hooks/getData/useCurrencies'
import useCustomers from 'src/hooks/getData/useCustomers'
import useProducts from 'src/hooks/getData/useProducts'
import usePurchaseOrders from 'src/hooks/getData/usePurchaseOrders'
import useSalesOrders from 'src/hooks/getData/useSalesOrders'
import useVendors from 'src/hooks/getData/useVendors'
import useWarehouses from 'src/hooks/getData/useWarehouses'
import { setSelectedCustomer } from 'src/store/apps/customers'
import { setSelectedVendor } from 'src/store/apps/vendors'
import CustomCloseButton from './CustomCloseButton'
import MobileDataGrid from './MobileDataGrid'

function CommonItemPopup({ openDialog, setOpenDialog, itemId }) {
  const dispatch = useDispatch()

  const tenant = useSelector(state => state.tenants?.selectedTenant)

  const { tenantId = '' } = tenant
  const { vendors } = useVendors(tenantId)
  const { currencies } = useCurrencies()
  const { warehouses } = useWarehouses(tenantId)
  const { reloadProductInStore, fetchSingleProduct } = useProducts(tenantId)
  const { customers } = useCustomers(tenantId)
  const { fetchSalesOrders } = useSalesOrders(tenantId)
  const { fetchPurchaseOrders } = usePurchaseOrders(tenantId)
  const [stockLoading, setStockLoading] = useState(true)
  const [lastClosingBal, setLastClosingBal] = useState('')
  const [lastRunningBal, setLastRunningBal] = useState('')
  const [transactions, setTransactions] = useState([])
  const [transactionsLoading, setTransactionsLoading] = useState(true)
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

  let today = new Date()
  let oneMonthAgo = lastMonthDate()
  const [startDate, setStartDate] = useState(lastMonthDate())
  const [endDate, setEndDate] = useState(new Date())
  const [filterAnchor, setFilterAnchor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [product, setProduct] = useState(null)
  const [salesOrders, setSalesOrders] = useState([])
  const [purchaseOrders, setPurchaseOrders] = useState([])
  useEffect(() => {
    const fetchSalesOrder = async () => {
      const salesOrders = await fetchSalesOrders()
      const purchaseOrders = await fetchPurchaseOrders()
      setSalesOrders(salesOrders)
      setPurchaseOrders(purchaseOrders)
    }
    fetchSalesOrder()
  }, [fetchSalesOrders, fetchPurchaseOrders])

  const getProductObject = async () => {
    setLoading(true)
    try {
      const response = await fetchSingleProduct(itemId)
      if (response) {
        setProduct(response)
      }
    } catch (e) {
      console.error('Error fetching item:', e)
      setProduct(null)
    } finally {
      setLoading(false)
    }
  }

  const refreshProductStore = async product => {
    console.log('called refresh store')

    setLoading(true)
    try {
      await reloadProductInStore(product?.itemId)
    } catch (error) {
      console.error('Error refreshing product store:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getProductObject()
  }, [tenantId, itemId])

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
                    <ArrowDownward />
                  ) : row?.stockMovement === 'OUTWARD' ? (
                    <ArrowUpward />
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

  const handleTabChange = (event, newValue) => {
    setTab(newValue)
    if (newValue === 'transactions') {
      getTransactions(oneMonthAgo, today)
    } else if (newValue === 'stock') {
      getAvailableQty()
    }
  }

  const handleFilterClick = event => {
    setFilterAnchor(event.currentTarget)
  }

  const handleFilterClose = () => {
    setFilterAnchor(null)
  }

  const handleReset = async () => {
    let today = new Date()
    let oneMonthAgo = lastMonthDate()
    setStartDate(oneMonthAgo)
    setEndDate(today)
    const formattedStartDate = formatDateString(oneMonthAgo)
    const formattedEndDate = formatDateString(today)
    try {
      setTransactionsLoading(true)
      const itemTransactions = await fetchData(
        getAllItemTransactionsQuery(tenantId, product?.itemId, formattedStartDate, formattedEndDate)
      )
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
      setFilterAnchor(null)
      console.log('Fetched data by date range successfully')
    }
  }

  const getTransactions = async (startDate, endDate) => {
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
      setFilterAnchor(null)
      console.log('Fetched data by date range successfully')
    }
  }

  useEffect(() => {
    if (tab === 'transactions') {
      getTransactions(oneMonthAgo, today)
    }
  }, [product?.itemId, tenantId])

  const handleClose = () => {
    setOpenDialog(false)
  }

  const [tab, setTab] = useState('overview')

  const sellingCurrency = useMemo(
    () => findObjectByCurrencyId(currencies, product?.sellingPriceCurrency),
    [currencies, product?.sellingPriceCurrency]
  )

  const costCurrency = useMemo(
    () => findObjectByCurrencyId(currencies, product?.costPriceCurrency),
    [currencies, product?.costPriceCurrency]
  )

  const purchaseCurrency = useMemo(
    () => findObjectByCurrencyId(currencies, product?.purchasePriceCurrency),
    [currencies, product?.purchasePriceCurrency]
  )

  const [groupedData, setGroupedData] = useState([])
  const [totalAvlQty, setTotalAvlQty] = useState(0)

  const getAvailableQty = async () => {
    setStockLoading(true)
    const itemId = product?.itemId

    try {
      const response = await fetchData(GetItemLedgerBalanceByItemIdQuery(tenantId, itemId))
      const state = response?.getItemLedgerBalanceByItemId
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
    if (product) {
      getAvailableQty()
    }
  }, [product, tenantId])

  return (
    <Dialog
      open={openDialog}
      disableEscapeKeyDown
      maxWidth='xl'
      fullWidth={true}
      scroll='paper'
      onClose={(event, reason) => {
        if (reason !== 'backdropClick') {
          handleClose()
        }
      }}
      sx={{
        '& .MuiDialog-paper': {
          overflow: 'visible',
          p: '20px 0px !important',
          height: '100%',
          verticalAlign: 'top'
        }
      }}
    >
      <DialogTitle id='alert-dialog-title'>
        <Alert severity='info' sx={{ color: 'rgba(0,0,0,0.8)' }}>
          Product Information
        </Alert>{' '}
      </DialogTitle>
      <DialogContent sx={{ py: 8 }}>
        <CustomCloseButton onClick={handleClose}>
          <Icon icon='tabler:x' fontSize='1.25rem' />
        </CustomCloseButton>
        {loading ? (
          <LinearProgress />
        ) : product ? (
          <TabContext value={tab}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid #ccc',
                width: '100%',
                mb: 2
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
              </TabList>
              <Tooltip title='Reload' placement='top'>
                <IconButton
                  color='default'
                  onClick={async () => {
                    await refreshProductStore(product)
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
                  <Grid container spacing={{ xs: 3, md: 5 }} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Grid item xs={12} sm={6} md={6.5}>
                      <Grid container spacing={{ xs: 3, md: 5 }}>
                        <Grid item xs={12}>
                          <Table
                            sx={{
                              width: '100%',
                              border: 0,
                              '& .MuiTableCell-root': {
                                border: 0,
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
                                <TableCell sx={{ width: '30%' }}>
                                  <Typography className='data-name'>Item Code</Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography className='data-value'>
                                    {' '}
                                    {product?.itemCodePrefix}
                                    {product?.itemCode}
                                  </Typography>
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell sx={{ width: '30%' }}>
                                  <Typography className='data-name'>Name</Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography className='data-value'>{product?.itemName}</Typography>
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell sx={{ width: '30%' }}>
                                  <Typography className='data-name'>Item Group</Typography>
                                </TableCell>
                                <TableCell sx={{ width: '60%' }}>
                                  <Typography className='data-value'>{product?.itemGroup}</Typography>
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell sx={{ width: '30%' }}>
                                  <Typography className='data-name'>UOM</Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography className='data-value'>{product?.uom}</Typography>
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell colSpan={2}>
                                  <Typography className='data-name'>Item Description</Typography>
                                  {product?.itemDescription}
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </Grid>
                        {product?.enablePackingUnit && (
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
                                    <TableHead>
                                      <TableRow>
                                        <TableCell style={{ width: '20%' }}>Unit</TableCell>
                                        <TableCell style={{ width: '40%' }}>Qty Per Unit</TableCell>
                                        <TableCell style={{ width: '40%' }}>Description</TableCell>
                                      </TableRow>
                                    </TableHead>
                                    <TableBody>
                                      {product?.packingUnits?.length > 0 ? (
                                        product?.packingUnits?.map((packingUnit, index) => (
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
                        {product?.enableDimension && (
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
                                        textAlign: 'left !important'
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
                                      {product?.dimensions?.length && (
                                        <TableRow>
                                          <TableCell align='left'>Length</TableCell>
                                          <TableCell align='left'>
                                            {product?.dimensions?.length?.defaultValue}
                                          </TableCell>
                                          <TableCell align='left'>
                                            {product?.dimensions?.length?.minimumValue}
                                          </TableCell>
                                        </TableRow>
                                      )}
                                      {product?.dimensions?.width && (
                                        <TableRow>
                                          <TableCell align='left'>Width</TableCell>
                                          <TableCell align='left'>{product?.dimensions?.width?.defaultValue}</TableCell>
                                          <TableCell align='left'>{product?.dimensions?.width?.minimumValue}</TableCell>
                                        </TableRow>
                                      )}

                                      {product?.dimensions?.height && (
                                        <TableRow>
                                          <TableCell align='left'>Height</TableCell>
                                          <TableCell align='left'>
                                            {product?.dimensions?.height?.defaultValue}
                                          </TableCell>
                                          <TableCell align='left'>
                                            {product?.dimensions?.height?.minimumValue}
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
                                            {product?.sellingPrice ? (
                                              <NumberFormat value={product?.sellingPrice} currency={sellingCurrency} />
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
                                            {product?.costPrice ? (
                                              <NumberFormat value={product?.costPrice} currency={costCurrency} />
                                            ) : (
                                              '-'
                                            )}
                                          </Typography>
                                        </TableCell>
                                      </TableRow>

                                      <TableRow>
                                        <TableCell sx={{ width: '40%' }}>
                                          <Typography className='data-name'>Markup Percentage</Typography>
                                        </TableCell>
                                        <TableCell>
                                          <Typography className='data-value'>
                                            {product?.markupPercentage ? product?.markupPercentage : '-'}
                                          </Typography>
                                        </TableCell>
                                      </TableRow>
                                      <TableRow>
                                        <TableCell sx={{ width: '40%' }}>
                                          <Typography className='data-name'>Inclusive of Tax</Typography>
                                        </TableCell>

                                        <TableCell>
                                          <Typography className='data-value'>
                                            {product?.sellingPriceTaxInclusive ? 'Yes' : 'No'}{' '}
                                          </Typography>
                                        </TableCell>
                                      </TableRow>
                                      <TableRow>
                                        <TableCell sx={{ width: '40%' }}>
                                          <Typography className='data-name'>In Stock</Typography>
                                        </TableCell>

                                        <TableCell>
                                          <Typography className='data-value'>
                                            {product?.inStock ? 'Yes' : 'No'}
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
                                            {product?.purchasePrice ? (
                                              <NumberFormat
                                                value={product?.purchasePrice}
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
                                            {product?.manufacturer ? product?.manufacturer : '-'}
                                          </Typography>
                                        </TableCell>
                                      </TableRow>
                                      <TableRow>
                                        <TableCell sx={{ width: '40%' }}>
                                          <Typography className='data-name'>Brand</Typography>
                                        </TableCell>
                                        <TableCell>
                                          <Typography className='data-value'>
                                            {product?.brand ? product?.brand : '-'}
                                          </Typography>
                                        </TableCell>
                                      </TableRow>

                                      <TableRow>
                                        <TableCell sx={{ width: '40%' }}>
                                          <Typography className='data-name'>Tags</Typography>
                                        </TableCell>
                                        <TableCell>
                                          <Typography className='data-value'>
                                            {product?.tags?.map(tag => {
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
                                            {product?.productCategory ? product?.productCategory : '-'}
                                          </Typography>
                                        </TableCell>
                                      </TableRow>
                                      <TableRow>
                                        <TableCell sx={{ width: '40%' }}>
                                          <Typography className='data-name'>Product class</Typography>
                                        </TableCell>
                                        <TableCell>
                                          <Typography className='data-value'>
                                            {product?.productClass ? product?.productClass : '-'}
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
                      gap: 3,
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      mb: 3
                    }}
                  >
                    {' '}
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
                      open={Boolean(filterAnchor)}
                      anchorEl={filterAnchor}
                      onClose={handleFilterClose}
                      anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left'
                      }}
                      transformOrigin={{
                        vertical: 'top',
                        horizontal: 'left'
                      }}
                      sx={{ mt: 2 }}
                    >
                      <Box sx={{ py: 0 }}>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            px: 4,
                            py: 4,
                            background: '#f1f1f1'
                          }}
                        >
                          <Typography sx={{ fontSize: '14px', lineHeight: '23px' }}> Filters</Typography>
                        </Box>
                        <Divider sx={{ mb: 3, opacity: 0.5 }} color='primary' />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 4, mb: 2 }}>
                          <Typography sx={{ fontSize: '13px', lineHeight: '23px' }}> Date Range</Typography>
                          <Button
                            type='button'
                            onClick={() => {
                              setStartDate(lastMonthDate())
                              setEndDate(new Date())
                            }}
                          >
                            Reset
                          </Button>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 4, alignItems: 'center', px: 4 }}>
                          <FilterDateRange label='From' date={startDate} setDate={setStartDate} />
                          <FilterDateRange label='To' date={endDate} setDate={setEndDate} />
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

                          <Button variant='contained' onClick={() => getTransactions(startDate, endDate)}>
                            Apply
                          </Button>
                        </Box>
                      </Box>
                    </Popover>
                    <IconButton
                      color='default'
                      sx={{ fontSize: '21px' }}
                      onClick={() => {
                        getTransactions(oneMonthAgo, today)
                      }}
                    >
                      <RefreshIcon />
                    </IconButton>
                  </Box>
                  <Card sx={{ p: 3 }}>
                    {transactionsLoading ? (
                      <LinearProgress sx={{ height: '5px' }} />
                    ) : (
                      <>
                        <Typography sx={{ fontSize: '14px', fontWeight: 500, textAlign: 'right', mb: 3 }}>
                          <span style={{ fontSize: '13px', color: '#959595' }}>Balance:</span> {lastRunningBal}
                        </Typography>
                        <Box sx={{ width: '100%', height: '480px' }}>
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
                          <span style={{ fontSize: '13px', color: '#959595' }}>Closing Balance:</span> {lastClosingBal}
                        </Typography>
                      </>
                    )}
                  </Card>
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
                      <IconButton color='default' sx={{ fontSize: '21px' }} onClick={() => getAvailableQty()}>
                        <RefreshIcon />
                      </IconButton>
                    ) : null}
                  </Box>
                  {stockLoading ? (
                    <LinearProgress sx={{ height: '5px' }} />
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
                                  const warehouse = warehouses?.find(item => item?.warehouseId === stock?.warehouseId)
                                  return (
                                    <>
                                      <TableRow>
                                        <TableCell>{index + 1}</TableCell>
                                        {/* <TableCell>{stock?.sku} </TableCell> */}
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
              </>
            )}
          </TabContext>
        ) : (
          <Typography variant='h4' textAlign={'center'}>
            Product is not available.
          </Typography>
        )}
      </DialogContent>
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
      {salesOrderDialogState.open && (
        <CommonSoPopup
          orderId={salesOrderDialogState.selectedSalesOrderId}
          open={salesOrderDialogState.open}
          onClose={() => setSalesOrderDialogState({ open: false, selectedSalesOrderId: null })}
        />
      )}
      {dialogState.open && (
        <CommonPOPopup
          orderId={dialogState.selectedOrderId}
          open={dialogState.open}
          onClose={() => setDialogState({ open: false, selectedOrderId: null })}
        />
      )}
    </Dialog>
  )
}

export default CommonItemPopup
