// ** React Imports
// ** MUI Imports
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import DialogContentText from '@mui/material/DialogContentText'
import { useDispatch, useSelector } from 'react-redux'
import { writeData } from 'src/common-functions/GraphqlOperations'
import { createAlert } from 'src/store/apps/alerts'
import { clearSalesInvoicePaymentMutation } from 'src/@core/components/graphql/sales-payment-queries'
import { resetSalesPayment, setUpdateSalesPayment } from 'src/store/apps/payments'
import { resetSalesOrder } from 'src/store/apps/sales'

const ClearSOPayment = ({ tenantId, paymentId, setOpenDialog, openDialog, handleDateRange, startDate, endDate }) => {
  // ** State
  const dispatch = useDispatch()
  const moduleFilterDateDuration = useSelector(
    state => state.otherSettings?.data?.moduleFilterDateDuration || undefined
  )

  const handleConfirm = async () => {
    try {
      setOpenDialog(false)

      const response = await writeData(clearSalesInvoicePaymentMutation(), { tenantId, paymentId })
      if (response.clearSalesInvoicePayment) {
        dispatch(setUpdateSalesPayment(response.clearSalesInvoicePayment))
        handleDateRange(startDate, endDate)
        dispatch(resetSalesOrder())
        // dispatch(resetSalesPayment())
        dispatch(createAlert({ message: 'Payment Cleared Successfully!', type: 'success' }))
      } else {
        dispatch(createAlert({ message: 'Payment Cleared failed!', type: 'error' }))
      }
    } catch (error) {
      // Handle any errors and optionally dispatch an error action
      console.log('error', error)
    }
  }
  const handleClose = () => setOpenDialog(false)

  return (
    <Dialog
      open={openDialog}
      disableEscapeKeyDown
      aria-labelledby='alert-dialog-title'
      aria-describedby='alert-dialog-description'
      onClose={(event, reason) => {
        if (reason !== 'backdropClick') {
          handleClose()
        }
      }}
    >
      <DialogTitle id='alert-dialog-title'>Clear payment?</DialogTitle>
      <DialogContent>
        <DialogContentText id='alert-dialog-description'>
          Please Click on confirm button to clear payment otherwise click cancel to close dialog
        </DialogContentText>
      </DialogContent>
      <DialogActions className='dialog-actions-dense'>
        <Button onClick={handleClose} variant='outlined'>
          Cancel
        </Button>
        <Button onClick={handleConfirm} variant='contained'>
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ClearSOPayment
