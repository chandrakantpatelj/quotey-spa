// ** Next Import
import PageHeader from 'src/@core/components/page-header'
import PageWrapper from 'src/@core/layouts/PageWrapper'
import { Typography } from '@mui/material'
import ViewSalesReport from 'src/views/reports/Sales/ViewSalesReport'

function SalesReports() {
  return (
    <>
      <PageHeader
        title={
          <Typography
            sx={{
              fontSize: { xs: '16px', md: '18px' },
              fontWeight: '500'
            }}
          >
            Sales Reports
          </Typography>
        }
      />
      <PageWrapper>
        <ViewSalesReport />
      </PageWrapper>
    </>
  )
}

export default SalesReports
