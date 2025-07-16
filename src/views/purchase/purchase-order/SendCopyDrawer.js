import React, { useEffect, useState } from 'react'
import { Button, Drawer, Box, Grid, Typography, TextField, IconButton } from '@mui/material'
import Icon from 'src/@core/components/icon'
import { useSelector, useDispatch } from 'react-redux'
import { setAllPurchaseOrder } from 'src/store/apps/purchaseorder'
import { writeData } from 'src/common-functions/GraphqlOperations'
import { sendPurchaseOrderMutation } from 'src/@core/components/graphql/purchase-order-pdf-queries'
import { createAlert } from 'src/store/apps/alerts'
import { STATUS_DRAFT } from 'src/common-functions/utils/Constants'
import useVendors from 'src/hooks/getData/useVendors'

function SendCopyDrawer({ order, setOpenSendCopyDrawer, openSendCopyDrawer }) {
  const tenant = useSelector(state => state.tenants?.selectedTenant)
  const { tenantId } = tenant || ''
  const purchaseOrder = useSelector(state => state.purchaseOrder?.data)
  const { vendors } = useVendors(tenantId)

  const dispatch = useDispatch()
  const [sendTo, setSendTo] = useState([])
  const [sendCC, setSendCC] = useState([])

  const [emailError, setEmailError] = useState('')

  useEffect(() => {
    const vendor = vendors?.find(vendor => vendor.vendorId === order.vendorId)

    if (vendor.emailAddress) {
      setSendTo([vendor.emailAddress])
      setEmailError('') // Reset error when a valid email is set
    } else {
      setEmailError('field is mandatory')
    }
  }, [vendors])

  const isValidEmail = email => {
    // Regular expression for a simple email validation
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g
    return emailRegex.test(email)
  }

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

  const handleSendOrder = async () => {
    setOpenSendCopyDrawer(false)
    try {
      const response = await writeData(sendPurchaseOrderMutation(), {
        tenantId,
        orderId: order.orderId,
        sendCopyTO: sendTo,
        sendCopyCC: sendCC
      })

      if (response.generateAndEmailPDFPo) {
        dispatch(createAlert({ message: 'PDF sent successfully.', type: 'success' }))
        if (order.status === STATUS_DRAFT) {
          const filteredPO = purchaseOrder?.map(item => {
            if (item?.orderId === response.generateAndEmailPDFPo?.orderId) {
              return { ...item, status: response?.generateAndEmailPDFPo?.status }
            } else {
              return item
            }
          })

          dispatch(setAllPurchaseOrder(filteredPO))
        }
      } else {
        const errorMessage = response?.errors?.[0] ? response.errors[0].message : 'Failed to send purchase order PDF.'
        dispatch(createAlert({ message: errorMessage, type: 'error' }))
      }
    } catch (error) {
      console.log('error', error)
    }
  }
  return (
    <Drawer
      anchor='right'
      open={openSendCopyDrawer}
      onClose={toggleDrawer(false)}
      sx={{ '& .MuiDrawer-paper': { width: { xs: '100%', sm: 425 } } }}
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
  )
}

export default SendCopyDrawer
