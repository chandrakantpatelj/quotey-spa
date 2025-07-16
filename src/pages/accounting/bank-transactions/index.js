import Router from 'next/router'
import { useEffect, useState } from 'react'
import { Box, LinearProgress, Typography } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import {
  getAllBankTransactionsByDateRangeQuery,
  UploadBankTransactionMutation
} from 'src/@core/components/graphql/bank-transaction-queries'
import PageHeader from 'src/@core/components/page-header'
import PageWrapper from 'src/@core/layouts/PageWrapper'
import { fetchData, writeData } from 'src/common-functions/GraphqlOperations'
import CommonFileImporter from 'src/common-components/CommonFileImporter'
import { CREATE_BANK_TRANSACTION, LIST_BANK_TRANSACTION, SCHEMA_VERSION } from 'src/common-functions/utils/Constants'
import {
  checkAuthorizedRoute,
  convertDate,
  hasPermission,
  lastMonthDate,
  safeAmount
} from 'src/common-functions/utils/UtilityFunctions'
import { createAlert } from 'src/store/apps/alerts'
import ErrorBoundary from 'src/pages/ErrorBoundary'
import BankTransactionListTable from 'src/views/accounting/bank-transactions/BankTransactionListTable'
import useOtherSettings from 'src/hooks/getData/useOtherSettings'

export default function Transactions() {
  const router = Router
  const dispatch = useDispatch()

  const tenant = useSelector(state => state?.tenants?.selectedTenant || {})
  const { tenantId = null } = tenant || {}

  const [loader, setLoader] = useState(true)
  const [transactions, setTransactions] = useState([])
  const [open, setOpen] = useState(null)
  const userProfile = useSelector(state => state.userProfile)
  const { fetchOtherSettings } = useOtherSettings(tenantId)
  const [isAuthorized, setIsAuthorized] = useState(false)
  async function getTransactions() {
    try {
      setLoader(true)
      const otherSettings = await fetchOtherSettings()
      const startDate = lastMonthDate(otherSettings?.moduleFilterDateDuration)
      const endDate = new Date()
      const data = await fetchData(getAllBankTransactionsByDateRangeQuery(tenantId, startDate, endDate))
      const { getAllBankTransactionsByDateRange } = data
      setTransactions(getAllBankTransactionsByDateRange)
    } catch (error) {
      console.error('error', error)
    } finally {
      setLoader(false)
    }
  }

  useEffect(() => {
    getTransactions()
  }, [tenant])

  const columns = [
    { columnName: 'date' },
    { columnName: 'amount' },
    { columnName: 'description' },
    { columnName: 'balance' }
  ]

  const handleImportedData = async mappedData => {
    const tenantId = tenant?.tenantId
    setLoader(true)

    const transactions = mappedData?.map(item => ({
      schemaVersion: SCHEMA_VERSION,
      transactionDate: convertDate(item?.date),
      amount: safeAmount(item?.amount),
      description: item?.description,
      balance: safeAmount(item?.balance)
    }))

    try {
      const response = await writeData(UploadBankTransactionMutation(), { tenantId, transactions })
      if (response.uploadBankTransactions) {
        setTransactions(prev => [...prev, ...response.uploadBankTransactions])
        dispatch(createAlert({ message: 'transactions uploaded successfully !', type: 'success' }))
        setOpen(false)
        router.push('/accounting/bank-transactions')
      } else {
        setOpen(false)
        dispatch(createAlert({ message: 'Transactions upload failed  !', type: 'error' }))
      }
    } catch (error) {
      setOpen(false)

      throw error
    } finally {
      setLoader(false)
    }
  }

  useEffect(() => {
    if (checkAuthorizedRoute(LIST_BANK_TRANSACTION, router, userProfile)) {
      setIsAuthorized(true)
    } else {
      setIsAuthorized(false)
    }
  }, [userProfile])

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
            Bank Transactions
          </Typography>
        }
        button={
          hasPermission(userProfile, CREATE_BANK_TRANSACTION) && (
            <CommonFileImporter
              open={open}
              setOpen={setOpen}
              columns={columns}
              handleImportedData={handleImportedData}
            />
          )
        }
      />
      <PageWrapper>
        {loader ? (
          <LinearProgress />
        ) : (
          <ErrorBoundary tenantId={tenantId} dispatch={dispatch}>
            <Box sx={{ width: '100%' }}>
              <BankTransactionListTable
                transactions={transactions}
                setTransactions={setTransactions}
                tenantId={tenantId}
                getTransactions={getTransactions}
              />
            </Box>
          </ErrorBoundary>
        )}
      </PageWrapper>
    </>
  )
}
