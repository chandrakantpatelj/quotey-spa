import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getSalesOrderQuery, GetSalesOrdersByDateRangeQuery } from 'src/@core/components/graphql/sales-order-queries'
import { fetchData } from 'src/common-functions/GraphqlOperations'
import { DateFunction, lastMonthDate } from 'src/common-functions/utils/UtilityFunctions'
import { setAllSalesOrder, setError, setLoading, setUpdateSalesOrder } from 'src/store/apps/sales'
import useOtherSettings from './useOtherSettings'

const useSalesOrders = tenantId => {
  const dispatch = useDispatch()
  const salesOrders = useSelector(state => state.sales?.data || [])
  const salesOrdersLoading = useSelector(state => state.sales?.salesOrdersLoading)
  const error = useSelector(state => state.sales?.error || null)
  const { fetchOtherSettings } = useOtherSettings(tenantId)
  const reloadSalesLoader = useSelector(state => state.sales?.reloadSalesLoader)
  const headerLoader = useSelector(state => state?.otherSettings.headerLoader)
  const fetchSalesOrderFromApi = salesOrders?.length === 0

  const callGetSalesOrdersQuery = async (startDate, endDate) => {
    const response = await fetchData(
      GetSalesOrdersByDateRangeQuery(tenantId, DateFunction(startDate), DateFunction(endDate))
    )
    return response?.getSalesOrdersByDateRange || []
  }

  const fetchSalesOrders = useCallback(
    async (startDateParam, endDateParam) => {
      if (!tenantId) return []
      if (!fetchSalesOrderFromApi && !startDateParam && !endDateParam) return salesOrders

      const otherSettings = await fetchOtherSettings()

      const startDate = startDateParam || lastMonthDate(otherSettings?.moduleFilterDateDuration)
      const endDate = endDateParam || new Date()

      dispatch(setLoading(true))

      try {
        const allSalesOrders = await callGetSalesOrdersQuery(startDate, endDate)

        if (!startDateParam && !endDateParam) {
          dispatch(setAllSalesOrder(allSalesOrders))
        }

        return allSalesOrders
      } catch (err) {
        dispatch(setError(response.errors[0].message))

        console.error(err)
        return []
      } finally {
        dispatch(setLoading(false))
      }
    },
    [tenantId, dispatch, fetchOtherSettings, reloadSalesLoader, headerLoader]
  )

  const fetchSalesOrder = useCallback(
    async orderId => {
      if (!orderId) return null
      const existingOrder = salesOrders.find(order => order.orderId === orderId)
      if (existingOrder) return existingOrder
      try {
        dispatch(setLoading(true))
        const response = await fetchData(getSalesOrderQuery(tenantId, orderId))

        const salesOrder = response.getSalesOrder || null

        return salesOrder
      } catch (err) {
        dispatch(setError('Failed to fetch order'))
        console.error(err)
        return null
      } finally {
        dispatch(setLoading(false))
      }
    },
    [tenantId, salesOrders, dispatch]
  )

  const reloadSalesOrderInStore = useCallback(
    async orderId => {
      if (!orderId) return
      console.log('orderId', orderId)
      const existingSO = salesOrders.find(so => so.orderId === orderId)

      try {
        if (existingSO?.orderId) {
          const response = await fetchData(getSalesOrderQuery(tenantId, existingSO?.orderId))

          const salesOrder = response.getSalesOrder || null

          if (salesOrder) {
            dispatch(setUpdateSalesOrder(salesOrder))
          }
        } else {
          try {
            const otherSettings = await fetchOtherSettings()
            const startDate = lastMonthDate(otherSettings?.moduleFilterDateDuration)
            const endDate = new Date()

            const allSalesOrders = await callGetSalesOrdersQuery(startDate, endDate)
            dispatch(setAllSalesOrder(allSalesOrders))
          } catch (fallbackError) {
            console.error('Fallback to fetch all POs also failed:', fallbackError)
          }

          return null
        }
      } catch (error) {
        console.error('Failed to fetch single SO, falling back to full fetch:', error)
      }
    },
    [tenantId, salesOrders, fetchOtherSettings, dispatch]
  )

  return { salesOrders, fetchSalesOrders, reloadSalesOrderInStore, fetchSalesOrder, salesOrdersLoading, error }
}
export default useSalesOrders
