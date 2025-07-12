import { addressFragment, fileFragment, primaryContact } from './common-queries'

const vendorsFieldBase = `
  schemaVersion
  vendorId
  tenantId
  vendorNo
  vendorNoPrefix
  displayName
  companyName
  currencyId
  paymentTermsId
  shippingPreference
  preferredShippingVendorId
  emailAddress
  workPhone
  mobile
  files {
    ${fileFragment}
  }
  billingAddress {
    ${addressFragment}
  }
  primaryContact {
    ${primaryContact}

  }
  createdDateTime
`
const vendorLedgerFields = `
  transactionId
  schemaVersion
  vendorId
  transactionDate
  transactionType
  transactionRef
  description
  notes
  credit
  debit
  currency
  purchaseOrderId
  purchaseReturnId
  purchaseOrderPaymentId
  status
  runningBalance
  closingBalance
  createdDateTime
  createdBy
  modifiedDateTime
  modifiedBy
  deletedDateTime
  deletedBy
`

export const getAllVendorsForNewProduct = tenantId => `
  getAllVendors(tenantId: "${tenantId}") {
    ${vendorsFieldBase}
  }
`

export const getAllVendors = tenantId => `
  getAllVendors(tenantId: "${tenantId}") {
    ${vendorsFieldBase}
   
  }
`
export const getVendorQuery = (tenantId, vendorId) => {
  return `
  query getVendor{
  getVendor(tenantId: "${tenantId}",vendorId:"${vendorId}") {
    ${vendorsFieldBase}
    }
  }
`
}
export const getAllVendorsForPurchasePayment = tenantId => `
  getAllVendors(tenantId: "${tenantId}") {
    ${vendorsFieldBase}
   
  }
`

export const getAllVendorQuery = tenantId => {
  return /* GraphQL */ `
    query getVendors {
      ${getAllVendors(tenantId)}
    }
  `
}

export const CreateVendorMutation = () => {
  return /* GraphQL */ `
    mutation CreateVendorMutation($tenantId: String!, $vendor: VendorInput!) {
      createVendor(tenantId: $tenantId, vendor: $vendor) {
        ${vendorsFieldBase}
       
      }
    }
  `
}
export const CreateVendorsMutation = () => {
  return /* GraphQL */ `
  mutation CreateVendorsMutations($tenantId: String!, $vendors: [VendorInput]!) {
    createVendors(tenantId: $tenantId, vendors: $vendors) {
      ${vendorsFieldBase}
         
      }
    }
  `
}

export const updateVendorMutation = () => {
  return /* GraphQL */ `
    mutation UpdateVendor($tenantId: String!, $vendorId: String!, $vendor: VendorInput!) {
      updateVendor(tenantId: $tenantId, vendorId: $vendorId, vendor: $vendor) {
        ${vendorsFieldBase}
      }
    }
  `
}

export const deleteVendorMutation = () => {
  return /* GraphQL */ `
    mutation deleteVendorMutation($tenantId: String!, $vendorId: String!) {
      deleteVendor(tenantId: $tenantId, vendorId: $vendorId)
    }
  `
}

export const getVendorsByDateRangeQuery = (tenantId, startDate, endDate) => {
  return /* GraphQL */ `
    query getVendorsByDateRange {
      getVendorsByDateRange(tenantId: "${tenantId}", startDate: "${startDate}", endDate: "${endDate}") {
        ${vendorsFieldBase}
      
      }
    }
  `
}

export const getAllVendorTransactionsQuery = (tenantId, vendorId, fromDate, toDate) => `
  query getVendorTransactionsByDateRange {
  getVendorTransactionsByDateRange(tenantId: "${tenantId}",vendorId: "${vendorId}",fromDate: "${fromDate}",toDate: "${toDate}") {
    ${vendorLedgerFields}
   }
  }`
