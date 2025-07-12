import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { GetUserAccountsQuery } from 'src/@core/components/graphql/user-account-queries'
import { fetchData } from 'src/common-functions/GraphqlOperations'
import { setAllUserAccounts, setError, setLoading } from 'src/store/apps/user'

const useUserAccounts = () => {
  const dispatch = useDispatch()
  const userAccounts = useSelector(state => state.user?.data || [])
  const loading = useSelector(state => state.user?.loading || false)
  const error = useSelector(state => state.user?.error || null)
  const fetchUserAccountsFromApi = userAccounts?.length === 0
  const headerLoader = useSelector(state => state?.otherSettings.headerLoader)
  const reloadUserAccount = useSelector(state => state.user?.reloadUserAccount)

  useEffect(() => {
    const fetchUserAccounts = async () => {
      if (fetchUserAccountsFromApi) {
        dispatch(setLoading(true))
        try {
          const response = await fetchData(GetUserAccountsQuery())
          const allData = response?.getUserAccounts
          dispatch(setAllUserAccounts(allData))
        } catch (error) {
          dispatch(setLoading(false))
          dispatch(setError('Failed to fetch user accounts'))
          console.error(error)
        }
      }
    }

    fetchUserAccounts()
  }, [dispatch, reloadUserAccount, headerLoader])

  return { userAccounts, loading, error }
}

export default useUserAccounts
