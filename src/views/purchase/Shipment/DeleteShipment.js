// ** React Imports
import { Fragment } from 'react'

// ** MUI Imports
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import { useDispatch } from 'react-redux'
import { deletePurchaseOrderShipmentMutation } from 'src/@core/components/graphql/purchase-order-shipment-queries'
import { writeData } from 'src/common-functions/GraphqlOperations'
import usePurchaseOrders from 'src/hooks/getData/usePurchaseOrders'
import usePurchasePackages from 'src/hooks/getData/usePurchasePackages'
import { createAlert } from 'src/store/apps/alerts'
import { setDeletePurchaseShipment } from 'src/store/apps/purchase-shipments'

const DeleteShipment = ({ tenantId, shipmentId, setOpenDialog, openDialog }) => {
  const { reloadPurchaseOrderInStore } = usePurchaseOrders(tenantId)
  const { reloadPurchasePackageInStore } = usePurchasePackages(tenantId)
  const dispatch = useDispatch()
  const handleConfirm = async () => {
    setOpenDialog(false)
    try {
      const response = await writeData(deletePurchaseOrderShipmentMutation(), { tenantId, shipmentId })

      if (response.deletePurchaseOrderShipment) {
        dispatch(setDeletePurchaseShipment(shipmentId))
        for (const item of response.deletePurchaseOrderShipment.packages) {
          await reloadPurchaseOrderInStore(item.purchaseOrderId)
          await reloadPurchasePackageInStore(item.packageId)
        }
        dispatch(createAlert({ message: 'Purchases Shipment Deleted Successfully!', type: 'success' }))
      } else {
        const errorMessage = response?.errors?.[0]?.message || 'Failed to delete shipment!'
        dispatch(createAlert({ message: errorMessage, type: 'error' }))
      }
    } catch (error) {
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
        <DialogTitle id='alert-dialog-title'>Delete Purchases Shipment?</DialogTitle>
        <DialogContent>
          <DialogContentText id='alert-dialog-description'>
            Please Click on confirm button to delete purchases shipment otherwise click cancel to close dialog
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

export default DeleteShipment
