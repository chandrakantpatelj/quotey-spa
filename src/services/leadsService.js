const API_URL = process.env.NEXT_PUBLIC_APPSYNC_API_URL

// GraphQL query to fetch leads
const GET_LEADS_QUERY = `
query GetLeads {
  getAllLeads {
    leadId
    status
    source
    rating
    land
    finance
    faceToFace
    purpose
    clientType
    welcomeLetterSent
    contacts {
      name
      email
      phone
    }
    assignedPeople {
      userId
      role
    }
    dates {
      createdAt
      updatedAt
      closedAt
    }
    companyDetails {
      name
      address
      abn
    }
    conveyancerSolicitor {
      name
      contact
    }
    mortgageBroker {
      name
      contact
    }
    bankFinancer {
      name
      contact
    }
    houseAndLandPackage {
      propertyId
      details
    }
    transferredTo {
      userId
      transferDate
    }
  }
}

`

// Send GraphQL request with auth token
export const getLeads = async token => {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token // token must be ID token from Cognito
    },
    body: JSON.stringify({
      query: GET_LEADS_QUERY
    })
  })

  const result = await res.json()

  if (result.errors) {
    throw new Error('Failed to fetch leads: ' + result.errors[0].message)
  }

  return result.data.getAllLeads
}
