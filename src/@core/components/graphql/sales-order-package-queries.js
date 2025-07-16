import { addressFragment, fileFragment, itemDimensionFragment, packingUnitsFragment } from './common-queries'

export const SalesOrderPackageItem = `
  lineItemId
  itemId
  itemCodePrefix
  itemCode
  itemName
  itemGroup
  itemDescription
  itemDimension {
    ${itemDimensionFragment}
  }
  packingUnit{
     ${packingUnitsFragment}
  }
  packedQty
  packedQtyUom
  warehouseId
`

const packagesFieldBase = `
  packageId
  schemaVersion
  tenantId
  tradingId
  salesOrderId
  salesOrderNo
  salesOrderNoPrefix
  customerId
  packageNo
  packageNoPrefix
  packageDate
  expectedDeliveryDate
  expectedPackingDate
  deliveryAddress {
    ${addressFragment}
  }
  assignedTo
  deliveredByUsername
  deliveryDate
  deliveredBy
  pickedUpBy
  packedByUsername
  packageItems{
    ${SalesOrderPackageItem}
  }
  notes
  status
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

export const getPackages = (tenantId, packageId) => `
  getSalesOrderPackage(tenantId: "${tenantId}",packageId:"${packageId}") {
    ${packagesFieldBase}
  }
`

export const getSalesOrderPackagesByOrderQuery = (tenantId, orderId) => {
  return `
query getSalesOrderPackagesBySalesOrder {
  getSalesOrderPackagesBySalesOrder(tenantId: "${tenantId}", salesOrderId: "${orderId}") {
    ${packagesFieldBase}
  }
}
`
}

export const getSalesOrderPackage = (tenantId, packageId) => {
  return /* GraphQL */ `
    query getSalesOrderPackage {
     getSalesOrderPackage(tenantId: "${tenantId}",packageId:"${packageId}") {
    ${packagesFieldBase}
    }
  }
  `
}

export const createSalesOrderPackageMutation = () => {
  return /* GraphQL */ `
    mutation CreateSalesOrderPackage($tenantId: String!, $salesOrderPackage: SalesOrderPackageInput!) {
      createSalesOrderPackage(tenantId: $tenantId, salesOrderPackage: $salesOrderPackage) {
        ${packagesFieldBase}
      }
    }
  `
}
export const createSalesOrderPackageAndProcessAsFulfilledMutation = () => {
  return /* GraphQL */ `
    mutation CreateSalesOrderPackageAndProcessAsFulfilled($tenantId: String!, $salesOrderPackage: SalesOrderPackageInput!) {
      createSalesOrderPackageAndProcessAsFulfilled(tenantId: $tenantId, salesOrderPackage: $salesOrderPackage) {
        ${packagesFieldBase}
      }
    }
  `
}

export const createSalesOrderPackageAndProcessAsDeliveredMutation = () => {
  return /* GraphQL */ `
    mutation CreateSalesOrderPackageAndProcessAsDelivered($tenantId: String!, $salesOrderPackage: SalesOrderPackageInput!) {
      createSalesOrderPackageAndProcessAsDelivered(tenantId: $tenantId, salesOrderPackage: $salesOrderPackage) {
        ${packagesFieldBase}
      }
    }
  `
}

export const addItemToSalesOrderPackageMutation = () => {
  return /* GraphQL */ `
    mutation AddItemToSalesOrderPackage($tenantId: String! ,$packageId: String!, $packageItem: SalesOrderPackageItemInput!) {
      addItemToSalesOrderPackage(tenantId: $tenantId,packageId: $packageId, packageItem: $packageItem) {
        ${packagesFieldBase}
      }
    }
  `
}

export const updateSalesOrderPackageMutation = () => {
  return /* GraphQL */ `
    mutation UpdateSalesOrderPackage($tenantId: String!, $packageId: String!, $salesOrderPackage: SalesOrderPackageInput!) {
      updateSalesOrderPackage(tenantId: $tenantId, packageId: $packageId, salesOrderPackage: $salesOrderPackage) {
        ${packagesFieldBase}
      }
    }
  `
}

export const updateSalesOrderPackageAndProcessAsFulfilledMutation = () => {
  return /* GraphQL */ `
    mutation UpdateSalesOrderPackageAndProcessAsFulfilled($tenantId: String!, $packageId: String!, $salesOrderPackage: SalesOrderPackageInput!) {
      updateSalesOrderPackageAndProcessAsFulfilled(tenantId: $tenantId, packageId: $packageId, salesOrderPackage: $salesOrderPackage) {
        ${packagesFieldBase}
      }
    }
  `
}
export const updateSalesOrderPackageAndProcessAsDeliveredMutation = () => {
  return /* GraphQL */ `
    mutation UpdateSalesOrderPackageAndProcessAsDelivered($tenantId: String!, $packageId: String!, $salesOrderPackage: SalesOrderPackageInput!) {
      updateSalesOrderPackageAndProcessAsDelivered(tenantId: $tenantId, packageId: $packageId, salesOrderPackage: $salesOrderPackage) {
        ${packagesFieldBase}
      }
    }
  `
}
export const deleteSalesOrderPackageMutation = () => {
  return /* GraphQL */ `
    mutation DeleteSalesOrderPackage($tenantId: String!, $packageId: String!) {
      deleteSalesOrderPackage(tenantId: $tenantId, packageId: $packageId)
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

export const fulfillSalesOrderPackageMutation = () => {
  return /* GraphQL */ `
    mutation FulfillSalesOrderPackage($tenantId: String!, $packageId: String!, $packedByUsername: String) {
      fulfillSalesOrderPackage(tenantId: $tenantId, packageId: $packageId, packedByUsername: $packedByUsername) {
        ${packagesFieldBase}
      }
    }
  `
}

export const processSalesOrderPackageAsDeliveredMutation = () => {
  return /* GraphQL */ `
    mutation ProcessSalesOrderPackageAsDelivered($tenantId: String!, $packageId: String!, $packedByUsername: String, $deliveredByUsername: String, $deliveryDate: String) {
      processSalesOrderPackageAsDelivered(tenantId: $tenantId, packageId: $packageId, packedByUsername: $packedByUsername, deliveredByUsername: $deliveredByUsername, deliveryDate: $deliveryDate) {
        ${packagesFieldBase}
      }
    }
  `
}

export const markSalesOrderPackageAsDeliveredMutation = () => {
  return /* GraphQL */ `
    mutation MarkSalesOrderPackageAsDelivered($tenantId: String!, $packageId: String!, $deliveredByUsername: String, $deliveryDate: String) {
      markSalesOrderPackageAsDelivered(tenantId: $tenantId, packageId: $packageId, deliveredByUsername: $deliveredByUsername, deliveryDate: $deliveryDate) {
        ${packagesFieldBase}
      }
    }
  `
}
export const undoSalesOrderPackageConfirmationMutation = () => {
  return /* GraphQL */ `
    mutation undoSalesOrderPackageConfirmation($tenantId: String!, $packageId: String!) {
      undoSalesOrderPackageConfirmation(tenantId: $tenantId, packageId: $packageId) {
        ${packagesFieldBase}
      }
    }
  `
}

export const undoSalesOrderPackageFulfillmentMutation = () => {
  return /* GraphQL */ `
    mutation undoSalesOrderPackageFulfillment($tenantId: String!, $packageId: String!) {
      undoSalesOrderPackageFulfillment(tenantId: $tenantId, packageId: $packageId) {
        ${packagesFieldBase}
      }
    }
  `
}

export const assignPackageToUserMutation = () => {
  return /* GraphQL */ `
    mutation AssignPackageToUser($tenantId: String!, $packageId: String!, $assignedTo: String!) {
      assignPackageToUser(tenantId: $tenantId, packageId: $packageId, assignedTo: $assignedTo) {
        ${packagesFieldBase}
      }
    }
  `
}

export const deleteItemFromSalesOrderPackageMutation = () => {
  return /* GraphQL */ `
    mutation DeleteItemFromSalesOrderPackage($tenantId: String! ,$packageId: String!, $lineItemId: String!, $itemId: String!, $warehouseId: String! ) {
      deleteItemFromSalesOrderPackage(tenantId: $tenantId ,packageId: $packageId, lineItemId: $lineItemId ,itemId: $itemId, warehouseId: $warehouseId) {
        ${packagesFieldBase}
      }
    }
  `
}

export const attachFileToPackageQuery = () => {
  return `mutation attachFileToPackage($tenantId: String!, $packageId: String!,$files:[FileUploaderInput]!) {
            attachFileToPackage(tenantId: $tenantId, packageId: $packageId,files:$files){
              ${fileFragment}
             }
          }`
}

export const deleteFileFromPackage = () => {
  return `mutation deleteFileFromPackage($tenantId: String!, $packageId: String!,$file:FileUploaderInput!) {
            deleteFileFromPackage(tenantId: $tenantId, packageId: $packageId,file:$file){
              ${fileFragment}
             }
          }`
}
