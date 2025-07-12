const BankTransactionSalesOrderRelatedRecord = `
  transactionRefPrefix
  transactionRef
  customerId
  salesOrderPaymentId
  salesInvoicePaymentNoPrefix
  salesInvoicePaymentNo
  salesInvoicePaymentId
  amount
  `
const BankTransactionExpenseRelatedRecord = `
  generalExpenseId
  generalExpenseNoPrefix
  generalExpenseNo
  `
const BankTransactionPurchaseOrderRelatedRecord = `
  vendorId
  purchaseOrderPaymentId
  currency
  paidAmount
  paidCurrency
`
const BankTransactionAccountTransactionRelatedRecord = `
  accountTransactionId
  accountTransactionNo
  accountTransactionNoPrefix
`

export const bankTransactionField = `
            schemaVersion
            transactionId
            transactionDate
            description
            credit
            debit
            status
            reconcileMethod
            reconciledBy
            reconcileDate
            matchType
            relatedRecords{
            ${BankTransactionSalesOrderRelatedRecord}
            ${BankTransactionPurchaseOrderRelatedRecord}
            ${BankTransactionExpenseRelatedRecord}
            ${BankTransactionAccountTransactionRelatedRecord}
            }
            createdDateTime
            createdBy
            modifiedDateTime
            modifiedBy
`
export const getAllBankTransactionsQuery = tenantId => {
  return /* GraphQL */ `
      query getAllBankTransactions {
          getAllBankTransactions(tenantId: "${tenantId}") {
            ${bankTransactionField}
          }  
         
        }
      `
}

export const getAllBankTransactionsByDateRangeQuery = (tenantId, startDate, endDate) => {
  return `query getAllBankTransactionsByDateRange{
              getAllBankTransactionsByDateRange(tenantId: "${tenantId}", startDate: "${startDate}", endDate: "${endDate}") {
              ${bankTransactionField}
              }
        }`
}

export const AddBankTransactionMutation = () => {
  return /* GraphQL */ `
    mutation AddBankTransactionMutation($tenantId: String!, $transaction: BankTransactionInput!) {
      addBankTransaction(tenantId: $tenantId, transaction: $transaction) {
        schemaVersion
        transactionDate
        description
        amount
      }
    }
  `
}

export const UploadBankTransactionMutation = () => {
  return /* GraphQL */ `
    mutation UploadBankTransactionMutation($tenantId: String!, $transactions: [BankTransactionInput]!) {
      uploadBankTransactions(tenantId: $tenantId, transactions: $transactions) {
        ${bankTransactionField}
      }
    }
  `
}

export const DeleteBankTransactionMutation = () => {
  return /* GraphQL */ `
    mutation DeleteBankTransactionMutation($tenantId: String!, $transactionId: String!) {
      deleteBankTransaction(tenantId: $tenantId, transactionId: $transactionId)
    }
  `
}

export const DeleteBankTransactionsMutation = () => {
  return /* GraphQL */ `
    mutation DeleteBankTransactionsMutation($tenantId: String!, $transactionIds: [String]!) {
      deleteBankTransactions(tenantId: $tenantId, transactionIds: $transactionIds)
    }
  `
}
