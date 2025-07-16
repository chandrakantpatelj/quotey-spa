const StakeholderNoteComment = `
  commentId
  comment
  commentedBy
  commentedDateTime`

const customerNotesFieldBase = `
noteId
schemaVersion
tenantId
customerId
note
date
status
comments{
  ${StakeholderNoteComment}
}
createdBy
createdDateTime
closedBy
closedDateTime
`
export const getCustomerNotesQuery = (tenantId, customerId, startDate, endDate) => {
  return /* GraphQL */ `
    query getCustomerNotes {
      getCustomerNotes(tenantId: "${tenantId}",customerId:"${customerId}" ,startDate: "${startDate}", endDate: "${endDate}") {
        ${customerNotesFieldBase}
      }
    }
  `
}

export const getAllCustomerNotesQuery = (tenantId, customerId) => {
  return /* GraphQL */ `
    query getAllCustomerNotes {
      getAllCustomerNotes(customerId: "${customerId}",tenantId:"${tenantId}") {
        ${customerNotesFieldBase}
      }
    }
  `
}
export const addNoteCommentMutation = () => {
  return `
    mutation addNoteCommentMutation($tenantId:String!,$noteId: String!,$comment:String!) {
      addNoteComment(tenantId:$tenantId,noteId: $noteId,comment:$comment) {
        ${customerNotesFieldBase}
      }
    }
  `
}
export const updateStakeholderNote = () => {
  return `
    mutation updateStakeholderNote($tenantId:String!,$noteId: String!, $stakeholderNote: StakeHolderNoteInput!) {
      updateStakeholderNote(tenantId:$tenantId,noteId: $noteId, stakeholderNote: $stakeholderNote) {
        ${customerNotesFieldBase}
      }
    }
  `
}

export const createCustomerNotesMutation = () => {
  return `
    mutation createCustomerNotesMutation($tenantId:String!,$stakeholderNote: StakeHolderNoteInput!) {
      createStakeholderNote(tenantId:$tenantId,stakeholderNote: $stakeholderNote) {
        ${customerNotesFieldBase}
      }
    }
  `
}
export const updateCustomerNotesMutation = () => {
  return /* GraphQL */ `
    mutation updateCustomerNotesMutation($tenantId:String!,$noteId: String!, $customerNotes: CustomerNotesInput!) {
      updateCustomerNotes(tenantId:$tenantId,noteId: $noteId, customerNotes: $customerNotes) {
        ${customerNotesFieldBase}
      }
    }
  `
}

export const deleteCustomerNotesMutation = () => {
  return /* GraphQL */ `
    mutation deleteCustomerNotesMutation($tenantId: String!, $noteId: String!) {
      deleteCustomerNotes(tenantId: $tenantId, noteId: $noteId)
    }
  `
}

export const markCustomerNoteAsClosedMutation = () => {
  return `
    mutation markCustomerNoteAsClosedMutation($tenantId:String!, $noteId: String!) {
      markNoteAsClosed(tenantId:$tenantId, noteId: $noteId) {
        ${customerNotesFieldBase}
      }
    }
  `
}
