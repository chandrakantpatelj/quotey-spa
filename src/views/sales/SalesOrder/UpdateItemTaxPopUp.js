import { Dialog, DialogTitle, Alert, DialogContent, Grid, Box, Button, Checkbox, Typography } from '@mui/material'
import { useState } from 'react'
import Icon from 'src/@core/components/icon'
import CustomCloseButton from 'src/common-components/CustomCloseButton'

export default function UpdateItemTaxPopUp({ open, setOpen, setValue, update, arrayName, index, selectedItem }) {
  const [isTaxFree, setIsTaxFree] = useState(selectedItem?.taxFree)
  const [taxInclusive, setTaxInclusive] = useState(selectedItem?.taxInclusive)

  const handleSubmit = () => {
    setValue(`${arrayName}[${index}].taxFree`, isTaxFree)
    update(`${arrayName}[${index}].taxFree`, isTaxFree)
    setValue(`${arrayName}[${index}].taxInclusive`, taxInclusive)
    update(`${arrayName}[${index}].taxInclusive`, taxInclusive)
    setOpen(false)
  }

  const handleClose = () => {
    setOpen(false)
  }

  return (
    <Dialog
      open={open}
      disableEscapeKeyDown
      maxWidth='xs'
      fullWidth
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
          Update Item ({selectedItem?.itemName}) Info
        </Alert>
      </DialogTitle>
      <DialogContent sx={{ py: 8 }}>
        <CustomCloseButton onClick={handleClose}>
          <Icon icon='tabler:x' fontSize='1.25rem' />
        </CustomCloseButton>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 2 }}>
              <Checkbox
                sx={{ p: '4px' }}
                name='taxFree'
                checked={isTaxFree}
                onChange={e => setIsTaxFree(e.target.checked)}
              />
              <Typography sx={{ fontSize: '13px' }}>Tax Free</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 2 }}>
              <Checkbox
                sx={{ p: '4px' }}
                name='taxInclusive'
                checked={taxInclusive}
                onChange={e => setTaxInclusive(e.target.checked)}
              />
              <Typography sx={{ fontSize: '13px' }}>
                {taxInclusive ? 'Inclusive of Tax' : 'Exclusive of Tax'}
              </Typography>
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
          <Button variant='contained' onClick={handleSubmit}>
            Change
          </Button>
          <Button variant='outlined' type='reset' onClick={handleClose}>
            Cancel
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  )
}
