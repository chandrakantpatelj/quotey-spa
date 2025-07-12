const StakeholderNoteComment = `
  commentId
  comment
  commentedBy
  commentedDateTime`

const vendorNoteFieldBase = `
noteId
schemaVersion
tenantId
vendorId
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

export const getVendorNotesQuery = (tenantId, noteId) => {
  return /* GraphQL */ `
    query getVendorNotes {
      getVendorNotes(noteId: "${noteId}",tenantId:"${tenantId}") {
        ${vendorNoteFieldBase}
      }
    }
  `
}

export const getAllVendorNotesQuery = (tenantId, vendorId, startDate, endDate) => {
  return /* GraphQL */ `
    query getVendorNotes {
      getVendorNotes(vendorId: "${vendorId}",tenantId:"${tenantId}",startDate: "${startDate}", endDate: "${endDate}") {
        ${vendorNoteFieldBase}
      }
    }
  `
}

export const createVendorStakeholderNote = () => {
  return `
    mutation createVendorStakeholderNote($tenantId:String!,$stakeholderNote: StakeHolderNoteInput!) {
      createStakeholderNote(tenantId:$tenantId,stakeholderNote: $stakeholderNote) {
        ${vendorNoteFieldBase}
      }
    }
  `
}

export const markNoteAsClosedMutation = () => {
  return `
    mutation markNoteAsClosedMutation($tenantId:String!, $noteId: String!) {
      markNoteAsClosed(tenantId:$tenantId, noteId: $noteId) {
        ${vendorNoteFieldBase}
      }
    }
  `
}

export const updateStakeholderNote = () => {
  return `
    mutation updateStakeholderNote($tenantId:String!,$noteId: String!, $stakeholderNote: StakeHolderNoteInput!) {
      updateStakeholderNote(tenantId:$tenantId,noteId: $noteId, stakeholderNote: $stakeholderNote) {
        ${vendorNoteFieldBase}
      }
    }
  `
}

export const deleteStakeholderNoteMutation = () => {
  return /* GraphQL */ `
    mutation deleteStakeholderNoteMutation($tenantId: String!, $noteId: String!) {
      deleteStakeholderNote(tenantId: $tenantId, noteId: $noteId)
    }
  `
}

export const addNoteCommentMutation = () => {
  return `
    mutation addNoteCommentMutation($tenantId:String!,$noteId: String!,$comment:String!) {
      addNoteComment(tenantId:$tenantId,noteId: $noteId,comment:$comment) {
        ${vendorNoteFieldBase}
      }
    }
  `
}

export const deleteCommentMutation = () => {
  return `
    mutation deleteCommentMutation($tenantId: String!, $noteId: String!, $commentId: String!) {
      deleteNoteComment(tenantId: $tenantId, noteId: $noteId, commentId: $commentId)
    }
  `
}
