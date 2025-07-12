import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Grid,
  IconButton,
  LinearProgress,
  MenuItem,
  Typography
} from '@mui/material'

import { AddOutlined, MoreVert } from '@mui/icons-material'
import { TabList, TabPanel } from '@mui/lab'
import TabContext from '@mui/lab/TabContext'
import { useTheme } from '@mui/material/styles'
import { getPurchaseOrderPayablesRelatedToShipmentQuery } from 'src/@core/components/graphql/purchase-order-shipment-queries'
import {
  GetPurchaseOrderPaymentsForPurchaseOrderShipmentQuery,
  undoPaymentClearingForPurchaseOrderPayableQuery
} from 'src/@core/components/graphql/purchases-payment-queries'
import Icon from 'src/@core/components/icon'
import CommonPoPaymentsPopUp from 'src/common-components/CommonPoPaymentsPopUp'
import CommonStyledMenu from 'src/common-components/CommonStyledMenu'
import CustomNoRowsOverlay from 'src/common-components/CustomNoRowsOverlay'
import MobileDataGrid from 'src/common-components/MobileDataGrid'
import StyledButton from 'src/common-components/StyledMuiButton'
import { fetchData, writeData } from 'src/common-functions/GraphqlOperations'
import { PURCHASE_SHIPMENT_PDF, STATUS_PENDING } from 'src/common-functions/utils/Constants'
import { DateFunction, NumberFormat, renderTabs, rowStatusChip } from 'src/common-functions/utils/UtilityFunctions'
import useCurrencies from 'src/hooks/getData/useCurrencies'
import useTaxAuthorities from 'src/hooks/getData/useTaxAuthorities'
import useVendors from 'src/hooks/getData/useVendors'
import { createAlert } from 'src/store/apps/alerts'
import NewPurchasePaymentDrawer from '../Payment/NewPurchasePaymentDrawer'
import ShipmentAttachmentTab from './ShipmentAttachmentTab'

const tabData = [
  {
    type: 'payments',
    avatarIcon: 'fluent:payment-20-regular'
  },
  {
    type: 'payables',
    avatarIcon: 'material-symbols-light:table-outline'
  },
  {
    type: 'attachments',
    avatarIcon: 'carbon:document-attachment'
  }
]

const ShipmentRelatedRecords = ({ shipment }) => {
  const theme = useTheme()
  const dispatch = useDispatch()

  const [value, setValue] = useState('payments')

  const handleChange = (event, newValue) => {
    setValue(newValue)
  }

  const tenantId = useSelector(state => state.tenants?.selectedTenant?.tenantId)
  const { currencies } = useCurrencies()
  const { vendors } = useVendors(tenantId)
  const { taxAuthorities } = useTaxAuthorities(tenantId)

  const localCurrency = useSelector(state => state?.currencies?.selectedCurrency) || {}

  const [purchasePayments, setPurchasePayments] = useState([])
  const [reloadPayment, setReloadPayment] = useState(false)

  const [loading, setLoading] = useState(true)

  const [dialogState, setDialogState] = useState({
    open: false,
    selectedPaymentId: null
  })

  const paymentcolumns = [
    {
      field: 'paymentNo',
      headerName: '',
      flex: 1,
      sortable: false,
      renderCell: ({ row }) => {
        const currency = currencies?.find(c => c.currencyId === row?.currency) || {}
        const paidCurrency = currencies?.find(c => c.currencyId === row?.paidCurrency) || {}

        return (
          <Box sx={{ width: '100%', p: 2 }}>
            <Grid container spacing={2} sx={{ alignItems: 'center', flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
              <Grid item xs={12} sm={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {/* <Typography sx={{ color: '#4567C6', fontWeight: 600 }}> */}
                  <StyledButton
                    color='primary'
                    onClick={() => setDialogState({ open: true, selectedPaymentId: row.paymentId })}
                  >
                    {row.paymentNoPrefix || ''}
                    {row.paymentNo}
                  </StyledButton>
                  {/* </Typography> */}
                </Box>
                <Typography sx={{ fontSize: '13px', color: '#696969' }}>
                  <Icon icon='wi:time-4' style={{ verticalAlign: 'middle', marginRight: '5px' }} width={16} />
                  {DateFunction(row?.paymentDate) || '-'}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  {row?.paidCurrency !== currency?.currencyId && (
                    <Typography sx={{ fontSize: '13px', color: '#000' }}>
                      <span style={{ color: '#818181' }}>Invoice Amount:</span>{' '}
                      <NumberFormat value={row?.amount} currency={currency} />
                    </Typography>
                  )}
                  <Typography sx={{ fontSize: '13px', color: '#000' }}>
                    {row?.paidCurrency !== currency?.currencyId && (
                      <span style={{ color: '#818181' }}>Paid Amount:</span>
                    )}
                    <NumberFormat value={row?.paidAmount} currency={paidCurrency} />
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={4}>
                {rowStatusChip(row?.status)}
                <Typography sx={{ fontSize: '12px', color: '#818181' }}>Status</Typography>
              </Grid>
            </Grid>
          </Box>
        )
      }
    }
  ]

  const [anchorElMap, setAnchorElMap] = useState({})

  const handleClick = (event, row) => {
    const updatedAnchorElMap = { ...anchorElMap }
    updatedAnchorElMap[row.purchaseOrderPayableId] = event.currentTarget
    setAnchorElMap(updatedAnchorElMap)
  }
  const handleClose = row => {
    const updatedAnchorElMap = { ...anchorElMap }
    updatedAnchorElMap[row.purchaseOrderPayableId] = null
    setAnchorElMap(updatedAnchorElMap)
  }

  const [payables, setPayables] = useState([])
  const [openNewPaymentDrawer, setOpenNewPaymentDrawer] = useState(false)

  const getPurchasePayablesData = async () => {
    setLoading(true)
    const orderId = shipment?.shipmentId
    try {
      const response = await fetchData(getPurchaseOrderPayablesRelatedToShipmentQuery(tenantId, orderId))
      const { getPurchaseOrderPayablesRelatedToShipment = {} } = response || {}
      setPayables(getPurchaseOrderPayablesRelatedToShipment)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const getPurchaseOrderPayments = async () => {
    setLoading(true)
    const purchaseOrderShipmentId = shipment?.shipmentId
    try {
      const response = await fetchData(
        GetPurchaseOrderPaymentsForPurchaseOrderShipmentQuery(tenantId, purchaseOrderShipmentId)
      )
      const { getPurchaseOrderPaymentsForPurchaseOrderShipment = {} } = response || {}
      setPurchasePayments(getPurchaseOrderPaymentsForPurchaseOrderShipment)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    if (value === 'payables') {
      getPurchasePayablesData()
    }
  }, [value])
  useEffect(() => {
    if (value === 'payments') {
      getPurchaseOrderPayments()
    }
  }, [value, shipment, reloadPayment])

  const UndoStatus = async data => {
    const updatedAnchorElMap = { ...anchorElMap }
    updatedAnchorElMap[data.purchaseOrderPayableId] = null
    setAnchorElMap(updatedAnchorElMap)
    const { purchaseOrderPayableId } = data
    try {
      const response = await writeData(undoPaymentClearingForPurchaseOrderPayableQuery(), {
        tenantId,
        purchaseOrderPayableId
      })
      if (response && response.undoPaymentClearingForPurchaseOrderPayable) {
        getPurchasePayablesData()
        dispatch(createAlert({ message: 'Status changed successfully!', type: 'success' }))
      } else {
        dispatch(createAlert({ message: 'Failed to change the status!', type: 'error' }))
      }
    } catch (error) {
      console.error(error)
    }
  }

  const payablecolumns = [
    {
      field: 'payableId',
      headerName: '',
      flex: 1,
      sortable: false,
      renderCell: ({ row }) => {
        const vendor = vendors?.find(item => item?.vendorId === row?.vendorId)
        const taxAuthority = taxAuthorities?.find(item => item?.taxAuthorityId === row?.taxAuthorityId)
        const currency = currencies?.find(c => c.currencyId === row?.payableCurrency) || {}

        return (
          <Box sx={{ width: '100%', p: 2 }}>
            <Grid container spacing={3} sx={{ alignItems: 'flex-start' }}>
              <Grid item xs={11}>
                <Grid container spacing={3} sx={{ alignItems: 'center' }}>
                  <Grid item xs={12} sm={3}>
                    <Typography sx={{ fontSize: '13px', color: '#4567C6' }}>
                      {row?.vendorId ? vendor?.displayName : row?.taxAuthorityId ? taxAuthority?.taxAuthorityName : '-'}{' '}
                    </Typography>
                    <Typography sx={{ fontSize: '13px', color: '#696969' }}>
                      <Icon icon='wi:time-4' width='16px' style={{ verticalAlign: 'middle', marginRight: '5px' }} />
                      {DateFunction(row?.payableDate) || '-'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={3.5}>
                    <table style={{ width: '100%' }}>
                      <tbody>
                        <tr>
                          <td style={{ fontSize: '11.5px', textAlign: 'left' }}>
                            <span style={{ color: '#818181' }}>Payable Amount:</span>
                          </td>
                          <td style={{ fontSize: '11.5px' }}>
                            <NumberFormat value={row?.payableAmount} currency={currency} />
                          </td>
                        </tr>
                        <tr>
                          <td style={{ fontSize: '11.5px', textAlign: 'left' }}>
                            <span style={{ color: '#818181' }}>Tax Amount:</span>
                          </td>
                          <td style={{ fontSize: '11.5px' }}>
                            <NumberFormat value={row?.payableTaxAmount} currency={currency} />
                          </td>
                        </tr>
                        <tr>
                          <td style={{ fontSize: '11.5px', textAlign: 'left' }}>
                            <span style={{ color: '#818181' }}>Total Amount:</span>
                          </td>
                          <td style={{ fontSize: '11.5px' }}>
                            <NumberFormat value={row?.totalPayableAmount} currency={currency} />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </Grid>

                  <Grid item xs={6} sm={3.5}>
                    <Box sx={{ display: 'flex', gap: 0.5, flexDirection: 'column' }}>
                      <Typography sx={{ fontSize: '12px' }}>
                        <NumberFormat value={row?.clearedPayableAmount} currency={currency} />
                      </Typography>
                      {row?.payableCurrency !== localCurrency?.currencyId && (
                        <Typography sx={{ fontSize: '12px' }}>
                          <NumberFormat value={row?.clearedPayableAmountInLocalCurrency} currency={localCurrency} />
                        </Typography>
                      )}
                    </Box>
                    <Typography sx={{ fontSize: '12px', color: '#818181' }}>Cleared Amount</Typography>
                  </Grid>
                  <Grid item xs={6} sm={2}>
                    {rowStatusChip(row?.payableStatus)}
                    <Typography sx={{ fontSize: '12px', color: '#818181' }}>Status</Typography>
                  </Grid>
                  <Grid item xs={12} sm={12}>
                    <Typography sx={{ fontWeight: 500, fontSize: '13px', mb: 1 }}>Clearings:</Typography>
                    {row?.purchaseOrderClearings?.map(item => {
                      const clearingCurrency =
                        currencies?.find(currency => currency.currencyId === item?.currency) || {}
                      return (
                        <Box
                          key={item?.purchaseOrderPayableId}
                          // sx={{ display: 'flex', gap: 1, flexDirection: 'column', mb: 1 }}
                        >
                          <StyledButton
                            color='primary'
                            onClick={() =>
                              setDialogState({ open: true, selectedPaymentId: item.purchaseOrderPaymentId })
                            }
                          >
                            {item.purchaseOrderPaymentId
                              ? `#${item.purchaseOrderPaymentNoPrefix || ''} ${item.purchaseOrderPaymentNo}`
                              : ''}
                            {item.taxStatementId ? `#${item.taxStatementNoPrefix || ''} ${item.taxStatementNo}` : ''}
                          </StyledButton>
                          <Typography sx={{ fontSize: '12px' }}>
                            <NumberFormat value={item?.amount} currency={clearingCurrency} />
                          </Typography>
                          {item?.currency !== localCurrency?.currencyId && (
                            <Typography sx={{ fontSize: '12px' }}>
                              <NumberFormat value={item?.amountInLocalCurrency} currency={localCurrency} />
                            </Typography>
                          )}
                        </Box>
                      )
                    })}
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={1}>
                <IconButton
                  aria-label='more'
                  onClick={event => handleClick(event, row)}
                  disabled={row?.payableStatus === STATUS_PENDING}
                >
                  <MoreVert />
                </IconButton>
                <CommonStyledMenu
                  anchorEl={anchorElMap[row.purchaseOrderPayableId]}
                  open={Boolean(anchorElMap[row.purchaseOrderPayableId])}
                  onClose={() => handleClose(row)}
                >
                  <MenuItem
                    onClick={() => {
                      UndoStatus(row)
                    }}
                  >
                    <Icon icon={'iconamoon:do-undo-light'} />
                    Undo Payment
                  </MenuItem>
                </CommonStyledMenu>
              </Grid>
            </Grid>
          </Box>
        )
      }
    }
  ]
  return (
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
            {renderTabs(value, theme, tabData, shipment)}
          </TabList>

          <TabPanel value='payments'>
            <Box sx={{ height: '100%' }}>
              {loading ? (
                <LinearProgress />
              ) : (
                <>
                  <Box display='flex' justifyContent='flex-end' mb={2}>
                    <Button
                      size='small'
                      variant='contained'
                      startIcon={<AddOutlined />}
                      onClick={() => setOpenNewPaymentDrawer(true)}
                    >
                      add New
                    </Button>
                  </Box>
                  <MobileDataGrid
                    hideFooter
                    columns={paymentcolumns}
                    rows={purchasePayments || []}
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
                        mainText: 'Empty Payments'
                      }
                    }}
                  />{' '}
                </>
              )}
            </Box>
          </TabPanel>
          <TabPanel value='payables'>
            <Box sx={{ height: '100%' }}>
              {loading ? (
                <LinearProgress />
              ) : (
                <MobileDataGrid
                  hideFooter
                  columns={payablecolumns}
                  rows={payables || []}
                  getRowId={row => row?.purchaseOrderPayableId}
                  initialState={{
                    sorting: {
                      sortModel: [{ field: 'purchaseOrderNo', sort: 'desc' }]
                    }
                  }}
                  slots={{
                    columnHeaders: () => null,
                    noRowsOverlay: CustomNoRowsOverlay
                  }}
                  slotProps={{
                    noRowsOverlay: {
                      mainText: 'Empty Purchase Order Payables'
                    }
                  }}
                />
              )}
            </Box>
          </TabPanel>
          <TabPanel
            value='attachments'
            sx={{
              p: { xs: '10px 0px !important', md: '15px !important' }
            }}
          >
            <ShipmentAttachmentTab order={shipment} folderName={PURCHASE_SHIPMENT_PDF} />
          </TabPanel>
        </TabContext>
      </CardContent>
      {openNewPaymentDrawer && (
        <NewPurchasePaymentDrawer
          openDrawer={openNewPaymentDrawer}
          setOpenDrawer={setOpenNewPaymentDrawer}
          reloadPayment={reloadPayment}
          setReloadPayment={setReloadPayment}
          order={shipment}
        />
      )}
      {dialogState.open && (
        <CommonPoPaymentsPopUp
          paymentId={dialogState.selectedPaymentId}
          open={dialogState.open}
          onClose={() => setDialogState({ open: false, selectedPaymentId: null })}
        />
      )}
    </Card>
  )
}

export default ShipmentRelatedRecords
