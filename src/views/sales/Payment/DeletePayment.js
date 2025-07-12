// ** React Imports
import { Fragment } from 'react'
// ** MUI Imports
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import { useDispatch } from 'react-redux'
import { deleteSalesInvoicePaymentMutation } from 'src/@core/components/graphql/sales-payment-queries'
import { writeData } from 'src/common-functions/GraphqlOperations'
import { createAlert } from 'src/store/apps/alerts'
import { setDeleteSalesPayment, setLoading } from 'src/store/apps/payments'

const DeletePayments = ({ tenantId, paymentId, setOpenDialog, openDialog }) => {
  const dispatch = useDispatch()
  const handleConfirm = async () => {
    setOpenDialog(false)
    dispatch(setLoading(true))
    try {
      const response = await writeData(deleteSalesInvoicePaymentMutation(), { tenantId, paymentId })
      if (response.deleteSalesInvoicePayment) {
        dispatch(setDeleteSalesPayment(paymentId))
        dispatch(createAlert({ message: 'Payment Deleted Successfully!', type: 'success' }))
      } else {
        dispatch(createAlert({ message: 'Payment Delation failed!', type: 'error' }))
      }
    } catch (error) {
      console.error(error)
    } finally {
      dispatch(setLoading(false))
    }
  }
  const handleClose = () => setOpenDialog(false)

  return (
    <Fragment>
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
        <DialogTitle id='alert-dialog-title'>Delete payment?</DialogTitle>
        <DialogContent>
          <DialogContentText id='alert-dialog-description'>
            Please Click on confirm button to delete payment otherwise click cancel to close dialog
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
    </Fragment>
  )
}

export default DeletePayments
