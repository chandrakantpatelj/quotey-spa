import { Dialog, DialogTitle, Alert, DialogContent, Grid, Box, Button } from '@mui/material'
import Icon from 'src/@core/components/icon'
import { Controller, useForm } from 'react-hook-form'
import { writeData } from 'src/common-functions/GraphqlOperations'
import { useDispatch } from 'react-redux'
import { createAlert } from 'src/store/apps/alerts'
import CustomCloseButton from 'src/common-components/CustomCloseButton'
import CustomDatePicker from 'src/views/forms/form-elements/pickers/CustomDatePicker'
import { toTitleCase } from 'src/common-functions/utils/UtilityFunctions'
import { movePurchaseOrderShipmentToStageQuery } from 'src/@core/components/graphql/purchase-order-shipment-queries'
import { setUpdatePurchaseShipment, setLoading, setSelectedPurchaseShipment } from 'src/store/apps/purchase-shipments'
import usePurchaseOrders from 'src/hooks/getData/usePurchaseOrders'
import usePurchasePackages from 'src/hooks/getData/usePurchasePackages'

export default function MovetoNextStagePurchaseShipment({
  tenantId,
  selectedShipment,
  open,
  setOpen,
  reloadShipments,
  setReloadShipments
}) {
  const dispatch = useDispatch()

  const shipmentId = selectedShipment?.shipmentId
  const { reloadPurchaseOrderInStore } = usePurchaseOrders(tenantId)
  const { reloadPurchasePackageInStore } = usePurchasePackages(tenantId)

  const handleClose = () => {
    setOpen(false)
  }

  const defaultData = {
    stageDate: selectedShipment?.shipmentDate
  }

  const { control, handleSubmit } = useForm({
    defaultValues: defaultData,
    mode: 'onChange'
  })

  const handleFormSubmit = async data => {
    dispatch(setLoading(true))
    setOpen(false)
    const stageDate = data?.stageDate
    const stageName = selectedShipment?.nextStatus
    try {
      const response = await writeData(movePurchaseOrderShipmentToStageQuery(), {
        tenantId,
        shipmentId,
        stageName,
        stageDate
      })
      if (response.movePurchaseOrderShipmentToStage) {
        dispatch(setUpdatePurchaseShipment(response.movePurchaseOrderShipmentToStage))
        dispatch(setSelectedPurchaseShipment(response.movePurchaseOrderShipmentToStage))
        response?.movePurchaseOrderShipmentToStage.packages.filter(async item => {
          await reloadPurchaseOrderInStore(item.purchaseOrderId)
          await reloadPurchasePackageInStore(item.packageId)
        })

        setReloadShipments && setReloadShipments(!reloadShipments)
        dispatch(
          createAlert({ message: 'Moved Purchase Orders Shipment to Next Stage successfully!', type: 'success' })
        )
      } else {
        const errorMessage = response?.errors?.[0] ? response.errors[0].message : 'Failed to move to next stage!'
        dispatch(createAlert({ message: errorMessage, type: 'error' }))
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    }
  }

  return (
    <>
      <Dialog
        open={open}
        disableEscapeKeyDown
        maxWidth='xs'
        fullWidth={true}
        scroll='paper'
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') {
            handleClose()
          }
        }}
        sx={{
          '& .MuiDialog-paper': {
            overflow: 'visible',
            pt: '10px !important',
            verticalAlign: 'top'
          }
        }}
      >
        <DialogTitle id='alert-dialog-title'>
          <Alert severity='info' icon={false} sx={{ color: 'rgba(0,0,0,0.8)' }}>
            Move to <span style={{ textTransform: 'capitalize' }}>{toTitleCase(selectedShipment?.nextStatus)} </span>
          </Alert>{' '}
        </DialogTitle>
        <DialogContent sx={{ py: 8 }}>
          <CustomCloseButton onClick={handleClose}>
            <Icon icon='tabler:x' fontSize='1.25rem' />
          </CustomCloseButton>
          <form onSubmit={handleSubmit(handleFormSubmit)}>
            <Grid container spacing={{ xs: 2, md: 3 }}>
              <Grid item xs={12}>
                <Controller
                  name='stageDate'
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <CustomDatePicker
                      label={'Date'}
                      fullWidth={true}
                      date={field.value ? new Date(field.value) : new Date()}
                      onChange={field.onChange}
                    />
                  )}
                />
              </Grid>
            </Grid>

            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: { xs: '10px', md: '20px' },
                marginTop: { xs: '20px', sm: '30px' }
              }}
            >
              <Button variant='contained' type='submit'>
                Save
              </Button>
              <Button variant='outlined' type='reset' onClick={handleClose}>
                Cancel
              </Button>
            </Box>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
