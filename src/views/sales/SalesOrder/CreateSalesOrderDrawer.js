'use client'
import { Alert, Backdrop, Box, CircularProgress, Drawer, Grid, IconButton, Snackbar, Typography } from '@mui/material'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Icon from 'src/@core/components/icon'
import ErrorBoundary from 'src/pages/ErrorBoundary'
import CreateSalesOrder from './CreateSalesOrder'

function CreateSalesOrderDrawer({ setOpenDrawer, openDrawer, customer }) {
  const dispatch = useDispatch()
  const tenant = useSelector(state => state.tenants?.selectedTenant)
  const { tenantId } = tenant || ''
  const [open, setOpen] = useState(false)
  const [loader, setLoader] = useState(false)

  function handleClose(event, reason) {
    if (reason === 'clickaway') {
      return
    }
    setOpen(false)
  }

  const toggleDrawer = open => event => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return
    }
    setOpenDrawer(open)
  }

  const handleCancelDrawer = () => {
    console.log('function called')
    setOpenDrawer(false)
  }

  return (
    <Drawer
      anchor='right'
      open={openDrawer}
      onClose={toggleDrawer(false)}
      sx={{ '& .MuiDrawer-paper': { width: { xs: '100%', sm: 1100 } } }}
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
        <Typography sx={{ fontSize: { xs: '16px', md: '20px' }, fontWeight: 500 }}>New Sales Order</Typography>

        <IconButton
          sx={{ fontSize: '28px' }}
          color='primary'
          onClick={() => handleCancelDrawer()}
          onKeyDown={toggleDrawer(false)}
        >
          <Icon icon='tabler:x' />
        </IconButton>
      </Box>
      <Box sx={{ p: { xs: '20px', lg: '40px' } }}>
        <ErrorBoundary tenantId={tenantId} dispatch={dispatch}>
          <Grid container spacing={{ xs: 6, md: 8, xl: 10 }}>
            <Grid item xs={12}>
              <CreateSalesOrder isSalesDrawer={true} handleCancelDrawer={handleCancelDrawer} />
            </Grid>
          </Grid>
        </ErrorBoundary>
      </Box>
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        open={open}
        autoHideDuration={3000}
        onClose={handleClose}
      >
        <Alert onClose={handleClose} severity='error' variant='filled' sx={{ width: '100%' }}>
          Please enter all required data
        </Alert>
      </Snackbar>
      {loader ? (
        <Backdrop sx={{ color: '#fff', zIndex: theme => theme.zIndex.drawer + 1 }} open={loader}>
          <CircularProgress color='inherit' />
        </Backdrop>
      ) : null}
    </Drawer>
  )
}

export default CreateSalesOrderDrawer
