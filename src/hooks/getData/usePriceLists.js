import { useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { fetchData } from 'src/common-functions/GraphqlOperations'
import { lastMonthDate } from 'src/common-functions/utils/UtilityFunctions'
import useOtherSettings from './useOtherSettings'
import { getPriceListByDateRangeQuery } from 'src/@core/components/graphql/priceList-queries'
import { setError, setPriceListLoading, setPriceLists } from 'src/store/apps/priceLists'

const usePriceLists = tenantId => {
  const dispatch = useDispatch()
  const priceListLoading = useSelector(state => state.priceLists?.priceListLoading)
  const error = useSelector(state => state.priceLists?.error || null)
  const priceLists = useSelector(state => state.priceLists.data)
  const { fetchOtherSettings } = useOtherSettings(tenantId)

  const fetchPriceLists = useCallback(
    async (startDateParam, endDateParam) => {
      if (!tenantId) return []

      if (priceLists?.length > 0) {
        return priceLists
      }

      dispatch(setPriceListLoading(true))

      try {
        const otherSettings = await fetchOtherSettings()

        const startDate = startDateParam || lastMonthDate(otherSettings?.moduleFilterDateDuration)
        const endDate = endDateParam || new Date()

        const priceListData = await fetchData(getPriceListByDateRangeQuery(tenantId, startDate, endDate))
        const getPriceListsByDateRange = priceListData.getPriceListsByDateRange

        if (!startDateParam && !endDateParam) {
          dispatch(setPriceLists(getPriceListsByDateRange))
        }

        return getPriceListsByDateRange
      } catch (err) {
        dispatch(setError(err?.message || 'Failed to fetch price lists'))
        console.error(err)
        return []
      } finally {
        dispatch(setPriceListLoading(false))
      }
    },
    [tenantId, dispatch, fetchOtherSettings]
  )

  // const fetchPriceList = useCallback(
  //   async orderId => {
  //     if (!orderId) return null
  //     const existingOrder = priceLists.find(order => order.orderId === orderId)
  //     if (existingOrder) return existingOrder
  //     try {
  //       dispatch(setPriceListLoading(true))
  //       const response = await fetchData(getSalesOrderQuery(tenantId, orderId))

  //       const salesOrder = response.getSalesOrder || null

  //       return salesOrder
  //     } catch (err) {
  //       dispatch(setError('Failed to fetch price list'))
  //       console.error(err)
  //       return null
  //     } finally {
  //       dispatch(setPriceListLoading(false))
  //     }
  //   },
  //   [tenantId, priceLists, dispatch]
  // )
  return { priceLists, fetchPriceLists, priceListLoading, error }
}
export default usePriceLists
