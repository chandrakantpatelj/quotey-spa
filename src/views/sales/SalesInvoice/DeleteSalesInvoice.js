import { Fragment } from 'react'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import DialogContentText from '@mui/material/DialogContentText'
import { useDispatch } from 'react-redux'
import { writeData } from 'src/common-functions/GraphqlOperations'
import { createAlert } from 'src/store/apps/alerts'
import { deleteSalesInvoiceMutation } from 'src/@core/components/graphql/sales-invoice-queries'
import { setDeleteInvoice, setInvoiceLoading } from 'src/store/apps/sales-invoices'

function DeleteSalesInvoice({ tenantId, invoiceId, openDialog, setOpenDialog }) {
  const dispatch = useDispatch()

  const handleConfirm = async () => {
    try {
      const response = await writeData(deleteSalesInvoiceMutation(), { tenantId, invoiceId })
      if (response.deleteSalesInvoice) {
        dispatch(setDeleteInvoice(invoiceId))
        dispatch(createAlert({ message: 'Invoice Deleted Successfully!', type: 'success' }))
      } else {
        dispatch(createAlert({ message: 'Failed to delete invoice!', type: 'error' }))
        dispatch(setInvoiceLoading(false))
      }
    } catch (error) {
      throw error
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
        <DialogTitle id='alert-dialog-title'>Delete Invoice?</DialogTitle>
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

export default DeleteSalesInvoice
