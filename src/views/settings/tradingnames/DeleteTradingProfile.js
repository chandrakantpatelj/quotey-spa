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
import { setDeleteTrading, setTradingLoading } from 'src/store/apps/tradings'
import { deleteTradingMutation } from 'src/@core/components/graphql/trading-queries'
import { writeData } from 'src/common-functions/GraphqlOperations'
import { createAlert } from 'src/store/apps/alerts'

const DeleteTradingProfile = ({ tenantId, tradingId, setOpenDialog, openDialog }) => {
  const dispatch = useDispatch()

  const handleConfirm = async () => {
    try {
      dispatch(setTradingLoading(tradingId))

      const response = await writeData(deleteTradingMutation(), { tenantId, tradingId })
      if (response.deleteTrading) {
        dispatch(setDeleteTrading(tradingId))

        dispatch(createAlert({ message: 'Trading Profile Deleted Successfully!', type: 'success' }))
      } else {
        dispatch(createAlert({ message: 'Trading Profile Deletion failed!', type: 'error' }))
      }
    } catch (error) {
      // Handle any errors and optionally dispatch an error action
      throw error
    } finally {
      setOpenDialog(false)
    }
    setOpenDialog(false)
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
        <DialogTitle id='alert-dialog-title'>Delete Trading Profile?</DialogTitle>
        <DialogContent>
          <DialogContentText id='alert-dialog-description'>
            Please Click on confirm button to delete trading profile otherwise click cancel to close dialog
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

export default DeleteTradingProfile
