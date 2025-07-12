import { addressFragment, fileFragment, primaryContact } from './common-queries'

const customerFields = `
  tenantId
  schemaVersion
  customerId
  customerNo
  customerNoPrefix
  displayName
  companyName
  customerName
  emailAddress
  workPhone
  mobile
  files {
    ${fileFragment}
  }
  attributes {
    key
    value
  }
  currencyId
  paymentTerms
  shippingPreference
  primaryContact {
    ${primaryContact}

  }
  deliveryAddress {
    ${addressFragment}
  }
  billingAddress {
    ${addressFragment}
  }
  createdDateTime
  modifiedDateTime
  modifiedBy
  createdBy
`
const customerLedgerFields = `
  transactionId
  tenantId
  customerId
  transactionDate
  transactionType
  transactionRef
  description
  notes
  credit
  debit
  currency
  salesReturnId
  salesInvoiceId
  salesInvoicePaymentNoPrefix
  salesInvoicePaymentNo
  salesInvoicePaymentId
  totalClearedAmount
  availableAmount
  status
  runningBalance
  closingBalance
  createdDateTime
  createdBy
  modifiedDateTime
  modifiedBy
  deletedDateTime
`

export const getAllCustomers = tenantId => `
  getAllCustomers(tenantId: "${tenantId}") {
    ${customerFields}

  }
`

export const getCustomerQuery = (tenantId, customerId) => {
  return ` query getCustomer{
            getCustomer(tenantId: "${tenantId}", customerId: "${customerId}") {
                ${customerFields}
            }
        }
`
}

export const getAllCustomersForPriceList = tenantId => `
  getAllCustomers(tenantId: "${tenantId}") {
    customerId
    customerName
  }
`

export const getAllCustomersQuery = tenantId => `
  query getAllCustomers {
    ${getAllCustomers(tenantId)}
  }
`

export const createCustomerMutation = () => {
  return /* GraphQL */ `
    mutation createCustomerMutation($tenantId: String!, $customer: CustomerInput!) {
      createCustomer(tenantId: $tenantId, customer: $customer) {
        ${customerFields}

      }
    }
  `
}

export const CreateCustomersMutation = () => {
  return /* GraphQL */ `
     mutation CreateCustomersMutations($tenantId: String!, $customers: [CustomerInput]!) {
      createCustomers(tenantId: $tenantId, customers: $customers) {
        ${customerFields}

      }
    }
 `
}

export const updateCustomerMutation = () => {
  return /* GraphQL */ `
    mutation UpdateCustomer($tenantId: String!, $customerId: String!, $customer: CustomerInput!) {
      updateCustomer(tenantId: $tenantId, customerId: $customerId, customer: $customer) {
        ${customerFields}
      }
    }
  `
}

export const deleteCustomerMutation = () => {
  return /* GraphQL */ `
    mutation deleteCustomerMutation($tenantId: String!, $customerId: String!) {
      deleteCustomer(tenantId: $tenantId, customerId: $customerId)
    }
  `
}

export const getCustomerNotesQuery = customerId => {
  return /* GraphQL */ `
    query getNotes {
      getCustomerNotesByID(customerId: "${customerId}",) {
        orderDate
        customerNotes
        status
      }
    }
  `
}

export const GetCustomersByDateRangeQuery = (tenantId, startDate, endDate) => {
  return /* GraphQL */ `
    query GetCustomersByDateRange {
      getCustomersByDateRange(tenantId: "${tenantId}", startDate: "${startDate}", endDate: "${endDate}") {
        ${customerFields}

      }
    }
  `
}

export const getAllCustomerTransactionsQuery = (tenantId, customerId, fromDate, toDate) => `
  query getCustomerTransactions {
  getCustomerTransactionsByDateRange(tenantId: "${tenantId}",customerId: "${customerId}",fromDate: "${fromDate}",toDate: "${toDate}") {
    ${customerLedgerFields}
   }
  }`

export const DeleteCustomersMutation = () => {
  return /* GraphQL */ `
    mutation DeleteCustomersMutation($tenantId: String!, $customerIds: [String]!) {
      deleteCustomers(tenantId: $tenantId, customerIds: $customerIds)
    }
  `
}

export const attachFilesToCustomer = () => {
  return `mutation attachFilesToCustomer($tenantId: String!, $customerId: String!,$files:[FileUploaderInput]!) {
            attachFilesToCustomer(tenantId: $tenantId, customerId: $customerId,files:$files){
              ${fileFragment}
             }
          }`
}

export const deleteFileFromCustomer = () => {
  return `mutation deleteFileFromCustomer($tenantId: String!, $customerId: String!,$file:FileUploaderInput!) {
            deleteFileFromCustomer(tenantId: $tenantId, customerId: $customerId,file:$file){
              ${fileFragment}
             }
          }`
}
