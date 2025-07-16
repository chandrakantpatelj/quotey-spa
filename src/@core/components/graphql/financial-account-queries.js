const financialAccountFieldsBase = `
currency
  schemaVersion
  accountId
  tenantId
  accountNumber
  accountNumberPrefix          
  accountName
  accountType
  description
  accountCategory
  parentAccount
  reportType
`

const accountTransactionFieldsBase = `
    transactionId
    schemaVersion
    tenantId
    accountId
    transactionDate
    transactionType
    transactionRef
    description
    credit
    debit
    currency
    customerId
    salesOrderId
    salesReturnId
    salesOrderPaymentId
    taxAuthorityId
    vendorId
    purchaseOrderId
    purchaseOrderPayableId
    purchaseReturnId
    bankTransactionId
    purchaseOrderPaymentId
    runningBalance
    closingBalance
    createdDateTime
    createdBy
    modifiedDateTime
    modifiedBy
    deletedDateTime
`

export const getAllFinancialAccounts = tenantId => `
  getAllFinancialAccounts(tenantId: "${tenantId}") {
    ${financialAccountFieldsBase}
   }
`
export const getAllFinancialAccountsForSetting = tenantId => `
  getAllFinancialAccounts(tenantId: "${tenantId}") {
    accountName
    accountId
 }
`
export const getAllFinancialAccountsQuery = tenantId => `
  query getFinancialAccount {
    ${getAllFinancialAccounts(tenantId)}
  }
`

export const CreateFinancialAccountMutation = () => {
  return /* GraphQL */ `
      mutation CreateFinancialAccount($tenantId: String!, $account: FinancialAccountInput!) {
        createFinancialAccount(tenantId: $tenantId, account: $account) {
          ${financialAccountFieldsBase}
        }
      }
    `
}
export const CreateFinancialAccountsMutation = () => {
  return /* GraphQL */ `
      mutation CreateFinancialAccounts($tenantId: String!, $accounts: [FinancialAccountInput]!) {
        createFinancialAccounts(tenantId: $tenantId, accounts: $accounts) {
          ${financialAccountFieldsBase}
        }
      }
    `
}
export const UpdateFinancialAccountMutation = () => {
  return /* GraphQL */ `
      mutation UpdateFinancialAccount($tenantId: String!, $accountId: String!, $account: FinancialAccountInput!) {
        updateFinancialAccount(tenantId: $tenantId, accountId: $accountId, account: $account) {
          ${financialAccountFieldsBase}
        }
      }
    `
}

export const deleteFinancialAccountMutation = () => {
  return /* GraphQL */ `
    mutation deleteFinancialAccount($tenantId: String!, $accountId: String!) {
      deleteFinancialAccount(tenantId: $tenantId, accountId: $accountId)
    }
  `
}

export const getAllFinancialAccountTransactionsQuery = (tenantId, accountId, fromDate, toDate) => `
  query getFinancialAccountTransactions {
  getAccountTransactionsByDateRange(tenantId: "${tenantId}",accountId: "${accountId}",fromDate: "${fromDate}",toDate: "${toDate}") {
    ${accountTransactionFieldsBase}
   }
  }
`
