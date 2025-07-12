import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { getAllCountriesQuery } from 'src/@core/components/graphql/country-queries'
import { fetchData } from 'src/common-functions/GraphqlOperations'
import { setCountries, setLoading, setError } from 'src/store/apps/country'

const useCountries = () => {
  const dispatch = useDispatch()

  const countries = useSelector(state => state.countries?.data || [])
  const loading = useSelector(state => state.countries?.loading || false)
  const error = useSelector(state => state.countries?.error || null)
  const fetchCountriesFromApi = countries?.length === 0
  const headerLoader = useSelector(state => state?.otherSettings.headerLoader)

  useEffect(() => {
    const fetchCountries = async () => {
      if (fetchCountriesFromApi) {
        dispatch(setLoading(true))
        try {
          const response = await fetchData(getAllCountriesQuery())
          const allCountries = response?.getAllCountries

          //   if (allCountries) {
          dispatch(setCountries(allCountries))
          //   }
        } catch (err) {
          dispatch(setLoading(false))
          dispatch(setError('Failed to fetch countries'))
          console.error(err)
        }
      }
    }

    fetchCountries()
  }, [dispatch, headerLoader])
  return { countries, loading, error }
}

export default useCountries
