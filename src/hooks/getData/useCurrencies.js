import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { getAllCurrencyQuery } from 'src/@core/components/graphql/currency-queries'
import { fetchData } from 'src/common-functions/GraphqlOperations'
import { setAllCurrency, setError, setLoading } from 'src/store/apps/currency'

const useCurrencies = () => {
  const dispatch = useDispatch()

  const currencies = useSelector(state => state.currencies?.data || [])
  const loading = useSelector(state => state.currencies?.loading || false)
  const error = useSelector(state => state.currencies?.error || null)
  const fetchCurrenciesFromApi = currencies?.length === 0
  const headerLoader = useSelector(state => state?.otherSettings.headerLoader)

  useEffect(() => {
    const fetchCurrencies = async () => {
      if (fetchCurrenciesFromApi) {
        dispatch(setLoading(true))
        try {
          const response = await fetchData(getAllCurrencyQuery())
          const allCurrencies = response?.getAllCurrency || []

          // if (allCurrencies) {
          dispatch(setAllCurrency(allCurrencies))
          // }
        } catch (err) {
          dispatch(setLoading(false))
          dispatch(setError('Failed to fetch currencies'))
          console.error(err)
        }
      }
    }

    fetchCurrencies()
  }, [dispatch, headerLoader])
  return { currencies, loading, error }
}

export default useCurrencies
