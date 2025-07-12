import { fileFragment, itemDimensionFragment } from './common-queries'

const purchaseOrdersInvoiceFieldsBase = `
  invoiceDate
  dueDate
  items {
    itemId
    itemName
    itemDescription
    qty
    uom
    purchasePrice
    itemCode
    itemDimension {
      ${itemDimensionFragment}
    }
  }
  purchaseOrderId
  notes
  files {
    ${fileFragment}
  }
  vendor
  currency
  paymentTerms
  invoiceType
  totalAmount
  totalQty
  subTotal
  shipping
  custom
  importGst
  misc
  tradingId
`

export const getPurchaseInvoices = tenantId => `
  getPurchaseInvoices(tenantId: "${tenantId}") {
    ${purchaseOrdersInvoiceFieldsBase}
    invoiceId
    tenantId
    invoiceNo
    status
    balance
    createdDateTime
  }
`

export const getPurchaseInvoiceForPOPayment = tenantId => `
  getPurchaseInvoices(tenantId: "${tenantId}") {
    invoiceId
    invoiceNo
    dueDate
    totalAmount
    balance
    currency
    vendor
    paymentTerms
    purchaseOrderId
    status
    items {
    itemId
    itemName
    itemDescription
    qty
    uom
    purchasePrice
    itemCode
    itemDimension {
      ${itemDimensionFragment}
    }
  }
  }
`

export const CreatePurchaseInvoiceMutation = () => {
  return /* GraphQL */ `
    mutation CreatePurchaseInvoiceMutation($tenantId: String!, $invoice: PurchaseInvoiceInput!) {
      createPurchaseInvoice(tenantId: $tenantId, invoice: $invoice) {
        ${purchaseOrdersInvoiceFieldsBase}
      }
    }
  `
}

export const UpdatePurchaseInvoiceMutation = () => {
  return /* GraphQL */ `
    mutation UpdatePurchaseInvoiceMutation($invoiceId: String!, $tenantId: String!, $invoice: PurchaseInvoiceInput!) {
      updatePurchaseInvoice(invoiceId: $invoiceId, tenantId: $tenantId, invoice: $invoice) {
        ${purchaseOrdersInvoiceFieldsBase}
      }
    }
  `
}

export const deletePurchaseInvoiceMutation = () => {
  return /* GraphQL */ `
    mutation deletePurchaseInvoiceMutation($tenantId: String!, $invoiceId: String!) {
      deletePurchaseInvoice(tenantId: $tenantId, invoiceId: $invoiceId)
    }
  `
}
