import React, { useState, Fragment } from 'react'
import { IconButton } from '@mui/material'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import DialogContentText from '@mui/material/DialogContentText'
import Icon from 'src/@core/components/icon'

function DeleteWarehouse() {
  const [openDialog, setOpenDialog] = useState(false)

  const handleConfirm = () => {
    setOpenDialog(false)
  }
  const handleClose = () => setOpenDialog(false)

  return (
    <>
      <IconButton onClick={() => setOpenDialog(true)} variant='outlined' color='error' sx={{ fontSize: '21px' }}>
        <Icon icon='mingcute:delete-2-line' />
      </IconButton>
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
          <DialogTitle id='alert-dialog-title'>Delete Warehouse?</DialogTitle>
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

export default DeleteWarehouse
