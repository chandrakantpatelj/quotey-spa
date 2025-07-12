import { fileFragment } from './common-queries'
import { getOtherSetting } from './other-setting-queries'

export const itemsFieldsBase = `
  schemaVersion   
  tenantId
  itemId
  itemCodePrefix
  itemCode
  itemName
  itemGroup
  itemDescription
  uom
  sellingPrice
  enablePackingUnit
  enableDimension
  sellingPriceCurrency
  sellingPriceTaxInclusive
  status
  costPrice
  costPriceCurrency
  costPriceMethod
  purchasePrice
  purchasePriceCurrency
  lowStockThreshold
  manufacturer
  brand
  vendor
  productCategory
  productClass
  tags
  packingUnits{
   unit
   description
   qtyPerUnit
  }
  dimensions{
    length{
      defaultValue
      minimumValue
    }
    width{
      defaultValue
      minimumValue
    }
    height{
      defaultValue
      minimumValue
    }
  }
  images {
    name
    key
  }
  files {
    ${fileFragment}
  }
  createdDateTime
  createdBy
  modifiedDateTime
  modifiedBy
`

export const itemLedgerFieldsBase = `
  transactionId
  schemaVersion
  tenantId
  itemId
  warehouseId
  transactionDate
  transactionType
  transactionRef
  stockMovement
  description
  notes
  inwardQty
  inwardQtyUom
  outwardQty
  outwardQtyUom
  clearedQty
  pricePerUnit
  totalPrice
  taxValuePerUnit
  totalTaxValue
  effectiveTaxRate
  currency
  customerId
  salesOrderId
  salesOrderNo
  salesOrderNoPrefix
  salesOrderPackageId
  salesOrderPackageNo
  salesOrderPackageNoPrefix
  salesOrderLineItemId
  salesReturnId
  vendorId
  purchaseOrderId
  purchaseOrderNo
  purchaseOrderNoPrefix
  purchaseReceiveId
  purchaseReceiveNo
  purchaseReceiveNoPrefix
  purchaseOrderPackageId
  purchaseOrderPackageNo
  purchaseOrderPackageNoPrefix
  purchaseOrderShipmentId
  purchaseOrderShipmentNo
  purchaseOrderShipmentNoPrefix
  purchaseReturnId
  stockAdjustmentId
  stockAdjustmentNo
  stockAdjustmentNoPrefix
  status
  runningBalance
  closingBalance
  createdDateTime
  createdBy
  modifiedDateTime
  modifiedBy
  deletedDateTime
`

export const getAllItems = tenantId => `
  getAllItems(tenantId: "${tenantId}") {
    ${itemsFieldsBase}
   
  }
`

export const getAllItemsQuery = tenantId => {
  return /* GraphQL */ `
    query getAllProducts {
      ${getAllItems(tenantId)}
    }
  `
}

export const getItemQuery = (tenantId, itemId) => {
  return /* GraphQL */ `
  query getItem {
    getItem(tenantId:"${tenantId}", itemId:"${itemId}"){
    ${itemsFieldsBase}  
    }
  }
  `
}

export const getAllItemsForPriceList = tenantId => `
  getAllItems(tenantId: "${tenantId}") {
    itemId
    itemName
    itemCode 
    uom
    sellingPrice
    sellingPriceCurrency
    sellingPriceTaxInclusive
    itemDescription
  }
`

export const createItemMutation = () => {
  return /* GraphQL */ `
    mutation CreateItemMutation($tenantId: String!, $item: ItemInput!) {
      createItem(tenantId: $tenantId, item: $item) {
        ${itemsFieldsBase}
      }
    }
  `
}

export const createItemsMutation = () => {
  return /* GraphQL */ `
     mutation CreateItemsMutations($tenantId: String!, $items: [ItemInput]!) {
        createItems(tenantId: $tenantId, items: $items) {
         ${itemsFieldsBase}
        }
    }
  `
}

export const updateItemMutation = () => {
  return /* GraphQL */ `
    mutation UpdateItem($tenantId: String!, $itemId: String!, $item: ItemInput!) {
      updateItem(tenantId: $tenantId, itemId: $itemId, item: $item) {
        ${itemsFieldsBase}
      }
    }
  `
}

export const deleteItemMutation = () => {
  return /* GraphQL */ `
    mutation DeleteItemMutation($tenantId: String!, $itemId: String!) {
      deleteItem(tenantId: $tenantId, itemId: $itemId)
    }
  `
}

export const editProductQuery = tenantId => {
  return /* GraphQL */ `
    query editProduct {
      ${getOtherSetting(tenantId)}
    }
  `
}

export const newProductQuery = tenantId => {
  return /* GraphQL */ `
    query newProduct {
      ${getOtherSetting(tenantId)}
    }
  `
}

export const GetItemLedgerBalanceByItemIdQuery = (tenantId, itemId) => {
  return /* GraphQL */ `
    query MyQuery {
      getItemLedgerBalanceByItemId(
        tenantId: "${tenantId}",
        itemId: "${itemId}"
      ) {
        itemId
        warehouseId
        availableQty
      }
    }
  `
}

export const GetItemLedgerBalanceByItemIdsQuery = (tenantId, itemIds) => {
  return /* GraphQL */ `
    query MyQuery {
      getItemLedgerBalanceByItemIds(
        tenantId: "${tenantId}",
        itemIds: ${JSON.stringify(itemIds)}
      ) {
        itemId
        warehouseId
        availableQty
      }
    }
  `
}

export const GetItemLedgerBalanceByItemIdAndWarehouseIdQuery = (tenantId, itemId, warehouseId) => {
  return /* GraphQL */ `
    query MyQuery {
      getItemLedgerBalanceByItemIdAndWarehouseId(
        tenantId: "${tenantId}",
        itemId: "${itemId}",
        warehouseId: "${warehouseId}",
      ) {
        itemId
        warehouseId
        availableQty
      }
    }
  `
}

export const GetItemsByDateRangeQuery = (tenantId, startDate, endDate) => {
  return /* GraphQL */ `
    query GetItemsByDateRange {
      getItemsByDateRange(tenantId: "${tenantId}", startDate: "${startDate}", endDate: "${endDate}") {
        ${itemsFieldsBase}
      }
    }
  `
}

export const getAllItemTransactionsQuery = (tenantId, itemId, fromDate, toDate) =>
  `query getItemTransactions {
  getItemLedgerTransactionsByDateRange(tenantId: "${tenantId}",itemId: "${itemId}",fromDate: "${fromDate}",toDate: "${toDate}") {
    ${itemLedgerFieldsBase}
   }
  }`

export const DeleteProductsMutation = () => {
  return /* GraphQL */ `
    mutation DeleteProductsMutation($tenantId: String!, $itemIds: [String]!) {
      deleteItems(tenantId: $tenantId, itemIds: $itemIds)
    }
  `
}

export const attachFileToProductQuery = () => {
  return `mutation attachFileToProduct($tenantId: String!, $itemId: String!,$files:[FileUploaderInput]!) {
            attachFileToProduct(tenantId: $tenantId, itemId: $itemId,files:$files){
              ${fileFragment}
             }
          }`
}

export const deleteFileFromProduct = () => {
  return `mutation deleteFileFromProduct($tenantId: String!, $itemId: String!,$file:FileUploaderInput!) {
            deleteFileFromProduct(tenantId: $tenantId, itemId: $itemId,file:$file){
              ${fileFragment}
             }
          }`
}
