import { useState } from 'react'

import { Card, Grid, Box, Typography } from '@mui/material'
import PageWrapper from 'src/@core/layouts/PageWrapper'
import Icon from 'src/@core/components/icon'
// import ApexChartWrapper from 'src/@core/styles/libs/react-apexcharts'

import PendingInvoicesChart from 'src/views/dashboard/PendingInvoicesChart'
import { useSelector } from 'react-redux'
import useDashboardData from 'src/hooks/getData/useDashboardData'
import CustomDatePicker from 'src/views/forms/form-elements/pickers/CustomDatePicker'
import PageHeader from 'src/@core/components/page-header'
import { NumberFormat } from 'src/common-functions/utils/UtilityFunctions'

function Dashboard() {
  const tenantId = useSelector(state => state.tenants?.selectedTenant?.tenantId)
  const localCurrency = useSelector(state => state?.currencies?.selectedCurrency) || {}

  const [currenctDate, setCurrenctDate] = useState(new Date())
  const { dashboardData = [] } = useDashboardData(tenantId, currenctDate)

  const filteredCardsData = dashboardData?.filter(
    item => !item.key.startsWith('current_fy_monthly_sale') && !item.key.startsWith('previous_fy_monthly_sale')
  )

  const filteredSalesGraphData = dashboardData?.filter(
    item => item.key.startsWith('current_fy_monthly_sale') || item.key.startsWith('previous_fy_monthly_sale')
  )

  const keyMappings = {
    currentMonthToDateSales: 'Sale (Month To Date)',
    previousMonthToDateSales: 'Sale (Prev Month To Date)',
    previousMonthSales: 'Sale (Prev Month)',
    currentFinancialYearToDateSales: 'Sale (Year To Date)',
    previousFinancialYearToDateSales: 'Sale (Prev Year To Date)',
    previousFinancialYearSales: 'Sale (Prev Financial Year)'
  }

  const toTitleCase = str => {
    return keyMappings[str]
  }

  return (
    <>
      <PageHeader
        button={
          <Box sx={{ maxWidth: '200px', width: '100%', ml: 'auto' }}>
            <CustomDatePicker
              label={'Date'}
              fullWidth={true}
              date={currenctDate}
              onChange={date => setCurrenctDate(date)}
            />
          </Box>
        }
      />
      <PageWrapper>
        <Grid container spacing={{ xs: 8, md: 10, xl: 10 }}>
          <Grid item xs={12}>
            <Grid container spacing={{ xs: 2, md: 4 }} columns={12}>
              {/* <Grid item xs={5} sm={5} md={2} lg={5} xl={2}>
                  <Card sx={{ p: 4, height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <Icon icon='streamline:return-2' style={{ width: '32px', height: '32px', color: '#DEA966' }} />
                      <Typography sx={{ fontSize: '16px', fontWeight: 500, color: '#041833' }}>Return</Typography>{' '}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <Typography sx={{ fontSize: { xs: '18px', md: '20px' }, fontWeight: 600, color: '#083166' }}>
                        $10239.00 <span style={{ fontSize: '13px', fontWeight: 500, color: '#DEA966' }}>-1.42</span>{' '}
                      </Typography>{' '}
                    </Box>
                    <Typography sx={{ fontSize: '13px', fontWeight: 400 }} color='secondary'>
                      Compared to $34.100
                    </Typography>
                  </Card>
                </Grid> */}
              {filteredCardsData?.map(item => {
                const formattedText = toTitleCase(item?.key)
                return (
                  <Grid item xs={12} sm={6} md={4} lg={4} xl={2} key={item?.key}>
                    <Card sx={{ p: 4, height: '100%' }}>
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: { xs: 'row', sm: 'column' },
                          justifyContent: 'space-between',
                          gap: 2,
                          height: '100%'
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Typography
                            sx={{
                              fontSize: { xs: '14px', md: '16px' },
                              fontWeight: 500,
                              color: '#041833',
                              wordBreak: 'break-word'
                            }}
                          >
                            {formattedText}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                            <Icon
                              icon='iconoir:receive-dollars'
                              style={{ fontSize: '32px', verticalAlign: 'middle', color: '#4567c6' }}
                            />{' '}
                          </Box>
                          <Typography sx={{ fontSize: { xs: '16px', md: '20px' }, fontWeight: 600, color: '#083166' }}>
                            <NumberFormat value={item?.value} currency={localCurrency} />
                          </Typography>
                        </Box>
                      </Box>
                    </Card>
                  </Grid>
                )
              })}
            </Grid>
          </Grid>
          <Grid item xs={12}>
            {/* <h5>test</h5> */}

            <Typography
              sx={{
                fontSize: '16px',
                fontWeight: '500',
                textAlign: 'left',
                mb: '10px'
              }}
            >
              Sales Figures
            </Typography>
            <Box component={'div'}>
              <PendingInvoicesChart data={filteredSalesGraphData} currency={localCurrency} />
            </Box>
          </Grid>
        </Grid>
      </PageWrapper>
    </>
  )
}

export default Dashboard
