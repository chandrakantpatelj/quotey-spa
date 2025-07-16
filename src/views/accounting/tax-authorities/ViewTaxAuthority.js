// ** Next Import
import Link from 'next/link'
import Router from 'next/router'
import { Fragment, useEffect, useState } from 'react'
import PageHeader from 'src/@core/components/page-header'
import PageWrapper from 'src/@core/layouts/PageWrapper'
import {
  Box,
  Button,
  IconButton,
  TableBody,
  TableCell,
  TableRow,
  Typography,
  Grid,
  Card,
  Tab,
  LinearProgress
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { useDispatch, useSelector } from 'react-redux'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import Icon from 'src/@core/components/icon'
import { Close } from '@mui/icons-material'
import {
  dataTextStyles,
  dataTitleStyles,
  DateFunction,
  dynamicSort,
  findObjectByCurrencyId,
  hasPermission,
  lastMonthDate,
  NumberFormat,
  rowStatusChip
} from 'src/common-functions/utils/UtilityFunctions'
import { CommonViewTable } from 'src/common-components/CommonPdfDesign'
import { setSelectedTaxAuthority } from 'src/store/apps/tax-authority'
import { formatPhoneNumberIntl } from 'react-phone-number-input'
import { CREATE_TAX_AUTHORITIES, EDIT_TAX_AUTHORITIES } from 'src/common-functions/utils/Constants'
import useTaxAuthorities from 'src/hooks/getData/useTaxAuthorities'
import { TabContext, TabList, TabPanel } from '@mui/lab'
import CommonDateRangeFilter from 'src/common-components/CommonDateRangeFilter'
import MobileDataGrid from 'src/common-components/MobileDataGrid'
import { GetTaxAuthorityTransactionsByDateRangeQuery } from 'src/@core/components/graphql/tax-authorities-queries'
import CustomNoRowsOverlay from 'src/common-components/CustomNoRowsOverlay'
import { fetchData } from 'src/common-functions/GraphqlOperations'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import CustomTextField from 'src/@core/components/mui/text-field'
import useCurrencies from 'src/hooks/getData/useCurrencies'
import useTaxPayments from 'src/hooks/getData/useTaxPayments'
import useTaxStatements from 'src/hooks/getData/useTaxStatements'
import TaxStatementPopup from '../tax-statements/TaxStatementPopup'
import StyledButton from 'src/common-components/StyledMuiButton'

export default function ViewTaxAuthority() {
  const theme = useTheme()
  const route = Router
  const dispatch = useDispatch()
  const tenantId = useSelector(state => state.tenants?.selectedTenant?.tenantId || null)
  const userProfile = useSelector(state => state.userProfile)

  const { taxAuthorities: allData } = useTaxAuthorities(tenantId)
  const { currencies = [] } = useCurrencies()
  const { taxStatements, loading: taxStatementsLoading } = useTaxStatements(tenantId)

  const { taxPayments, loading: paymentsLoading } = useTaxPayments(tenantId)

  const taxAuthorities = dynamicSort(allData, 'taxAuthorityCode')

  const taxAuthority = useSelector(state => state?.taxAuthority?.selectedTaxAuthority)

  const moduleFilterDateDuration = useSelector(
    state => state.otherSettings?.data?.moduleFilterDateDuration || undefined
  )

  const [startDate, setStartDate] = useState(lastMonthDate(moduleFilterDateDuration))
  const [endDate, setEndDate] = useState(new Date())
  const [transactions, setTransactions] = useState([])

  const [salesOrderDialogState, setSalesOrderDialogState] = useState({
    open: false,
    selectedTaxStatementId: null
  })

  const [anchorElMap, setAnchorElMap] = useState({})

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

  const columns = [
    {
      flex: 0.25,
      minWidth: 100,
      field: 'transactionDate',
      renderCell: ({ row }) => {
        const currency = findObjectByCurrencyId(currencies, row?.currency)

        let statement = null
        let payment = null

        if (row.transactionType === 'TAX_PAYMENT' && row.taxPaymentId != null) {
          payment = taxPayments?.find(payment => payment?.paymentId === row?.taxPaymentId) || null
        } else if (row.transactionType === 'TAX_STATEMENT' && row.taxStatementId != null) {
          statement = taxStatements?.find(item => item?.statementId === row?.taxStatementId) || null
        }

        return (
          <Grid container spacing={3} sx={{ alignItems: 'center' }}>
            <Grid item xs={11.5}>
              <Grid container spacing={2} sx={{ alignItems: 'center' }}>
                <Grid item xs={12} md={6} lg={7.5}>
                  <Typography sx={{ ...dataTextStyles, lineHeight: '28px' }}>
                    {DateFunction(row?.transactionDate)} {rowStatusChip(row?.status)}
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    {payment ? (
                      <Box sx={{ color: '#959595' }}>
                        Payment:{'  '}
                        {/* <StyledButton
                          color='primary'
                          onClick={() => setSalesDialogState({ open: true, selectedSalesPaymentId: row?.taxPaymentId })}
                        > */}
                        #{payment?.paymentNo}
                        {/* </StyledButton> */}
                      </Box>
                    ) : (
                      statement && (
                        <Box sx={{ color: '#959595' }}>
                          Statement:{'  '}
                          <StyledButton
                            color='primary'
                            onClick={() =>
                              setSalesOrderDialogState({ open: true, selectedTaxStatementId: row.taxStatementId })
                            }
                          >
                            #{statement?.statementNo}
                          </StyledButton>
                        </Box>
                      )
                    )}
                  </Box>
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
                </Grid>
                <Grid item xs={3} md={2} lg={1.5}>
                  <Typography sx={dataTextStyles}>
                    <NumberFormat value={row?.credit} currency={currency} />
                  </Typography>
                  <Typography sx={dataTitleStyles}> Credit</Typography>
                </Grid>
                <Grid item xs={3} md={2} lg={1.5}>
                  <Typography sx={dataTextStyles}>
                    <NumberFormat value={row?.debit} currency={currency} />
                  </Typography>
                  <Typography sx={dataTitleStyles}> debit</Typography>
                </Grid>
                <Grid item xs={3} md={2} lg={1.5}>
                  <Typography sx={dataTextStyles}>
                    <NumberFormat value={row?.runningBalance} currency={currency} />
                  </Typography>
                  <Typography sx={dataTitleStyles}> Balance</Typography>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={0.5}>
              {/* <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                {row.status !== 'CLEARED' && row.transactionType !== 'SALES_ORDER' && (
                  <>
                    <IconButton
                      aria-label='more'
                      id='long-button'
                      aria-haspopup='true'
                      onClick={event => handleMenuClick(event, row)}
                    >
                      <MoreVert />
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
                  </>
                )}
              </Box> */}
            </Grid>
          </Grid>
        )
      }
    }
  ]

  const [transactionsLoading, setTransactionsLoading] = useState(true)
  const [lastClosingBal, setLastClosingBal] = useState(0)
  const [lastRunningBal, setLastRunningBal] = useState(0)

  const [tab, setTab] = useState('overview')

  const handleTabChange = (event, newValue) => {
    setTab(newValue)
    if (newValue === 'transactions') {
      const startDate = lastMonthDate(moduleFilterDateDuration)
      handleDateRange(startDate, endDate)
    }
  }
  const handleDateRange = async (startDate, endDate) => {
    setStartDate(startDate)
    setEndDate(endDate)
    try {
      setTransactionsLoading(true)
      const taxAuthorityTransactions = await fetchData(
        GetTaxAuthorityTransactionsByDateRangeQuery(
          taxAuthority?.tenantId,
          taxAuthority?.taxAuthorityId,
          startDate,
          endDate
        )
      )
      const { getTaxAuthorityTransactionsByDateRange } = taxAuthorityTransactions
      getTaxAuthorityTransactionsByDateRange.sort((a, b) => new Date(b.createdDateTime) - new Date(a.createdDateTime))
      if (getTaxAuthorityTransactionsByDateRange) {
        setLastClosingBal(getTaxAuthorityTransactionsByDateRange[0]?.closingBalance)
        setLastRunningBal(getTaxAuthorityTransactionsByDateRange[0]?.runningBalance)
      }

      setTransactions(getTaxAuthorityTransactionsByDateRange)
    } catch (error) {
      console.error('Error', error)
    } finally {
      setTransactionsLoading(false)
      console.log('Fetched data by date range successfully')
    }
  }

  useEffect(() => {
    if (tab === 'transactions') {
      handleDateRange(startDate, endDate)
    }
  }, [taxAuthority])

  useEffect(() => {
    if (Object.keys(taxAuthority).length === 0) {
      route.push('/accounting/tax-authorities/')
    }
  }, [taxAuthority, tenantId])
  return (
    <Fragment>
      <PageHeader
        title={
          <Typography
            sx={{
              fontSize: { xs: '16px', md: '18px' },
              fontWeight: '500'
            }}
          >
            View Tax Authority - {taxAuthority?.taxAuthorityCode}
          </Typography>
        }
        button={
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {hasPermission(userProfile, CREATE_TAX_AUTHORITIES) && (
              <Button
                variant='contained'
                color='primary'
                sx={{ display: { xs: 'none', sm: 'flex' } }}
                startIcon={<AddOutlinedIcon />}
                component={Link}
                scroll={true}
                href={`/accounting/tax-authorities/add`}
              >
                Add New
              </Button>
            )}
            {hasPermission(userProfile, EDIT_TAX_AUTHORITIES) && (
              <IconButton
                variant='outlined'
                sx={{ fontSize: '21px' }}
                component={Link}
                scroll={true}
                href={`/accounting/tax-authorities/edit/${taxAuthority?.taxAuthorityId}`}
                onClick={() => dispatch(setSelectedTaxAuthority(taxAuthority))}
              >
                <Icon icon='tabler:edit' />
              </IconButton>
            )}
            <IconButton
              variant='outlined'
              color='default'
              sx={{ fontSize: '21px' }}
              component={Link}
              scroll={true}
              href='/accounting/tax-authorities/'
            >
              <Close sx={{ color: theme => theme.palette.primary.main }} />
            </IconButton>
          </Box>
        }
      />
      <PageWrapper>
        <Grid container spacing={{ xs: 5, xl: 10 }}>
          <Grid item xs={12} md={12} lg={12} xl={9}>
            <Grid item xs={12} sm={6} md={6} lg={4} xl={4}>
              <CustomAutocomplete
                options={taxAuthorities || []}
                getOptionLabel={option => option?.taxAuthorityName || ''}
                value={taxAuthorities.find(option => option.taxAuthorityId === taxAuthority.taxAuthorityId) || null}
                onChange={(e, newValue) => {
                  dispatch(setSelectedTaxAuthority(newValue))
                }}
                disableClearable
                renderInput={params => <CustomTextField {...params} fullWidth label='taxAuthorities' />}
              />
            </Grid>
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
                <Tab label='Transactions' value='transactions' />
              </TabList>

              <TabPanel
                value='overview'
                sx={{
                  p: { xs: '10px 0px !important', md: '15px !important' }
                }}
              >
                <Card sx={{ p: 6 }}>
                  <Grid container spacing={8}>
                    <Grid item xs={12} sm={12}>
                      <Grid
                        container
                        spacing={{ xs: 3, md: 4 }}
                        sx={{ display: 'flex', justifyContent: 'space-between' }}
                      >
                        <Grid item xs={12} md={6}>
                          <CommonViewTable>
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
                                    #{taxAuthority?.taxAuthorityCode}
                                  </Typography>
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>
                                  <Typography className='data-name'>Name : {taxAuthority?.taxAuthorityName}</Typography>
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>
                                  <Typography className='data-name'>Type : {taxAuthority?.taxAuthorityType}</Typography>
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </CommonViewTable>
                        </Grid>
                        <Grid item xs={12} md={4} xl={3.5}>
                          <CommonViewTable>
                            <TableBody>
                              <TableRow>
                                <TableCell>
                                  <Typography className='data-name'>
                                    Registration No : {taxAuthority?.taxAuthorityRegistration?.registrationNo ?? '-'}
                                  </Typography>
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>
                                  <Typography className='data-name'>
                                    Registration Date :{' '}
                                    {DateFunction(taxAuthority?.taxAuthorityRegistration?.registrationDate)}
                                  </Typography>
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>
                                  <Typography className='data-name'>
                                    Registration ExpiryDate :{' '}
                                    {DateFunction(taxAuthority?.taxAuthorityRegistration?.registrationExpiryDate)}
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </CommonViewTable>
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography
                        sx={{
                          fontSize: '14px',
                          fontWeight: 500,
                          lineHeight: '22px',
                          mb: 2
                        }}
                      >
                        Contact
                      </Typography>
                      <CommonViewTable>
                        <TableBody>
                          <TableRow>
                            <TableCell>
                              <Typography className='data-name'>
                                Name : {taxAuthority?.taxAuthorityContact?.contactName || '-'}
                              </Typography>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <Typography className='data-name'>
                                Email : {taxAuthority?.taxAuthorityContact?.contactEmail || '-'}
                              </Typography>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <Typography className='data-name'>
                                Phone :{formatPhoneNumberIntl(`+${taxAuthority?.taxAuthorityContact?.contactPhone}`)}{' '}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </CommonViewTable>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography
                        sx={{
                          fontSize: '14px',
                          fontWeight: 500,
                          lineHeight: '22px',
                          mb: 2
                        }}
                      >
                        Address
                      </Typography>
                      <CommonViewTable>
                        <TableBody>
                          <TableRow>
                            <TableCell>
                              {taxAuthority?.taxAuthorityAddress &&
                              Object.values(taxAuthority?.taxAuthorityAddress).every(field => !field) ? (
                                <Typography className='data-name'>-</Typography>
                              ) : (
                                <>
                                  <Typography className='data-name'>
                                    {taxAuthority?.taxAuthorityAddress?.addressLine1}
                                    {taxAuthority?.taxAuthorityAddress?.addressLine2 &&
                                      `, ${taxAuthority?.taxAuthorityAddress?.addressLine2}`}
                                  </Typography>
                                  <Typography className='data-name'>
                                    {taxAuthority?.taxAuthorityAddress?.cityOrTown},{' '}
                                    {taxAuthority?.taxAuthorityAddress?.state}
                                  </Typography>
                                  <Typography className='data-name'>
                                    {taxAuthority?.taxAuthorityAddress?.postcode},{' '}
                                    {taxAuthority?.taxAuthorityAddress?.country}
                                  </Typography>
                                </>
                              )}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </CommonViewTable>
                    </Grid>
                    <Grid item xs={12}>
                      <CommonViewTable>
                        <TableBody>
                          <TableRow>
                            <TableCell>
                              <Typography className='data-name' sx={{ lineHeight: '23px' }}>
                                {taxAuthority?.taxAuthorityDescription &&
                                  `Description: ${taxAuthority?.taxAuthorityDescription}`}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </CommonViewTable>
                    </Grid>
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
                    justifyContent: 'space-between',
                    mb: 2
                  }}
                >
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
                        // autoHeight
                        columns={columns}
                        rows={transactions || []}
                        // disableColumnMenu={true}
                        // disableRowSelectionOnClick
                        getRowId={row => row?.transactionId}
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
            </TabContext>
            {salesOrderDialogState.open && (
              <TaxStatementPopup
                statementId={salesOrderDialogState.selectedTaxStatementId}
                open={salesOrderDialogState.open}
                onClose={() => setSalesOrderDialogState({ open: false, selectedTaxStatementId: null })}
              />
            )}
          </Grid>
        </Grid>
      </PageWrapper>
    </Fragment>
  )
}
