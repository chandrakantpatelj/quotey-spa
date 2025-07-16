import { Close } from '@mui/icons-material'
import { Grid, IconButton, Typography } from '@mui/material'
import Link from 'next/link'
import { useDispatch, useSelector } from 'react-redux'
import PageHeader from 'src/@core/components/page-header'
import PageWrapper from 'src/@core/layouts/PageWrapper'
import ErrorBoundary from 'src/pages/ErrorBoundary'
import CreateSalesOrder from 'src/views/sales/SalesOrder/CreateSalesOrder'

function SalesOrder() {
  const dispatch = useDispatch()

  const tenant = useSelector(state => state.tenants?.selectedTenant) || {}
  const { tenantId = '' } = tenant

  return (
    <ErrorBoundary tenantId={tenantId} dispatch={dispatch}>
      <PageHeader
        title={
          <Typography
            sx={{
              fontSize: { xs: '16px', md: '18px' },
              fontWeight: '500'
            }}
          >
            New Sales Order
          </Typography>
        }
        button={
          <IconButton
            variant='outlined'
            color='default'
            sx={{ fontSize: '21px' }}
            component={Link}
            scroll={true}
            href={`/sales/sales-order/`}
          >
            <Close sx={{ color: theme => theme.palette.primary.main }} />
          </IconButton>
          // )
        }
      />
      <PageWrapper>
        <Grid container spacing={{ xs: 6, md: 8, xl: 10 }}>
          <Grid item xs={12} xl={11}>
            <CreateSalesOrder />
          </Grid>
        </Grid>
      </PageWrapper>
    </ErrorBoundary>
  )
}

export default SalesOrder
