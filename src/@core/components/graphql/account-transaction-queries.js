export const AccountTransactionEntry = `
    accountId
    accountType
    effect
    amount
  `

const generalAccountTransactionsFields = `
    schemaVersion
    tenantId
    transactionId
    transactionNo
    transactionNoPrefix
    transactionDate
    transactionType
    amount
    currency
    reference
    entries {
      ${AccountTransactionEntry}
    }
    description
    notes
    bankTransactionId
    createdDateTime
    createdBy
    modifiedDateTime
    modifiedBy
    deletedDateTime
    deletedBy
`

export const getAccountEntries = tenantId => `
  getAccountEntries(tenantId: "${tenantId}") {
    ${generalAccountTransactionsFields}
  }
`

export const getAllAccountTransactionsQuery = tenantId => `
  query getAllAccountEntries {
    ${getAccountEntries(tenantId)}
  }
`
export const getAccountEntryQuery = (tenantId, transactionId) => `
  query getAccountEntryQuery {
     getAccountEntry(tenantId: "${tenantId}",transactionId:"${transactionId}") {
    ${generalAccountTransactionsFields}
  }
}
`
export const getAccountEntriesByDateRangeQuery = (tenantId, startDate, endDate) => `
    query GetAccountEntriesByDateRange {
       getAccountEntriesByDateRange(tenantId: "${tenantId}",startDate: "${startDate}",endDate: "${endDate}") {
          ${generalAccountTransactionsFields}
      }
    }
  `

export const createAccountEntryMutation = () => {
  return /* GraphQL */ `
      mutation CreateAccountEntryMutation($tenantId: String!, $transaction: AccountEntryInput!) {
        createAccountEntry(tenantId: $tenantId, transaction: $transaction) {
            ${generalAccountTransactionsFields}
        }
      }
    `
}

export const deleteAccountEntryMutation = () => {
  return /* GraphQL */ `
    mutation DeleteAccountEntryMutation($tenantId: String!, $transactionId: String!) {
      deleteAccountEntry(tenantId: $tenantId, transactionId: $transactionId)
    }
  `
}
