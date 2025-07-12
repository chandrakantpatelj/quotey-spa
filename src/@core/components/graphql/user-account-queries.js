const UserAccountPermissionFieldBase = `
    permissionId
    tenantId
    isAdmin
    roles
`

const userAccountFieldsBase = `
    username
    name
    email
    phoneNumber
    permissions {
    ${UserAccountPermissionFieldBase}
    }
    createdDateTime
    createdBy
    updatedDateTime
    updatedBy
    lastLoginDateTime
`

// export const getUserForSalesOrder = () => `
//   getUsers {
//     userId
//     username
//     name
//   }
// `

export const GetUserAccountsQuery = () => {
  return `
    query GetUserAccounts {
      getUserAccounts {
        ${userAccountFieldsBase}
      }
    }
  `
}

export const CreateUserAccountMutation = () => {
  return /* GraphQL */ `
    mutation CreateUserAccount($userAccount: UserAccountInput!) {
      createUserAccount(userAccount: $userAccount) {
        ${userAccountFieldsBase}
      }
    }
  `
}

// export const UpdateUserAccountMutation = () => {
//   return /* GraphQL */ `
//     mutation UpdateUserAccount($username: String!, $userAccount: UpdateUserAccountInput!) {
//       updateUserAccount(username: $username, userAccount: $userAccount) {
//         ${userAccountFieldsBase}
//       }
//     }
//   `
// }

export const UpdateUserAccountMutation = () => {
  return /* GraphQL */ `
    mutation UpdateUserAccount($username: String!, $userAccount: UpdateUserAccountInput!) {
      updateUserAccount(username: $username,  userAccount: $userAccount) {
        ${userAccountFieldsBase}
      }
    }
  `
}

export const DeleteUserAccountMutation = () => {
  return /* GraphQL */ `
    mutation DeleteUserAccount($username: String!) {
      deleteUserAccount(username: $username)
    }
  `
}

export const AddPermissionMutation = () => {
  return /* GraphQL */ `
    mutation AddPermission($username: String!, $permission: UserAccountPermissionInput!) {
      addPermission(username: $username,  permission: $permission) {
        ${userAccountFieldsBase}
      }
    }
  `
}

export const UpdatePermissionMutation = () => {
  return /* GraphQL */ `
    mutation UpdatePermission($username: String!, $permissionId: String!, $permission: UserAccountPermissionInput!) {
      updatePermission(username: $username, permissionId: $permissionId,  permission: $permission) {
        ${userAccountFieldsBase}
      }
    }
  `
}

export const RemovePermissionMutation = () => {
  return /* GraphQL */ `
    mutation RemovePermission($username: String!, $permissionId: String!) {
      removePermission(username: $username, permissionId: $permissionId){
        ${userAccountFieldsBase}
      }
    }
  `
}
