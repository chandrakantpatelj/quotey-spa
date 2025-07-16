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
import { DeleteStockAdjustmentMutation } from 'src/@core/components/graphql/stock-adjustment-queries'
import { setDeleteStock } from 'src/store/apps/stock-adjustments'

const DeleteStock = ({ tenantId, stockAdjustmentId, setOpenDialog, openDialog }) => {
  const dispatch = useDispatch()
  const handleConfirm = async () => {
    try {
      const response = await writeData(DeleteStockAdjustmentMutation(), { tenantId, stockAdjustmentId })
      if (response.deleteStockAdjustment) {
        dispatch(setDeleteStock(stockAdjustmentId))
        dispatch(createAlert({ message: 'Stock Deleted successfully !', type: 'success' }))
      } else {
        dispatch(createAlert({ message: 'Stock Delation failed !', type: 'error' }))
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
        <DialogTitle id='alert-dialog-title'>Delete Stock?</DialogTitle>
        <DialogContent>
          <DialogContentText id='alert-dialog-description'>
            Please Click on confirm button to delete stock otherwise click cancel to close dialog
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

export default DeleteStock
