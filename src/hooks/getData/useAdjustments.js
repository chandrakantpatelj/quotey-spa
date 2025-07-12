import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { getStockAdjustmentsByDateRangeQuery } from 'src/@core/components/graphql/stock-adjustment-queries'
import { fetchData } from 'src/common-functions/GraphqlOperations'
import { lastMonthDate } from 'src/common-functions/utils/UtilityFunctions'
import { setAllStockAdjustments, setError, setLoading } from 'src/store/apps/stock-adjustments'
import useOtherSettings from './useOtherSettings'

const useAdjustments = tenantId => {
  const dispatch = useDispatch()
  const stockAdjustments = useSelector(state => state.stockAdjustments?.data || [])
  const loading = useSelector(state => state.stockAdjustments?.loading)
  const error = useSelector(state => state.stockAdjustments?.error || null)
  const fetchAdjustmentsFromApi = stockAdjustments?.length === 0
  const headerLoader = useSelector(state => state?.otherSettings.headerLoader)
  const reloadStock = useSelector(state => state.stockAdjustments?.reloadStock)
  const { fetchOtherSettings } = useOtherSettings(tenantId)

  useEffect(() => {
    const fetchAdjustments = async () => {
      if (fetchAdjustmentsFromApi && tenantId) {
        const otherSettings = await fetchOtherSettings()

        const startDate = lastMonthDate(otherSettings?.moduleFilterDateDuration)
        const endDate = new Date()
        dispatch(setLoading(true))
        try {
          const response = await fetchData(getStockAdjustmentsByDateRangeQuery(tenantId, startDate, endDate))
          const allAdjustments = response?.getStockAdjustmentsByDateRange
          dispatch(setAllStockAdjustments(allAdjustments))
        } catch (error) {
          dispatch(setLoading(false))
          dispatch(setError('Failed to fetch stock adjustments'))
          console.error(error)
        }
      }
    }

    fetchAdjustments()
  }, [tenantId, dispatch, reloadStock, headerLoader, fetchOtherSettings])

  return { stockAdjustments, loading, error }
}

export default useAdjustments
