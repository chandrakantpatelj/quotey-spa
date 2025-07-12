import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { getAllVendorQuery } from 'src/@core/components/graphql/vendor-queries'
import { fetchData } from 'src/common-functions/GraphqlOperations'
import { setAllVendor, setError, setLoading } from 'src/store/apps/vendors'

const useVendors = tenantId => {
  const dispatch = useDispatch()
  const vendors = useSelector(state => state.vendors?.data || [])
  const loading = useSelector(state => state.vendors?.loading || false)
  const error = useSelector(state => state.vendors?.error || null)
  const fetchVendorsFromApi = vendors?.length === 0
  const headerLoader = useSelector(state => state?.otherSettings.headerLoader)
  const reloadVendor = useSelector(state => state.vendors?.reloadVendor)

  useEffect(() => {
    const fetchVendors = async () => {
      if (fetchVendorsFromApi && tenantId) {
        dispatch(setLoading(true))
        try {
          const response = await fetchData(getAllVendorQuery(tenantId))
          const allVendors = response?.getAllVendors

          dispatch(setAllVendor(allVendors))
        } catch (error) {
          dispatch(setLoading(false))
          dispatch(setError('Failed to fetch vendors'))
          console.error(error)
        }
      }
    }

    fetchVendors()
  }, [tenantId, dispatch, reloadVendor, headerLoader])

  return { vendors, loading, error }
}

export default useVendors
