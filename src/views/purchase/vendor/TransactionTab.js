import { useEffect, useState } from 'react'
import { Box, IconButton, Typography, LinearProgress, MenuItem, Grid } from '@mui/material'
import Icon from 'src/@core/components/icon'
import { useDispatch, useSelector } from 'react-redux'
import {
  dataTextStyles,
  dataTitleStyles,
  DateFunction,
  findObjectByCurrencyId,
  lastMonthDate,
  NumberFormat,
  rowStatusChip
} from 'src/common-functions/utils/UtilityFunctions'
import StyledButton from 'src/common-components/StyledMuiButton'
import CustomNoRowsOverlay from 'src/common-components/CustomNoRowsOverlay'
import { setActionPayment } from 'src/store/apps/purchases-payment'
import useCurrencies from 'src/hooks/getData/useCurrencies'
import CommonStyledMenu from 'src/common-components/CommonStyledMenu'
import usePurchaseOrders from 'src/hooks/getData/usePurchaseOrders'
import CommonDateRangeFilter from 'src/common-components/CommonDateRangeFilter'
import useIsDesktop from 'src/hooks/IsDesktop'
import ClearPOPayment from '../Payment/ClearPOPayment'
import usePurchasePayments from 'src/hooks/getData/usePurchasePayment'
import RefreshIcon from '@mui/icons-material/Refresh'
import { fetchData } from 'src/common-functions/GraphqlOperations'
import { getAllVendorTransactionsQuery } from 'src/@core/components/graphql/vendor-queries'
import CommonPoPaymentsPopUp from 'src/common-components/CommonPoPaymentsPopUp'
import CommonPOPopup from 'src/common-components/CommonPOPopup'
import MobileDataGrid from 'src/common-components/MobileDataGrid'

export default function TransactionTab({ vendor }) {
  const isDesktop = useIsDesktop()
  const dispatch = useDispatch()
  const tenant = useSelector(state => state.tenants?.selectedTenant) || ''
  const { tenantId = '' } = tenant
  const { fetchPurchaseOrders } = usePurchaseOrders(tenantId)
  const moduleFilterDateDuration = useSelector(
    state => state.otherSettings?.data?.moduleFilterDateDuration || undefined
  )
  const [anchorElMap, setAnchorElMap] = useState({})
  const { purchasePayments } = usePurchasePayments(tenantId)
  const [openPaymentClearDialog, setOpenPaymentClearDialog] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState('')
  const [lastClosingBal, setLastClosingBal] = useState('')
  const [lastRunningBal, setLastRunningBal] = useState('')
  const [transactions, setTransactions] = useState([])
  const [transactionsLoading, setTransactionsLoading] = useState(true)
  const [startDate, setStartDate] = useState(lastMonthDate(moduleFilterDateDuration))
  const [endDate, setEndDate] = useState(new Date())
  const { currencies } = useCurrencies()
  const [columnVisible, setColumnVisible] = useState()
  const [purchaseOrderDialogState, setPurchaseOrderDialogState] = useState({
    open: false,
    selectedOrderId: null
  })
  const [dialogState, setDialogState] = useState({
    open: false,
    selectedPaymentId: null
  })
  const [purchaseOrders, setPurchaseOrders] = useState([])

  useEffect(() => {
    const getPurchaseOrders = async () => {
      const purchaseOrders = await fetchPurchaseOrders()
      setPurchaseOrders(purchaseOrders)
    }
    getPurchaseOrders()
  }, [fetchPurchaseOrders])

  useEffect(() => {
    handleDateRange(startDate, endDate)
  }, [vendor])

  const handleDateRange = async (startDate, endDate) => {
    setStartDate(startDate)
    setEndDate(endDate)
    try {
      setTransactionsLoading(true)
      const vendorTransactions = await fetchData(
        getAllVendorTransactionsQuery(vendor?.tenantId, vendor?.vendorId, startDate, endDate)
      )
      const { getVendorTransactionsByDateRange } = vendorTransactions

      getVendorTransactionsByDateRange?.sort((a, b) => new Date(b.createdDateTime) - new Date(a.createdDateTime))
      if (getVendorTransactionsByDateRange) {
        setLastClosingBal(getVendorTransactionsByDateRange[0]?.closingBalance)
        setLastRunningBal(getVendorTransactionsByDateRange[0]?.runningBalance)
      }
      setTransactions(getVendorTransactionsByDateRange)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setTransactionsLoading(false)
      console.log('Fetched data by date range successfully')
    }
  }
  const handleClose = row => {
    const updatedAnchorElMap = { ...anchorElMap }
    updatedAnchorElMap[row.transactionId] = null
    setAnchorElMap(updatedAnchorElMap)
  }
  const clearPayment = row => {
    setSelectedTransaction(row)
    setOpenPaymentClearDialog(true)
    handleClose(row)
  }

  const handleClick = (event, row) => {
    dispatch(setActionPayment(row))
    const updatedAnchorElMap = { ...anchorElMap }
    updatedAnchorElMap[row.transactionId] = event.currentTarget
    setAnchorElMap(updatedAnchorElMap)
  }

  const columns = [
    {
      flex: 0.25,
      minWidth: 100,
      field: 'transactionDate',
      renderCell: ({ row }) => {
        const currency = findObjectByCurrencyId(currencies, row?.currency)
        let order = null
        let payment = null

        if (row.transactionType === 'PURCHASE_ORDER_PAYMENT' && row.purchaseOrderPaymentId != null) {
          payment = purchasePayments?.find(payment => payment?.paymentId === row?.purchaseOrderPaymentId) || null
        } else if (row.transactionType === 'PURCHASE_ORDER' && row.purchaseOrderId != null) {
          order = purchaseOrders?.find(item => item?.orderId === row?.purchaseOrderId) || null
        }

        return (
          <Grid container spacing={3} sx={{ alignItems: 'center' }}>
            <Grid item xs={11} md={11.5}>
              <Grid container spacing={3} sx={{ alignItems: 'center' }}>
                <Grid item xs={12} md={6}>
                  <Typography sx={{ ...dataTextStyles, lineHeight: '28px' }}>
                    {DateFunction(row?.transactionDate)} {rowStatusChip(row?.status)}
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    {payment ? (
                      <Box sx={{ color: '#959595' }}>
                        Payment:{' '}
                        <StyledButton
                          color='primary'
                          onClick={() => setDialogState({ open: true, selectedPaymentId: row?.purchaseOrderPaymentId })}
                        >
                          #{row.transactionRef}
                        </StyledButton>
                      </Box>
                    ) : (
                      order && (
                        <Box sx={{ color: '#959595' }}>
                          Order:{' '}
                          <StyledButton
                            color='primary'
                            onClick={() =>
                              setPurchaseOrderDialogState({ open: true, selectedOrderId: row?.purchaseOrderId })
                            }
                          >
                            #{row.transactionRef}
                          </StyledButton>
                        </Box>
                      )
                    )}
                  </Box>
                  <div>
                    <pre style={{ fontFamily: 'inherit', whiteSpace: 'pre-wrap' }}>{row?.description}</pre>
                  </div>
                </Grid>
                <Grid item xs={4} md={2}>
                  <Typography sx={dataTextStyles}>
                    <NumberFormat value={row?.credit} currency={currency} />
                  </Typography>
                  <Typography sx={dataTitleStyles}> Credit</Typography>
                </Grid>
                <Grid item xs={4} md={2}>
                  <Typography sx={dataTextStyles}>
                    <NumberFormat value={row?.debit} currency={currency} />
                  </Typography>
                  <Typography sx={dataTitleStyles}> Debit</Typography>
                </Grid>
                <Grid item xs={4} md={2}>
                  <Typography sx={dataTextStyles}>
                    <NumberFormat value={row?.runningBalance} currency={currency} />
                  </Typography>
                  <Typography sx={dataTitleStyles}> Balance</Typography>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={1} md={0.5} sx={{ alignSelf: { xs: 'flex-start', md: 'center' } }}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <IconButton
                  aria-label='more'
                  id='long-button'
                  aria-haspopup='true'
                  onClick={event => handleClick(event, row)}
                  disabled={row.status !== 'CLEARED' && row.transactionType !== 'PURCHASE_ORDER' ? false : true}
                >
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
                  <MenuItem onClick={() => clearPayment(row)}>
                    <Icon icon='material-symbols:done' />
                    Clear payment
                  </MenuItem>
                </CommonStyledMenu>
              </Box>
            </Grid>
          </Grid>
        )
      }
    }
  ]
  useEffect(() => {
    const showAction = transactions?.some(
      transaction => transaction.status !== 'CLEARED' && transaction.transactionType !== 'PURCHASE_ORDER'
    )
    setColumnVisible({ action: showAction })
  }, [isDesktop, transactions])

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          gap: 3,
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'flex-start',
          mb: 2
        }}
      >
        <IconButton
          color='secondary'
          sx={{ fontSize: '21px' }}
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
            horizontal: 'left'
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left'
          }}
          getData={handleDateRange}
        />
        <Typography sx={{ ml: 'auto', fontSize: '14px', fontWeight: 500, textAlign: 'right' }}>
          <span style={{ fontSize: '13px', color: '#959595' }}>Balance:</span> {lastRunningBal}
        </Typography>
      </Box>

      {transactionsLoading ? (
        <LinearProgress sx={{ height: '5px' }} />
      ) : (
        <>
          <Box sx={{ width: '100%' }}>
            <MobileDataGrid
              columns={columns}
              rows={transactions || []}
              columnVisibilityModel={columnVisible}
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
      {openPaymentClearDialog && (
        <ClearPOPayment
          tenantId={tenantId}
          paymentId={selectedTransaction?.purchaseOrderPaymentId}
          openDialog={openPaymentClearDialog}
          setOpenDialog={setOpenPaymentClearDialog}
          handleDateRange={handleDateRange}
          startDate={startDate}
          endDate={endDate}
        />
      )}
      {dialogState?.open && (
        <CommonPoPaymentsPopUp
          paymentId={dialogState?.selectedPaymentId}
          open={dialogState.open}
          onClose={() => setDialogState({ open: false, selectedPaymentId: null })}
        />
      )}

      {purchaseOrderDialogState.open && (
        <CommonPOPopup
          orderId={purchaseOrderDialogState.selectedOrderId}
          open={purchaseOrderDialogState.open}
          onClose={() => setPurchaseOrderDialogState({ open: false, selectedOrderId: null })}
        />
      )}
    </>
  )
}
