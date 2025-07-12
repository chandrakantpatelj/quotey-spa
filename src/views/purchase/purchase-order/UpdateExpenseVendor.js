import { Dialog, DialogTitle, Alert, DialogContent, Grid, Box, Button, Typography } from '@mui/material'
import { useState } from 'react'
import Icon from 'src/@core/components/icon'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import CustomTextField from 'src/@core/components/mui/text-field'
import CustomCloseButton from 'src/common-components/CustomCloseButton'

export default function UpdateExpenseVendor({
  open,
  setOpen,
  vendors,
  updateExpense,
  updateFieldByKey,
  selectedExpense
}) {
  const expenseId = selectedExpense?.expenseId

  const expenseVendor = vendors?.find(val => val?.vendorId === selectedExpense?.vendorId)

  const [selectedVendor, setSelectedVendor] = useState(expenseVendor)

  const handleSubmit = () => {
    updateFieldByKey(updateExpense, 'expenses', expenseId, 'vendorId', selectedVendor?.vendorId)
    updateFieldByKey(updateExpense, 'expenses', expenseId, 'expenseValueCurrency', selectedVendor?.currencyId)
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
            Update Expense Vendor
          </Alert>{' '}
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
                  lineHeight: '24px',
                  mb: 2
                }}
              >
                <span style={{ fontWeight: 400 }}> Expense Name :</span> {selectedExpense?.expenseName}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <CustomAutocomplete
                value={selectedVendor}
                onChange={(event, newValue) => {
                  setSelectedVendor(newValue)
                }}
                fullWidth
                getOptionLabel={option => {
                  if (typeof option === 'string') {
                    return option
                  } else
                    return `${option?.vendorNoPrefix || ''}  ${option?.vendorNo || ''}  ${option?.displayName || ''}`
                }}
                isOptionEqualToValue={(option, value) => option.vendorId === value?.vendorId}
                renderOption={(props, option) => {
                  return (
                    <li {...props}>
                      {option?.vendorNoPrefix || ''}
                      {option?.vendorNo || ''} {option?.displayName || ''}
                    </li>
                  )
                }}
                options={vendors}
                renderInput={params => <CustomTextField {...params} label='Vendor' />}
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
