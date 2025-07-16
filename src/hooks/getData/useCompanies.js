import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { getAllTenantQuery } from 'src/@core/components/graphql/company-queries'
import { fetchData } from 'src/common-functions/GraphqlOperations'
import { setAllTenants, setTenantLoading, setError } from 'src/store/apps/company'

const useCompanies = () => {
  const dispatch = useDispatch()

  const companies = useSelector(state => state.tenants?.data || [])
  const loading = useSelector(state => state.tenants?.loading || false)
  const error = useSelector(state => state.tenants?.error || null)
  const fetchCompaniesFromApi = companies?.length === 0
  const reloadCompanyLoader = useSelector(state => state.tenants?.reloadCompanyLoader)

  useEffect(() => {
    const fetchCompanies = async () => {
      if (fetchCompaniesFromApi) {
        dispatch(setTenantLoading(true))
        try {
          const response = await fetchData(getAllTenantQuery())
          const allCompanies = response?.getAllTenants
          dispatch(setAllTenants(allCompanies))
        } catch (err) {
          dispatch(setTenantLoading(false))
          dispatch(setError('Failed to fetch companies'))
          console.error(err)
        }
      }
    }

    fetchCompanies()
  }, [dispatch, reloadCompanyLoader])
  return { companies, loading, error }
}

export default useCompanies
