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
import { createAlert } from 'src/store/apps/alerts'
import { writeData } from 'src/common-functions/GraphqlOperations'
import { deleteVendorMutation } from '../../../@core/components/graphql/vendor-queries'
import { setDeleteVendor } from 'src/store/apps/vendors'

const DeleteVendors = ({ tenantId, vendorId, setOpenDialog, openDialog }) => {
  const dispatch = useDispatch()
  const handleConfirm = async () => {
    try {
      const response = await writeData(deleteVendorMutation(), { tenantId, vendorId })
      if (response.deleteVendor) {
        dispatch(setDeleteVendor(vendorId))
        dispatch(createAlert({ message: 'Vendor Deleted successfully !', type: 'success' }))
      } else {
        const errorMessage = response?.errors?.[0] ? response.errors[0].message : 'Vendor Delation failed !'
        dispatch(createAlert({ message: errorMessage, type: 'error' }))
      }
    } catch (error) {
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

export default DeleteVendors
