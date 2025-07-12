// ** React Imports
import { Fragment } from 'react'

// ** MUI Imports
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import DialogContentText from '@mui/material/DialogContentText'
import { useDispatch } from 'react-redux'
import { writeData } from 'src/common-functions/GraphqlOperations'
import { createAlert } from 'src/store/apps/alerts'
import { DeleteBankTransactionMutation } from 'src/@core/components/graphql/bank-transaction-queries'

const DeleteTransaction = ({ tenantId, deleteTransaction, setOpenDialog, openDialog, setTransactions }) => {
  // ** State
  const dispatch = useDispatch()
  const handleConfirm = async () => {
    try {
      const response = await writeData(DeleteBankTransactionMutation(), {
        tenantId,
        transactionId: deleteTransaction?.transactionId
      })
      if (response.deleteBankTransaction) {
        dispatch(createAlert({ message: 'transaction deleted successfully !', type: 'success' }))
        setTransactions(data => data?.filter(item => item.transactionId !== deleteTransaction?.transactionId))
      } else {
        dispatch(createAlert({ message: 'transaction deletion failed !', type: 'error' }))
      }
    } catch (error) {
      // Handle any errors and optionally dispatch an error action
      throw error
    } finally {
      setOpenDialog(false)
    }
  }

  const handleClose = () => {
    setOpenDialog(false)
  }
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
        <DialogTitle id='alert-dialog-title'>Delete Transaction?</DialogTitle>
        <DialogContent>
          <DialogContentText id='alert-dialog-description'>
            Please Click on confirm button to delete item otherwise click cancel to close dialog
          </DialogContentText>
        </DialogContent>
        <DialogActions className='dialog-actions-dense'>
          <Button variant='outlined' onClick={handleClose}>
            Cancel
          </Button>
          <Button variant='contained' onClick={handleConfirm}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Fragment>
  )
}

export default DeleteTransaction
