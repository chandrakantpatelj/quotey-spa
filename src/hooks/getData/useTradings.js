import { useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { getTradingQuery, getTradingsByDateRangeQuery } from 'src/@core/components/graphql/trading-queries'
import { fetchData } from 'src/common-functions/GraphqlOperations'
import { lastMonthDate } from 'src/common-functions/utils/UtilityFunctions'
import { setAllTrading, setError, setTradingLoading } from 'src/store/apps/tradings'
import useOtherSettings from './useOtherSettings'

const useTradings = tenantId => {
  const dispatch = useDispatch()
  const tradings = useSelector(state => state.tradings?.data || [])
  const tradingLoading = useSelector(state => state.tradings?.tradingLoading || false)
  const error = useSelector(state => state.tradings?.error || null)
  const fetchTradingsFromApi = tradings?.length === 0
  const { fetchOtherSettings } = useOtherSettings(tenantId)
  const headerLoader = useSelector(state => state?.otherSettings.headerLoader)
  const reloadTradingLoader = useSelector(state => state.tradings?.reloadTradingLoader)

  const fetchTradings = useCallback(
    async (startDateParam, endDateParam) => {
      if (!tenantId) return []
      if (!fetchTradingsFromApi && !startDateParam && !endDateParam) return tradings

      const otherSettings = await fetchOtherSettings()

      const startDate = startDateParam || lastMonthDate(otherSettings?.moduleFilterDateDuration)
      const endDate = endDateParam || new Date()

      dispatch(setTradingLoading(true))

      try {
        const response = await fetchData(getTradingsByDateRangeQuery(tenantId, startDate, endDate))
        const allTradings = response?.getTradingsByDateRange || []

        if (!startDateParam && !endDateParam) {
          dispatch(setAllTrading(allTradings))
        }

        return allTradings
      } catch (err) {
        dispatch(setError(response.errors[0].message))

        console.error(err)
        return []
      } finally {
        dispatch(setTradingLoading(false))
      }
    },
    [tenantId, dispatch, reloadTradingLoader, headerLoader, fetchOtherSettings]
  )

  const fetchSingleTrading = useCallback(
    async tradingId => {
      if (!tradingId) return null
      const existingTrading = tradings.find(order => order.tradingId === tradingId)
      if (existingTrading) return existingTrading
      try {
        dispatch(setTradingLoading(true))
        const response = await fetchData(getTradingQuery(tenantId, tradingId))
        const trading = response.getTrading || null

        return trading
      } catch (err) {
        dispatch(setError(response.errors[0].message))
        console.error(err)
        return null
      } finally {
        dispatch(setTradingLoading(false))
      }
    },
    [tenantId, tradings, dispatch]
  )
  return { tradings, fetchTradings, fetchSingleTrading, tradingLoading, error }
}

export default useTradings
