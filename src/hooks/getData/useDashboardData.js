import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { getDashboardStatesForSalesInvoicesQuery } from 'src/@core/components/graphql/dashboard-queries'
import { fetchData } from 'src/common-functions/GraphqlOperations'

const useDashboardData = (tenantId, currentDate) => {
  const dispatch = useDispatch()

  const headerLoader = useSelector(state => state?.otherSettings.headerLoader)

  const [dashboardData, setDashboardData] = useState([])
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (tenantId) {
        try {
          const response = await fetchData(getDashboardStatesForSalesInvoicesQuery(tenantId, currentDate))
          const allData = response?.getDashboardStatesForSalesInvoices
          setDashboardData(allData)
        } catch (error) {
          console.error(error)
        }
      }
    }

    fetchDashboardData()
  }, [tenantId, currentDate, dispatch, headerLoader])

  return { dashboardData }
}

export default useDashboardData
