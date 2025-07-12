import { itemDimensionFragment, packingUnitsFragment } from './common-queries'

const StockAdjustmentItemBase = `
  itemId
  itemCodePrefix
  itemCode
  itemName
  itemDescription
  itemDimension {
    ${itemDimensionFragment}
  }
  packingUnit{
    ${packingUnitsFragment}
  }
  qty
  uom
  totalValue
`

const StockAdjustmentFieldBase = `
  stockAdjustmentId
  schemaVersion
  tenantId
  adjustmentNoPrefix
  adjustmentNo
  adjustmentDate
  warehouseId
  reference
  stockMovement
  currency
  adjustmentItems {
   ${StockAdjustmentItemBase}
  }
  status
  reason
  notes
`

export const getAllAdjutments = tenantId => `
  getStockAdjustments(tenantId: "${tenantId}") {
    ${StockAdjustmentFieldBase}
  }
`

export const getStockAdjustmentsQuery = tenantId => {
  return /* GraphQL */ `
    query getAllAdjutments {
      ${getAllAdjutments(tenantId)}
    }
  `
}

export const getStockAdjustmentsByDateRangeQuery = (tenantId, startDate, endDate) => {
  return /* GraphQL */ `
    query getStockAdjustmentsByDateRangeQuery {
      getStockAdjustmentsByDateRange(tenantId: "${tenantId}", startDate: "${startDate}", endDate: "${endDate}") {
        ${StockAdjustmentFieldBase}
      }
    }
  `
}

export const CreateStockAdjustmentMutation = () => {
  return /* GraphQL */ `
    mutation CreateStockAdjustmentMutation($tenantId: String!, $stockAdjustment: StockAdjustmentInput!) {
      createStockAdjustment(tenantId: $tenantId, stockAdjustment: $stockAdjustment) {
        ${StockAdjustmentFieldBase}
      }
    }
  `
}

export const UpdateStockAdjustmentMutation = () => {
  return /* GraphQL */ `
    mutation UpdateStockAdjustment($tenantId: String!, $stockAdjustmentId: String!, $stockAdjustment: StockAdjustmentInput!) {
      updateStockAdjustment(tenantId: $tenantId, stockAdjustmentId: $stockAdjustmentId, stockAdjustment: $stockAdjustment) {
        ${StockAdjustmentFieldBase}
      }
    }
  `
}

export const DeleteStockAdjustmentMutation = () => {
  return /* GraphQL */ `
    mutation deleteStockAdjustmentMutation($tenantId: String!, $stockAdjustmentId: String!) {
      deleteStockAdjustment(tenantId: $tenantId, stockAdjustmentId: $stockAdjustmentId)
    }
  `
}

export const UndoStockAdjustmentConfirmationQuery = () => {
  return /* GraphQL */ `
    mutation UndoStockAdjustmentConfirmation($tenantId: String!, $stockAdjustmentId: String!) {
      undoStockAdjustmentConfirmation(tenantId: $tenantId, stockAdjustmentId: $stockAdjustmentId) {
        ${StockAdjustmentFieldBase}
      }
    }
  `
}
