const ticketField = `
    schemaVersion
    createdDateTime
    ticketId
    
`
export const createTicketMutation = () => {
  return /* GraphQL */ `
      mutation CreateTicketMutation($tenantId: String!, $ticket: HelpDeskTicketInput!) {
        createTicket(tenantId: $tenantId, ticket: $ticket) {
          ${ticketField}
        }
      }
    `
}
