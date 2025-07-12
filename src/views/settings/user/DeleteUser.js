// ** React Imports
import { Fragment } from 'react'
// ** MUI Imports
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import DialogContentText from '@mui/material/DialogContentText'
import { writeData } from 'src/common-functions/GraphqlOperations'
import { createAlert } from 'src/store/apps/alerts'
import { useDispatch } from 'react-redux'
import { DeleteUserAccountMutation } from 'src/@core/components/graphql/user-account-queries'
import { setDeleteUserAccount } from 'src/store/apps/user'

const DeleteUser = ({ setOpenDialog, openDialog, username }) => {
  const dispatch = useDispatch()
  const handleConfirm = async () => {
    setOpenDialog(false)
    try {
      const response = await writeData(DeleteUserAccountMutation(), { username })
      if (response.deleteUserAccount) {
        dispatch(setDeleteUserAccount(username))
        dispatch(createAlert({ message: 'User Deleted successfully !', type: 'success' }))
      } else {
        dispatch(createAlert({ message: 'User Delation failed !', type: 'error' }))
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
        <DialogTitle id='alert-dialog-title'>Delete Vendor?</DialogTitle>
        <DialogContent>
          <DialogContentText id='alert-dialog-description'>
            Please Click on confirm button to delete vendor otherwise click cancel to close dialog
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

export default DeleteUser
