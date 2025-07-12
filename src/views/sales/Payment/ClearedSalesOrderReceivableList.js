// ** Next Import

import { useEffect, useState } from 'react'
import CustomNoRowsOverlay from 'src/common-components/CustomNoRowsOverlay'
import {
  dataTextStyles,
  dataTitleStyles,
  DateFunction,
  NumberFormat,
  rowStatusChip
} from 'src/common-functions/utils/UtilityFunctions'
import useCurrencies from 'src/hooks/getData/useCurrencies'
import { useDispatch } from 'react-redux'
import { Box, Grid, IconButton, LinearProgress, MenuItem, Typography } from '@mui/material'
import { fetchData, writeData } from 'src/common-functions/GraphqlOperations'
import StyledButton from 'src/common-components/StyledMuiButton'
import Icon from 'src/@core/components/icon'

import {
  getClearedSalesInvoiceReceivablesQuery,
  undoPaymentClearingForSalesInvoiceReceivableMutation
} from 'src/@core/components/graphql/sales-payment-queries'
import { createAlert } from 'src/store/apps/alerts'
import CommonInvoicePopUp from 'src/common-components/CommonInvoicePopUp'
import MobileDataGrid from 'src/common-components/MobileDataGrid'
import CommonStyledMenu from 'src/common-components/CommonStyledMenu'
import { MoreVert } from '@mui/icons-material'

const ClearedSalesOrderReceivableList = ({ tenantId, paymentId }) => {
  const { currencies } = useCurrencies()
  const dispatch = useDispatch()

  const [loading, setLoading] = useState(false)

  const [salesPayablesList, setSalesPayablesList] = useState([])

  const getClearedSalesInvoiceReceivables = async () => {
    setLoading(true)
    try {
      const response = await fetchData(getClearedSalesInvoiceReceivablesQuery(tenantId, paymentId))

      if (response?.getClearedSalesInvoiceReceivables) {
        setSalesPayablesList(response?.getClearedSalesInvoiceReceivables)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
      console.log('Fetched data  successfully')
    }
  }

  useEffect(() => {
    getClearedSalesInvoiceReceivables()
  }, [tenantId, paymentId])

  const [dialogState, setDialogState] = useState({
    open: false,
    selectedInvoiceId: null
  })

  const handleUndoClearedSOReceievables = async row => {
    const { salesInvoiceReceivableId } = row
    const updatedAnchorElMap = { ...anchorElMap }
    updatedAnchorElMap[row.salesInvoiceReceivableId] = null
    setAnchorElMap(updatedAnchorElMap)
    try {
      const response = await writeData(undoPaymentClearingForSalesInvoiceReceivableMutation(), {
        tenantId,
        salesInvoiceReceivableId
      })
      const { undoPaymentClearingForSalesInvoiceReceivable } = response
      if (undoPaymentClearingForSalesInvoiceReceivable) {
        getClearedSalesInvoiceReceivables()

        // dispatch(setUpdatePackage(undoPaymentClearingForSalesInvoiceReceivable))
        dispatch(createAlert({ message: 'Undo Receievables successfully!', type: 'success' }))
      } else {
        dispatch(createAlert({ message: 'Undo Receievables Failed!', type: 'error' }))
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    }
  }

  const [anchorElMap, setAnchorElMap] = useState({})

  const handleClick = (event, row) => {
    // dispatch(setActionPayment(row))
    const updatedAnchorElMap = { ...anchorElMap }
    updatedAnchorElMap[row.salesInvoiceReceivableId] = event.currentTarget
    setAnchorElMap(updatedAnchorElMap)
  }

  const handleClose = row => {
    const updatedAnchorElMap = { ...anchorElMap }
    updatedAnchorElMap[row.salesInvoiceReceivableId] = null
    setAnchorElMap(updatedAnchorElMap)
  }
  const columns = [
    {
      flex: 1,
      field: 'salesInvoiceNo',
      renderCell: ({ row }) => {
        const Currency = currencies?.find(currency => currency.currencyId === row?.receivableCurrency) || {}
        const clearedCurrency = currencies?.find(currency => currency.currencyId === row?.clearedCurrency) || {}

        return (
          <Box sx={{ width: '100%', p: 2 }}>
            <Grid container spacing={3} sx={{ alignItems: 'center' }}>
              <Grid item xs={11} md={11.5}>
                <Grid container spacing={3} sx={{ alignItems: 'center' }}>
                  <Grid item xs={12} sm={12} md={12} lg={1.5}>
                    <StyledButton
                      color='primary'
                      onClick={() => setDialogState({ open: true, selectedInvoiceId: row?.salesInvoiceId })}
                    >
                      # {row?.salesInvoiceNoPrefix || ''}
                      {row?.salesInvoiceNo}
                    </StyledButton>
                  </Grid>
                  <Grid item xs={6} sm={2} md={2} lg={1.5}>
                    <Typography sx={dataTextStyles}>{DateFunction(row?.salesInvoiceDate)}</Typography>
                    <Typography sx={dataTitleStyles}>Invoice Date</Typography>
                  </Grid>
                  <Grid item xs={6} sm={2} md={2} lg={1.5}>
                    <Typography sx={dataTextStyles}>{DateFunction(row?.clearingDate)}</Typography>
                    <Typography sx={dataTitleStyles}>Date</Typography>
                  </Grid>
                  <Grid item xs={6} sm={2} md={2} lg={2}>
                    <Typography sx={dataTextStyles}>
                      <NumberFormat value={row?.totalReceivableAmount} currency={Currency} />
                    </Typography>
                    <Typography sx={dataTitleStyles}>Receivable Amount</Typography>
                  </Grid>
                  <Grid item xs={6} sm={2} md={2} lg={2.5}>
                    <Typography sx={dataTextStyles}>
                      <NumberFormat value={row?.totalClearedReceivableAmount} currency={Currency} />
                    </Typography>
                    <Typography sx={dataTitleStyles}>Cleared Receivable Amount</Typography>
                  </Grid>
                  <Grid item xs={6} sm={2} md={2} lg={1.5}>
                    <Typography sx={dataTextStyles}>
                      <NumberFormat value={row?.clearedAmount} currency={clearedCurrency} />
                    </Typography>
                    <Typography sx={dataTitleStyles}>Cleared Amount</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3} md={3} lg={1.5}>
                    {rowStatusChip(row?.receivableStatus)}
                    <Typography sx={dataTitleStyles}>Status</Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={1} md={0.5} sx={{ alignSelf: { xs: 'flex-start', md: 'center' } }}>
                <IconButton
                  aria-label='more'
                  id='long-button'
                  aria-haspopup='true'
                  onClick={event => handleClick(event, row)}
                  disabled={row.receivableStatus !== 'CLEARED' && row.receivableStatus !== 'PARTLY_CLEARED'}
                >
                  <MoreVert />
                </IconButton>

                <CommonStyledMenu
                  anchorEl={anchorElMap[row.salesInvoiceReceivableId]}
                  open={Boolean(anchorElMap[row.salesInvoiceReceivableId])}
                  onClose={() => handleClose(row)}
                >
                  <MenuItem onClick={() => handleUndoClearedSOReceievables(row)}>
                    <Icon icon={'iconamoon:do-undo-light'} />
                    Undo Cleared Payable
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
    <>
      {loading ? (
        <LinearProgress />
      ) : (
        <>
          {/* <Box sx={{ width: '100%', background: '#80808017', borderRadius: '6px 6px 0px 0px', p: 2.7, mb: 0 }}> */}
          <Typography sx={{ fontSize: '15px', fontWeight: 500, textAlign: 'left', mb: 3 }}>
            Cleared Sales Invoice Receivable
          </Typography>
          {/* </Box> */}

          <MobileDataGrid
            hideFooter
            rows={salesPayablesList || []}
            columns={columns}
            getRowId={row => row?.salesInvoiceReceivableId}
            initialState={{
              sorting: {
                sortModel: [{ field: 'salesInvoiceNo', sort: 'desc' }]
              }
            }}
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
            <CommonInvoicePopUp
              invoiceId={dialogState.selectedInvoiceId}
              open={dialogState.open}
              setOpen={setDialogState}
            />
          )}
        </>
      )}
    </>
  )
}

export default ClearedSalesOrderReceivableList
