export const getUserPreferenceQuery = () => {
  return /* GraphQL */ `
    query getUserPreference {
      getUserPreference {
        tenantId
      }
    }
  `
}

export const createUserPreferenceMutation = () => {
  return /* GraphQL */ `
    mutation CreateUserPreferenceMutation($userPreference: UserPreferenceInput!) {
      createUserPreference(userPreference: $userPreference) {
        tenantId
      }
    }
  `
}

export const updateUserPreferenceMutation = () => {
  return /* GraphQL */ `
    mutation UpdateUserPreference($userPreference: UserPreferenceInput!) {
      updateUserPreference(userPreference: $userPreference) {
        tenantId
      }
    }
  `
}
