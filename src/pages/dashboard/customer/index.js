import { Grid } from '@mui/material'
import ApexChartWrapper from 'src/@core/styles/libs/react-apexcharts'

import PageWrapper from 'src/@core/layouts/PageWrapper'
import EcommerceCongratulationsJohn from 'src/views/dashboard/CustomerDashboard/EcommerceCongratulationsJohn'
import EcommerceEarningReports from 'src/views/dashboard/CustomerDashboard/EcommerceEarningReports'
import EcommerceExpenses from 'src/views/dashboard/CustomerDashboard/EcommerceExpenses'
import EcommerceGeneratedLeads from 'src/views/dashboard/CustomerDashboard/EcommerceGeneratedLeads'
import EcommerceInvoiceTable from 'src/views/dashboard/CustomerDashboard/EcommerceInvoiceTable'
import EcommerceOrders from 'src/views/dashboard/CustomerDashboard/EcommerceOrders'
import EcommercePopularProducts from 'src/views/dashboard/CustomerDashboard/EcommercePopularProducts'
import EcommerceProfit from 'src/views/dashboard/CustomerDashboard/EcommerceProfit'
import EcommerceRevenueReport from 'src/views/dashboard/CustomerDashboard/EcommerceRevenueReport'
import EcommerceStatistics from 'src/views/dashboard/CustomerDashboard/EcommerceStatistics'
import EcommerceTransactions from 'src/views/dashboard/CustomerDashboard/EcommerceTransactions'

function CustomerDashboard() {
  return (
    <ApexChartWrapper>
      <PageWrapper>
        <Grid container spacing={6}>
          <Grid item xs={12} md={4}>
            <EcommerceCongratulationsJohn />
          </Grid>
          <Grid item xs={12} md={8}>
            <EcommerceStatistics />
          </Grid>
          <Grid item xs={12} lg={4}>
            <Grid container spacing={6}>
              <Grid item xs={6} md={3} lg={6}>
                <EcommerceExpenses />
              </Grid>
              <Grid item xs={6} md={3} lg={6}>
                <EcommerceProfit />
              </Grid>
              <Grid item xs={12} md={6} lg={12}>
                <EcommerceGeneratedLeads />
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} lg={8}>
            <EcommerceRevenueReport />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <EcommerceEarningReports />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <EcommercePopularProducts />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <EcommerceOrders />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <EcommerceTransactions />
          </Grid>
          <Grid item xs={12} lg={8}>
            <EcommerceInvoiceTable />
          </Grid>
        </Grid>
      </PageWrapper>
    </ApexChartWrapper>
  )
}

export default CustomerDashboard
