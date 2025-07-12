// ** React Imports
import { Fragment } from 'react'

// ** MUI Imports
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import DialogContentText from '@mui/material/DialogContentText'
import { setDeleteProduct } from 'src/store/apps/products'
import { useDispatch } from 'react-redux'
import { writeData } from 'src/common-functions/GraphqlOperations'
import { createAlert } from 'src/store/apps/alerts'
import { deleteItemMutation } from 'src/@core/components/graphql/item-queries'

const DeleteItem = ({ tenantId, itemId, setOpenDialog, openDialog, image }) => {
  // ** State
  const dispatch = useDispatch()
  const handleConfirm = async () => {
    try {
      const response = await writeData(deleteItemMutation(), { tenantId, itemId })
      if (response.deleteItem) {
        dispatch(setDeleteProduct(itemId))
        deleteImage()
        dispatch(createAlert({ message: 'Product deleted successfully !', type: 'success' }))
      } else {
        dispatch(createAlert({ message: 'Product deletion failed !', type: 'error' }))
      }
    } catch (error) {
      // Handle any errors and optionally dispatch an error action
      throw error
    } finally {
      setOpenDialog(false)
    }
  }

  const deleteImage = () => {
    console.log('deleteImage called::', image)
    try {
      Amplify.Storage.remove(image, { level: 'public' })
        .then(result => {
          console.log('Delete result:', result)
          // Handle success, update your state or take any necessary actions
        })
        .catch(err => {
          console.error('Delete error:', err)
          // Handle error, display an alert or take appropriate action
        })
    } catch (error) {
      console.error('Error:', error)
      // Handle unexpected errors
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
        <DialogTitle id='alert-dialog-title'>Delete Item?</DialogTitle>
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

export default DeleteItem
