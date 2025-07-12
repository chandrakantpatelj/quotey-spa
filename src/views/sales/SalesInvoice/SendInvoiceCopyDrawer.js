import { Box, Button, Drawer, Grid, IconButton, TextField, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Icon from 'src/@core/components/icon'
import useCustomers from 'src/hooks/getData/useCustomers'
import { sendSalesOrder } from 'src/store/apps/sales'

function SendInvoiceCopyDrawer({ order, setOpenSendCopyDrawer, openSendCopyDrawer }) {
  const dispatch = useDispatch()
  const [sendTo, setSendTo] = useState([])
  const [sendCC, setSendCC] = useState([])
  const tenant = useSelector(state => state.tenants?.selectedTenant)
  const { tenantId } = tenant || ''
  const { fetchSingleCustomer } = useCustomers(tenantId)
  const [emailError, setEmailError] = useState('')

  const [customer, setCustomer] = useState({})

  useEffect(() => {
    const getCustomerObject = async () => {
      const customer = await fetchSingleCustomer(order?.customerId)
      if (customer) {
        setCustomer(customer)
      }
    }
    getCustomerObject()
  }, [tenantId, order?.customerId])

  const isValidEmail = email => {
    // Regular expression for a simple email validation
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g
    return emailRegex.test(email)
  }

  useEffect(() => {
    if (customer && customer.emailAddress) {
      setSendTo([customer.emailAddress])
      setEmailError('') // Reset error when a valid email is set
    } else {
      setEmailError('field is mandatory')
    }
  }, [customer])

  const handleInputChange = e => {
    const inputValue = e.target.value
    console.log(inputValue)
    // Validate each email in the array before updating state
    if (isValidEmail(inputValue)) {
      setEmailError('')
    } else {
      setEmailError('Invalid email address')
    }
    setSendTo([inputValue])
  }

  const toggleDrawer = open => event => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return
    }
    setOpenSendCopyDrawer(open)
  }
  console.log('order', order)
  const handleSendOrder = async () => {
    sendSalesOrder(tenantId, order?.invoiceId || order?.salesInvoiceId, sendTo, sendCC, dispatch)
    setOpenSendCopyDrawer(false)
  }

  return (
    <>
      {/* <Button variant='contained' sx={{ display: 'block', ml: 'auto' }} onClick={toggleDrawer(true)}>
        Send Copy
      </Button> */}
      <Drawer
        anchor='right'
        open={openSendCopyDrawer}
        onClose={toggleDrawer(false)}
        sx={{ '& .MuiDrawer-paper': { width: { xs: '100%', sm: 465 } } }}
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
          <Typography sx={{ fontSize: { xs: '16px', md: '20px' }, fontWeight: 500 }}>Send Copy</Typography>

          <IconButton
            sx={{ fontSize: '28px' }}
            color='primary'
            onClick={toggleDrawer(false)}
            onKeyDown={toggleDrawer(false)}
          >
            <Icon icon='tabler:x' />
          </IconButton>
        </Box>
        <Box sx={{ p: { xs: '20px', lg: '40px' } }}>
          <Grid container spacing={6}>
            <Grid item xs={12}>
              {' '}
              {/* <CustomTextField name='symbol' variant='standard' label='To' fullWidth /> */}
              <Grid item xs={12}>
                <div style={{ position: 'absolute' }}>
                  <label>To:</label>
                </div>
                <div style={{ position: 'relative' }}>
                  <TextField
                    variant='standard'
                    sx={{ minWidth: '100%', paddingLeft: '30px' }}
                    inputProps={{
                      style: { fontSize: 12 }
                    }}
                    value={sendTo.join(', ')} // Display the array as a comma-separated string
                    onChange={handleInputChange}
                    helperText={emailError}
                    error={Boolean(emailError)}
                  />
                </div>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <div style={{ position: 'absolute' }}>
                <label>CC:</label>
              </div>
              <div style={{ position: 'relative' }}>
                <TextField
                  variant='standard'
                  sx={{ minWidth: '100%', paddingLeft: '30px' }}
                  inputProps={{
                    style: { fontSize: 12 }
                  }}
                  onChange={e => {
                    setSendCC([e.target.value])
                  }}
                />
              </div>
            </Grid>
          </Grid>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: { xs: 'center', sm: 'end' },
              gap: '20px',
              marginTop: { xs: '30px', md: '50px' }
            }}
          >
            <Button variant='contained' onClick={handleSendOrder} disabled={Boolean(emailError)}>
              Send
            </Button>
            <Button variant='outlined' onClick={toggleDrawer(false)}>
              Cancel
            </Button>
          </Box>
        </Box>
      </Drawer>
    </>
  )
}

export default SendInvoiceCopyDrawer
