import { Box, Drawer, IconButton, Tooltip, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import Icon from 'src/@core/components/icon'
import { BANK_TRANSACTION_SO_PAYMENT } from 'src/common-functions/utils/Constants'
import { getAdornmentConfig } from 'src/common-functions/utils/UtilityFunctions'
import { DataGrid, gridClasses } from '@mui/x-data-grid'
import StyledButton from 'src/common-components/StyledMuiButton'
import CommonCustomerPopup from 'src/common-components/CommonCustomerPopup'
import { useRouter } from 'next/router'
import { fetchData } from 'src/common-functions/GraphqlOperations'
import { getAllSalesInvoicePaymentsForBankTransaction } from 'src/@core/components/graphql/sales-payment-queries'
import CommonSoPaymentsPopUp from 'src/common-components/CommonSoPaymentsPopUp'
import CommonPoPaymentsPopUp from 'src/common-components/CommonPoPaymentsPopUp'

function ViewRecords({ setViewRecords, transaction, viewRecords, setTransactions, matchedType }) {
  const route = useRouter()

  const { tenantId } = useSelector(state => state.tenants?.selectedTenant)
  //   const currency = useSelector(state => state?.currencies?.selectedCurrency) || {}
  const customers = useSelector(state => state.customers.data || [])
  const [openPopup, setOpenPopup] = useState({})
  const [salesOrderPayments, setSalesOrderPayments] = useState([])
  const [salesDialogState, setSalesDialogState] = useState({
    open: false,
    selectedSalesPaymentId: null
  })
  const [poDialogState, setPoDialogState] = useState({
    open: false,
    selectedPaymentId: null
  })
  async function getPayments() {
    try {
      const { getAllSalesInvoicePayments } = await fetchData(getAllSalesInvoicePaymentsForBankTransaction(tenantId))
      console.log('getAllSalesInvoicePayments', getAllSalesInvoicePayments)
      setSalesOrderPayments(getAllSalesInvoicePayments)
    } catch (error) {
      console.error('error', error)
    }
  }
  useEffect(() => {
    getPayments()
  }, [tenantId])

  const toggleDrawer = open => event => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return
    }
    setViewRecords(open)
  }
  // Handle customer popup open
  const handleCustomerDialog = rowIndex => {
    const popupKey = `${rowIndex}`
    setOpenPopup(prevState => ({
      ...prevState,
      [popupKey]: true // Merge with the existing state
    }))
  }
  // Handle customer popup close
  const handleCloseCustomerDialog = rowIndex => {
    const popupKey = `${rowIndex}`
    setOpenPopup(prevState => ({
      ...prevState,
      [popupKey]: false // Only close the specific popup
    }))
  }
  const isSOPayment = matchedType === BANK_TRANSACTION_SO_PAYMENT
  const columns = [
    {
      flex: 0.4,
      minWidth: 50,
      field: 'paymentId',
      headerName: `${isSOPayment ? 'Sales Invoice Payment' : 'Purchase Payment'}`,
      renderCell: ({ row }) => {
        let paymentExist = {}
        if (isSOPayment) {
          paymentExist = salesOrderPayments.find(payment => payment.paymentId === row.salesInvoicePaymentId)
        } else {
          paymentExist = salesOrderPayments.find(payment => payment.paymentId === row.paymentOrderPaymentId)
        }
        console.log('isSOPayment', isSOPayment)
        console.log('paymentExist', paymentExist)
        return paymentExist ? (
          isSOPayment ? (
            <Box sx={{ color: '#959595' }}>
              <StyledButton
                color='primary'
                onClick={() => setSalesDialogState({ open: true, selectedSalesPaymentId: row?.salesInvoicePaymentId })}
              >
                {row.transactionRefPrefix}
                {row.transactionRef}
              </StyledButton>
            </Box>
          ) : (
            <Box sx={{ color: '#959595' }}>
              <StyledButton
                color='primary'
                onClick={() => setPoDialogState({ open: true, selectedPaymentId: row?.purchaseOrderPaymentId })}
              >
                {`${row.transactionRefPrefix}${row.transactionRef}`}
              </StyledButton>
            </Box>
          )
        ) : row?.transactionRefPrefix || row?.transactionRef ? (
          <Tooltip title='deleted' arrow>
            <span>{`${row.transactionRefPrefix || ''}${row.transactionRef || ''}`}</span>
          </Tooltip>
        ) : null
      }
    },
    {
      flex: 0.4,
      minWidth: 50,
      field: 'customerId',
      headerName: 'Customer Name',
      renderCell: ({ row }) => {
        const customer = customers.find(customer => customer.customerId === row.customerId)
        const rowIndex = row?.transactionRef
        console.log('row', row)
        console.log('customer', customer)

        return (
          <>
            <StyledButton
              color='primary'
              sx={{
                cursor: 'pointer'
              }}
              onClick={() => handleCustomerDialog(rowIndex)}
            >
              {customer?.customerName}
            </StyledButton>
            <CommonCustomerPopup
              customerId={row?.customerId}
              open={openPopup[rowIndex]}
              setOpen={() => handleCloseCustomerDialog(rowIndex)}
            />
          </>
        )
      }
    },
    {
      flex: 0.2,
      minWidth: 80,
      field: 'amount',
      headerName: 'Amount'
    }
  ]
  console.log('viewRecords', viewRecords)
  return (
    <>
      <Drawer
        anchor='right'
        open={viewRecords}
        onClose={toggleDrawer(false)}
        sx={{ '& .MuiDrawer-paper': { width: { xs: '100%', sm: 600 } } }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: { xs: '20px', lg: '22px' },
            borderBottom: '1px solid #DBDBDB'
          }}
        >
          <Typography sx={{ fontSize: { xs: '16px', md: '20px' }, fontWeight: 500 }}>Details</Typography>

          <IconButton
            sx={{ fontSize: '28px' }}
            color='primary'
            onClick={toggleDrawer(false)}
            onKeyDown={toggleDrawer(false)}
          >
            <Icon icon='tabler:x' />
          </IconButton>
        </Box>

        <DataGrid
          columns={columns}
          columnHeaderHeight={50}
          getRowHeight={() => 'auto'}
          sx={{
            [`& .${gridClasses.cell}`]: {
              py: '6px !important'
            }
          }}
          autoHeight={true}
          rows={transaction || []}
          // columnVisibilityModel={columnVisible}
          disableColumnMenu={true}
          disableRowSelectionOnClick
          getRowId={row => row?.transactionRef}
          onRowSelectionModelChange={newSelection => {
            setSelectedRows(newSelection)
          }}
          // slots={{
          //   noRowsOverlay: CustomNoRowsOverlay
          // }}
          slotProps={{
            noRowsOverlay: {
              mainText: 'Empty Details',
              subText: 'No Details available here. Click "Import" button above to get started.'
            }
          }}
        />
      </Drawer>
      {salesDialogState?.open && (
        <CommonSoPaymentsPopUp
          paymentId={salesDialogState?.selectedSalesPaymentId}
          openSoPaymentDialog={salesDialogState?.open}
          setSoPaymentDialog={() => setSalesDialogState({ open: false, selectedSalesPaymentId: null })}
        />
      )}
      {poDialogState?.open && (
        <CommonPoPaymentsPopUp
          paymentId={poDialogState?.selectedPaymentId}
          open={poDialogState.open}
          onClose={() => setPoDialogState({ open: false, selectedPaymentId: null })}
        />
      )}
    </>
  )
}

export default ViewRecords
