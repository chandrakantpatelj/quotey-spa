import Link from 'next/link'
import { useEffect, useState } from 'react'
import PageHeader from 'src/@core/components/page-header'
import { Typography, Button } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import PageWrapper from 'src/@core/layouts/PageWrapper'
import { checkAuthorizedRoute, hasPermission } from 'src/common-functions/utils/UtilityFunctions'
import ExpenseListTable from 'src/views/accounting/expenses/ExpensesListTable'
import { CREATE_EXPENSE, LIST_EXPENSE } from 'src/common-functions/utils/Constants'
import { useRouter } from 'next/router'
import ErrorBoundary from 'src/pages/ErrorBoundary'
import useExpenses from 'src/hooks/getData/useExpenses'
import useGeneralExpenseType from 'src/hooks/getData/useGeneralExpenseType'

function Expense() {
  const dispatch = useDispatch()
  const tenantId = useSelector(state => state.tenants?.selectedTenant?.tenantId) || ''
  const [expenseData, setExpenseData] = useState({})
  const router = useRouter()
  const userProfile = useSelector(state => state.userProfile)

  const [isAuthorized, setIsAuthorized] = useState(false)
  const { expenses, expenseLoading } = useExpenses(tenantId)
  const { generalExpenseTypes, generalExpenseTypeLoading } = useGeneralExpenseType(tenantId)

  const loader = expenseLoading || generalExpenseTypeLoading

  useEffect(() => {
    if (checkAuthorizedRoute(LIST_EXPENSE, router, userProfile)) {
      setIsAuthorized(true)
      setExpenseData({
        expenses,
        generalExpenseTypes
      })
    } else {
      setIsAuthorized(false)
    }
  }, [tenantId, expenseLoading, expenses, userProfile])

  if (!isAuthorized) {
    return null
  }

  return (
    <>
      <PageHeader
        title={
          <Typography
            sx={{
              fontSize: { xs: '16px', md: '18px' },
              fontWeight: '500'
            }}
          >
            Expenses
          </Typography>
        }
        button={
          hasPermission(userProfile, CREATE_EXPENSE) && (
            <Button
              variant='contained'
              color='primary'
              startIcon={<AddOutlinedIcon />}
              component={Link}
              scroll={true}
              href={`/accounting/expenses/add`}
            >
              Add New
            </Button>
          )
        }
      />
      <PageWrapper>
        <ErrorBoundary tenantId={tenantId} dispatch={dispatch}>
          <ExpenseListTable tenantId={tenantId} expenseData={expenseData} loader={loader} />
        </ErrorBoundary>
      </PageWrapper>
    </>
  )
}

export default Expense
