import React, { useState, useEffect } from 'react'
import PageHeader from 'src/@core/components/page-header'
import PageWrapper from 'src/@core/layouts/PageWrapper'
import { Typography, Button, LinearProgress } from '@mui/material'
import ViewReportsTable from 'src/views/reports/ViewReportsTable'
import { useSelector } from 'react-redux'
import FilterComponent from 'src/views/reports/FilterComponent'
import { fetchData } from 'src/common-functions/GraphqlOperations'
import { getPLReportsQueryByDateRange, viewReportsQuery } from 'src/@core/components/graphql/reports-queries'
import {
  DateFunction,
  groupAccountsByCurrency,
  groupAccountsByCurrencyAndType,
  lastMonthDate
} from 'src/common-functions/utils/UtilityFunctions'
import useOtherSettings from 'src/hooks/getData/useOtherSettings'

function Reports() {
  const tenantId = useSelector(state => state.tenants?.selectedTenant?.tenantId) || null
  const [loading, setLoading] = useState(false)
  const [incomeAccounts, setIncomeAccounts] = useState([])
  const [expenseAccounts, setExpenseAccounts] = useState([])
  const [totalIncome, settotalIncome] = useState(0)
  const [totalExpense, settotalExpense] = useState(0)
  const { fetchOtherSettings } = useOtherSettings(tenantId)
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(DateFunction(new Date()))
  const [filteredAccounts, setFilteredAccounts] = useState([])

  async function getData(method, startDate, endDate) {
    try {
      setStartDate(DateFunction(startDate))
      setEndDate(DateFunction(endDate))
      setLoading(true)
      const data = await fetchData(getPLReportsQueryByDateRange(tenantId, method, startDate, endDate))
      const { getProfitAndLossReportByDateRange } = data
      let filteredReport = groupAccountsByCurrencyAndType(getProfitAndLossReportByDateRange)
      setFilteredAccounts(filteredReport)
    } catch (error) {
      console.error('Error fetching preports:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const initSettingsAndStartDate = async () => {
      const otherSettings = await fetchOtherSettings()
      const filterDuration = otherSettings?.moduleFilterDateDuration || null

      const calculatedDate = lastMonthDate(filterDuration)
      getData('CASH', DateFunction(calculatedDate), endDate)
    }

    initSettingsAndStartDate()
  }, [tenantId, fetchOtherSettings])

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
            Profit & Loss Reports
          </Typography>
        }
        button={<FilterComponent getData={getData} />}
      />
      <PageWrapper>
        {loading ? (
          <LinearProgress />
        ) : (
          <ViewReportsTable
            loading={loading}
            filteredAccounts={filteredAccounts}
            startDate={startDate}
            endDate={endDate}
          />
        )}
      </PageWrapper>
    </>
  )
}

export default Reports
