import { addressFragment, fileFragment } from './common-queries'
import { PurchaseOrderPayableFieldBase } from './purchase-order-queries'

const PurchaseOrderShipmentPackageFieldBase = `
  packageId
  packageNo
  packageNoPrefix
  purchaseOrderId
  purchaseOrderNo
  purchaseOrderNoPrefix
  vendorId
  totalValue
  currency
  `

const PurchaseOrderShipmentTaxFieldBase = `
  taxId
  taxType
  taxName
  paidToTaxAuthority
  taxAuthorityId
  paidToVendor
  vendorId
  distributionMethod
  eligibleForTaxCredit
  taxValue
  taxValueCurrency
`

const PurchaseOrderShipmentExpenseFieldBase = `
  expenseId
  expenseType
  expenseName
  vendorId
  paidToMainVendor
  additionalTaxes
  eligibleForTaxCredit
  distributionMethod
  expenseValue
  taxValue
  expenseValueCurrency
`

const purchaseOrdersShipmentFieldBase = `
  schemaVersion
  shipmentType
  tenantId
  shipmentId
  shipmentNoPrefix
  shipmentNo
  vendorId
  tradingId
  shipmentDate
  currency
  currencyExchangeRate
  warehouseId
  deliveryAddress {
    ${addressFragment}
  }
  packages {
  ${PurchaseOrderShipmentPackageFieldBase}
  }
  taxes {
    ${PurchaseOrderShipmentTaxFieldBase}
  }
  expenses{
    ${PurchaseOrderShipmentExpenseFieldBase}
  }
  lockedComponents
  purchaseModuleSettingVersion
  status
  currentStage
  undoCurrentStage
  moveToNextStage
  previousStatus
  previousStage
  nextStatus
  nextStage
  deliveryStatus
  paymentStatus
  notes
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

export const getAllPurchaseOrdersShipments = tenantId => `
   getPurchaseOrderShipments(tenantId: "${tenantId}") {
    ${purchaseOrdersShipmentFieldBase}
  }
`

export const getPurchaseOrderShipmentsQuery = tenantId => {
  return /* GraphQL */ `
    query  getPurchaseOrderShipments {
      ${getAllPurchaseOrdersShipments(tenantId)}
    }
  `
}

export const getPurchaseOrderShipmentQuery = (tenantId, shipmentId) => {
  return ` query getPurchaseOrderShipment{
      getPurchaseOrderShipment(tenantId: "${tenantId}", shipmentId: "${shipmentId}") {
            ${purchaseOrdersShipmentFieldBase}
        }
      }
`
}

export const getPurchaseOrderShipmentsByPurchaseOrderIdQuery = (tenantId, purchaseOrderId) => {
  return ` query GetPurchaseOrderShipmentsByPurchaseOrderId{
      getPurchaseOrderShipmentsByPurchaseOrderId(tenantId: "${tenantId}", purchaseOrderId: "${purchaseOrderId}") {
            ${purchaseOrdersShipmentFieldBase}
        }
      }
`
}

export const getPurchaseOrderShipmentsByPurchaseOrderPackageIdQuery = (tenantId, purchaseOrderPackageId) => {
  return ` query getPurchaseOrderShipmentsByPurchaseOrderPackageId{
      getPurchaseOrderShipmentsByPurchaseOrderPackageId(tenantId: "${tenantId}", purchaseOrderPackageId: "${purchaseOrderPackageId}") {
            ${purchaseOrdersShipmentFieldBase}
        }
      }
`
}

export const getPurchaseOrderShipmentsByDateRangeQuery = (tenantId, startDate, endDate) => {
  return /* GraphQL */ `
    query GetPurchaseOrderShipmentsByDateRange {
      getPurchaseOrderShipmentsByDateRange(tenantId: "${tenantId}", startDate: "${startDate}", endDate: "${endDate}") {
        ${purchaseOrdersShipmentFieldBase}
      }
    }
  `
}

export const getSalesOrderPackagesByDateRangeQuery = (tenantId, startDate, endDate) => {
  return /* GraphQL */ `
    query getSalesOrderPackagesByDateRange {
      getSalesOrderPackagesByDateRange(tenantId: "${tenantId}", startDate: "${startDate}", endDate: "${endDate}") {
        ${packagesFieldBase}
      }
    }
  `
}

export const createPurchaseOrderShipmentMutation = () => {
  return /* GraphQL */ `
    mutation CreatePurchaseOrderShipment($tenantId: String!, $purchaseOrderShipment: PurchaseOrderShipmentInput!) {
      createPurchaseOrderShipment(tenantId: $tenantId, purchaseOrderShipment: $purchaseOrderShipment) {
        ${purchaseOrdersShipmentFieldBase}
      }
    }
  `
}

export const createPurchaseOrderShipmentAndMoveToFirstStageMutation = () => {
  return /* GraphQL */ `
    mutation CreatePurchaseOrderShipmentAndMoveToFirstStage($tenantId: String!, $purchaseOrderShipment: PurchaseOrderShipmentInput!) {
      createPurchaseOrderShipmentAndMoveToFirstStage(tenantId: $tenantId, purchaseOrderShipment: $purchaseOrderShipment) {
        ${purchaseOrdersShipmentFieldBase}
      }
    }
  `
}

export const updatePurchaseOrderShipmentMutation = () => {
  return /* GraphQL */ `
    mutation updatePurchaseOrderShipment($tenantId: String!, $shipmentId: String!, $purchaseOrderShipment: PurchaseOrderShipmentInput!) {
      updatePurchaseOrderShipment(tenantId: $tenantId, shipmentId: $shipmentId, purchaseOrderShipment: $purchaseOrderShipment) {
        ${purchaseOrdersShipmentFieldBase}
      }
    }
  `
}

export const updatePurchaseOrderShipmentAndMoveToFirstStageMutation = () => {
  return /* GraphQL */ `
    mutation UpdatePurchaseOrderShipmentAndMoveToFirstStage($tenantId: String!, $shipmentId: String!, $purchaseOrderShipment: PurchaseOrderShipmentInput!) {
      updatePurchaseOrderShipmentAndMoveToFirstStage(tenantId: $tenantId, shipmentId: $shipmentId, purchaseOrderShipment: $purchaseOrderShipment) {
        ${purchaseOrdersShipmentFieldBase}
      }
    }
  `
}

export const deletePurchaseOrderShipmentMutation = () => {
  return /* GraphQL */ `
    mutation DeletePurchaseOrderShipment($tenantId: String!, $shipmentId: String!) {
      deletePurchaseOrderShipment(tenantId: $tenantId, shipmentId: $shipmentId){
         ${purchaseOrdersShipmentFieldBase}
      }
    }
  `
}

export const undoPurchaseOrderShipmentStageQuery = () => {
  return /* GraphQL */ `
    mutation undoPurchaseOrderShipmentStage($tenantId: String!, $shipmentId: String!, $stageName: String!) {
      undoPurchaseOrderShipmentStage(tenantId: $tenantId, shipmentId: $shipmentId, stageName: $stageName) {
        ${purchaseOrdersShipmentFieldBase}
      }
    }
  `
}

export const getPurchaseOrderPayablesRelatedToShipmentQuery = (tenantId, shipmentId) => {
  return /* GraphQL */ `
    query GetPurchaseOrderPayablesRelatedToShipment {
      getPurchaseOrderPayablesRelatedToShipment(tenantId: "${tenantId}",shipmentId: "${shipmentId}") {
        ${PurchaseOrderPayableFieldBase}
      }
    }
  `
}

export const movePurchaseOrderShipmentToStageQuery = () => {
  return /* GraphQL */ `
    mutation movePurchaseOrderShipmentToStage($tenantId: String!, $shipmentId: String!, $stageName: String!, $stageDate: String!) {
      movePurchaseOrderShipmentToStage(tenantId: $tenantId, shipmentId: $shipmentId, stageName: $stageName, stageDate: $stageDate) {
        ${purchaseOrdersShipmentFieldBase}
      }
    }
  `
}

export const attachFilesToPurchaseOrderShipment = () => {
  return `mutation attachFilesToPurchaseOrderShipment($tenantId: String!, $shipmentId: String!,$files:[FileUploaderInput]!) {
            attachFilesToPurchaseOrderShipment(tenantId: $tenantId, shipmentId: $shipmentId,files:$files){
              ${fileFragment}
             }
          }`
}

export const deleteFileFromPurchaseOrderShipment = () => {
  return `mutation deleteFileFromPurchaseOrderShipment($tenantId: String!, $shipmentId: String!,$file:FileUploaderInput!) {
            deleteFileFromPurchaseOrderShipment(tenantId: $tenantId, shipmentId: $shipmentId,file:$file){
              ${fileFragment}
             }
          }`
}
