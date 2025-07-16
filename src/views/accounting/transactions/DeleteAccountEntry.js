import { Fragment } from 'react'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import DialogContentText from '@mui/material/DialogContentText'
import { useDispatch } from 'react-redux'
import { writeData } from 'src/common-functions/GraphqlOperations'
import { createAlert } from 'src/store/apps/alerts'
import { deleteAccountEntryMutation } from 'src/@core/components/graphql/account-transaction-queries'
import { setDeleteAccountTransaction } from 'src/store/apps/account-transactions'

export default function DeleteAccountEntry({ tenantId, openDialog, setOpenDialog }) {
  const dispatch = useDispatch()

  const handleConfirm = async () => {
    try {
      const response = await writeData(deleteAccountEntryMutation(), { tenantId, transactionId })
      if (response.deleteAccountEntry) {
        dispatch(setDeleteAccountTransaction(transactionId))
        dispatch(createAlert({ message: 'Account Transaction Deleted Successfully!', type: 'success' }))
      } else {
        dispatch(createAlert({ message: 'Account Transaction Deletion failed!', type: 'error' }))
      }
    } catch (error) {
      throw error
    } finally {
      setOpenDialog(false)
    }
  }

  const handleClose = () => setOpenDialog(false)

  return (
    <>
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
          <DialogTitle id='alert-dialog-title'>Delete Account Transaction?</DialogTitle>
          <DialogContent>
            <DialogContentText id='alert-dialog-description'>
              Please click on the confirm button to delete, or click cancel to close the dialog.
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
    </>
  )
}
