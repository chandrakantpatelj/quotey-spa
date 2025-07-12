import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { getAllTaxAuthoritiesQuery } from 'src/@core/components/graphql/tax-authorities-queries'
import { fetchData } from 'src/common-functions/GraphqlOperations'
import { setAllTaxAuthorities, setTaxAuthError, setTaxAuthorityLoading } from 'src/store/apps/tax-authority'

const useTaxAuthorities = tenantId => {
  const dispatch = useDispatch()

  const taxAuthorities = useSelector(state => state.taxAuthority?.data || [])
  const taxAuthorityLoading = useSelector(state => state.taxAuthority?.taxAuthorityLoading || false)
  const taxAuthorityError = useSelector(state => state.taxAuthority?.taxAuthorityError || null)
  const headerLoader = useSelector(state => state?.otherSettings.headerLoader)
  const reloadTaxAuthLoader = useSelector(state => state.taxAuthority?.reloadTaxAuthLoader)

  useEffect(() => {
    const fetchTaxAuthority = async () => {
      if (taxAuthorities?.length === 0 && tenantId) {
        dispatch(setTaxAuthorityLoading(true))
        try {
          const response = await fetchData(getAllTaxAuthoritiesQuery(tenantId))
          dispatch(setAllTaxAuthorities(response?.getAllTaxAuthorities || []))
        } catch (err) {
          dispatch(setTaxAuthorityLoading(false))
          dispatch(setTaxAuthError('Failed to fetch tax authorities'))
          console.error(err)
        }
      }
    }

    fetchTaxAuthority()
  }, [tenantId, dispatch, reloadTaxAuthLoader, headerLoader])
  return { taxAuthorities, taxAuthorityLoading, taxAuthorityError }
}

export default useTaxAuthorities
