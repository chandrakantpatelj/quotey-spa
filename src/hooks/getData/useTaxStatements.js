import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { getAllTaxStatementsQuery } from 'src/@core/components/graphql/tax-statement-queries'
import { fetchData } from 'src/common-functions/GraphqlOperations'
import { setAllTaxStatements, setLoading, setError } from 'src/store/apps/tax-statements'

const useTaxStatements = tenantId => {
  const dispatch = useDispatch()

  const taxStatements = useSelector(state => state.taxStatements?.data || [])
  const loading = useSelector(state => state.taxStatements?.loading || false)
  const error = useSelector(state => state.taxStatements?.error || null)
  const headerLoader = useSelector(state => state?.otherSettings.headerLoader)
  const reloadTaxStatementLoader = useSelector(state => state.taxStatements?.reloadTaxStatementLoader)

  useEffect(() => {
    const fetchtaxStatement = async () => {
      if (taxStatements?.length === 0 && tenantId) {
        dispatch(setLoading(true))
        try {
          const response = await fetchData(getAllTaxStatementsQuery(tenantId))
          dispatch(setAllTaxStatements(response?.getTaxStatements || []))
        } catch (err) {
          dispatch(setLoading(false))
          dispatch(setError('Failed to fetch tax statements'))
          console.error(err)
        }
      }
    }

    fetchtaxStatement()
  }, [tenantId, dispatch, reloadTaxStatementLoader, headerLoader])
  return { taxStatements, loading, error }
}

export default useTaxStatements
