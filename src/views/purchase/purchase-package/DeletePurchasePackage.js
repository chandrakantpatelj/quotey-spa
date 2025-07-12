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
import { deletePurchaseOrderPackageMutation } from 'src/@core/components/graphql/purchase-order-packages-queries'
import { setDeletePurchasePackage } from 'src/store/apps/purchase-packages'
import usePurchaseOrders from 'src/hooks/getData/usePurchaseOrders'
import usePurchasePackages from 'src/hooks/getData/usePurchasePackages'

const DeletePurchasePackage = ({ tenantId, packageId, setOpenDialog, openDialog }) => {
  const dispatch = useDispatch()
  const { reloadPurchaseOrderInStore } = usePurchaseOrders(tenantId)
  const { reloadPurchasePackageInStore } = usePurchasePackages(tenantId)

  const handleConfirm = async () => {
    try {
      const response = await writeData(deletePurchaseOrderPackageMutation(), { tenantId, packageId })

      if (response.deletePurchaseOrderPackage) {
        dispatch(setDeletePurchasePackage(packageId))
        for (const item of response.deletePurchaseOrderPackage.packages) {
          await reloadPurchaseOrderInStore(item.purchaseOrderId)
          await reloadPurchasePackageInStore(item.packageId)
        }
        dispatch(createAlert({ message: 'Package Deleted Successfully!', type: 'success' }))
      } else {
        dispatch(createAlert({ message: 'Package Deletion failed!', type: 'error' }))
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
        <DialogTitle id='alert-dialog-title'>Delete Purchase Package?</DialogTitle>
        <DialogContent>
          <DialogContentText id='alert-dialog-description'>
            Please Click on confirm button to delete package otherwise click cancel to close dialog
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

export default DeletePurchasePackage
