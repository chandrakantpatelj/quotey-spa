import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { getGeneralExpensesByDateRangeQuery } from 'src/@core/components/graphql/general-expense-queries'
import { fetchData } from 'src/common-functions/GraphqlOperations'
import { lastMonthDate } from 'src/common-functions/utils/UtilityFunctions'
import { setAllExpenses, setExpenseLoading, setExpenseError } from 'src/store/apps/expenses'
import useOtherSettings from './useOtherSettings'

const useExpenses = tenantId => {
  const dispatch = useDispatch()

  const expenses = useSelector(state => state.expenses?.data || [])
  const expenseLoading = useSelector(state => state.expenses?.expenseLoading || false)
  const expenseError = useSelector(state => state.expenses?.expenseError || null)
  const { fetchOtherSettings } = useOtherSettings(tenantId)

  const fetchExensesFromApi = expenses?.length === 0
  const headerLoader = useSelector(state => state?.otherSettings.headerLoader)
  const reloadExpenseLoader = useSelector(state => state.expenses?.reloadExpenseLoader)

  useEffect(() => {
    const fetchExpenses = async () => {
      if (fetchExensesFromApi && tenantId) {
        const otherSettings = await fetchOtherSettings()

        const startDate = lastMonthDate(otherSettings?.moduleFilterDateDuration)
        const endDate = new Date()
        dispatch(setExpenseLoading(true))
        try {
          const response = await fetchData(getGeneralExpensesByDateRangeQuery(tenantId, startDate, endDate))
          dispatch(setAllExpenses(response?.getGeneralExpensesByDateRange || []))
        } catch (err) {
          dispatch(setExpenseLoading(false))
          dispatch(setExpenseError('Failed to fetch expenses'))
          console.error(err)
        }
      }
    }

    fetchExpenses()
  }, [tenantId, dispatch, reloadExpenseLoader, headerLoader, fetchOtherSettings])
  return { expenses, expenseLoading, expenseError }
}

export default useExpenses
