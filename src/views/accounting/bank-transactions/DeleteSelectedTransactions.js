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
import { DeleteBankTransactionsMutation } from 'src/@core/components/graphql/bank-transaction-queries'

const DeleteSelectedTransactions = ({ tenantId, selectedRows, setOpenDialog, openDialog, setTransactions }) => {
  // ** State
  const dispatch = useDispatch()
  const handleConfirm = async () => {
    try {
      const response = await writeData(DeleteBankTransactionsMutation(), {
        tenantId,
        transactionIds: selectedRows
      })
      if (response.deleteBankTransactions) {
        dispatch(createAlert({ message: 'Transactions deleted successfully !', type: 'success' })),
          setTransactions(data => data.filter(row => !response.deleteBankTransactions.includes(row.transactionId)))
      } else {
        dispatch(createAlert({ message: 'Transactions deletion failed !', type: 'error' }))
      }
    } catch (error) {
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
        <DialogTitle id='alert-dialog-title'>Delete Selected Transactions?</DialogTitle>
        <DialogContent>
          <DialogContentText id='alert-dialog-description'>
            Please Click on confirm button to delete selected transactions otherwise click cancel to close dialog.
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

export default DeleteSelectedTransactions
