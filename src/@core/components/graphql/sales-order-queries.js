import { addressFragment, fileFragment, itemDimensionFragment, packingUnitsFragment } from './common-queries'
import { getOtherSetting } from './other-setting-queries'
import { getAllPriceList } from './priceList-queries'
import { getSalesModuleSettings } from './sales-module-setting'

export const salesOrderItemTaxesFields = `
    taxId
    taxType
    taxName
    taxRate
    taxAuthorityId
    taxValuePerUnit
    taxValue
    taxValueCurrency
`

export const salesOrderItemQuery = `
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
    ${salesOrderItemTaxesFields}
  }
  subtotal
  totalDiscount
  totalTax
  totalNetAmount
  warehouseId
  serviceDate
  totalPackedQty
`

export const salesOrderTaxesFields = `
    taxId
    taxType
    taxName
    taxRate
    taxAuthorityId
    taxValue
    taxValueCurrency
`
export const SalesOrderOtherChargeField = `
  chargeId
  chargeType
  chargeName
  chargedAmount
  chargedAmountCurrency
  totalChargeValue
  includingTax
  taxes{
    ${salesOrderTaxesFields}
  }
`
const salesOrderFieldsBase = `
  schemaVersion
  tenantId
  orderId
  orderNo
  orderNoPrefix
  salesInvoiceId
  tradingId
  customerId
  salesQuotationId
  salesQuotationNoPrefix
  salesQuotationNo
  reference
  orderDate
  dueDate
  expectedDeliveryDate
  expectedPackingDate
  deliveryDate
  paymentTerms
  shippingPreference
  status
  currency
  emailAddress
  sendEmail
  billingAddress {
    ${addressFragment}
  }
  deliveryAddress {
    ${addressFragment}
  }
  deliveredBy
  assignedTo
  customerNotes
  notes
  termsAndConditions
  discountType
  discountValue
  deliveryStatus
  totalQty
  subtotal
  totalDiscount
  totalTax
  totalOtherCharges
  totalOtherChargesTax
  totalAmount
  depositAmount
  balance
  orderItems {
    ${salesOrderItemQuery}
  }
  taxes{
    ${salesOrderTaxesFields}
  }
  otherCharges{
    ${SalesOrderOtherChargeField}
  }

  files {
    ${fileFragment}
  }
  paymentId
  paymentMethod
  paymentReference
  paymentDate
  paymentStatus
  createdDateTime
  createdBy
  modifiedDateTime
  modifiedBy
  deletedDateTime
  deletedBy
  `

export const getAllSalesOrders = tenantId => `
  getAllSalesOrders(tenantId: "${tenantId}") {
    ${salesOrderFieldsBase}
  }
`

export const getSalesOrdersByCustomer = (tenantId, customerId) => `
  getSalesOrdersByCustomer(tenantId: "${tenantId}", customerId: "${customerId}") {
    orderId
    orderNo
    dueDate
    customerId
    totalAmount
    depositAmount
    currency
  }
`

export const getAllConfirmedSalesOrders = tenantId => `
  getAllConfirmedSalesOrders(tenantId: "${tenantId}") {
    orderId
    orderNo
    orderNoPrefix
    tradingId
    orderDate
    dueDate
    customerId
    paymentTerms
    orderItems {
      ${salesOrderItemQuery}
    }
    billingAddress {
      ${addressFragment}
    }
    deliveryAddress {
      ${addressFragment}
    }
    taxes{
      ${salesOrderTaxesFields}
    }
    otherCharges{
      ${SalesOrderOtherChargeField}
    }
    assignedTo
    expectedDeliveryDate
    expectedPackingDate
    discountType
    discountValue
    notes
    customerNotes
    termsAndConditions
  }
`

export const getSalesOrderToBePackedQuery = (tenantId, orderId) => {
  return /* GraphQL */ `
    query GetSalesOrderToBePacked {
    getSalesOrderToBePacked(tenantId: "${tenantId}", orderId: "${orderId}") {
    orderId
    orderNo
    orderNoPrefix
    tradingId
    orderDate
    customerId
    expectedDeliveryDate
    expectedPackingDate
    orderItems {
      ${salesOrderItemQuery}
    }
    deliveryAddress {
      ${addressFragment}
    }
    assignedTo
    notes
      }
  }
`
}

export const getAllConfirmedSalesOrdersQuery = tenantId => {
  return /* GraphQL */ `
    query GetAllConfirmedSalesOrders {
      ${getAllConfirmedSalesOrders(tenantId)}
    }
  `
}

export const getAllSalesOrdersQuery = tenantId => {
  return /* GraphQL */ `
    query getSalesOrders {
      ${getAllSalesOrders(tenantId)}
    }
  `
}

export const getSuggestedProducts = () => {
  return /* GraphQL */ `
    mutation SuggestedProducts($tenantId: String!, $message: String!) {
      getSuggestedProducts(tenantId: $tenantId, message: $message) {
        productId
        itemCode
        dimension {
          length
          width
        }
        qty
      }
    }
  `
}

export const newSalesOrdersQuery = tenantId => {
  return /* GraphQL */ `
    query newSalesOrders {
      ${getAllConfirmedSalesOrders(tenantId)}
    }
  `
}

export const viewSalesOrdersQuery = tenantId => {
  return /* GraphQL */ `
    query viewSalesOrders {
       ${getSalesModuleSettings(tenantId)}
    }
  `
}

export const editSalesOrdersQuery = tenantId => {
  return /* GraphQL */ `
    query editSalesOrders {
      ${getAllPriceList(tenantId)}
      ${getOtherSetting(tenantId)}

    }
  `
}

export const createSalesOrderMutation = () => {
  return /* GraphQL */ `
    mutation CreateSalesOrder($tenantId: String!, $salesOrder: SalesOrderInput!) {
      createSalesOrder(tenantId: $tenantId, salesOrder: $salesOrder) {
        ${salesOrderFieldsBase}
      }
    }
  `
}

export const createSalesOrderAndProcessAsDeliveredMutation = () => {
  return /* GraphQL */ `
    mutation CreateSalesOrderAndProcessAsDelivered($tenantId: String!, $salesOrder: SalesOrderInput!) {
      createSalesOrderAndProcessAsDelivered(tenantId: $tenantId, salesOrder: $salesOrder) {
        ${salesOrderFieldsBase}
      }
    }
  `
}

export const createSalesOrderAndIssueTaxInvoiceMutation = () => {
  return /* GraphQL */ `
    mutation CreateSalesOrderAndIssueTaxInvoice($tenantId: String!, $salesOrder: SalesOrderInput!) {
      createSalesOrderAndIssueTaxInvoice(tenantId: $tenantId, salesOrder: $salesOrder) {
        ${salesOrderFieldsBase}
      }
    }
  `
}

export const updateSalesOrderMutation = () => {
  return /* GraphQL */ `
    mutation UpdateSalesOrder($tenantId: String!, $orderId: String!, $salesOrder: SalesOrderInput!) {
      updateSalesOrder(tenantId: $tenantId, orderId: $orderId, salesOrder: $salesOrder) {
        ${salesOrderFieldsBase}
      }
    }
  `
}

export const updateSalesOrderAndProcessAsDeliveredMutation = () => {
  return /* GraphQL */ `
    mutation UpdateSalesOrderAndProcessAsDelivered($tenantId: String!, $orderId: String!, $salesOrder: SalesOrderInput!) {
      updateSalesOrderAndProcessAsDelivered(tenantId: $tenantId, orderId: $orderId, salesOrder: $salesOrder) {
        ${salesOrderFieldsBase}
      }
    }
  `
}

export const updateSalesOrderAndIssueTaxInvoiceMutation = () => {
  return /* GraphQL */ `
    mutation UpdateSalesOrderAndIssueTaxInvoice($tenantId: String!, $orderId: String!, $salesOrder: SalesOrderInput!) {
      updateSalesOrderAndIssueTaxInvoice(tenantId: $tenantId, orderId: $orderId, salesOrder: $salesOrder) {
        ${salesOrderFieldsBase}
      }
    }
  `
}

export const deleteSalesOrderMutation = () => {
  return /* GraphQL */ `
    mutation DeleteSalesOrder($tenantId: String!, $orderId: String!) {
      deleteSalesOrder(tenantId: $tenantId, orderId: $orderId)
    }
  `
}

export const undoTaxInvoiceForSalesOrderQuery = () => {
  return /* GraphQL */ `
    mutation UndoTaxInvoiceForSalesOrder($tenantId: String!, $orderId: String!) {
      undoTaxInvoiceForSalesOrder(tenantId: $tenantId, orderId: $orderId) {
        ${salesOrderFieldsBase}
      }
    }
  `
}

export const undoSalesOrderConfirmationQuery = () => {
  return /* GraphQL */ `
    mutation undoSalesOrderConfirmation($tenantId: String!, $orderId: String!) {
      undoSalesOrderConfirmation(tenantId: $tenantId, orderId: $orderId) {
        ${salesOrderFieldsBase}
      }
    }
  `
}

// export const undoSalesOrderPayment = () => {
//   return /* GraphQL */ `
//     mutation undoSalesOrderPayment($tenantId: String!, $orderId: String!) {
//       undoSalesOrderPayment(tenantId: $tenantId, orderId: $orderId) {
//         ${salesOrderFieldsBase}
//       }
//     }
//   `
// }

export const issueTaxInvoiceForSalesOrderMutation = () => {
  return /* GraphQL */ `
    mutation IssueTaxInvoiceForSalesOrder($tenantId: String!, $orderId: String!, $invoiceDate: String, $paymentTerms: String, $dueDate: String) {
      issueTaxInvoiceForSalesOrder(tenantId: $tenantId, orderId: $orderId,invoiceDate: $invoiceDate,paymentTerms: $paymentTerms ,dueDate: $dueDate) {
        ${salesOrderFieldsBase}
      }
    }
  `
}

export const addItemToSalesOrderMutation = () => {
  return /* GraphQL */ `
    mutation AddItemToSalesOrder($tenantId: String!, $orderId: String!, $item:SalesOrderItemInput!) {
      addItemToSalesOrder(tenantId: $tenantId, orderId: $orderId, item: $item) {
        ${salesOrderFieldsBase}
      }
    }
  `
}

export const deleteItemFromSalesOrderMutation = () => {
  return /* GraphQL */ `
    mutation deleteItemFromSalesOrder($tenantId: String!, $orderId: String!, $lineItemId: String!) {
      deleteItemFromSalesOrder(tenantId: $tenantId, orderId: $orderId, lineItemId: $lineItemId) {
        ${salesOrderFieldsBase}
      }
    }
  `
}

export const GetSalesOrdersByDateRangeQuery = (tenantId, startDate, endDate) => {
  return /* GraphQL */ `
    query GetSalesOrdersByDateRange {
      getSalesOrdersByDateRange(tenantId: "${tenantId}", startDate: "${startDate}", endDate: "${endDate}") {
        ${salesOrderFieldsBase}
      }
    }
  `
}
export const getSalesOrderQuery = (tenantId, orderId) => {
  return ` query getSalesOrder{
            getSalesOrder(tenantId: "${tenantId}", orderId: "${orderId}") {
                    ${salesOrderFieldsBase}

            }
        }
`
}
export const getAllPendingOrdersMatchingPaymentInfo = () => {
  return `
    query getAllPendingOrdersMatchingPaymentInfo($tenantId : String!, $paymentInfo:PaymentInfoInput!) {
      getAllPendingOrdersMatchingPaymentInfo(tenantId: $tenantId, paymentInfo:$paymentInfo) {
       orderNo
       customerId
       totalAmount
       orderDate
      }
    }
  `
}
