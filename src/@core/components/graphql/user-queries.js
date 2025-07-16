const userFieldsBase = `
  userId
  username
  email
  phone
  tempPassword
  name
  role
  createdDateTime
`

export const getUserForSalesOrder = () => `
  getUsers {
    userId
    username
    name
  }
`

export const getUserQuery = () => {
  return `
    query getAllUsers {
      getUsers {
        ${userFieldsBase}
      }
    }
  `
}

export const createUserMutation = () => {
  return /* GraphQL */ `
    mutation CreateUser($user: UserInput!) {
      createUser(user: $user) {
        ${userFieldsBase}
      }
    }
  `
}

export const updateUserMutation = () => {
  return /* GraphQL */ `
    mutation UpdateUser($userId: String!, $user: UserInput!) {
      updateUser(userId: $userId, user: $user) {
        ${userFieldsBase}
      }
    }
  `
}

export const deleteUserMutation = () => {
  return /* GraphQL */ `
    mutation DeleteUser($userId: String!) {
      deleteUser(userId: $userId)
    }
  `
}

export const ViewUserQuery = () => {
  return `
    query getAllUsers {
      getUsers {
        ${userFieldsBase}
      }
    }
  `
}

export const getUsersByDateRangeQuery = (startDate, endDate) => {
  return /* GraphQL */ `
    query getUsersByDateRange {
      getUsersByDateRange(startDate: "${startDate}", endDate: "${endDate}") {
        ${userFieldsBase}
      }
    }
  `
}
