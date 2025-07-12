import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { getAccountEntriesByDateRangeQuery } from 'src/@core/components/graphql/account-transaction-queries'
import { fetchData } from 'src/common-functions/GraphqlOperations'
import { lastMonthDate } from 'src/common-functions/utils/UtilityFunctions'
import { setAccountTransactionLoading, setAllAccountTransactions, setError } from 'src/store/apps/account-transactions'
import useOtherSettings from './useOtherSettings'

const useAccountTransactions = tenantId => {
  const dispatch = useDispatch()

  const accountTransactions = useSelector(state => state.accountTransactions?.data || [])
  const loading = useSelector(state => state.accountTransactions?.loading || false)
  const error = useSelector(state => state.accountTransactions?.error || null)
  const headerLoader = useSelector(state => state?.otherSettings.headerLoader)
  const reloadAccountTransactionLoader = useSelector(state => state.accountTransactions?.reloadAccountTransactionLoader)
  const { fetchOtherSettings } = useOtherSettings(tenantId)

  useEffect(() => {
    const fetchAccountEntries = async () => {
      if (accountTransactions?.length === 0 && tenantId) {
        const otherSettings = await fetchOtherSettings()

        const startDate = lastMonthDate(otherSettings?.moduleFilterDateDuration)
        const endDate = new Date()
        dispatch(setAccountTransactionLoading(true))
        try {
          const response = await fetchData(getAccountEntriesByDateRangeQuery(tenantId, startDate, endDate))
          dispatch(setAllAccountTransactions(response?.getAccountEntriesByDateRange || []))
        } catch (err) {
          dispatch(setAccountTransactionLoading(false))
          dispatch(setError('Failed to fetch account transactions by date range'))
          console.error(err)
        }
      }
    }

    fetchAccountEntries()
  }, [tenantId, dispatch, reloadAccountTransactionLoader, headerLoader, fetchOtherSettings])
  return { accountTransactions, loading, error }
}

export default useAccountTransactions
