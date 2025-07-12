import { useCallback, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { getOtherSettingQuery } from 'src/@core/components/graphql/other-setting-queries'
import { fetchData } from 'src/common-functions/GraphqlOperations'
import { setOtherSettingLoading, setOtherSettings } from 'src/store/apps/other-setting'

const useOtherSettings = tenantId => {
  const dispatch = useDispatch()

  const otherSettings = useSelector(state => state.otherSettings?.data || {})
  const loadingOtherSetting = useSelector(state => state.otherSettings?.loadingOtherSetting || false)
  const reloadOtherSetting = useSelector(state => state.otherSettings?.reloadOtherSetting)

  const fetchOtherSettings = useCallback(async () => {
    const shouldFetch = Object.keys(otherSettings).length === 0

    if (shouldFetch && tenantId) {
      dispatch(setOtherSettingLoading(true))
      try {
        const response = await fetchData(getOtherSettingQuery(tenantId))
        dispatch(setOtherSettings(response?.getOtherSetting))
        return response?.getOtherSetting || []
      } catch (err) {
        console.error(err)
      } finally {
        dispatch(setOtherSettingLoading(false))
      }
    }

    return otherSettings || []
  }, [tenantId, dispatch, reloadOtherSetting])

  return { loadingOtherSetting, fetchOtherSettings, otherSettings }
}

export default useOtherSettings
