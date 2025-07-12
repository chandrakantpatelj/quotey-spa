// ** Next Import
import RefreshIcon from '@mui/icons-material/Refresh'
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import {
  Box,
  Card,
  Grid,
  IconButton,
  LinearProgress,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Tooltip,
  Typography
} from '@mui/material'
import Tab from '@mui/material/Tab'
import { useEffect, useMemo, useState } from 'react'
import { formatPhoneNumberIntl } from 'react-phone-number-input'
import { useSelector } from 'react-redux'
import { getAllCustomerTransactionsQuery } from 'src/@core/components/graphql/customer-queries'
import Icon from 'src/@core/components/icon'
import CommonDateRangeFilter from 'src/common-components/CommonDateRangeFilter'
import CommonInvoicePopUp from 'src/common-components/CommonInvoicePopUp'
import { ShowAddress } from 'src/common-components/CommonPdfDesign'
import CommonSoPaymentsPopUp from 'src/common-components/CommonSoPaymentsPopUp'
import CommonStyledMenu from 'src/common-components/CommonStyledMenu'
import CustomNoRowsOverlay from 'src/common-components/CustomNoRowsOverlay'
import MobileDataGrid from 'src/common-components/MobileDataGrid'
import StyledButton from 'src/common-components/StyledMuiButton'
import { fetchData } from 'src/common-functions/GraphqlOperations'
import { CUSTOMER_PDF, SALES_INVOICE, SALES_INVOICE_PAYMENT } from 'src/common-functions/utils/Constants'
import {
  dataTextStyles,
  dataTitleStyles,
  DateFunction,
  findObjectByCurrencyId,
  NumberFormat,
  rowStatusChip
} from 'src/common-functions/utils/UtilityFunctions'
import useIsDesktop from 'src/hooks/IsDesktop'
import useCurrencies from 'src/hooks/getData/useCurrencies'
import useCustomers from 'src/hooks/getData/useCustomers'
import useDateRangeDefaults from 'src/hooks/getData/useDateRangeDefaults'
import useSalesInvoices from 'src/hooks/getData/useSaleInvoices'
import useSalesPayments from 'src/hooks/getData/useSalesPayment'
import ClearSOPayment from '../Payment/ClearSOPayment'
import CustomerAttachmentTab from './CustomerAttachmentTab'
import { ALL_COLUMNS } from './CustomerListTable'
import CustomerNoteTab from './CustomerNoteTab'

export default function CustomerViewSection({ customerId, defaultTab }) {
  const tenant = useSelector(state => state.tenants?.selectedTenant)
  const { tenantId = '' } = tenant
  const isDesktop = useIsDesktop()
  const { currencies = [] } = useCurrencies()
  const { fetchSalesInvoices } = useSalesInvoices(tenantId)
  const { fetchSalesPayments } = useSalesPayments(tenantId)
  const { fetchSingleCustomer } = useCustomers(tenantId)
  const { oneMonthAgoDate } = useDateRangeDefaults()

  const [salesInvoices, setSalesInvoices] = useState([])
  const [salesPayments, setSalesPayments] = useState([])
  const [customer, setCustomer] = useState(null)

  const [lastClosingBal, setLastClosingBal] = useState('')
  const [lastRunningBal, setLastRunningBal] = useState('')
  const [transactions, setTransactions] = useState([])

  console.log('customer89745', customer)

  const [transactionsLoading, setTransactionsLoading] = useState(true)
  const [tab, setTab] = useState(defaultTab)
  const [anchorElMap, setAnchorElMap] = useState({})
  const [salesInvoiceDialog, setSalesInvoiceDialog] = useState({
    open: false,
    selectedInvoiceId: null
  })
  const [salesDialogState, setSalesDialogState] = useState({
    open: false,
    selectedSalesPaymentId: null
  })
  const [startDate, setStartDate] = useState(oneMonthAgoDate)
  const [endDate, setEndDate] = useState(new Date())
  const [openPaymentClearDialog, setOpenPaymentClearDialog] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      const salesPayments = await fetchSalesPayments()
      const res = await fetchSalesInvoices()
      setSalesInvoices(res)
      setSalesPayments(salesPayments)
    }
    fetchData()
  }, [fetchSalesInvoices, fetchSalesPayments])

  useEffect(() => {
    const getCustomerObject = async () => {
      const customer = await fetchSingleCustomer(customerId)

      if (customer) {
        setCustomer(customer)
      }
    }

    getCustomerObject()
  }, [tenantId, customerId])

  useEffect(() => {
    if (tab === 'transactions') {
      handleDateRange(startDate, endDate)
    }
  }, [customerId])

  const currency = useMemo(
    () =>
      currencies?.find(item => {
        return item?.currencyId === customer?.currencyId
      }) || {},
    [customer, currencies]
  )

  const handleMenuClick = (event, row) => {
    // dispatch(setSelectedPackages(row))
    const updatedAnchorElMap = { ...anchorElMap }
    updatedAnchorElMap[row.transactionId] = event.currentTarget
    setAnchorElMap(updatedAnchorElMap)
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

  const handleTabChange = (event, newValue) => {
    setTab(newValue)
    if (newValue === 'transactions') {
      const startDate = oneMonthAgoDate
      handleDateRange(oneMonthAgoDate, endDate)
    }
  }

  const handleDateRange = async (startDate, endDate) => {
    setStartDate(startDate)
    setEndDate(endDate)
    try {
      setTransactionsLoading(true)
      const customerTransactions = await fetchData(
        getAllCustomerTransactionsQuery(tenantId, customerId, startDate, endDate)
      )
      const { getCustomerTransactionsByDateRange } = customerTransactions
      getCustomerTransactionsByDateRange.sort((a, b) => new Date(b.createdDateTime) - new Date(a.createdDateTime))
      if (getCustomerTransactionsByDateRange) {
        setLastClosingBal(getCustomerTransactionsByDateRange[0]?.closingBalance)
        setLastRunningBal(getCustomerTransactionsByDateRange[0]?.runningBalance)
      }

      setTransactions(getCustomerTransactionsByDateRange)
    } catch (error) {
      console.error('Error', error)
    } finally {
      setTransactionsLoading(false)
      console.log('Fetched data by date range successfully')
    }
  }

  // if (!isAuthorized) {
  //   return null
  // }
  const columns = [
    {
      flex: 0.25,
      minWidth: 100,
      field: 'transactionDate',
      renderCell: ({ row }) => {
        const currency = findObjectByCurrencyId(currencies, row?.currency)

        let invoice = null
        let payment = null

        if (row.transactionType === SALES_INVOICE_PAYMENT && row.salesInvoicePaymentId != null) {
          payment = salesPayments?.find(payment => payment?.paymentId === row?.salesInvoicePaymentId) || null
        } else if (row.transactionType === SALES_INVOICE && row.salesInvoiceId != null) {
          invoice = salesInvoices?.find(item => item?.invoiceId === row?.salesInvoiceId) || null
        }

        return (
          <Box sx={{ width: '100%', p: 2 }}>
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
                            onClick={() =>
                              setSalesDialogState({ open: true, selectedSalesPaymentId: row?.salesInvoicePaymentId })
                            }
                          >
                            #{payment?.paymentNo}
                          </StyledButton>
                        </Box>
                      ) : (
                        invoice && (
                          <Box sx={{ color: '#959595' }}>
                            Invoice:{' '}
                            <StyledButton
                              color='primary'
                              onClick={() =>
                                setSalesInvoiceDialog({ open: true, selectedInvoiceId: row.salesInvoiceId })
                              }
                            >
                              #{invoice?.invoiceNo}
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
                <IconButton
                  aria-label='more'
                  id='long-button'
                  aria-haspopup='true'
                  onClick={event => handleMenuClick(event, row)}
                  disabled={row.status !== 'CLEARED' && row.transactionType !== SALES_INVOICE ? true : false}
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
              </Grid>
            </Grid>
          </Box>
        )
      }
    }
  ]
  return customer != '' ? (
    <>
      <TabContext value={tab}>
        <TabList
          textColor='inherit'
          allowScrollButtonsMobile={true}
          scrollButtons={'auto'}
          onChange={handleTabChange}
          sx={{
            top: '0px',
            background: '#FFF',
            '& .MuiTabPanel-root': {
              p: { xs: '10px 0px !important', md: '15px !important' }
            }
          }}
        >
          <Tab label='Overview' value='overview' />
          <Tab
            label='Transactions'
            value='transactions'
            // onClick={() => {
            //   if (customer) {
            //     handleDateRange(startDate, endDate)
            //   }
            // }}
          />
          <Tab label='Notes' value='notes' />
          <Tab label='Attachments' value='attachments' />
        </TabList>

        <TabPanel
          value='overview'
          sx={{
            p: { xs: '10px 0px !important', md: '15px !important' }
          }}
        >
          <Card sx={{ p: 5 }}>
            <Grid item xs={12}>
              <Table
                sx={{
                  width: '100%',
                  border: 0,
                  marginBottom: '30px',
                  '& .MuiTableCell-root': {
                    border: 0,
                    padding: '0px !important',
                    verticalAlign: 'top',
                    width: '50%'
                  },
                  '& .MuiTableCell-root .data-name': {
                    fontSize: '13px',
                    color: '#818181',
                    lineHeight: '28px'
                  },
                  '& .MuiTableCell-root .data-value': {
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#000',
                    lineHeight: '28px'
                  }
                }}
              >
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={2}>
                      <Typography
                        sx={{
                          fontSize: '14px',
                          fontWeight: 500,
                          lineHeight: '26px',
                          color: '#4567c6 !important',
                          textAlign: 'left'
                        }}
                      >
                        #{customer?.customerNo}
                      </Typography>
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell>
                      <Typography className='data-name'>Customer Name: {customer?.customerName}</Typography>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <Typography className='data-name'>Display Name: {customer?.displayName}</Typography>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <Typography className='data-name'>Company Name: {customer?.companyName} </Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Grid>

            <Grid item xs={12}>
              <Grid container spacing={6} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Grid item xs={12} sm={6} md={6}>
                  <Typography
                    sx={{
                      fontSize: '14px',
                      fontWeight: 500,
                      lineHeight: '22px',
                      mb: 2
                    }}
                  >
                    Primary Contact
                  </Typography>
                  <Table
                    sx={{
                      width: '100%',
                      border: 0,
                      marginBottom: '30px',
                      '& .MuiTableCell-root': {
                        width: '50%',
                        border: 0,
                        verticalAlign: 'top !important',
                        padding: '0px !important'
                      },
                      '& .MuiTableCell-root .data-name': {
                        fontSize: '13px',
                        color: '#818181',
                        lineHeight: '28px'
                      },
                      '& .MuiTableCell-root .data-value': {
                        fontSize: '13px',
                        fontWeight: 500,
                        color: '#000',
                        lineHeight: '28px'
                      }
                    }}
                  >
                    <TableBody>
                      <TableRow>
                        <TableCell>
                          <Typography className='data-name'>
                            {customer?.primaryContact?.firstName} {customer?.primaryContact?.lastName}
                          </Typography>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <Typography className='data-name' sx={{ display: 'flex', gap: 1 }}>
                            <a
                              href='mailto:emailAddress'
                              style={{ color: 'inherit', textDecoration: 'none', wordBreak: 'break-all' }}
                            >
                              {' '}
                              {customer?.emailAddress}
                            </a>{' '}
                          </Typography>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <Typography className='data-name'>
                            {formatPhoneNumberIntl(`+${customer?.mobile}`)}{' '}
                          </Typography>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <Typography className='data-name'>
                            {formatPhoneNumberIntl(`+${customer?.workPhone}`)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                      <ShowAddress data={customer?.billingAddress} />
                    </TableBody>
                  </Table>
                </Grid>
                <Grid item xs={12} sm={6} md={6}>
                  <Typography
                    sx={{
                      fontSize: '14px',
                      fontWeight: 500,
                      lineHeight: '22px',
                      mb: 2
                    }}
                  >
                    Delivery Address
                  </Typography>
                  <Table
                    sx={{
                      width: '100%',
                      border: 0,
                      marginBottom: '30px',
                      '& .MuiTableCell-root': {
                        width: '50%',
                        border: 0,
                        verticalAlign: 'top !important',
                        padding: '0px !important'
                      },
                      '& .MuiTableCell-root .data-name': {
                        fontSize: '13px',
                        color: '#818181',
                        lineHeight: '28px'
                      },
                      '& .MuiTableCell-root .data-value': {
                        fontSize: '13px',
                        fontWeight: 500,
                        color: '#000',
                        lineHeight: '28px'
                      }
                    }}
                  >
                    <TableBody>
                      <TableRow>
                        <TableCell colSpan={2}>
                          <ShowAddress data={customer?.deliveryAddress} />
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              {' '}
              <Typography
                sx={{
                  fontSize: '14px',
                  fontWeight: 500,
                  lineHeight: '22px',
                  mb: 2
                }}
              >
                Other Details
              </Typography>
              <Table
                sx={{
                  width: '100%',
                  border: 0,
                  '& .MuiTableCell-root': {
                    border: 0,
                    padding: '0px !important',
                    verticalAlign: 'top',
                    width: '50%'
                  },
                  '& .MuiTableCell-root .data-name': {
                    fontSize: '13px',
                    color: '#818181',
                    lineHeight: '28px'
                  },
                  '& .MuiTableCell-root .data-value': {
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#000',
                    lineHeight: '28px'
                  }
                }}
              >
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <Typography className='data-name'>
                        Currency: {currency?.symbol} {currency?.currencyId}
                      </Typography>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <Typography className='data-name'>Payment Term : {customer?.paymentTerms}</Typography>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <Typography className='data-name'>
                        Shipping Preference : {customer?.shippingPreference}
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Grid>
          </Card>
        </TabPanel>

        <TabPanel
          value='transactions'
          sx={{
            p: { xs: '10px 0px !important', md: '15px !important' }
          }}
        >
          <Box
            sx={{
              display: 'flex',
              gap: 3,
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'flex-end',
              mb: 2
            }}
          >
            <Tooltip title='Reload' placement='top'>
              <IconButton
                color='default'
                onClick={() => {
                  handleDateRange(startDate, endDate)
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
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
                  columnVisibilityModel={ALL_COLUMNS}
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
        </TabPanel>

        <TabPanel
          value='notes'
          sx={{
            p: { xs: '10px 0px !important', md: '15px !important' }
          }}
        >
          <CustomerNoteTab customer={customer} />
        </TabPanel>

        <TabPanel
          value='attachments'
          sx={{
            p: { xs: '10px 0px !important', md: '15px !important' }
          }}
        >
          <CustomerAttachmentTab order={customer} folderName={CUSTOMER_PDF} />
        </TabPanel>
      </TabContext>
      {salesInvoiceDialog.open && (
        <CommonInvoicePopUp
          invoiceId={salesInvoiceDialog.selectedInvoiceId}
          open={salesInvoiceDialog.open}
          setOpen={setSalesInvoiceDialog}
        />
      )}
      {salesDialogState?.open && (
        <CommonSoPaymentsPopUp
          paymentId={salesDialogState?.selectedSalesPaymentId}
          openSoPaymentDialog={salesDialogState?.open}
          setSoPaymentDialog={() => setSalesDialogState({ open: false, selectedSalesPaymentId: null })}
        />
      )}
      {openPaymentClearDialog && (
        <ClearSOPayment
          tenantId={tenantId}
          paymentId={selectedTransaction?.salesInvoicePaymentId}
          openDialog={openPaymentClearDialog}
          setOpenDialog={setOpenPaymentClearDialog}
          handleDateRange={handleDateRange}
          startDate={startDate}
          endDate={endDate}
        />
      )}
    </>
  ) : null
}
