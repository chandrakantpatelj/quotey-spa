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
import { deleteTaxAuthorityMutation } from 'src/@core/components/graphql/tax-authorities-queries'
import { deleleTaxAuthority, setTaxAuthorityLoading } from 'src/store/apps/tax-authority'

export default function DeleteTaxAuthority({ tenantId, taxAuthorityId, openDialog, setOpenDialog }) {
  const dispatch = useDispatch()

  const handleConfirm = async () => {
    try {
      dispatch(setTaxAuthorityLoading(true))

      const response = await writeData(deleteTaxAuthorityMutation(), { tenantId, taxAuthorityId })
      if (response.deleteTaxAuthority) {
        dispatch(deleleTaxAuthority(taxAuthorityId))
        dispatch(createAlert({ message: 'Tax Authority Deleted Successfully!', type: 'success' }))
      } else {
        dispatch(createAlert({ message: 'Tax Authority Deletion failed!', type: 'error' }))
      }
    } catch (error) {
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
          <DialogTitle id='alert-dialog-title'>Delete Tax Authority?</DialogTitle>
          <DialogContent>
            <DialogContentText id='alert-dialog-description'>
              Please click on the confirm button to delete, or click cancel to close the dialog.
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
