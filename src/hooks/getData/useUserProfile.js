import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { getUserProfileQuery } from 'src/@core/components/graphql/user-profile'
import { fetchData } from 'src/common-functions/GraphqlOperations'
import { setUserProfile, setUserProfileLoading } from 'src/store/apps/user-profile'

const useUserProfile = tenantId => {
  const dispatch = useDispatch()

  const { data: userProfile, userProfileLoading } = useSelector(state => state.userProfile || {})
  const fetchUserProfileFromApi = Object.keys(userProfile).length === 0
  const headerLoader = useSelector(state => state?.otherSettings.headerLoader)

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (fetchUserProfileFromApi) {
        dispatch(setUserProfileLoading(true))
        try {
          const response = await fetchData(getUserProfileQuery())
          const userProfile = response?.getUserProfile

          dispatch(setUserProfile({ userProfile, tenantId }))
        } catch (err) {
          dispatch(setUserProfileLoading(false))
          console.error(err)
        }
      }
    }

    fetchUserProfile()
  }, [tenantId, dispatch, headerLoader])
  return { userProfile, userProfileLoading }
}

export default useUserProfile
