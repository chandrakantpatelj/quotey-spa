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
import { deleteCommentMutation } from 'src/@core/components/graphql/vendor-notes-queries'

function DeleteNoteComment({
  selectedNotes,
  setOpenCommentDeleteDialog,
  openCommentDeleteDialog,
  notesData,
  setNotesData,
  selectedComment
}) {
  const dispatch = useDispatch()

  const handleConfirm = async () => {
    const previousNotesData = notesData
    setOpenCommentDeleteDialog(false)

    try {
      const response = await writeData(deleteCommentMutation(), {
        tenantId: selectedNotes?.tenantId,
        noteId: selectedNotes.noteId,
        commentId: selectedComment?.commentId || ''
      })
      if (response.deleteNoteComment) {
        const updateNote = notesData.map(mapNote => {
          if (mapNote.noteId === selectedNotes.noteId) {
            const filteredComments = selectedNotes.comments.filter(
              comment => selectedComment.commentId !== comment.commentId
            )
            return { ...mapNote, comments: filteredComments }
          } else {
            return mapNote
          }
        })
        setNotesData(updateNote)
        dispatch(createAlert({ message: 'Comment Deleted successfully !', type: 'success' }))
      } else {
        dispatch(createAlert({ message: 'Comment Delation failed !', type: 'error' }))
        setNotesData(previousNotesData)
      }
    } catch (error) {
      setOpenCommentDeleteDialog(false)
      dispatch(
        createAlert({
          message: 'An error occurred while deleting the note!',
          type: 'error'
        })
      )
      setNotesData(previousNotesData)

      console.error(error)
    }
  }

  const handleClose = () => setOpenCommentDeleteDialog(false)

  return (
    <Fragment>
      <Dialog
        open={openCommentDeleteDialog}
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

export default DeleteNoteComment
