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
import { DeleteCustomersMutation } from 'src/@core/components/graphql/customer-queries'
import { setAllCustomer } from 'src/store/apps/customers'
import useVendors from 'src/hooks/getData/useVendors'
import { setAllVendor } from 'src/store/apps/vendors'

const DeleteSelectedVendors = ({ tenantId, selectedRows, setOpenDialog, openDialog }) => {
  // ** State
  const { vendors } = useVendors(tenantId)

  const dispatch = useDispatch()
  const handleConfirm = async () => {
    try {
      const response = await writeData(DeleteCustomersMutation(), {
        tenantId,
        vendorIds: selectedRows
      })
      if (response.deleteVendors) {
        dispatch(createAlert({ message: 'Vendors deleted successfully !', type: 'success' })),
          dispatch(setAllVendor(vendors.filter(row => !response.deleteVendors.includes(row.vendorId))))
      } else {
        dispatch(createAlert({ message: 'Vendors deletion failed !', type: 'error' }))
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
        <DialogTitle id='alert-dialog-title'>Delete Selected Vendors?</DialogTitle>
        <DialogContent>
          <DialogContentText id='alert-dialog-description'>
            Please Click on confirm button to delete selected vendors otherwise click cancel to close dialog.
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

export default DeleteSelectedVendors
