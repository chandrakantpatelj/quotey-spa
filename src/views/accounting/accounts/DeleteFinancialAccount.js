import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import { Fragment } from 'react'
import { useDispatch } from 'react-redux'
import { deleteFinancialAccountMutation } from 'src/@core/components/graphql/financial-account-queries'
import { writeData } from 'src/common-functions/GraphqlOperations'
import { createAlert } from 'src/store/apps/alerts'
import { setDeleteFinancialAccount, setFinancialAccountLoading } from 'src/store/apps/financial-Accounts'

function DeleteFinancialAccount({ tenantId, accountId, openDialog, setOpenDialog }) {
  const dispatch = useDispatch()

  const handleConfirm = async () => {
    setOpenDialog(false)
    try {
      dispatch(setFinancialAccountLoading(true))
      const response = await writeData(deleteFinancialAccountMutation(), { tenantId, accountId })
      if (response.deleteFinancialAccount) {
        dispatch(setDeleteFinancialAccount(accountId))
        dispatch(createAlert({ message: 'Account Deleted successfully !', type: 'success' }))
      } else {
        dispatch(createAlert({ message: 'Account Delation failed !', type: 'error' }))
      }
    } catch (error) {
      console.error(error)
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
        <DialogTitle id='alert-dialog-title'>Delete Account?</DialogTitle>
        <DialogContent>
          <DialogContentText id='alert-dialog-description'>
            Please Click on confirm button to delete otherwise click cancel to close dialog
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

export default DeleteFinancialAccount
