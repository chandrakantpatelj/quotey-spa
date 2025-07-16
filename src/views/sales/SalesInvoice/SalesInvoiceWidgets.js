import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

import { Box, Card, CardContent, CardHeader, Grid, IconButton, LinearProgress, Typography } from '@mui/material'

import { TabList, TabPanel } from '@mui/lab'
import TabContext from '@mui/lab/TabContext'

import { useTheme } from '@mui/material/styles'

import RefreshIcon from '@mui/icons-material/Refresh'
import { getSalesInvoicePaymentsForSalesInvoiceQuery } from 'src/@core/components/graphql/sales-payment-queries'
import CommonSoPaymentsPopUp from 'src/common-components/CommonSoPaymentsPopUp'
import CustomNoRowsOverlay from 'src/common-components/CustomNoRowsOverlay'
import MobileDataGrid from 'src/common-components/MobileDataGrid'
import StyledButton from 'src/common-components/StyledMuiButton'
import { fetchData } from 'src/common-functions/GraphqlOperations'
import {
  dataTextStyles,
  dataTitleStyles,
  DateFunction,
  NumberFormat,
  renderTabs,
  rowStatusChip
} from 'src/common-functions/utils/UtilityFunctions'
import useCurrencies from 'src/hooks/getData/useCurrencies'
import useSalesInvoices from 'src/hooks/getData/useSaleInvoices'

const tabData = [
  {
    type: 'payments',
    avatarIcon: 'fluent:payment-20-regular'
  },
  {
    type: 'emails',
    avatarIcon: 'fluent:mail-20-regular'
  }
]

const renderTabPanels = (value, tabPanelData, setSalesDialogState, reloadSalesInvoiceInStore, selectedInvoice) => {
  const { currencies, salesPayments, loading, salesInvoiceLoading } = tabPanelData
  console.log('selectedInvoice', selectedInvoice)

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

        return (
          <Grid container spacing={3} sx={{ alignItems: 'center' }}>
            <Grid item xs={6}>
              <Typography sx={{ ...dataTextStyles }}>{date}</Typography>
              <Box sx={{ color: '#959595' }}>
                <StyledButton
                  color='primary'
                  onClick={() => setSalesDialogState({ open: true, selectedSalesPaymentId: row?.paymentId })}
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
            <Grid item xs={3} sx={{ textAlign: 'right' }}>
              {rowStatusChip(row?.status)}
            </Grid>
          </Grid>
        )
      }
    }
  ]

  const invoiceHistoryColumns = [
    {
      flex: 0.35,
      minWidth: 300,
      field: 'sentDateTime',
      headerName: '',
      renderCell: params => {
        const { row } = params
        const dateObj = new Date(row?.sentDateTime)

        const sentToEmails = row?.sentTo?.length ? row.sentTo.map((email, idx) => email) : '—'

        const ccToEmails = row?.sentCC?.length ? row.sentCC.map((email, idx) => email) : '-'

        console.log('ccToEmails', row?.sentCC)

        return (
          <Grid container spacing={1} sx={{ alignItems: 'center' }}>
            <Grid item xs={3}>
              <Typography sx={{ color: '#959595', fontSize: '12px', fontWeight: 600 }}>
                {DateFunction(dateObj.toLocaleDateString())}
              </Typography>
              <Typography sx={{ color: '#959595', fontSize: '12px', fontWeight: 600 }}>
                {dateObj.toLocaleTimeString('en-AU', { timeZone: 'Australia/Sydney' })}
              </Typography>
              <Typography sx={dataTitleStyles}>Date</Typography>
            </Grid>

            <Grid item xs={6}>
              <Typography sx={{ color: '#959595', fontSize: '12px' }}>
                <span style={{ fontWeight: 600 }}> To:</span> {sentToEmails}
              </Typography>

              {row?.sentCC?.length > 0 && (
                <Typography sx={{ color: '#959595', fontSize: '12px' }}>
                  <span style={{ fontWeight: 600 }}> CC:</span> {ccToEmails}
                </Typography>
              )}
            </Grid>

            <Grid item xs={3} sx={{ textAlign: 'right' }}>
              {rowStatusChip(row?.status)}
            </Grid>
          </Grid>
        )
      }
    }
  ]

  switch (value) {
    case 'payments':
      return (
        <TabPanel key={value} value={value}>
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
    case 'emails':
      return (
        <TabPanel key={value} value={value}>
          {salesInvoiceLoading ? (
            <LinearProgress />
          ) : (
            <>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: 3
                }}
              >
                <IconButton
                  onClick={async () => {
                    await reloadSalesInvoiceInStore(selectedInvoice?.invoiceId || null)
                  }}
                >
                  <RefreshIcon />
                </IconButton>
              </Box>
              <MobileDataGrid
                hideFooter
                columns={invoiceHistoryColumns}
                rows={selectedInvoice?.invoiceSentHistory || []}
                getRowId={row => row?.messageId}
                initialState={{
                  sorting: {
                    sortModel: [{ field: 'sentDateTime', sort: 'desc' }]
                  }
                }}
                slots={{
                  columnHeaders: () => null,
                  noRowsOverlay: CustomNoRowsOverlay
                }}
                slotProps={{
                  noRowsOverlay: {
                    mainText: 'No emails have been sent yet.'
                  }
                }}
              />
            </>
          )}
        </TabPanel>
      )
  }
}

const SalesInvoiceWidgets = ({ selectedInvoice }) => {
  const [value, setValue] = useState('payments')
  const [salesDialogState, setSalesDialogState] = useState({
    open: false,
    selectedSalesPaymentId: null
  })
  const theme = useTheme()

  const handleChange = (event, newValue) => {
    setValue(newValue)
  }
  const tenantId = useSelector(state => state.tenants?.selectedTenant?.tenantId)
  const { currencies } = useCurrencies()

  const [salesPayments, setSalesPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const { reloadSalesInvoiceInStore, salesInvoiceLoading } = useSalesInvoices(tenantId)

  const getSalesOrderPayments = async () => {
    if (!selectedInvoice?.invoiceId || !selectedInvoice?.salesOrderId) {
      setSalesPayments([])
      return
    }

    try {
      setLoading(true)

      const response = await fetchData(
        getSalesInvoicePaymentsForSalesInvoiceQuery(tenantId, selectedInvoice.invoiceId, selectedInvoice.salesOrderId)
      )
      const payments = response.getSalesInvoicePaymentsForSalesInvoice

      setSalesPayments(payments || [])
    } catch (error) {
      console.error('Failed to fetch sales order payments:', error)
      setSalesPayments([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (value !== 'payments') return
    getSalesOrderPayments()
  }, [selectedInvoice, value])

  const tabPanelData = { currencies, salesPayments, loading, salesInvoiceLoading }
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
              {renderTabs(value, theme, tabData, selectedInvoice)}
            </TabList>
            {renderTabPanels(value, tabPanelData, setSalesDialogState, reloadSalesInvoiceInStore, selectedInvoice)}
          </TabContext>
        </CardContent>
      </Card>
      {salesDialogState?.open &&
        (value === 'payments' ? (
          <CommonSoPaymentsPopUp
            paymentId={salesDialogState?.selectedSalesPaymentId}
            openSoPaymentDialog={salesDialogState?.open}
            setSoPaymentDialog={() => setSalesDialogState({ open: false, selectedSalesPaymentId: null })}
          />
        ) : null)}
    </>
  )
}

export default SalesInvoiceWidgets
