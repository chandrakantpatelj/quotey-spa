import { addressFragment, fileFragment } from './common-queries'
import { getOtherSetting } from './other-setting-queries'
import { getAllPriceList } from './priceList-queries'
import { salesOrderItemQuery, SalesOrderOtherChargeField, salesOrderTaxesFields } from './sales-order-queries'

const quotationFields = `
  schemaVersion
  tradingId
  reference
  quotationDate
  quotationNoPrefix
  dueDate
  deliveryAddress {
    ${addressFragment}
  }
  billingAddress {
    ${addressFragment}
  }
  deliveryDate
  customerId
  paymentTerms
  shippingPreference
  customerNotes
  notes
  termsAndConditions
  files {
    ${fileFragment}
  }
  quotationItems {
    ${salesOrderItemQuery}
  }
  taxes{
    ${salesOrderTaxesFields}
  }
  otherCharges{
    ${SalesOrderOtherChargeField}
  }
  balance
  currency
  totalQty
  subtotal
  totalTax
  totalDiscount
  discountType
  discountValue
  status
  totalOtherCharges
  totalOtherChargesTax
  paymentId
  paymentMethod
  paymentReference
  depositAmount
  totalAmount
  createdDateTime
  modifiedBy
  modifiedDateTime
  createdBy
  tenantId
  quotationId
  paymentStatus
  quotationNo
  deletedDateTime
  deletedBy
`

export const getAllQuotations = tenantId => `
  getAllQuotations(tenantId: "${tenantId}") {
    ${quotationFields}
   
  }
`

export const getAllQuotationsQuery = tenantId => {
  return `
    query getQuotations {
      ${getAllQuotations(tenantId)}
    }
  `
}

export const newQuotationsQuery = tenantId => {
  return `
    query newQuotations {
      ${getAllPriceList(tenantId)}

    }
  `
}

export const editQuotationsQuery = tenantId => {
  return `
    query editQuotations {
      ${getAllPriceList(tenantId)}
      ${getOtherSetting(tenantId)}
    }
  `
}

export const createQuotationMutation = () => {
  return `
    mutation CreateQuotation($tenantId: String!, $quotation: QuotationInput!) {
      createQuotation(tenantId: $tenantId, quotation: $quotation) {
        ${quotationFields}
       }
    }
  `
}

export const updateQuotationMutation = () => {
  return `
    mutation UpdateQuotation($tenantId: String!, $quotationId: String!, $quotation: QuotationInput!) {
      updateQuotation(tenantId: $tenantId, quotationId: $quotationId, quotation: $quotation) {
        ${quotationFields}
        }
    }
  `
}

export const deleteQuotationMutation = () => {
  return `
    mutation DeleteQuotation($tenantId: String!, $quotationId: String!) {
      deleteQuotation(tenantId: $tenantId, quotationId: $quotationId)
    }
  `
}

export const getQuotationsByDateRangeQuery = (tenantId, startDate, endDate) => {
  return /* GraphQL */ `
    query GetQuotationsByDateRange {
      getQuotationsByDateRange(tenantId: "${tenantId}", startDate: "${startDate}", endDate: "${endDate}") {
        ${quotationFields}
      }
    }
  `
}
