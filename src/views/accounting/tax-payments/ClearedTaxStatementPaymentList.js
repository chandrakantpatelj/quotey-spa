// ** Next Import

import { useEffect, useState } from 'react'
import { DataGrid } from '@mui/x-data-grid'
import CustomNoRowsOverlay from 'src/common-components/CustomNoRowsOverlay'
import {
  dataTextStyles,
  dataTitleStyles,
  DateFunction,
  NumberFormat,
  rowStatusChip
} from 'src/common-functions/utils/UtilityFunctions'
import useIsDesktop from 'src/hooks/IsDesktop'
import useCurrencies from 'src/hooks/getData/useCurrencies'
import { useDispatch, useSelector } from 'react-redux'
import { Box, Grid, IconButton, LinearProgress, MenuItem, Tooltip, Typography } from '@mui/material'
import { fetchData, writeData } from 'src/common-functions/GraphqlOperations'
import StyledButton from 'src/common-components/StyledMuiButton'
import Icon from 'src/@core/components/icon'

import { undoPaymentClearingForSalesInvoiceReceivableMutation } from 'src/@core/components/graphql/sales-payment-queries'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import CommonStyledMenu from 'src/common-components/CommonStyledMenu'
import { createAlert } from 'src/store/apps/alerts'
import {
  getClearedTaxStatementsForPaymentQuery,
  undoPaymentClearingForTaxStatementMutation
} from 'src/@core/components/graphql/tax-payments-queries'
import { resettaxStatement } from 'src/store/apps/tax-statements'
import MobileDataGrid from 'src/common-components/MobileDataGrid'

export const MOBILE_COLUMNS = {
  clearedAmount: false
}
export const ALL_COLUMNS = {}

const ClearedTaxStatementPaymentList = ({ tenantId, taxPaymentId }) => {
  const isDesktop = useIsDesktop()
  const localCurrency = useSelector(state => state?.currencies?.selectedCurrency) || {}
  const { currencies } = useCurrencies()
  const dispatch = useDispatch()

  const [loading, setLoading] = useState(false)

  const [taxStatementList, setTaxStatementList] = useState([])

  const getClearedTaxStatement = async () => {
    setLoading(true)
    try {
      const response = await fetchData(getClearedTaxStatementsForPaymentQuery(tenantId, taxPaymentId))

      if (response?.getClearedTaxStatementsForPayment) {
        setTaxStatementList(response?.getClearedTaxStatementsForPayment)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
      console.log('Fetched data  successfully')
    }
  }

  useEffect(() => {
    getClearedTaxStatement()
  }, [tenantId, taxPaymentId])

  const [columnVisible, setColumnVisible] = useState(ALL_COLUMNS)

  useEffect(() => {
    const newColumns = isDesktop ? ALL_COLUMNS : MOBILE_COLUMNS
    setColumnVisible(newColumns)
  }, [isDesktop])

  const [dialogState, setDialogState] = useState({
    open: false,
    selectedTaxStatementId: null
  })
  const [anchorElMap, setAnchorElMap] = useState({})

  const handleClose = row => {
    const updatedAnchorElMap = { ...anchorElMap }
    updatedAnchorElMap[row.taxStatementId] = null
    setAnchorElMap(updatedAnchorElMap)
  }

  const handleUndoClearedTaxStatement = async row => {
    const { taxStatementId } = row
    console.log('row', row)
    const updatedAnchorElMap = { ...anchorElMap }
    updatedAnchorElMap[row.taxStatementId] = null
    setAnchorElMap(updatedAnchorElMap)
    try {
      const response = await writeData(undoPaymentClearingForTaxStatementMutation(), {
        tenantId,
        taxStatementId
      })
      const { undoPaymentClearingForTaxStatement } = response
      if (undoPaymentClearingForTaxStatement) {
        getClearedTaxStatement()
        dispatch(resettaxStatement())

        // dispatch(setUpdatePackage(undoPaymentClearingForTaxStatement))
        dispatch(createAlert({ message: 'Undo Payment Clearing successfully!', type: 'success' }))
      } else {
        dispatch(createAlert({ message: 'Undo Payment Clearing Failed!', type: 'error' }))
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    }
  }
  const handleClick = (event, row) => {
    // dispatch(setActionPayment(row))
    const updatedAnchorElMap = { ...anchorElMap }
    updatedAnchorElMap[row.taxStatementId] = event.currentTarget
    setAnchorElMap(updatedAnchorElMap)
  }
  const columns = [
    {
      flex: 1,
      field: 'taxStatementNo',
      renderCell: ({ row }) => {
        const Currency = currencies?.find(currency => currency.currencyId === row?.currency) || {}

        return (
          <Grid
            container
            spacing={3}
            sx={{
              alignItems: 'center',
              display: 'flex', // Ensure items are in one row on larger screens
              flexWrap: { xs: 'wrap', lg: 'nowrap' } // Wrap for mobile, no wrap for larger screens
            }}
          >
            {/* Tax Statement Number */}
            <Grid item xs={12} sm={6} lg={1} xl={1}>
              <StyledButton
                color='primary'
                onClick={() => setDialogState({ open: true, selectedTaxStatementId: row?.taxStatementId })}
              >
                # {row?.salesInvoiceNoPrefix || ''}
                {row?.taxStatementNo}
              </StyledButton>
            </Grid>

            {/* Tax Statement Date */}
            <Grid item xs={6} sm={3} lg={2} xl={2}>
              <Typography sx={dataTextStyles}>{DateFunction(row?.taxStatementDate)}</Typography>
              <Typography sx={dataTitleStyles}>Date</Typography>
            </Grid>

            {/* Clearing Date */}
            <Grid item xs={6} sm={3} lg={2} xl={2}>
              <Typography sx={dataTextStyles}>{DateFunction(row?.clearingDate)}</Typography>
              <Typography sx={dataTitleStyles}>Cleared Date</Typography>
            </Grid>

            {/* Net Statement Amount */}
            <Grid item xs={6} sm={3} lg={2} xl={2}>
              <Typography sx={dataTextStyles}>
                <NumberFormat value={row?.netStatementAmount} currency={Currency} />
              </Typography>
              <Typography sx={dataTitleStyles}>Net Statement Amount</Typography>
            </Grid>

            {/* Cleared Payable Amount */}
            <Grid item xs={6} sm={3} lg={2} xl={2}>
              <Typography sx={dataTextStyles}>
                <NumberFormat value={row?.totalClearedPayableAmount} currency={Currency} />
              </Typography>
              <Typography sx={dataTitleStyles}>Cleared Payable Amount</Typography>
            </Grid>

            {/* Status */}
            <Grid item xs={6} sm={3} lg={1.5} xl={1.5}>
              {rowStatusChip(row?.paymentStatus)}
              <Typography sx={dataTitleStyles}>Status</Typography>
            </Grid>

            {/* Action - Undo Payment */}
            {row.paymentStatus === 'PAID' && (
              <Grid item xs={6} sm={3} lg={1.5} xl={1.5}>
                <Tooltip title='Undo Cleared Payable'>
                  <IconButton color='error' onClick={() => handleUndoClearedTaxStatement(row)}>
                    <Icon icon='iconamoon:do-undo-light' />
                  </IconButton>
                </Tooltip>
              </Grid>
            )}
          </Grid>
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
            Cleared Tax Statement Payable
          </Typography>
          {/* </Box> */}
          <MobileDataGrid
            columns={columns}
            rows={taxStatementList || []}
            getRowId={row => row?.taxStatementId}
            initialState={{
              sorting: {
                sortModel: [{ field: 'taxStatementNo', sort: 'desc' }]
              }
            }}
            slots={{
              columnHeaders: () => null, // Removes column headers for a cleaner mobile view
              noRowsOverlay: CustomNoRowsOverlay
            }}
            slotProps={{
              noRowsOverlay: {
                mainText: 'No Data Available',
                subText: 'No records found. Please add new entries to see data here.'
              }
            }}
          />

          {/* {dialogState.open && (
            <CommonTaxStatementPopup
              statementId={dialogState.selectedTaxStatementId}
              open={dialogState.open}
              onClose={() => setDialogState({ open: false, selectedTaxStatementId: null })}
            />
          )} */}
        </>
      )}
    </>
  )
}

export default ClearedTaxStatementPaymentList
