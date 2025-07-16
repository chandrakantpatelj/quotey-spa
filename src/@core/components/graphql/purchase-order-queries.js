import { addressFragment, fileFragment, itemDimensionFragment, packingUnitsFragment } from './common-queries'

const orderItemInput = `
  itemId
  itemCode
  itemCodePrefix
  itemName
  itemDescription
  qty
  uom
  purchasePrice
  itemDimension {
    ${itemDimensionFragment}
  }
  packingUnit{
    ${packingUnitsFragment}
  }
  subtotal 
  totalPackedQty
  `

const PurchaseOrderTax = `
    taxId
    taxType
    taxName
    taxRate
    isManuallyEntered
    taxAuthorityId
    paidToMainVendor
    vendorId
    paidToTaxAuthority
    eligibleForTaxCredit
    taxValue
    taxValueCurrency
`

const PurchaseOrderExpense = `
   expenseId
   expenseType
   expenseName
   vendorId
   paidToMainVendor
   additionalTaxes
   accountableForOrderTaxes
   eligibleForTaxCredit
   distributionMethod
   expenseValue
   taxValue
   expenseValueCurrency
`
const PurchaseOrderClearingFieldBase = `
    purchaseOrderId
    purchaseOrderPaymentId
    purchaseOrderPaymentNo
    purchaseOrderPaymentNoPrefix
    taxStatementId
    taxStatementNo
    taxStatementNoPrefix
    purchaseOrderPayableId
    clearingDate
    clearingMethod
    amount
    currency
    currencyExchangeRate
    amountInLocalCurrency
`

export const PurchaseOrderPayableFieldBase = `
    purchaseOrderPayableId
    purchaseOrderId
    purchaseOrderNo
    purchaseOrderNoPrefix
    reference
    vendorId
    taxAuthorityId
    payableDate
    payableAmount
    payableTaxAmount
    totalPayableAmount
    payableCurrency
    clearedPayableAmount
    clearedPayableAmountInLocalCurrency
    clearedPayableCurrencyExchangeRate
    purchaseOrderClearings {
    ${PurchaseOrderClearingFieldBase}
    }
    payableStatus
`

const purchaseOrdersFieldBase = `
  schemaVersion
  purchaseType
  tenantId
  orderId
  orderNoPrefix
  orderNo
  tradingId
  vendorId
  currency
  currencyExchangeRate
  orderDate
  dueDate
  paymentTerms
  reference
  shippingPreference
  billingAddress {
    ${addressFragment}
  } 
  deliverType
  warehouseId
   deliveryAddress {
    ${addressFragment}
  }
  deliveryDate
  orderItems {
    ${orderItemInput}
  }
  taxes {
    ${PurchaseOrderTax}
  }
  expenses {
    ${PurchaseOrderExpense}
  }
  purchaseModuleSettingVersion
  lockedComponents
  status
  currentStage
  undoCurrentStage
  moveToNextStage
  previousStatus
  previousStage
  nextStatus
  nextStage
  paymentStatus
  vendorNotes
  notes
  termsAndConditions
  totalQty
  subtotal
  subtotalCurrency
  totalAmount
  totalAmountCurrency
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

export const getAllPurchaseOrders = tenantId => `
  getAllPurchaseOrders(tenantId: "${tenantId}") {
    ${purchaseOrdersFieldBase}
  }
`
export const getPurchaseOrderQuery = (tenantId, orderId) => {
  return ` query getPurchaseOrder{
            getPurchaseOrder(tenantId: "${tenantId}", orderId: "${orderId}") {
                    ${purchaseOrdersFieldBase}

            }
        }
`
}
export const getPurchaseOrdersQuery = tenantId => {
  return /* GraphQL */ `
    query getPurchaseOrder {
      ${getAllPurchaseOrders(tenantId)}
    }
  `
}

export const createPurchaseOrderMutation = () => {
  return /* GraphQL */ `
    mutation CreatePurchaseOrder($tenantId: String!, $purchaseOrder: PurchaseOrderInput!) {
      createPurchaseOrder(tenantId: $tenantId, purchaseOrder: $purchaseOrder) {
        ${purchaseOrdersFieldBase}
      }
    }
  `
}

export const createPurchaseOrderAndMoveToFirstStageMutation = () => {
  return /* GraphQL */ `
    mutation CreatePurchaseOrderAndMoveToFirstStage($tenantId: String!, $purchaseOrder: PurchaseOrderInput!) {
      createPurchaseOrderAndMoveToFirstStage(tenantId: $tenantId, purchaseOrder: $purchaseOrder) {
        ${purchaseOrdersFieldBase}
      }
    }
  `
}

export const updatePurchaseOrderMutation = () => {
  return /* GraphQL */ `
    mutation UpdatePurchaseOrder($tenantId: String!, $orderId: String!, $purchaseOrder: PurchaseOrderInput!) {
      updatePurchaseOrder(tenantId: $tenantId, orderId: $orderId, purchaseOrder: $purchaseOrder) {
        ${purchaseOrdersFieldBase}
      }
    }
  `
}

export const updatePurchaseOrderAndMoveToFirstStageMutation = () => {
  return /* GraphQL */ `
    mutation UpdatePurchaseOrderAndMoveToFirstStage($tenantId: String!, $orderId: String!, $purchaseOrder: PurchaseOrderInput!) {
      updatePurchaseOrderAndMoveToFirstStage(tenantId: $tenantId, orderId: $orderId, purchaseOrder: $purchaseOrder) {
        ${purchaseOrdersFieldBase}
      }
    }
  `
}
export const deletePurchaseOrderMutation = () => {
  return /* GraphQL */ `
    mutation DeletePurchaseOrder($tenantId: String!, $orderId: String!) {
      deletePurchaseOrder(tenantId: $tenantId, orderId: $orderId)
    }
  `
}

export const getPurchaseOrdersByDateRangeQuery = (tenantId, startDate, endDate) => {
  return /* GraphQL */ `
    query GetPurchaseOrdersByDateRange {
      getPurchaseOrdersByDateRange(tenantId: "${tenantId}", startDate: "${startDate}", endDate: "${endDate}") {
        ${purchaseOrdersFieldBase}
      }
    }
  `
}

export const UndoPurchaseOrderStageQuery = () => {
  return /* GraphQL */ `
    mutation UndoPurchaseOrderStage($tenantId: String!, $orderId: String!, $stageName: String!) {
      undoPurchaseOrderStage(tenantId: $tenantId, orderId: $orderId, stageName: $stageName) {
        ${purchaseOrdersFieldBase}
      }
    }
  `
}

export const movePurchaseOrderToNextStageQuery = () => {
  return /* GraphQL */ `
    mutation MovePurchaseOrderToNextStage($tenantId: String!, $orderId: String!, $stageName: String!, $stageDate: String!) {
      movePurchaseOrderToNextStage(tenantId: $tenantId, orderId: $orderId, stageName: $stageName, stageDate: $stageDate) {
        ${purchaseOrdersFieldBase}
      }
    }
  `
}

export const getPurchaseOrdersByVendorToBePackagedQuery = (tenantId, vendorId) => {
  return /* GraphQL */ `
    query GetPurchaseOrdersByVendorToBePackaged {
      getPurchaseOrdersByVendorToBePackaged(tenantId: "${tenantId}",vendorId: "${vendorId}") {
        ${purchaseOrdersFieldBase}
      }
    }
  `
}

export const GetPurchaseOrderPayablesRelatedToOrderQuery = (tenantId, orderId) => {
  return /* GraphQL */ `
    query GetPurchaseOrderPayablesRelatedToOrder {
      getPurchaseOrderPayablesRelatedToOrder(tenantId: "${tenantId}",orderId: "${orderId}") {
        ${PurchaseOrderPayableFieldBase}
      }
    }
  `
}
