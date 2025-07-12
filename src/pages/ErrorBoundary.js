import { Alert, Box, Button, Grid, Typography } from '@mui/material'
import React from 'react'
import { styled } from '@mui/material/styles'
import { writeData } from 'src/common-functions/GraphqlOperations'
import { createTicketMutation } from 'src/@core/components/graphql/helpdesk-queries'
import { SCHEMA_VERSION } from 'src/common-functions/utils/Constants'
import { createAlert } from 'src/store/apps/alerts'

const BoxWrapper = styled(Box)(({ theme }) => ({
  [theme.breakpoints.down('md')]: {
    width: '90vw'
  }
}))

const Img = styled('img')(({ theme }) => ({
  [theme.breakpoints.down('lg')]: {
    height: 450,
    marginTop: theme.spacing(10)
  },
  [theme.breakpoints.down('md')]: {
    height: 400
  },
  [theme.breakpoints.up('lg')]: {
    marginTop: theme.spacing(20)
  }
}))
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)

    // Define a state variable to track whether is an error or not
    // this.state = { hasError: false }
    this.state = {
      hasError: false,
      isReportSent: false, // New state variable to track if the error report has been sent
      error: '',
      ticketId: ''
    }
  }
  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI

    return { hasError: true }
  }
  componentDidCatch(error, errorInfo) {
    // You can use your own error logging service here
    this.setState({ error: { errorMessage: error.message, errorInfo: errorInfo.componentStack } })
    console.log({ error, errorInfo })
  }
  async handleSendError(state) {
    const { tenantId, dispatch } = this.props
    try {
      const response = await writeData(createTicketMutation(), {
        tenantId,
        ticket: { schemaVersion: SCHEMA_VERSION, description: state.error, tenantId }
      })
      if (response.createTicket) {
        dispatch(createAlert({ message: 'Ticket Raised Successfully!', type: 'success' }))
        this.setState({ isReportSent: true, ticketId: response.createTicket.ticketId })
      }
    } catch (error) {
      console.error('Error sending error report:', error)
      dispatch(createAlert({ message: 'something wrong, try again !', type: 'error' }))
    }
  }
  render() {
    // Check if an error is thrown
    if (this.state.hasError) {
      // Render custom fallback UI
      return (
        <Box sx={{ textAlign: 'center', paddingTop: '50px', minHeight: '100vh' }}>
          <Typography variant='h1' sx={{ color: '#333', fontWeight: 'bold', mb: 2 }}>
            Ooops...
          </Typography>
          <Typography variant='h5' sx={{ color: '#555', mb: 4 }}>
            The page you are looking for does not exist or an error occurred.
            <br /> If this issue persists, please consider sending an error report to our development team.
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
            <Grid container spacing={2} justifyContent='center'>
              <Grid item>
                <Img height='250' alt='error-illustration' src='/images/pages/404.png' />
              </Grid>
            </Grid>
          </Box>
          <Button
            variant='contained'
            color='secondary'
            disabled={this.state.isReportSent}
            onClick={e => {
              this.handleSendError(this.state)
            }}
            sx={{
              backgroundColor: '#d9534f', // Custom color for error reporting
              color: '#fff',
              padding: '10px 20px',
              textTransform: 'none',
              fontSize: '16px'
            }}
          >
            {this.state.isReportSent ? 'Report Sent' : 'Send Error Report'}
          </Button>
          <Typography variant='h6' sx={{ color: '#555', fontWeight: 'bold', m: 4 }}>
            {this.state.isReportSent ? `Ticket Id: ${this.state.ticketId}` : 'Ticket Id: No Ticket Raised Yet'}
          </Typography>
        </Box>
      )
    }

    // Return children components in case of no error
    return this.props.children
  }
}

export default ErrorBoundary
