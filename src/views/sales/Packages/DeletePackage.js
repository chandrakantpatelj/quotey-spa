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
import { setDeletePackage, setLoading } from 'src/store/apps/packages'
import { createAlert } from 'src/store/apps/alerts'
import { writeData } from 'src/common-functions/GraphqlOperations'
import { deleteSalesOrderPackageMutation } from 'src/@core/components/graphql/sales-order-package-queries'

const DeletePackage = ({ tenantId, packageId, setOpenDialog, openDialog }) => {
  // ** State
  const dispatch = useDispatch()
  const handleConfirm = async () => {
    setOpenDialog(false)
    dispatch(setLoading(true))

    try {
      const response = await writeData(deleteSalesOrderPackageMutation(), { tenantId, packageId })

      if (response.deleteSalesOrderPackage) {
        dispatch(setDeletePackage(packageId))
        dispatch(createAlert({ message: 'Package Deleted Successfully!', type: 'success' }))
      } else {
        dispatch(createAlert({ message: 'Package Deletion failed!', type: 'error' }))
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
        <DialogTitle id='alert-dialog-title'>Delete Package?</DialogTitle>
        <DialogContent>
          <DialogContentText id='alert-dialog-description'>
            Please Click on confirm button to delete package otherwise click cancel to close dialog
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

export default DeletePackage
