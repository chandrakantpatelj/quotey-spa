import React, { Fragment } from 'react'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import DialogContentText from '@mui/material/DialogContentText'
import { useDispatch } from 'react-redux'
import { writeData } from 'src/common-functions/GraphqlOperations'
import { createAlert } from 'src/store/apps/alerts'
import { deletePriceListMutation } from 'src/@core/components/graphql/priceList-queries'
import { resetPriceList } from 'src/store/apps/priceLists'

function DeletePriceList({ tenantId, priceListId, setOpenDialog, openDialog, setPriceListData }) {
  const dispatch = useDispatch()
  const handleConfirm = async () => {
    try {
      const response = await writeData(deletePriceListMutation(), { tenantId, priceListId })
      if (response.deletePriceList) {
        dispatch(resetPriceList())
        dispatch(createAlert({ message: 'Price List Deleted successfully !', type: 'success' }))
      } else {
        dispatch(createAlert({ message: 'Price List Delation failed !', type: 'error' }))
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
          <DialogTitle id='alert-dialog-title'>Delete Price List?</DialogTitle>
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

export default DeletePriceList
