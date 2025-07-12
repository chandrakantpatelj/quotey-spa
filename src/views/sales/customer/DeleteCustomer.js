import { Fragment } from 'react'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import DialogContentText from '@mui/material/DialogContentText'
import { useDispatch } from 'react-redux'
import { writeData } from 'src/common-functions/GraphqlOperations'
import { deleteCustomerMutation } from 'src/@core/components/graphql/customer-queries'
import { createAlert } from 'src/store/apps/alerts'
import { setDeleteCustomer, setCustomerLoading } from 'src/store/apps/customers'

function Deletecustomer({ tenantId, customerId, openDialog, setOpenDialog }) {
  const dispatch = useDispatch()
  const handleConfirm = async () => {
    try {
      dispatch(setCustomerLoading(true))

      const response = await writeData(deleteCustomerMutation(), { tenantId, customerId })
      if (response.deleteCustomer) {
        dispatch(setDeleteCustomer(customerId))
        dispatch(createAlert({ message: 'Customer Deleted Successfully!', type: 'success' }))
      } else {
        dispatch(setCustomerLoading(false))
        dispatch(createAlert({ message: 'Customer Deletion failed!', type: 'error' }))
      }
    } catch (error) {
      // Handle any errors and optionally dispatch an error action
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
          <DialogTitle id='alert-dialog-title'>Delete Customer?</DialogTitle>
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
    </>
  )
}

export default Deletecustomer
