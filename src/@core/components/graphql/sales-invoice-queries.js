import { addressFragment, fileFragment, itemDimensionFragment, packingUnitsFragment } from './common-queries'
import { SalesOrderOtherChargeField, salesOrderTaxesFields } from './sales-order-queries'

export const salesInvoiceItemFragment = `
  lineItemId
  itemId
  itemName
  itemCodePrefix
  itemCode
  itemGroup
  itemDescription
  itemDimension {
    ${itemDimensionFragment}
  }
  packingUnit{
    ${packingUnitsFragment}
  }
  qty
  uom
  originalPrice
  taxFree
  taxInclusive
  sellingPrice
  discountPerUnit
  taxes {
    ${salesOrderTaxesFields}
  }
  subtotal
  totalDiscount
  totalTax
  totalNetAmount
  serviceDate
`
const SalesInvoiceSentHistory = `
  messageId
  sentDateTime
  sentBy
  sentTo
  sentCC
  status`

const salesInvoiceFieldsBase = `
  schemaVersion
  tenantId
  tradingId
  customerId
  invoiceId
  invoiceNo
  invoiceNoPrefix
  salesOrderId
  salesOrderNo
  saleOrderNoPrefix
  invoiceDate
  dueDate
  paymentTerms
  paymentStatus
  status
  currency
  emailAddress
  sendEmail
  invoiceSentHistory {
  ${SalesInvoiceSentHistory}
  }
  totalOutstandingAmount
  billingAddress {
    ${addressFragment}
  }
  deliveryAddress {
    ${addressFragment}
  }
  invoiceItems {
    ${salesInvoiceItemFragment}
  }
  taxes {
    ${salesOrderTaxesFields}
  }
  otherCharges {
   ${SalesOrderOtherChargeField}
    taxes {
       ${salesOrderTaxesFields}
    }
  }
  customerNotes
  notes
  termsAndConditions
  discountType
  discountValue
  totalQty
  subtotal
  totalDiscount
  totalTax
  totalOtherCharges
  totalOtherChargesTax
  totalAmount
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

export const getSalesInvoiceQuery = (tenantId, invoiceId) => `
  query getSalesInvoice {
    getSalesInvoice(tenantId: "${tenantId}", invoiceId: "${invoiceId}") {
      ${salesInvoiceFieldsBase}
    }
  }
`

export const getAllSalesInvoicesQuery = tenantId => `
  query getAllSalesInvoices {
    getSalesInvoices(tenantId: "${tenantId}") {
      ${salesInvoiceFieldsBase}
    }
  }
`

export const getSalesInvoicesByDateRangeQuery = (tenantId, startDate, endDate) => `
  query getSalesInvoicesByDateRange {
    getSalesInvoicesByDateRange(tenantId: "${tenantId}", startDate: "${startDate}", endDate: "${endDate}") {
      ${salesInvoiceFieldsBase}
    }
  }
`

export const getSalesInvoicesByCustomerQuery = (tenantId, customerId) => `
  query getSalesInvoicesByCustomer {
    getSalesInvoicesByCustomer(tenantId: "${tenantId}", customerId: "${customerId}") {
      ${salesInvoiceFieldsBase}
    }
  }
`

export const getSalesInvoicesByCustomerAndDateRangeQuery = (tenantId, customerId, startDate, endDate) => `
  query getSalesInvoicesByCustomerAndDateRange {
    getSalesInvoicesByCustomerAndDateRange(tenantId: "${tenantId}", customerId: "${customerId}", startDate: "${startDate}", endDate: "${endDate}") {
      ${salesInvoiceFieldsBase}
    }
  }
`

export const createSalesInvoiceMutation = () => `
  mutation createSalesInvoice($tenantId: String!, $salesInvoice: SalesInvoiceInput!) {
    createSalesInvoice(tenantId: $tenantId, salesInvoice: $salesInvoice) {
      ${salesInvoiceFieldsBase}
    }
  }
`

export const markSalesInvoiceAsIssuedMutation = () => `
  mutation markSalesInvoiceAsIssued($tenantId: String!, $invoiceId: String!) {
    markSalesInvoiceAsIssued(tenantId: $tenantId, invoiceId: $invoiceId) {
      ${salesInvoiceFieldsBase}
    }
  }
`

export const updateSalesInvoiceMutation = () => `
  mutation updateSalesInvoice($tenantId: String!, $invoiceId: String!, $salesInvoice: SalesInvoiceInput!) {
    updateSalesInvoice(tenantId: $tenantId, invoiceId: $invoiceId, salesInvoice: $salesInvoice) {
      ${salesInvoiceFieldsBase}
    }
  }
`

export const deleteSalesInvoiceMutation = () => `
  mutation deleteSalesInvoice($tenantId: String!, $invoiceId: String!) {
    deleteSalesInvoice(tenantId: $tenantId, invoiceId: $invoiceId)
  }
`

export const cancelSalesInvoiceMutation = () => `
  mutation cancelSalesInvoice($tenantId: String!, $invoiceId: String!) {
    cancelSalesInvoice(tenantId: $tenantId, invoiceId: $invoiceId) {
      ${salesInvoiceFieldsBase}
    }
  }
`

export const getSalesInvoicesByOrderQuery = (tenantId, salesOrderId) => {
  return /* GraphQL */ `
    query getSalesInvoicesByOrder {
      getSalesInvoicesByOrder(tenantId: "${tenantId}",  salesOrderId: "${salesOrderId}") {
        ${salesInvoiceFieldsBase}
      }
    }
  `
}
