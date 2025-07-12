// ** Next Import
import Link from 'next/link'
import Router from 'next/router'
import React, { useEffect, useMemo, useState } from 'react'
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
  Card,
  LinearProgress,
  Tooltip
} from '@mui/material'
import { Close } from '@mui/icons-material'
import Icon from 'src/@core/components/icon'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import PageHeader from 'src/@core/components/page-header'
import PageWrapper from 'src/@core/layouts/PageWrapper'
import { useDispatch, useSelector } from 'react-redux'
import { useTheme } from '@mui/material/styles'
import { setSelectedFinancialAccounts } from 'src/store/apps/financial-Accounts'
import StyledButton from 'src/common-components/StyledMuiButton'
import {
  dataTextStyles,
  dataTitleStyles,
  DateFunction,
  findObjectByCurrencyId,
  hasPermission,
  lastMonthDate,
  NumberFormat
} from 'src/common-functions/utils/UtilityFunctions'
import CustomNoRowsOverlay from 'src/common-components/CustomNoRowsOverlay'
import { getAllFinancialAccountTransactionsQuery } from 'src/@core/components/graphql/financial-account-queries'
import { fetchData } from 'src/common-functions/GraphqlOperations'
import { setSelectedCustomer } from 'src/store/apps/customers'
import { setSelectedVendor } from 'src/store/apps/vendors'
import { CREATE_ACCOUNT, EDIT_ACCOUNT } from 'src/common-functions/utils/Constants'
import CommonCustomerPopup from 'src/common-components/CommonCustomerPopup'
import CommonVendorPopup from 'src/common-components/CommonVendorPopup'
import CommonSoPopup from 'src/common-components/CommonSoPopup'
import CommonPOPopup from 'src/common-components/CommonPOPopup'
import CommonSoPaymentsPopUp from 'src/common-components/CommonSoPaymentsPopUp'
import CommonPoPaymentsPopUp from 'src/common-components/CommonPoPaymentsPopUp'
import CommonDateRangeFilter from 'src/common-components/CommonDateRangeFilter'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import CustomTextField from 'src/@core/components/mui/text-field'
import RefreshIcon from '@mui/icons-material/Refresh'
import MobileDataGrid from 'src/common-components/MobileDataGrid'
import useCustomers from 'src/hooks/getData/useCustomers'
import AccountsFilter from './AccountsFilter'

export default function ViewFinancialAccount({ accountData, financialAccountloading }) {
  const route = Router
  const dispatch = useDispatch()
  const account = useSelector(state => state.financialAccounts.selectedAccounts) || {}
  const userProfile = useSelector(state => state.userProfile)
  const tenantId = useSelector(state => state.tenants?.selectedTenant?.tenantId)
  const { customers, fetchCustomers } = useCustomers(tenantId)
  const {
    financialAccounts = [],
    currencies = [],
    popayments = [],
    vendors = [],
    salesOrders = [],
    purchaseOrders = [],
    salesPayments = []
  } = accountData || {}

  const [transactionsLoading, setTransactionsLoading] = useState(true)
  const [transactions, setTransactions] = useState([])
  const [filteredTransactions, setFilteredTransactions] = useState([])
  const moduleFilterDateDuration = useSelector(
    state => state.otherSettings?.data?.moduleFilterDateDuration || undefined
  )
  const [startDate, setStartDate] = useState(lastMonthDate(moduleFilterDateDuration))
  const [endDate, setEndDate] = useState(new Date())

  const [openCustomerDialog, setOpenCustomerDialog] = useState(false)
  const [customerForDialog, setCustomerForDialog] = useState({})
  const [openVendorDialog, setOpenVendorDialog] = useState(false)
  const [vendorForDialog, setVendorForDialog] = useState({})
  console.log('filteredTransactions', filteredTransactions)
  const {
    startDate: rawStartDate,
    endDate: rawEndDate,
    filterVendor,
    filterPurchaseOrder,
    filterCustomer,
    filterSalesOrder
  } = useSelector(state => state.accounts?.filters ?? {})

  const oneMonthAgoDate = useMemo(() => lastMonthDate(moduleFilterDateDuration), [moduleFilterDateDuration])
  const todayDate = useMemo(() => new Date(), [])

  const filterStartDate = new Date(rawStartDate ?? oneMonthAgoDate)
  const filterEndDate = new Date(rawEndDate ?? todayDate)

  const isStartDateChanged = filterStartDate.toDateString() !== oneMonthAgoDate.toDateString()
  const isEndDateChanged = filterEndDate.toDateString() !== todayDate.toDateString()

  // Individual filter checks
  const filters = {
    startDate: isStartDateChanged,
    endDate: isEndDateChanged,
    filterVendor: Boolean(filterVendor),
    filterPurchaseOrder: Boolean(filterPurchaseOrder),
    filterCustomer: Boolean(filterCustomer),
    filterSalesOrder: Boolean(filterSalesOrder)
  }
  const anyFilterActive = Object.values(filters).some(Boolean)
  const [isFilterActive, setFilterActive] = useState({
    filterActive: anyFilterActive,
    ...filters
  })

  useEffect(() => {
    const getCustomerObject = async () => {
      await fetchCustomers()
    }

    getCustomerObject()
  }, [tenantId, fetchCustomers])

  const [purchaseOrderDialogState, setPurchaseOrderDialogState] = useState({
    open: false,
    selectedOrderId: null
  })

  const [dialogState, setDialogState] = useState({
    open: false,
    selectedPaymentId: null
  })
  const [salesDialogState, setSalesDialogState] = useState({
    open: false,
    selectedSalesPaymentId: null
  })
  const [salesOrderDialogState, setSalesOrderDialogState] = useState({
    open: false,
    selectedSalesOrderId: null
  })

  const currency = useMemo(
    () =>
      currencies?.find(item => {
        return item?.currencyId === account?.currency
      }) || {},
    [account, currencies]
  )

  useEffect(() => {
    if (Object.keys(account).length === 0) {
      route.push('/accounting/accounts/')
    }
  }, [account, tenantId])

  const columns = [
    {
      flex: 1,
      field: 'transactionDetails',
      renderCell: ({ row }) => {
        const currency = findObjectByCurrencyId(currencies, row?.currency)
        const customer = customers?.find(item => item?.customerId === row?.customerId) || null
        const vendor = vendors?.find(item => item?.vendorId === row?.vendorId) || null
        const sopayment = salesPayments?.find(payment => payment?.paymentId === row?.salesOrderPaymentId) || null
        const popayment = popayments?.find(payment => payment?.paymentId === row?.purchaseOrderPaymentId) || null
        const sorder = salesOrders?.find(item => item?.orderId === row?.salesOrderId) || null
        const porder = purchaseOrders?.find(item => item?.orderId === row?.purchaseOrderId) || null

        return (
          <Grid container spacing={3} sx={{ alignItems: 'center', padding: 2 }}>
            <Grid item xs={12} sm={2} lg={1.5} xl={2}>
              <Typography sx={dataTextStyles}>{DateFunction(row?.transactionDate)}</Typography>
              <Typography sx={dataTitleStyles}>Date</Typography>
            </Grid>
            <Grid item xs={12} sm={6} lg={4.5} xl={4}>
              <Typography sx={dataTextStyles}>{row?.description}</Typography>
              <Typography sx={dataTitleStyles}>Description</Typography>
            </Grid>
            <Grid item xs={6} sm={2} lg={1} xl={1}>
              <Typography sx={dataTextStyles}>
                <NumberFormat value={row?.credit} currency={currency} />
              </Typography>
              <Typography sx={dataTitleStyles}>Credit</Typography>
            </Grid>
            <Grid item xs={6} sm={2} lg={1} xl={1}>
              <Typography sx={dataTextStyles}>
                <NumberFormat value={row?.debit} currency={currency} />
              </Typography>
              <Typography sx={dataTitleStyles}>Debit</Typography>
            </Grid>
            <Grid item xs={12} sm={3} lg={2} xl={2}>
              {row.salesOrderPaymentId && sopayment && (
                <>
                  <Typography sx={dataTextStyles}>Sales Payment:</Typography>
                  <StyledButton
                    color='primary'
                    onClick={() =>
                      setSalesDialogState({ open: true, selectedSalesPaymentId: row?.salesOrderPaymentId })
                    }
                  >
                    #{sopayment?.paymentNo}
                  </StyledButton>
                </>
              )}
            </Grid>

            <Grid item xs={12} sm={3} lg={2} xl={2}>
              {customer && (
                <>
                  <Typography sx={dataTextStyles}>Customer:</Typography>
                  <StyledButton
                    color='primary'
                    onClick={() => {
                      dispatch(setSelectedCustomer(customer))
                      setCustomerForDialog(customer)
                      setOpenCustomerDialog(true)
                    }}
                  >
                    {customer?.customerName}
                  </StyledButton>
                </>
              )}
            </Grid>
            <Grid item xs={12} sm={3} lg={2} xl={2}>
              {row.salesOrderId && sorder && (
                <>
                  <Typography sx={dataTextStyles}>Sales Order:</Typography>
                  <StyledButton
                    color='primary'
                    onClick={() => setSalesOrderDialogState({ open: true, selectedSalesOrderId: row.salesOrderId })}
                  >
                    #{sorder?.orderNo}
                  </StyledButton>{' '}
                </>
              )}
            </Grid>

            <Grid item xs={12} sm={3} lg={2} xl={2}>
              {vendor && (
                <>
                  <Typography sx={dataTextStyles}>Vendor:</Typography>
                  <StyledButton
                    color='primary'
                    onClick={() => {
                      dispatch(setSelectedVendor(vendor))
                      setOpenVendorDialog(true)
                      setVendorForDialog(vendor)
                    }}
                  >
                    {vendor?.displayName}
                  </StyledButton>
                </>
              )}
            </Grid>
            <Grid item xs={12} sm={3} lg={2} xl={2}>
              {row.purchaseOrderId && porder && (
                <>
                  <Typography sx={dataTextStyles}>Purchase Order:</Typography>
                  <StyledButton
                    color='primary'
                    onClick={() => setPurchaseOrderDialogState({ open: true, selectedOrderId: row?.purchaseOrderId })}
                  >
                    #{porder?.orderNo}
                  </StyledButton>
                </>
              )}
            </Grid>
            <Grid item xs={12} sm={3} lg={2} xl={2}>
              {row.purchaseOrderPaymentId && popayment && (
                <>
                  <Typography sx={dataTextStyles}>Payment:</Typography>
                  <StyledButton
                    color='primary'
                    onClick={() => setDialogState({ open: true, selectedPaymentId: row?.purchaseOrderPaymentId })}
                  >
                    #{popayment?.paymentNo}
                  </StyledButton>
                </>
              )}
            </Grid>
            <Grid item xs={12} sm={3} lg={2} xl={2}>
              <Typography sx={dataTextStyles}>
                <NumberFormat value={row?.runningBalance} currency={currency} />
              </Typography>
              <Typography sx={dataTitleStyles}>Balance</Typography>
            </Grid>
          </Grid>
        )
      }
    }
  ]

  const fetchAccountTransactions = async (startDate, endDate) => {
    // setStartDate(startDate)
    // setEndDate(endDate)

    try {
      setTransactionsLoading(true)
      const accountData = await fetchData(
        getAllFinancialAccountTransactionsQuery(account?.tenantId, account?.accountId, startDate, endDate)
      )
      const { getAccountTransactionsByDateRange } = accountData
      getAccountTransactionsByDateRange.sort((a, b) => new Date(b.createdDateTime) - new Date(a.createdDateTime))
      setTransactions(getAccountTransactionsByDateRange)
    } catch (error) {
      console.error('Error', error)
    } finally {
      setTransactionsLoading(false)
      console.log('Fetched data by date range successfully')
    }
  }

  useEffect(() => {
    if (account) {
      fetchAccountTransactions(startDate, endDate)
    }
  }, [account])

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
            View Account - {account?.accountNumber}
          </Typography>
        }
        button={
          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
            {hasPermission(userProfile, CREATE_ACCOUNT) && (
              <Button
                variant='contained'
                color='primary'
                sx={{ display: { xs: 'none', sm: 'flex' } }}
                startIcon={<AddOutlinedIcon />}
                component={Link}
                scroll={true}
                href={`/accounting/accounts/add-accounts/`}
              >
                Add New
              </Button>
            )}
            {hasPermission(userProfile, EDIT_ACCOUNT) && (
              <IconButton
                component={Link}
                scroll={true}
                href={`/accounting/accounts/edit/${account?.accountId}`}
                onClick={() => dispatch(setSelectedFinancialAccounts(account))}
              >
                <Icon icon='tabler:edit' />
              </IconButton>
            )}
            <IconButton component={Link} scroll={true} href='/accounting/accounts/'>
              <Close sx={{ color: theme => theme.palette.primary.main }} />
            </IconButton>
          </Box>
        }
      />

      <PageWrapper>
        {financialAccountloading ? (
          <LinearProgress />
        ) : (
          <div>
            <Grid container spacing={{ xs: 5, xl: 10 }}>
              <Grid item xs={12}>
                <Grid item xs={12} sm={6} md={6} lg={4} xl={4}>
                  <CustomAutocomplete
                    options={financialAccounts || []}
                    getOptionLabel={option => `${option.accountNumber} - ${option.accountName}`}
                    value={financialAccounts.find(option => option.accountId === account.accountId) || null}
                    onChange={(e, newValue) => {
                      dispatch(setSelectedFinancialAccounts(newValue))
                    }}
                    disableClearable
                    renderInput={params => <CustomTextField {...params} fullWidth label='Accounts' />}
                  />
                </Grid>
              </Grid>

              <Grid item xs={12} lg={12} xl={12}>
                <Card sx={{ p: 6 }}>
                  <Grid container spacing={{ xs: 5, xl: 10 }}>
                    <Grid item xs={12}>
                      <Grid
                        container
                        spacing={{ xs: 0, xl: 6 }}
                        sx={{ display: 'flex', justifyContent: 'space-between' }}
                      >
                        <Grid item xs={12} sm={8} md={8} lg={7} xl={6.5}>
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
                                  <Typography
                                    sx={{
                                      fontSize: '14px',
                                      fontWeight: 500,
                                      lineHeight: '26px',
                                      color: '#4567c6 !important',
                                      textAlign: 'left'
                                    }}
                                  >
                                    #{account?.accountNumberPrefix}
                                    {account?.accountNumber}{' '}
                                  </Typography>
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>
                                  <Typography className='data-name'>Account Name: {account?.accountName}</Typography>
                                </TableCell>
                              </TableRow>

                              {/* <TableRow>
                                <TableCell>
                                  <Typography className='data-name'>
                                    Description:{' '}
                                    {account?.description ? (
                                      <div>
                                        <pre
                                          style={{
                                            fontFamily: 'inherit',
                                            whiteSpace: 'pre-wrap'
                                          }}
                                        >
                                          {account?.description}
                                        </pre>
                                      </div>
                                    ) : (
                                      '-'
                                    )}
                                  </Typography>
                                </TableCell>
                              </TableRow> */}
                            </TableBody>
                          </Table>
                        </Grid>
                        <Grid item xs={12} sm={4} md={4} lg={3.5} xl={3.5}>
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
                                  <Typography className='data-name'>Account Type: {account?.accountType}</Typography>
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>
                                  <Typography className='data-name'>
                                    Account Category: {account?.accountCategory}
                                  </Typography>
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>
                                  <Typography className='data-name'>Report Type: {account?.reportType}</Typography>
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>
                                  <Typography className='data-name'>Currency: {currency?.currencyId}</Typography>
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography
                            className='data-name'
                            sx={{
                              fontSize: '13px',
                              fontWeight: 300,
                              lineHeight: '28px',
                              color: '#000'
                            }}
                          >
                            Description:{' '}
                            {account?.description ? (
                              <div>
                                <pre
                                  style={{
                                    fontFamily: 'inherit',
                                    whiteSpace: 'pre-wrap'
                                  }}
                                >
                                  {account?.description}
                                </pre>
                              </div>
                            ) : (
                              '-'
                            )}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'space-between', mb: 3 }}>
                        <Typography sx={{ fontSize: '16px', fontWeight: 500 }}>Transactions</Typography>

                        <AccountsFilter
                          anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'right'
                          }}
                          transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right'
                          }}
                          fetchAccountTransactions={fetchAccountTransactions}
                          transactions={transactions}
                          setFilteredTransactions={setFilteredTransactions}
                          isFilterActive={isFilterActive}
                          setFilterActive={setFilterActive}
                        />
                      </Box>

                      {transactionsLoading ? (
                        <LinearProgress />
                      ) : (
                        <>
                          <Box sx={{ width: '100%' }}>
                            <MobileDataGrid
                              columns={columns}
                              // rows={transactions || []}
                              rows={
                                filteredTransactions.length > 0 || isFilterActive.filterActive
                                  ? filteredTransactions
                                  : transactions
                              }
                              getRowId={row => row?.transactionId}
                              initialState={{
                                sorting: {
                                  sortModel: [{ field: 'transactionDate', sort: 'desc' }]
                                }
                              }}
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
                        </>
                      )}
                    </Grid>
                  </Grid>
                </Card>
              </Grid>
            </Grid>
          </div>
        )}
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
        )}{' '}
        {purchaseOrderDialogState.open && (
          <CommonPOPopup
            orderId={purchaseOrderDialogState.selectedOrderId}
            open={purchaseOrderDialogState.open}
            onClose={() => setPurchaseOrderDialogState({ open: false, selectedOrderId: null })}
          />
        )}
        {salesDialogState?.open && (
          <CommonSoPaymentsPopUp
            paymentId={salesDialogState?.selectedSalesPaymentId}
            openSoPaymentDialog={salesDialogState?.open}
            setSoPaymentDialog={() => setSalesDialogState({ open: false, selectedSalesPaymentId: null })}
          />
        )}
        {dialogState?.open && (
          <CommonPoPaymentsPopUp
            paymentId={dialogState?.selectedPaymentId}
            open={dialogState.open}
            onClose={() => setDialogState({ open: false, selectedPaymentId: null })}
          />
        )}
      </PageWrapper>
    </React.Fragment>
  )
}
