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
import { RemovePermissionMutation } from 'src/@core/components/graphql/user-account-queries'
import { setLoading, setSelectedUserObject, setUpdateUserAccount } from 'src/store/apps/user'

const DeletePermission = ({ setOpen, open, username, permissionId }) => {
  const dispatch = useDispatch()
  const handleConfirm = async () => {
    // setUserObject(prev => ({
    //   ...prev,
    //   users: prev.users.filter(user => user.username !== username)
    // }))
    setOpen(false)
    try {
      dispatch(setLoading(true))
      const response = await writeData(RemovePermissionMutation(), { username, permissionId })
      if (response.removePermission) {
        dispatch(setUpdateUserAccount(response.removePermission))
        dispatch(setSelectedUserObject(response.removePermission))
        dispatch(createAlert({ message: 'Permission removed successfully !', type: 'success' }))
      } else {
        dispatch(createAlert({ message: 'Failed to remove permission!', type: 'error' }))
      }
    } catch (error) {
      console.error(error)
    }
  }
  const handleClose = () => setOpen(false)

  return (
    <Fragment>
      <Dialog
        open={open}
        disableEscapeKeyDown
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') {
            handleClose()
          }
        }}
      >
        <DialogTitle id='alert-dialog-title'>Delete Permission?</DialogTitle>
        <DialogContent>
          <DialogContentText id='alert-dialog-description'>
            Please Click on confirm button to delete permission otherwise click cancel to close dialog
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

export default DeletePermission
