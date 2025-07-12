import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { getAllWarehousesQuery } from 'src/@core/components/graphql/warehouses-queries'
import { fetchData } from 'src/common-functions/GraphqlOperations'
import { setAllWareHouse, setLoading, setError } from 'src/store/apps/warehouses'

const useWarehouses = tenantId => {
  const dispatch = useDispatch()

  const warehouses = useSelector(state => state.warehouses?.data || [])
  const loading = useSelector(state => state.warehouses?.loading || false)
  const error = useSelector(state => state.warehouses?.error || null)
  const fetchWarehousesFromApi = warehouses?.length === 0
  const headerLoader = useSelector(state => state?.otherSettings.headerLoader)
  const reloadWarehouseLoader = useSelector(state => state.warehouses?.reloadWarehouseLoader)

  useEffect(() => {
    const fetchWarehouses = async () => {
      if (fetchWarehousesFromApi && tenantId) {
        dispatch(setLoading(true))
        try {
          const response = await fetchData(getAllWarehousesQuery(tenantId))
          const allWarehouses = response?.getAllWarehouses

          dispatch(setAllWareHouse(allWarehouses))
        } catch (err) {
          dispatch(setLoading(false))
          dispatch(setError('Failed to fetch warehouses'))
          console.error(err)
        }
      }
    }

    fetchWarehouses()
  }, [tenantId, dispatch, reloadWarehouseLoader, headerLoader])
  return { warehouses, loading, error }
}

export default useWarehouses
