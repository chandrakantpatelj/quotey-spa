import { useState, useEffect } from 'react'
import PageHeader from 'src/@core/components/page-header'
import PageWrapper from 'src/@core/layouts/PageWrapper'
import { Typography, LinearProgress } from '@mui/material'
import { useSelector } from 'react-redux'
import FilterComponent from 'src/views/reports/FilterComponent'
import { fetchData } from 'src/common-functions/GraphqlOperations'
import { getBLReportsQueryByDateRange } from 'src/@core/components/graphql/reports-queries'
import {
  DateFunction,
  groupAccountsByCurrency,
  groupAccountsByCurrencyAndType,
  lastMonthDate
} from 'src/common-functions/utils/UtilityFunctions'
import ViewBalanceSheet from 'src/views/reports/ViewBalanceSheet'
import useOtherSettings from 'src/hooks/getData/useOtherSettings'

function Reports() {
  const tenantId = useSelector(state => state.tenants?.selectedTenant?.tenantId) || ''
  const [loading, setLoading] = useState(false)
  const [filteredAccounts, setFilteredAccounts] = useState([])
  const [expenseAccounts, setExpenseAccounts] = useState([])
  const [assests, setAssests] = useState([])
  const [liabilities, setLiabilities] = useState([])
  const [equities, setEquities] = useState([])
  const [totalIncome, settotalIncome] = useState(0)
  const [totalExpense, settotalExpense] = useState(0)
  const [totalAssests, setTotalAssests] = useState(0)
  const [totalLiabilites, setTotalLiabilites] = useState(0)
  const [totalEquity, setTotalEquity] = useState(0)
  const { fetchOtherSettings } = useOtherSettings(tenantId)
  const [endDate, setEndDate] = useState(DateFunction(new Date()))
  const [startDate, setStartDate] = useState(null)

  async function getData(method, startDate, endDate) {
    try {
      setLoading(true)
      setStartDate(DateFunction(startDate))
      setEndDate(DateFunction(endDate))
      const data = await fetchData(getBLReportsQueryByDateRange(tenantId, method, startDate, endDate))
      const { getBalanceSheetReportByDateRange } = data
      let filteredReport = groupAccountsByCurrencyAndType(getBalanceSheetReportByDateRange)
      setFilteredAccounts(filteredReport)
    } catch (error) {
      console.error('Error fetching reports:', error)
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
            Balance Sheet Reports
          </Typography>
        }
        button={<FilterComponent getData={getData} />}
      />
      <PageWrapper>
        {loading ? (
          <LinearProgress />
        ) : (
          <ViewBalanceSheet
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
