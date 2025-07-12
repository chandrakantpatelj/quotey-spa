import { fileFragment, itemDimensionFragment, packingUnitsFragment } from './common-queries'

const packageItemsInput = `
  itemId
  itemCodePrefix
  itemCode
  itemName
  itemDescription
  itemDimension {
    ${itemDimensionFragment}
  }
  packingUnit {
     ${packingUnitsFragment}
  }
  packedQty
  packedQtyUom
  purchasePrice
  subtotal
  warehouseId
  `

const purchaseOrderPackageFieldBase = `
  packageId
  schemaVersion
  tenantId
  tradingId
  packageNo
  packageNoPrefix
  packageDate
  purchaseType
  purchaseOrderId
  purchaseOrderNo
  purchaseOrderNoPrefix
  vendorId
  packageItems {
    ${packageItemsInput}
  }
  totalPackageQty
  totalPackageValue
  currency
  notes
  purchaseModuleSettingVersion
  status
  currentStage
  undoCurrentStage
  moveToNextStage
  previousStatus
  previousStage
  nextStatus
  nextStage
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

export const getAllPurchaseOrderPackages = tenantId => `
  getPurchaseOrderPackages(tenantId: "${tenantId}") {
    ${purchaseOrderPackageFieldBase}
  }
`

export const getPurchaseOrderPackagesQuery = tenantId => {
  return /* GraphQL */ `
    query getPurchasePackages {
      ${getAllPurchaseOrderPackages(tenantId)}
    }
  `
}

export const getPurchaseOrderPackageQuery = (tenantId, packageId) => {
  return /* GraphQL */ `
    query getPurchaseOrderPackage {
      getPurchaseOrderPackage(tenantId: "${tenantId}",packageId: "${packageId}") {
       ${purchaseOrderPackageFieldBase}
      }
    }
  `
}

export const getPurchaseOrderPackagesByPurchaseOrderQuery = (tenantId, purchaseOrderId) => {
  return /* GraphQL */ `
    query getPurchaseOrderPackagesByPurchaseOrder {
       getPurchaseOrderPackagesByPurchaseOrder(tenantId: "${tenantId}",purchaseOrderId: "${purchaseOrderId}") {
         ${purchaseOrderPackageFieldBase}
       }
    }
  `
}

export const undoPurchaseOrderPackageStageQuery = () => {
  return /* GraphQL */ `
    mutation undoPurchaseOrderPackageStage($tenantId: String!, $packageId: String!, $stageName: String!) {
      undoPurchaseOrderPackageStage(tenantId: $tenantId, packageId: $packageId, stageName: $stageName) {
        ${purchaseOrderPackageFieldBase}
      }
    }
  `
}

export const movePurchaseOrderPackageToStageQuery = () => {
  return /* GraphQL */ `
    mutation MovePurchaseOrderPackageToStage($tenantId: String!, $packageId: String!, $stageName: String!, $stageDate: String!) {
      movePurchaseOrderPackageToStage(tenantId: $tenantId, packageId: $packageId, stageName: $stageName, stageDate: $stageDate) {
        ${purchaseOrderPackageFieldBase}
      }
    }
  `
}

export const getPurchaseOrderPackagesByDateRangeQuery = (tenantId, startDate, endDate) => {
  return /* GraphQL */ `
    query GetPurchaseOrderPackagesByDateRange {
      getPurchaseOrderPackagesByDateRange(tenantId: "${tenantId}", startDate: "${startDate}", endDate: "${endDate}") {
        ${purchaseOrderPackageFieldBase}
      }
    }
  `
}

export const createPurchaseOrderPackageMutation = () => {
  return /* GraphQL */ `
    mutation createPurchaseOrderPackage($tenantId: String!, $purchaseOrderPackage: PurchaseOrderPackageInput!) {
      createPurchaseOrderPackage(tenantId: $tenantId, purchaseOrderPackage: $purchaseOrderPackage) {
        ${purchaseOrderPackageFieldBase}
      }
    }
  `
}

export const createPurchaseOrderPackageAndMoveToFirstStageMutation = () => {
  return /* GraphQL */ `
    mutation CreatePurchaseOrderPackageAndMoveToFirstStage($tenantId: String!, $purchaseOrderPackage: PurchaseOrderPackageInput!) {
      createPurchaseOrderPackageAndMoveToFirstStage(tenantId: $tenantId, purchaseOrderPackage: $purchaseOrderPackage) {
        ${purchaseOrderPackageFieldBase}
      }
    }
  `
}

export const updatePurchaseOrderPackageMutation = () => {
  return /* GraphQL */ `
    mutation UpdatePurchaseOrderPackage($tenantId: String!, $packageId: String!, $purchaseOrderPackage: PurchaseOrderPackageInput!) {
      updatePurchaseOrderPackage(tenantId: $tenantId, packageId: $packageId, purchaseOrderPackage: $purchaseOrderPackage) {
        ${purchaseOrderPackageFieldBase}
      }
    }
  `
}

export const updatePurchaseOrderPackageAndMoveToFirstStageMutation = () => {
  return /* GraphQL */ `
    mutation UpdatePurchaseOrderPackageAndMoveToFirstStage($tenantId: String!, $packageId: String!, $purchaseOrderPackage: PurchaseOrderPackageInput!) {
      updatePurchaseOrderPackageAndMoveToFirstStage(tenantId: $tenantId, packageId: $packageId, purchaseOrderPackage: $purchaseOrderPackage) {
        ${purchaseOrderPackageFieldBase}
      }
    }
  `
}

export const deletePurchaseOrderPackageMutation = () => {
  return /* GraphQL */ `
    mutation DeletePurchaseOrderPackage($tenantId: String!, $packageId: String!) {
      deletePurchaseOrderPackage(tenantId: $tenantId, packageId: $packageId){
          ${purchaseOrderPackageFieldBase}
        }
    }
  `
}

export const addItemToPurchaseOrderPackageMutation = () => {
  return /* GraphQL */ `
    mutation AddItemToPurchaseOrderPackage($tenantId: String! ,$packageId: String!, $packageItem: PurchaseOrderPackageItemInput!) {
      addItemToPurchaseOrderPackage(tenantId: $tenantId,packageId: $packageId, packageItem: $packageItem) {
        ${purchaseOrderPackageFieldBase}
      }
    }
  `
}

export const updateItemInPurchaseOrderPackageMutation = () => {
  return /* GraphQL */ `
    mutation UpdateItemInPurchaseOrderPackage($tenantId: String! ,$packageId: String!,$itemId: String!,$warehouseId: String!, $packageItem: PurchaseOrderPackageItemInput!) {
      updateItemInPurchaseOrderPackage(tenantId: $tenantId,packageId: $packageId,itemId: $itemId,warehouseId: $warehouseId, packageItem: $packageItem) {
        ${purchaseOrderPackageFieldBase}
      }
    }
  `
}

export const deleteItemFromPurchaseOrderPackageMutation = () => {
  return /* GraphQL */ `
    mutation DeleteItemFromPurchaseOrderPackage($tenantId: String! ,$packageId: String!, $itemId: String!, $warehouseId: String! ) {
      deleteItemFromPurchaseOrderPackage(tenantId: $tenantId ,packageId: $packageId ,itemId: $itemId, warehouseId: $warehouseId) {
        ${purchaseOrderPackageFieldBase}
      }
    }
  `
}
