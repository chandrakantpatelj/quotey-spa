const UserPermission = `
  tenantId
  isAdmin
  permissions{
    action
    scope
  }
  `

const UserProfile = `
  username
  name
  rootUser
  accountId
  accountNo
  permissions{
    ${UserPermission}
  }
`
export const getUserProfile = () => `
      getUserProfile {
        ${UserProfile}
      }
  `

export const getUserProfileQuery = () => {
  return `
    query getUserProfile {
      getUserProfile {
        ${UserProfile}
      }
    }
  `
}
