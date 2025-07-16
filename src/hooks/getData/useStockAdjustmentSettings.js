import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { getStockAdjustmentSettingsQuery } from 'src/@core/components/graphql/general-setting-queries'
import { fetchData } from 'src/common-functions/GraphqlOperations'
import { setStockAdjustmentSettings } from 'src/store/apps/general-setting'

const useStockAdjustmentSettings = tenantId => {
  const dispatch = useDispatch()

  const generalStockAdujstmentSettings = useSelector(state => state.generalSettings?.stockAdjustmentSettings || [])

  const fetchDataFromApi = generalStockAdujstmentSettings?.length === 0
  const headerLoader = useSelector(state => state?.otherSettings.headerLoader)

  useEffect(() => {
    const fetchStockAdjustmentSetting = async () => {
      if (fetchDataFromApi && tenantId) {
        try {
          const response = await fetchData(getStockAdjustmentSettingsQuery(tenantId))
          const generalStockSettings = response?.getStockAdjustmentSettings
          dispatch(setStockAdjustmentSettings(generalStockSettings))
        } catch (err) {
          console.error(err)
        }
      }
    }

    fetchStockAdjustmentSetting()
  }, [tenantId, dispatch, headerLoader])
  return { generalStockAdujstmentSettings }
}

export default useStockAdjustmentSettings
