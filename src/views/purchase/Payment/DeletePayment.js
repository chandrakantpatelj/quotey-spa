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
import { deletePurchaseOrderPaymentMutation } from 'src/@core/components/graphql/purchases-payment-queries'
import { writeData } from 'src/common-functions/GraphqlOperations'
import { createAlert } from 'src/store/apps/alerts'
import { setDeletePurchasePayment, setPOPaymentLoading } from 'src/store/apps/purchases-payment'

const DeletePurchasePayments = ({ tenantId, paymentId, setOpenDialog, openDialog }) => {
  // ** State
  const dispatch = useDispatch()
  const handleConfirm = async () => {
    try {
      dispatch(setPOPaymentLoading(true))
      const response = await writeData(deletePurchaseOrderPaymentMutation(), { tenantId, paymentId })
      if (response.deletePurchaseOrderPayment) {
        dispatch(setDeletePurchasePayment(paymentId))
        dispatch(createAlert({ message: 'Payment Deleted Successfully!', type: 'success' }))
      } else {
        dispatch(setPOPaymentLoading(false))
        dispatch(
          createAlert({ message: response.errors[0].message || 'Faild to delete purchase payment!', type: 'error' })
        )
      }
    } catch (error) {
      dispatch(setPOPaymentLoading(false))
      console.error(error)
    } finally {
      setOpenDialog(false)
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

export default DeletePurchasePayments
