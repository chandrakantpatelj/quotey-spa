// ** React Imports
import { Fragment, useState } from 'react'

// ** MUI Imports
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import DialogContentText from '@mui/material/DialogContentText'
import { setDeletePurchaseOrder } from 'src/store/apps/purchaseorder'
import { useDispatch } from 'react-redux'
import { writeData } from 'src/common-functions/GraphqlOperations'
import { deletePurchaseOrderMutation } from 'src/@core/components/graphql/purchase-order-queries'
import { createAlert } from 'src/store/apps/alerts'

const DeleteDialog = ({ tenantId, orderId, setOpenDialog, openDialog }) => {
  const dispatch = useDispatch()
  const handleConfirm = async () => {
    try {
      const response = await writeData(deletePurchaseOrderMutation(), { tenantId, orderId })
      if (response.deletePurchaseOrder) {
        dispatch(setDeletePurchaseOrder(orderId))
        dispatch(createAlert({ message: 'PurchaseOrder Deleted Successfully!', type: 'success' }))
      } else {
        const errorMessage = response?.errors?.[0] ? response.errors[0].message : 'Failed to delete to purchase order!'
        dispatch(createAlert({ message: errorMessage, type: 'error' }))
      }
    } catch (error) {
      // Handle any errors and optionally dispatch an error action
      console.log('error', error)
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
        <DialogTitle id='alert-dialog-title'>Delete Purchase Order?</DialogTitle>
        <DialogContent>
          <DialogContentText id='alert-dialog-description'>
            Please Click on confirm button to delete purchase order otherwise click cancel to close dialog
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

export default DeleteDialog
