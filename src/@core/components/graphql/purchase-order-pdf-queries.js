import { fileFragment } from './common-queries'

export const sendPurchaseOrderMutation = () => {
  return /* GraphQL */ `
    mutation GenerateAndEmailPDF($tenantId: String!, $orderId: String!, $sendCopyTO: [String], $sendCopyCC: [String]) {
      generateAndEmailPDFPo(tenantId: $tenantId, orderId: $orderId, sendCopyTO: $sendCopyTO, sendCopyCC: $sendCopyCC) {
        tenantId
        orderId
        orderNo
        status
      }
    }
  `
}

export const deleteFileFromPurchaseOrder = () => {
  return `mutation deleteFileFromPurchaseOrder($tenantId: String!, $orderId: String!,$file:FileUploaderInput!) {
            deleteFileFromPurchaseOrder(tenantId: $tenantId, orderId: $orderId,file:$file){
              ${fileFragment}
             }
          }`
}

export const attachFileToPurchaseOrder = () => {
  return `mutation attachFileToPurchaseOrder($tenantId: String!, $orderId: String!,$files:[FileUploaderInput]!) {
            attachFileToPurchaseOrder(tenantId: $tenantId, orderId: $orderId,files:$files){
              ${fileFragment}
             }
          }`
}
