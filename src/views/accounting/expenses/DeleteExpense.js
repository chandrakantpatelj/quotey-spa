import React, { Fragment } from 'react'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import DialogContentText from '@mui/material/DialogContentText'
import { useDispatch } from 'react-redux'
import { setDeleteExpense, setExpenseLoading } from 'src/store/apps/expenses' // Adjust the import based on your file structure
import { writeData } from 'src/common-functions/GraphqlOperations'
import { deleteGeneralExpenseMutation } from 'src/@core/components/graphql/general-expense-queries' // Adjust the import based on your file structure
import { createAlert } from 'src/store/apps/alerts'

function DeleteExpense({ tenantId, expenseId, openDialog, setOpenDialog }) {
  const dispatch = useDispatch()

  const handleConfirm = async () => {
    try {
      const response = await writeData(deleteGeneralExpenseMutation(), { tenantId, expenseId })
      dispatch(setExpenseLoading(true))
      if (response.deleteGeneralExpense) {
        dispatch(setDeleteExpense(expenseId))
        dispatch(createAlert({ message: 'Expense Deleted Successfully!', type: 'success' }))
      } else {
        dispatch(createAlert({ message: 'Expense Deletion failed!', type: 'error' }))
      }
    } catch (error) {
      // Handle any errors and optionally dispatch an error action
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
          <DialogTitle id='alert-dialog-title'>Delete Expense?</DialogTitle>
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

export default DeleteExpense
