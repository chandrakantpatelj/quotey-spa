import { useCallback, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { fetchData } from 'src/common-functions/GraphqlOperations'
import { lastMonthDate } from 'src/common-functions/utils/UtilityFunctions'
import useOtherSettings from './useOtherSettings'
import {
  getPurchaseOrderShipmentQuery,
  getPurchaseOrderShipmentsByDateRangeQuery
} from 'src/@core/components/graphql/purchase-order-shipment-queries'
import { setAllPurchaseShipments, setLoading, setError, setAddPurchaseShipmet } from 'src/store/apps/purchase-shipments'

const useShipments = tenantId => {
  const dispatch = useDispatch()
  const purchaseShipments = useSelector(state => state.purchaseShipments?.data || [])

  const loading = useSelector(state => state.purchaseShipments?.loading || false)
  const error = useSelector(state => state.purchaseShipments?.error || null)
  const { fetchOtherSettings } = useOtherSettings(tenantId)
  const headerLoader = useSelector(state => state?.otherSettings.headerLoader)
  const reloadPurchaseShipment = useSelector(state => state.purchaseShipments?.reloadPurchaseShipment)

  const callGetShipmentsQuery = async (startDate, endDate) => {
    const response = await fetchData(getPurchaseOrderShipmentsByDateRangeQuery(tenantId, startDate, endDate))
    return response?.getPurchaseOrderShipmentsByDateRange
  }

  const fetchShipments = useCallback(
    async (startDateParam, endDateParam) => {
      if (!tenantId) return []
      if (purchaseShipments.length) return purchaseShipments

      const otherSettings = await fetchOtherSettings()
      const startDate = startDateParam || lastMonthDate(otherSettings?.moduleFilterDateDuration)
      const endDate = endDateParam || new Date()

      dispatch(setLoading(true))

      try {
        const allShipments = await callGetShipmentsQuery(startDate, endDate)
        if (!startDateParam && !endDateParam) {
          dispatch(setAllPurchaseShipments(allShipments))
        }

        return allShipments
      } catch (err) {
        dispatch(setError('Failed to fetch purchase orders'))
        console.error(err)
        return []
      } finally {
        dispatch(setLoading(false))
      }
    },
    [tenantId, dispatch, reloadPurchaseShipment, headerLoader, fetchOtherSettings]
  )

  const fetchSingleShipment = useCallback(
    async shipmentId => {
      if (!shipmentId) return null

      let existingShipment = purchaseShipments?.find(item => item?.shipmentId === shipmentId)

      if (existingShipment) return existingShipment

      if (!purchaseShipments.length && !existingShipment) {
        const newPurchasesShipments = await fetchShipments()
        existingShipment = newPurchasesShipments.find(inv => inv.shipmentId === shipmentId)
      }

      try {
        dispatch(setLoading(true))
        const response = await fetchData(getPurchaseOrderShipmentQuery(tenantId, shipmentId))

        const shipment = response?.getPurchaseOrderShipment || null

        if (shipment) {
          dispatch(setAddPurchaseShipmet(shipment))
        }

        return shipment
      } catch (err) {
        dispatch(setError('Failed to fetch Purchase Order'))
        console.error(err)
        return null
      } finally {
        dispatch(setLoading(false))
      }
    },
    [tenantId, purchaseShipments, dispatch]
  )

  return { purchaseShipments, fetchSingleShipment, fetchShipments, loading, error }
}
export default useShipments
