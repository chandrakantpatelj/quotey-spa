import { bankTransactionField } from './bank-transaction-queries'
import { fileFragment } from './common-queries'

const generalExpenseFields = `
  schemaVersion
  tenantId
  expenseId
  expenseNo
  expenseNoPrefix
  expenseDate
  expenseType
  description
  notes
  paymentMethod
  amount
  currency
  bankTransactionId
  files {
    ${fileFragment}
  }
  createdDateTime
  createdBy
  modifiedDateTime
  modifiedBy
  deletedDateTime
  deletedBy
`

export const createGeneralExpenseMutation = () => {
  return /* GraphQL */ `
    mutation createGeneralExpenseMutation($tenantId: String!, $expense: GeneralExpenseInput!) {
      createGeneralExpense(tenantId: $tenantId, expense: $expense) {
        ${generalExpenseFields}
      }
    }
  `
}
export const createGeneralExpenseFromBankTransactionMutation = () => {
  return /* GraphQL */ `
    mutation createGeneralExpenseFromBankTransaction($tenantId: String!, $expense: GeneralExpenseInput!) {
      createGeneralExpenseFromBankTransaction(tenantId: $tenantId, expense: $expense) {
        ${bankTransactionField}
      }
    }
  `
}

export const updateGeneralExpenseMutation = () => {
  return /* GraphQL */ `
    mutation updateGeneralExpenseMutation($tenantId: String!, $expenseId: String!, $expense: GeneralExpenseInput!) {
      updateGeneralExpense(tenantId: $tenantId, expenseId: $expenseId, expense: $expense) {
        ${generalExpenseFields}
      }
    }
  `
}

export const deleteGeneralExpenseMutation = () => {
  return /* GraphQL */ `
    mutation deleteGeneralExpenseMutation($tenantId: String!, $expenseId: String!) {
      deleteGeneralExpense(tenantId: $tenantId, expenseId: $expenseId)
    }
  `
}

export const getGeneralExpenses = tenantId => `
  getGeneralExpenses(tenantId: "${tenantId}") {
    ${generalExpenseFields}
  }
`

export const getGeneralExpensesByDateRange = (tenantId, startDate, endDate) => `
  getGeneralExpensesByDateRange(tenantId: "${tenantId}", startDate: "${startDate}", endDate: "${endDate}") {
    ${generalExpenseFields}
  }
`

export const getGeneralExpensesQuery = (tenantId, expenseId) => `
  query getGeneralExpensesQuery {
    getGeneralExpense(tenantId: "${tenantId}",  expenseId: "${expenseId}") {
    ${generalExpenseFields}
  }
  }
`

export const getGeneralExpensesByDateRangeQuery = (tenantId, startDate, endDate) => `
  query getGeneralExpensesByDateRange {
    ${getGeneralExpensesByDateRange(tenantId, startDate, endDate)}
  }
`
export const attachFileToGeneralExpenseQuery = () => {
  return `mutation attachFileToGeneralExpense($tenantId: String!, $expenseId: String!,$files:[FileUploaderInput]!) {
            attachFileToGeneralExpense(tenantId: $tenantId, expenseId: $expenseId,files:$files){
              ${fileFragment}
             }
          }`
}
