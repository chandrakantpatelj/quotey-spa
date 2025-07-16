import React, { Fragment } from 'react'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import DialogContentText from '@mui/material/DialogContentText'
import { useDispatch } from 'react-redux'
import { writeData } from 'src/common-functions/GraphqlOperations'
import { deleteQuotationMutation } from 'src/@core/components/graphql/quotation-queries'
import { createAlert } from 'src/store/apps/alerts'
import { setDeleteQuotation } from 'src/store/apps/quotations'

function DeleteQuotation({ tenantId, quotationId, setOpenDialog, openDialog }) {
  const dispatch = useDispatch()
  const handleConfirm = async () => {
    try {
      const response = await writeData(deleteQuotationMutation(), { tenantId, quotationId })
      if (response.deleteQuotation) {
        dispatch(setDeleteQuotation(quotationId))

        dispatch(createAlert({ message: 'Quotation Deleted successfully !', type: 'success' }))
      } else {
        dispatch(createAlert({ message: 'Quotation Delation failed !', type: 'error' }))
      }
    } catch (error) {
      console.error(error)
    } finally {
      setOpenDialog(false)
    }

    // setShowAlert(true)
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
          <DialogTitle id='alert-dialog-title'>Delete Quotation?</DialogTitle>
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

export default DeleteQuotation
