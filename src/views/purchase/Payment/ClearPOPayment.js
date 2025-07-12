// ** React Imports
// ** MUI Imports
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import { useDispatch, useSelector } from 'react-redux'
import { getPurchaseOrdersByDateRangeQuery } from 'src/@core/components/graphql/purchase-order-queries'
import {
  clearPurchaseOrderPayment,
  getPurchaseOrderPaymentsByDateRangeQuery
} from 'src/@core/components/graphql/purchases-payment-queries'
import { fetchData, writeData } from 'src/common-functions/GraphqlOperations'
import { lastMonthDate } from 'src/common-functions/utils/UtilityFunctions'
import { createAlert } from 'src/store/apps/alerts'
import { setAllPurchaseOrder } from 'src/store/apps/purchaseorder'
import { setAllPoPayments, setUpdatePurchasePayment } from 'src/store/apps/purchases-payment'

const ClearPOPayment = ({ tenantId, paymentId, setOpenDialog, openDialog, handleDateRange, startDate, endDate }) => {
  // ** State
  const dispatch = useDispatch()
  const moduleFilterDateDuration = useSelector(
    state => state.otherSettings?.data?.moduleFilterDateDuration || undefined
  )
  const handleConfirm = async () => {
    try {
      setOpenDialog(false)
      const response = await writeData(clearPurchaseOrderPayment(), { tenantId, paymentId })
      if (response.clearPurchaseOrderPayment) {
        dispatch(setUpdatePurchasePayment(response.clearPurchaseOrderPayment))
        handleDateRange && handleDateRange(startDate, endDate)
        await getUpdatedData(tenantId)
        dispatch(createAlert({ message: 'Payment Cleared Successfully!', type: 'success' }))
      } else {
        dispatch(createAlert({ message: 'Payment Cleared failed!', type: 'error' }))
      }
    } catch (error) {
      // Handle any errors and optionally dispatch an error action
      console.log('error', error)
    }
  }
  const handleClose = () => setOpenDialog(false)

  async function getUpdatedData(tenantId) {
    try {
      const poResponse = await fetchData(
        getPurchaseOrdersByDateRangeQuery(tenantId, lastMonthDate(moduleFilterDateDuration), new Date())
      )
      const poPaymentResponse = await fetchData(
        getPurchaseOrderPaymentsByDateRangeQuery(tenantId, lastMonthDate(moduleFilterDateDuration), new Date())
      )
      dispatch(setAllPurchaseOrder(poResponse?.getPurchaseOrdersByDateRange))
      dispatch(setAllPoPayments(poPaymentResponse?.getPurchaseOrderPaymentsByDateRange))
    } catch (error) {
      console.log('error', error)
    }
  }

  return (
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
      <DialogTitle id='alert-dialog-title'>Clear payment?</DialogTitle>
      <DialogContent>
        <DialogContentText id='alert-dialog-description'>
          Please Click on confirm button to clear payment otherwise click cancel to close dialog
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
  )
}

export default ClearPOPayment
