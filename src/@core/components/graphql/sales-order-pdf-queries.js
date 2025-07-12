import { fileFragment } from './common-queries'

export const sendSalesOrderMutation = () => {
  return /* GraphQL */ `
    mutation GenerateAndEmailPDF($tenantId: String!, $orderId: String!, $sendCopyTO: [String], $sendCopyCC: [String]) {
      generateAndEmailPDFSalesOrder(
        tenantId: $tenantId
        orderId: $orderId
        sendCopyTO: $sendCopyTO
        sendCopyCC: $sendCopyCC
      )
    }
  `
}

export const attachFileToSalesOrder = () => {
  return `mutation attachFileToSalesOrder($tenantId: String!, $orderId: String!,$files:[FileUploaderInput]!) {
            attachFileToSalesOrder(tenantId: $tenantId, orderId: $orderId,files:$files){
              ${fileFragment}
             }
          }`
}

export const deleteFileFromSalesOrder = () => {
  return `mutation deleteFileFromSalesOrder($tenantId: String!, $orderId: String!,$file:FileUploaderInput!) {
            deleteFileFromSalesOrder(tenantId: $tenantId, orderId: $orderId,file:$file){
              ${fileFragment}
             }
          }`
}
