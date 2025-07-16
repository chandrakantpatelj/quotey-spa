import { Dialog, DialogTitle, Alert, DialogContent, Grid, Box, Button } from '@mui/material'
import Icon from 'src/@core/components/icon'
import { Controller, useForm } from 'react-hook-form'
import { writeData } from 'src/common-functions/GraphqlOperations'
import { useDispatch } from 'react-redux'
import { createAlert } from 'src/store/apps/alerts'
import CustomCloseButton from 'src/common-components/CustomCloseButton'
import CustomDatePicker from 'src/views/forms/form-elements/pickers/CustomDatePicker'
import { toTitleCase } from 'src/common-functions/utils/UtilityFunctions'
import { movePurchaseOrderPackageToStageQuery } from 'src/@core/components/graphql/purchase-order-packages-queries'
import { setUpdatePurchasePackage, setLoading, setSelectedPurchasePackage } from 'src/store/apps/purchase-packages'
import usePurchaseOrders from 'src/hooks/getData/usePurchaseOrders'

export default function MovetoNextStagePurchasePackage({
  tenantId,
  selectedPackage,
  open,
  setOpen,
  reloadPackages,
  setReloadPackages
}) {
  const dispatch = useDispatch()
  const { reloadPurchaseOrderInStore } = usePurchaseOrders(tenantId)

  const packageId = selectedPackage?.packageId

  const handleClose = () => {
    setOpen(false)
  }

  const defaultData = {
    stageDate: selectedPackage?.packageDate
  }

  const { control, handleSubmit } = useForm({
    defaultValues: defaultData,
    mode: 'onChange'
  })

  const handleFormSubmit = async data => {
    const stageDate = data?.stageDate

    const stageName = selectedPackage?.nextStatus
    try {
      setOpen(false)
      dispatch(setLoading(false))
      const response = await writeData(movePurchaseOrderPackageToStageQuery(), {
        tenantId,
        packageId,
        stageName,
        stageDate
      })
      if (response.movePurchaseOrderPackageToStage) {
        dispatch(setUpdatePurchasePackage(response.movePurchaseOrderPackageToStage))
        dispatch(setSelectedPurchasePackage(response.movePurchaseOrderPackageToStage))
        setReloadPackages && setReloadPackages(!reloadPackages)
        await reloadPurchaseOrderInStore(response?.movePurchaseOrderPackageToStage?.purchaseOrderId)
        dispatch(createAlert({ message: 'Moved Purchase Order Package to Next Stage successfully!', type: 'success' }))
      } else {
        const errorMessage = response?.errors?.[0] ? response.errors[0].message : 'Failed to move to next stage!'
        dispatch(createAlert({ message: errorMessage, type: 'error' }))
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    }
  }

  return (
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
          Move to <span style={{ textTransform: 'capitalize' }}>{toTitleCase(selectedPackage?.nextStatus)} </span>
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
  )
}
