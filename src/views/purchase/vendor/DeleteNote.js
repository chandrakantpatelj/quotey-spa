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
import { deleteStakeholderNoteMutation } from 'src/@core/components/graphql/vendor-notes-queries'

function DeleteNote({ selectedNotes, setOpenDialog, openDialog, notesData, setNoteData }) {
  const dispatch = useDispatch()

  const handleConfirm = async () => {
    const previousNotesData = notesData
    setOpenDialog(false)

    try {
      setNoteData(prevData => prevData.filter(note => note.noteId !== selectedNotes.noteId))
      const response = await writeData(deleteStakeholderNoteMutation(), {
        tenantId: selectedNotes?.tenantId,
        noteId: selectedNotes.noteId
      })
      if (response.deleteStakeholderNote) {
        dispatch(createAlert({ message: 'Notes Deleted successfully !', type: 'success' }))
      } else {
        dispatch(createAlert({ message: 'Notes Delation failed !', type: 'error' }))
        setNoteData(previousNotesData)
      }
    } catch (error) {
      setOpenDialog(false)
      dispatch(
        createAlert({
          message: 'An error occurred while deleting the note!',
          type: 'error'
        })
      )
      setNoteData(previousNotesData)

      console.error(error)
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
        <DialogTitle id='alert-dialog-title'>Delete Note?</DialogTitle>
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

export default DeleteNote
