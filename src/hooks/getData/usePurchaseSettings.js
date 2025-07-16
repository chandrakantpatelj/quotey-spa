import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { getAllPurchaseModuleSettingsQuery } from 'src/@core/components/graphql/purchase-module-setting'
import { fetchData } from 'src/common-functions/GraphqlOperations'
import { setAllPurchaseSettingData, setLoading, setError } from 'src/store/apps/purchase-module-settings'

const usePurchaseSettings = tenantId => {
  const dispatch = useDispatch()
  const purchaseModuleSetting = useSelector(state => state.purchaseModuleSetting?.data || [])
  const loading = useSelector(state => state.purchaseModuleSetting?.loading || false)
  const error = useSelector(state => state.purchaseModuleSetting?.error || null)
  const fetchPurchaseOrderFromApi = purchaseModuleSetting?.length === 0
  const headerLoader = useSelector(state => state?.otherSettings.headerLoader)
  const reloadPurchaseModuleLoader = useSelector(
    state => state.purchaseModuleSetting?.reloadPurchaseModuleLoader || false
  )

  useEffect(() => {
    const fetchPurchaseModuleSetting = async () => {
      if (fetchPurchaseOrderFromApi && tenantId) {
        dispatch(setLoading(true))
        try {
          const response = await fetchData(getAllPurchaseModuleSettingsQuery(tenantId))
          const allpurchaseModuleSetting = response?.getAllPurchaseModuleSettings

          dispatch(setAllPurchaseSettingData(allpurchaseModuleSetting))
        } catch (error) {
          dispatch(setError('Failed to fetch purchase module settings'))
          console.error(error)
        }
      }
    }

    fetchPurchaseModuleSetting()
  }, [tenantId, dispatch, reloadPurchaseModuleLoader, headerLoader])
  return { purchaseModuleSetting, loading, error }
}
export default usePurchaseSettings
