import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { getQuotationsByDateRangeQuery } from 'src/@core/components/graphql/quotation-queries'
import { fetchData } from 'src/common-functions/GraphqlOperations'
import { setAllQuotations, setLoading, setError } from 'src/store/apps/quotations'
import useOtherSettings from './useOtherSettings'
import { lastMonthDate } from 'src/common-functions/utils/UtilityFunctions'

const useQuotations = tenantId => {
  const dispatch = useDispatch()

  const quotations = useSelector(state => state.quotations?.data || [])
  const loading = useSelector(state => state.quotations?.loading || false)
  const error = useSelector(state => state.quotations?.error || null)
  const fetchQuotationsFromApi = quotations?.length === 0
  const { fetchOtherSettings } = useOtherSettings(tenantId)
  const headerLoader = useSelector(state => state?.otherSettings.headerLoader)
  const reloadQuotation = useSelector(state => state.quotations?.reloadQuotation)

  useEffect(() => {
    const fetchQuotations = async () => {
      if (fetchQuotationsFromApi && tenantId) {
        const otherSettings = await fetchOtherSettings()

        const startDate = lastMonthDate(otherSettings?.moduleFilterDateDuration)
        const endDate = new Date()
        dispatch(setLoading(true))
        try {
          const response = await fetchData(getQuotationsByDateRangeQuery(tenantId, startDate, endDate))
          const allQuotations = response?.getQuotationsByDateRange

          dispatch(setAllQuotations(allQuotations))
        } catch (err) {
          dispatch(setLoading(false))
          dispatch(setError('Failed to fetch quotations'))
          console.error(err)
        }
      }
    }

    fetchQuotations()
  }, [tenantId, dispatch, reloadQuotation, headerLoader, fetchOtherSettings])
  return { quotations, loading, error }
}

export default useQuotations
