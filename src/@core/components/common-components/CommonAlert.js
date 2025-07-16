// react imports
import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { createAlert, emptyAlerts } from 'src/store/apps/alerts'

// ** MUI Imports
import { Button } from '@mui/material'
import Alert from '@mui/material/Alert'

import Snackbar from '@mui/material/Snackbar'

const CommonAlert = () => {
  // const alertState = useSelector(state => state.alerts.state)
  const { alerts } = useSelector(state => state?.alerts)
  const [alert, setAlert] = useState({ type: '', message: '' })
  const [open, setOpen] = useState(false)
  const dispatch = useDispatch()

  useEffect(() => {
    if (alerts?.length > 0) {
      setAlert(alerts[alerts?.length - 1])
      setOpen(true)
      setTimeout(() => {
        setOpen(!open)
        dispatch(emptyAlerts())
      }, 2000)
    }
  }, [alerts])
  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }
    setOpen(false)
  }

  return (
    <>
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        open={open}
        onClose={handleClose}
        autoHideDuration={3000}
      >
        <Alert variant='filled' severity={alert.type || 'success'}>
          {alert.message || ''}
        </Alert>
      </Snackbar>
    </>
  )
}

export default CommonAlert
