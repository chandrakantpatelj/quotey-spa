import { Box, Divider, Drawer, Grid, IconButton, Typography } from '@mui/material'
import { useState } from 'react'
import Icon from 'src/@core/components/icon'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import CustomTextField from 'src/@core/components/mui/text-field'
import CreateExpenseDrawer from './CreateExpenseDrawer'
import CreatePurchasePaymentDrawer from './CreatePurchasePaymentDrawer'
import CreateTaxPaymentDrawer from './CreateTaxPaymentDrawer'

function TransactionExpenseDrawer({ setOpenDrawer, transaction, openDrawer, setTransactions }) {
  console.log('transaction', transaction)
  const ModuleList = ['Expenses', 'Purchase Order Payment', 'Tax Payment']
  const [formModule, setFormModule] = useState(ModuleList[0])

  const toggleDrawer = open => event => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return
    }
    setOpenDrawer(open)
  }

  const switchModule = moduleName => {
    switch (moduleName) {
      case 'Expenses':
        return (
          <CreateExpenseDrawer
            setOpenDrawer={setOpenDrawer}
            transaction={transaction}
            setTransactions={setTransactions}
          />
        )
      case 'Purchase Order Payment':
        return (
          <CreatePurchasePaymentDrawer
            setOpenDrawer={setOpenDrawer}
            transaction={transaction}
            setTransactions={setTransactions}
          />
        )

      case 'Tax Payment':
        return (
          <CreateTaxPaymentDrawer
            setOpenDrawer={setOpenDrawer}
            transaction={transaction}
            setTransactions={setTransactions}
          />
        )
    }
  }

  return (
    <Drawer
      anchor='right'
      open={openDrawer}
      onClose={toggleDrawer(false)}
      sx={{ '& .MuiDrawer-paper': { width: { xs: '100%', sm: 600 } } }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: { xs: '20px', lg: '22px' },
          borderBottom: '1px solid #DBDBDB'
        }}
      >
        <Typography sx={{ fontSize: { xs: '16px', md: '20px' }, fontWeight: 500 }}>Expense</Typography>

        <IconButton
          sx={{ fontSize: '28px' }}
          color='primary'
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}
        >
          <Icon icon='tabler:x' />
        </IconButton>
      </Box>
      <Grid container spacing={{ xs: 6 }} sx={{ p: { xs: '20px', lg: '40px' } }}>
        <Grid item xs={6} md={6}>
          <CustomAutocomplete
            options={ModuleList}
            getOptionLabel={option => option || ''}
            value={formModule}
            onChange={(e, newValue) => {
              setFormModule(newValue)
            }}
            disableClearable
            renderInput={params => <CustomTextField {...params} label='Type' />}
          />
        </Grid>
        <Grid item xs={12}>
          <Divider variant='fullWidth' orientation='horizontal' sx={{ display: 'block' }} />
        </Grid>
        <Grid item xs={12} md={12}>
          {switchModule(formModule)}
        </Grid>
      </Grid>
    </Drawer>
  )
}

export default TransactionExpenseDrawer
