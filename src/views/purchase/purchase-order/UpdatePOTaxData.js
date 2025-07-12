import { Dialog, DialogTitle, Alert, DialogContent, Grid, Box, Button, Typography, Checkbox } from '@mui/material'
import { useState } from 'react'
import Icon from 'src/@core/components/icon'
import CustomCloseButton from 'src/common-components/CustomCloseButton'

export default function UpdatePOTaxData({ open, setOpen, updateTax, updateFieldByKey, selectedTax }) {
  const taxId = selectedTax?.taxId

  //   const expenseVendor = vendors?.find(val => val?.vendorId === selectedTax?.vendorId)

  const [isTaxFree, setIsTaxFree] = useState(selectedTax?.isManuallyEntered)

  const handleSubmit = () => {
    updateFieldByKey(updateTax, 'taxes', taxId, 'isManuallyEntered', isTaxFree)
    setOpen(false)
  }

  const handleClose = () => {
    setOpen(false)
  }

  return (
    <>
      <Dialog
        open={open}
        disableEscapeKeyDown
        maxWidth='xs'
        fullWidth={true}
        scroll='paper'
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
            Update Tax Info
          </Alert>
        </DialogTitle>
        <DialogContent sx={{ py: 8 }}>
          <CustomCloseButton onClick={handleClose}>
            <Icon icon='tabler:x' fontSize='1.25rem' />
          </CustomCloseButton>
          <Grid container spacing={{ xs: 2, md: 3, lg: 3, xl: 3 }}>
            <Grid item xs={12}>
              <Typography
                sx={{
                  fontSize: '13px',
                  fontWeight: 500,
                  textAlign: 'center',
                  lineHeight: '24px'
                }}
              >
                <span style={{ fontWeight: 400 }}> Tax:</span> {selectedTax?.taxName}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'center' }}>
                <Checkbox
                  sx={{ p: '4px' }}
                  name='isManuallyEntered'
                  checked={isTaxFree}
                  onChange={e => setIsTaxFree(e.target.checked)}
                />
                <Typography sx={{ fontSize: '13px' }}>Is Manually Entered</Typography>
              </Box>
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
            <Button variant='contained' onClick={() => handleSubmit()}>
              Change
            </Button>
            <Button variant='outlined' type='reset' onClick={handleClose}>
              Cancel
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  )
}
