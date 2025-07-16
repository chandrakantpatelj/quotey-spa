// ** Next Import

import { useEffect, useState } from 'react'
import CustomNoRowsOverlay from 'src/common-components/CustomNoRowsOverlay'
import {
  dataTextStyles,
  dataTitleStyles,
  DateFunction,
  findObjectByCurrencyId,
  NumberFormat,
  rowStatusChip
} from 'src/common-functions/utils/UtilityFunctions'
import useCurrencies from 'src/hooks/getData/useCurrencies'
import { useDispatch, useSelector } from 'react-redux'
import { Box, Grid, IconButton, LinearProgress, MenuItem, Typography } from '@mui/material'
import { fetchData, writeData } from 'src/common-functions/GraphqlOperations'
import {
  getClearedPurchaseOrderPayablesQuery,
  undoPaymentClearingForPurchaseOrderPayableQuery
} from 'src/@core/components/graphql/purchases-payment-queries'
import StyledButton from 'src/common-components/StyledMuiButton'
import CommonPOPopup from 'src/common-components/CommonPOPopup'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import CommonStyledMenu from 'src/common-components/CommonStyledMenu'
import Icon from 'src/@core/components/icon'
import { resetPurchaseOrder } from 'src/store/apps/purchaseorder'
import { createAlert } from 'src/store/apps/alerts'
import ShipmentPopup from '../Shipment/ShipmentPopup'
import MobileDataGrid from 'src/common-components/MobileDataGrid'

const ClearedPurchaseOrdersPayableList = ({ tenantId, paymentId }) => {
  const localCurrency = useSelector(state => state?.currencies?.selectedCurrency) || {}
  const { currencies } = useCurrencies()
  const dispatch = useDispatch()

  const [loading, setLoading] = useState(false)

  const [purchasePayablesList, setPurchasePayablesList] = useState([])

  const getClearedPurchaseOrderPayables = async () => {
    setLoading(true)
    try {
      const response = await fetchData(getClearedPurchaseOrderPayablesQuery(tenantId, paymentId))

      if (response?.getClearedPurchaseOrderPayables) {
        setPurchasePayablesList(response?.getClearedPurchaseOrderPayables)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
      console.log('Fetched data  successfully')
    }
  }

  useEffect(() => {
    getClearedPurchaseOrderPayables()
  }, [tenantId, paymentId])

  const [dialogState, setDialogState] = useState({
    open: false,
    selectedOrderId: null
  })

  const [shipmentPopupState, setShipmentPopupState] = useState({
    open: false,
    selectedShipmentId: null
  })
  const [anchorElMap, setAnchorElMap] = useState({})

  const handleClick = (event, row) => {
    // dispatch(setActionPayment(row))
    const updatedAnchorElMap = { ...anchorElMap }
    updatedAnchorElMap[row.purchaseOrderPayableId] = event.currentTarget
    setAnchorElMap(updatedAnchorElMap)
  }

  const handleClose = row => {
    const updatedAnchorElMap = { ...anchorElMap }
    updatedAnchorElMap[row.purchaseOrderPayableId] = null
    setAnchorElMap(updatedAnchorElMap)
  }

  const handleUndoClearedPOPayables = async row => {
    const { purchaseOrderPayableId } = row
    const updatedAnchorElMap = { ...anchorElMap }
    updatedAnchorElMap[row.purchaseOrderPayableId] = null
    setAnchorElMap(updatedAnchorElMap)
    try {
      const response = await writeData(undoPaymentClearingForPurchaseOrderPayableQuery(), {
        tenantId,
        purchaseOrderPayableId
      })
      const { undoPaymentClearingForPurchaseOrderPayable } = response
      if (undoPaymentClearingForPurchaseOrderPayable) {
        getClearedPurchaseOrderPayables()
        dispatch(resetPurchaseOrder())
        dispatch(createAlert({ message: 'Undo Payment Clearing successfully!', type: 'success' }))
      } else {
        dispatch(createAlert({ message: 'Undo Payment Clearing Failed!', type: 'error' }))
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    }
  }

  const columns = [
    {
      field: 'purchaseOrderPayableId',
      headerName: '',
      flex: 1,
      sortable: false,
      renderCell: ({ row }) => {
        const clearingDate = DateFunction(row?.clearingDate)
        let date = null

        if (row?.purchaseOrderNo !== null) {
          date = DateFunction(row?.purchaseOrderDate)
        } else if (row?.purchaseOrderShipmentNo !== null) {
          date = DateFunction(row?.purchaseOrderShipmentDate)
        }
        const currency = findObjectByCurrencyId(currencies, row?.payableCurrency)

        const paidCurrency = currencies?.find(currency => currency.currencyId === row?.payableCurrency) || {}

        const getOrder = () => {
          if (row?.purchaseOrderNo !== null) {
            return (
              <StyledButton
                color='primary'
                onClick={() => setDialogState({ open: true, selectedOrderId: row?.purchaseOrderId })}
              >
                # {row?.purchaseOrderNoPrefix || ''}
                {row?.purchaseOrderNo}
              </StyledButton>
            )
          } else if (row?.purchaseOrderShipmentNo !== null) {
            return (
              <StyledButton
                color='primary'
                onClick={() => setShipmentPopupState({ open: true, selectedShipmentId: row?.purchaseOrderShipmentId })}
              >
                # {row?.purchaseOrderShipmentNoPrefix || ''}
                {row?.purchaseOrderShipmentNo}
              </StyledButton>
            )
          }
        }

        return (
          <Box sx={{ width: '100%', p: 2 }}>
            <Grid container spacing={3} sx={{ alignItems: 'center' }}>
              <Grid item xs={11} md={11.5}>
                <Grid container spacing={3} sx={{ alignItems: 'center' }}>
                  <Grid item xs={6} md={1.5}>
                    <Typography sx={dataTextStyles}>{clearingDate}</Typography>
                    <Typography sx={dataTitleStyles}>Clearing Date</Typography>
                  </Grid>
                  <Grid item xs={6} md={1.5}>
                    <Typography sx={{ fontSize: '13px', color: '#696969' }}>
                      <Icon icon='wi:time-4' style={{ verticalAlign: 'middle', marginRight: '5px' }} width={16} />
                      {date}
                    </Typography>
                    {getOrder()}
                  </Grid>
                  <Grid item xs={6} md={2.5}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', fontSize: '12px' }}>
                      <NumberFormat value={row?.payableAmount} currency={currency} />
                      <NumberFormat value={row?.amountInLocalCurrency} currency={localCurrency} />
                    </Box>
                    <Typography sx={dataTitleStyles}>Payable Amount</Typography>
                  </Grid>
                  <Grid item xs={6} md={2.5}>
                    <Box sx={{ fontSize: '12px' }}>
                      <NumberFormat value={row?.totalPayableAmount} currency={currency} />
                    </Box>
                    <Typography sx={dataTitleStyles}>Total Paybale Amount</Typography>
                  </Grid>
                  <Grid item xs={6} md={2.5}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', fontSize: '12px' }}>
                      <NumberFormat value={row?.totalClearedPayableAmount} currency={paidCurrency} />
                      <NumberFormat value={row?.totalClearedPayableAmountInLocalCurrency} currency={localCurrency} />
                    </Box>
                    <Typography sx={dataTitleStyles}>Total Cleared Payable Amount</Typography>
                  </Grid>
                  <Grid item xs={6} md={1.5}>
                    {rowStatusChip(row?.payableStatus)}
                    <Typography sx={dataTitleStyles}>Status</Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={1} md={0.5} sx={{ alignSelf: { xs: 'flex-start', md: 'center' } }}>
                <>
                  <IconButton
                    aria-label='more'
                    id='long-button'
                    aria-haspopup='true'
                    onClick={event => handleClick(event, row)}
                    disabled={row.payableStatus !== 'PAID' && row.payableStatus !== 'PARTLY_PAID'}
                  >
                    <MoreVertIcon />
                  </IconButton>
                  <CommonStyledMenu
                    anchorEl={anchorElMap[row.purchaseOrderPayableId]}
                    open={Boolean(anchorElMap[row.purchaseOrderPayableId])}
                    onClose={() => handleClose(row)}
                  >
                    <MenuItem onClick={() => handleUndoClearedPOPayables(row)}>
                      <Icon icon={'iconamoon:do-undo-light'} />
                      Undo Cleared Payable
                    </MenuItem>
                  </CommonStyledMenu>
                </>
              </Grid>
            </Grid>
          </Box>
        )
      }
    }
  ]

  return (
    <>
      {loading ? (
        <LinearProgress />
      ) : (
        <>
          {/* <Box sx={{ width: '100%', background: '#80808017', borderRadius: '6px 6px 0px 0px', p: 2.7, mb: 0 }}> */}
          <Typography sx={{ fontSize: '15px', fontWeight: 500, textAlign: 'left', mb: 3 }}>
            Cleared Purchase Order Payables
          </Typography>

          <MobileDataGrid
            hideFooter
            columns={columns}
            rows={purchasePayablesList || []}
            getRowId={row => row?.purchaseOrderPayableId}
            slots={{
              columnHeaders: () => null,
              noRowsOverlay: CustomNoRowsOverlay
            }}
            slotProps={{
              noRowsOverlay: {
                mainText: 'No Data Available'
              }
            }}
          />

          {dialogState.open && (
            <CommonPOPopup
              orderId={dialogState.selectedOrderId}
              open={dialogState.open}
              onClose={() => setDialogState({ open: false, selectedOrderId: null })}
            />
          )}

          {shipmentPopupState.open && (
            <ShipmentPopup
              shipmentId={shipmentPopupState.selectedShipmentId}
              open={shipmentPopupState.open}
              onClose={() => setShipmentPopupState({ open: false, selectedShipmentId: null })}
            />
          )}
        </>
      )}
    </>
  )
}

export default ClearedPurchaseOrdersPayableList
